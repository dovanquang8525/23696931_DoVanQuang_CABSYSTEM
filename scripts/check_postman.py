"""Offline contract checks; Python + PyYAML + jsonschema. No network or API calls."""
from pathlib import Path
import hashlib
import json
import re
import hmac
import os
import secrets
import subprocess
import sys
import tempfile

import jsonschema
import yaml

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'postman/documents/api-source-manifest.json').read_text(encoding='utf-8'))
# Preserve the earlier catalog checks below, but resolve its role explicitly.
collection = json.loads((ROOT / manifest['compatibility']['collection']['path']).read_text(encoding='utf-8'))
environment = json.loads((ROOT / manifest['compatibility']['environment']['path']).read_text(encoding='utf-8'))
phase6 = json.loads((ROOT / manifest['primary']['collection']['path']).read_text(encoding='utf-8'))
phase6_env = json.loads((ROOT / manifest['primary']['environment']['path']).read_text(encoding='utf-8'))


def walk(items):
    for item in items:
        if 'item' in item:
            yield from walk(item['item'])
        else:
            yield item


def schema(value, doc):
    if isinstance(value, list):
        return [schema(v, doc) for v in value]
    if not isinstance(value, dict):
        return value
    if '$ref' in value:
        node = doc
        for key in value['$ref'][2:].split('/'):
            node = node[key.replace('~1', '/').replace('~0', '~')]
        return schema(node, doc)
    result = {k: schema(v, doc) for k, v in value.items() if k != 'nullable'}
    for bound in ['Minimum', 'Maximum']:
        key = 'exclusive' + bound
        if isinstance(result.get(key), bool):
            if result.pop(key):
                result[key] = result.pop(bound.lower())
    return {'anyOf': [result, {'type': 'null'}]} if value.get('nullable') else result


operations = {}
for item in manifest['sources']:
    p = ROOT / item['path']
    assert hashlib.sha256(p.read_bytes()).hexdigest() == item['sha256'], f'Stale collection source: {p}'
    doc = yaml.safe_load(p.read_text(encoding='utf-8'))
    for path, entry in doc['paths'].items():
        for method, op in entry.items():
            if method not in ['get', 'post', 'put', 'patch', 'delete']:
                continue
            operations[op['operationId']] = (doc, path, method.upper(), op)
assert len(operations) == manifest['operationCount'] == 47
values = {x['key']: x['value'] for x in environment['values']}
assert len(values) == len(environment['values'])
assert values['baseUrl'] == 'http://localhost:3000'
assert all(not v for k, v in values.items() if k.endswith(('Password', 'Token', 'Signature')))
# Synthetic fixtures only, used exclusively for schema validation, never exported.
fixtures = {**values, 'customerPassword': 'SchemaFixture123', 'driverPassword': 'SchemaFixture123',
            'adminPassword': 'SchemaFixture123', 'adminPhone': '0900000003', 'otpCode': '123456'}
for key in ['customerId','driverId','bookingId','tripId','paymentId','invitationId','notificationId','otpId']:
    fixtures[key] = '000000000000000000000001'


def replace(value):
    return re.sub(r'\{\{(\w+)\}\}', lambda m: str(fixtures[m[1]]), value)


covered = set()
catalog_count = 0
for folder in collection['item'][:10]:
    for item in walk(folder['item']):
        request = item['request']
        oid = re.search(r'operationId: (\w+)', request['description'])[1]
        doc, path, method, op = operations[oid]
        covered.add(oid)
        catalog_count += 1
        assert request['method'] == method
        prefix = '' if path in ['/health', '/ready', '/health/services'] else '{{apiPrefix}}'
        expected_url = '{{baseUrl}}' + prefix + re.sub(r'\{(\w+)\}', r'{{\1}}', path)
        assert request['url']['raw'].split('?')[0] == expected_url
        if oid != 'handleMockCallback' and 'body' in request:
            body = json.loads(replace(request['body']['raw']))
            content = op['requestBody']['content']['application/json']
            jsonschema.validate(body, schema(content['schema'], doc))
        for param in op.get('parameters', []):
            if param['in'] == 'query':
                entry = next(v for v in request['url']['query'] if v['key'] == param['name'])
                if not entry.get('disabled'):
                    raw = replace(entry['value'])
                    kind = param['schema']['type']
                    value = int(raw) if kind == 'integer' else float(raw) if kind == 'number' else raw
                    jsonschema.validate(value, schema(param['schema'], doc))
        for response in op['responses'].values():
            for content in response.get('content', {}).values():
                if 'schema' in content:
                    jsonschema.Draft7Validator.check_schema(schema(content['schema'], doc))
assert covered == set(operations)
items = list(walk(collection['item']))
for item in items:
    assert item['request']['url']['raw'].startswith('{{baseUrl}}')
    assert 'grpc://' not in item['request']['url']['raw']
    assert {e['listen'] for e in item['event']} == {'test', 'prerequest'}
    assert 'HTTP status matches scenario' in '\n'.join(next(e['script']['exec'] for e in item['event'] if e['listen'] == 'test'))
metadata = yaml.safe_load((ROOT / '.postman/resources.yaml').read_text(encoding='utf-8'))
refs = metadata['localResources']['specs']
assert len(refs) == 10
assert all((ROOT / '.postman' / ref).is_file() for ref in refs)
assert {Path(ref).name for ref in refs} == {Path(x['path']).name for x in manifest['sources']}

# Audit the actual Phase 6 suite; never generate or patch it to satisfy checks.
artifacts = [manifest[group][kind] for group in ['primary', 'compatibility'] for kind in ['collection', 'environment']]
artifacts += manifest['contracts'] + manifest['phase6Documents']
for artifact in artifacts:
    assert 'legacy' not in Path(artifact['path']).parts, 'Archive used as active source'
    assert hashlib.sha256((ROOT / artifact['path']).read_bytes()).hexdigest() == artifact['sha256'], 'Artifact changed; review manifest: ' + artifact['path']
primary_values = {entry['key']: entry['value'] for entry in phase6_env['values']}
assert len(primary_values) == len(phase6_env['values'])
assert primary_values['base_url'] == 'http://localhost:3000'
assert all(not value for key, value in primary_values.items() if re.search(r'password|token|secret|signature', key, re.I))
primary_items = list(walk(phase6['item']))
assert len(primary_items) == manifest['primary']['requestCount'] == 142
primary_ids = [item['id'] for item in primary_items]
assert len(set(primary_ids)) == len(primary_ids)
runtime_keys = set()
for item in primary_items:
    for entry in item.get('event', []):
        code = '\n'.join(entry['script']['exec'])
        runtime_keys.update(re.findall(r"pm\.environment\.(?:set|unset)\(['\"]([^'\"]+)['\"]", code))
primary_fixtures = dict(primary_values)
for key in primary_fixtures:
    if key.endswith('_id'):
        primary_fixtures[key] = '000000000000000000000001'
    elif key.endswith('_phone'):
        primary_fixtures[key] = '0900000001'
    elif key.endswith('_password'):
        primary_fixtures[key] = 'SchemaFixture123'
primary_fixtures['otp_code'] = '123456'
primary_fixtures.update(pickup_lat='10.8', pickup_lon='106.7', destination_lat='10.81', destination_lon='106.71')


def primary_replace(raw):
    return re.sub(r'\{\{(\w+)\}\}', lambda match: str(primary_fixtures[match[1]]), raw)


for item in primary_items:
    req = item['request']
    url = req['url'] if isinstance(req['url'], str) else req['url']['raw']
    assert url.startswith('{{base_url}}/'), item['name']
    actual_path = url[len('{{base_url}}'):].split('?')[0]
    api_path = actual_path[len('/api/v1'):] if actual_path.startswith('/api/v1/') else actual_path
    matches = [(doc, op) for doc, path, method, op in operations.values()
               if method == req['method'] and re.fullmatch(re.sub(r'\{\w+\}', r'[^/]+', path), api_path)]
    assert matches, 'Undocumented route: ' + item['name']
    test = '\n'.join(next(e['script']['exec'] for e in item['event'] if e['listen'] == 'test'))
    expected = re.search(r'const expected\s*=\s*(\d+)', test)
    assert expected and any(expected[1] in op['responses'] for _, op in matches), item['name']
    for entry in item.get('event', []):
        code = '\n'.join(entry['script']['exec'])
        for target in re.findall(r"setNextRequest\(['\"]([^'\"]+)['\"]\)", code):
            assert target in primary_ids or target in {x['name'] for x in primary_items}, target
    # URL/body/auth/header variables must be declared or captured by runtime scripts.
    refs = set(re.findall(r'\{\{([A-Za-z]\w*)\}\}', json.dumps(req, ensure_ascii=False)))
    assert refs <= set(primary_values) | runtime_keys, 'Undeclared variables: ' + item['name']
    if api_path == '/payments/mock/callback' and item['name'] != 'Invalid mock signature always rejected':
        assert req['body']['raw'] == '{{callback_payload}}', 'Signed bytes would be changed: ' + item['name']

catalog_folder = next(folder for folder in phase6['item'] if folder['name'].startswith('09 API catalog'))
primary_coverage = set()
for item in walk(catalog_folder['item']):
    oid = item['name'].removeprefix('Catalog ')
    assert oid in operations
    primary_coverage.add(oid)
    doc, path, method, op = operations[oid]
    req = item['request']
    assert req['method'] == method
    expected_url = '{{base_url}}' + ('' if path in ['/health','/ready','/health/services'] else '/api/v1') + path
    # Object IDs use different variable names; compare literal path segments too.
    url = req['url'].split('?')[0]
    assert re.sub(r'\{\{\w+\}\}', '{}', url) == re.sub(r'\{\{\w+\}\}|\{\w+\}', '{}', expected_url), oid
    content = op.get('requestBody', {}).get('content', {}).get('application/json')
    if content and oid != 'handleMockCallback':
        jsonschema.validate(json.loads(primary_replace(req['body']['raw'])), schema(content['schema'], doc))
assert primary_coverage == set(operations)
cases = json.loads((ROOT / 'postman/documents/test-cases.json').read_text(encoding='utf-8'))
grading = json.loads((ROOT / 'postman/documents/grading-checklist.json').read_text(encoding='utf-8'))
assert len(cases) == 103
assert {case['acceptanceCriterion'] for case in cases} == {f'AC{n:02}' for n in range(1,106) if n not in [57,58]}
assert len(grading) == 30 and {entry['criterion'] for entry in grading} == set(range(1,31))
assert all(case['executionStatus'] in ['BLOCKED','NOT_RUN'] and not case['actualResult'] and not case['evidence'] for case in cases)
assert all(entry['status'] in ['BLOCKED','NOT_RUN'] and not entry['actual'] and not entry['evidence'] for entry in grading)
assert all(set(entry['testCases']) <= {case['testCaseId'] for case in cases} for entry in grading)
print('Phase 6 offline: 142 requests, 47/47 catalog operations, variables, control-flow targets, artifact hashes, 103 cases and exactly 30 criteria checked.')

# Exercise the external signer with synthetic data, never real .env credentials.
secret = secrets.token_hex(32)
with tempfile.TemporaryDirectory(prefix='cab-postman-signer-') as folder:
    work = Path(folder).resolve()
    assert work.parent == Path(tempfile.gettempdir()).resolve()
    output = work / '.env.callback-test.json'
    command = [sys.executable, str(ROOT / 'scripts/sign_mock_callback.py'),
               '--payment-id', '000000000000000000000008', '--reference-code', 'TEST-REFERENCE',
               '--amount', '20000', '--result', 'COMPLETED', '--output', str(output)]
    process_env = {k: v for k, v in os.environ.items() if k not in ['MOCK_CALLBACK_SECRET','CAB_MOCK_CALLBACK_SECRET']}
    process_env.update(MOCK_CALLBACK_SECRET=secret, PYTHONDONTWRITEBYTECODE='1')
    subprocess.run(command, env=process_env, check=True, capture_output=True, text=True)
    data = json.loads(output.read_text(encoding='utf-8'))
    local = {v['key']: v['value'] for v in data['values']}
    raw = local['callbackRawBody']
    callback = json.loads(raw)
    signature = 'sha256=' + hmac.new(secret.encode(), (local['callbackTimestamp'] + '\n' + raw).encode(), hashlib.sha256).hexdigest()
    assert hmac.compare_digest(local['callbackSignature'], signature)
    assert str(callback['timestamp']) == local['callbackTimestamp']
    assert secret not in output.read_text(encoding='utf-8')
    callback_doc = operations['handleMockCallback'][0]
    jsonschema.validate(callback, schema(callback_doc['components']['schemas']['MockCallback'], callback_doc))
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    retry = subprocess.run(command, env=process_env, capture_output=True, text=True)
    assert retry.returncode != 0 and hashlib.sha256(output.read_bytes()).hexdigest() == digest
    bad_output = work / 'callback-public.json'
    rejected = subprocess.run(command[:-1] + [str(bad_output)], env=process_env, capture_output=True, text=True)
    assert rejected.returncode != 0 and not bad_output.exists()
print(f'Compatibility catalog offline: {len(operations)}/47 operations, {catalog_count} catalog variants, {len(items)} requests.')
print('Request examples, enabled queries, response schemas, Gateway URLs and 10 metadata refs validated. API runtime NOT_RUN.')
print('Signer verified: HMAC over exact timestamp+LF+body; no secret exported; overwrite/public filename refused.')
