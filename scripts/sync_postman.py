"""Historical catalog generator; candidate output only, NEVER synchronizes Phase 6.

Default invocation refuses generation. Import is read-only. Use --output-dir
.local/postman-candidates/<new-name> only after an explicit preservation review.
This generator does not preserve Phase 6 assertions/fixtures/control flow.
"""
from pathlib import Path
import argparse
import copy
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def candidate_directory(value):
    directory = Path(value).resolve()
    candidate_root = (ROOT / '.local/postman-candidates').resolve()
    if directory == candidate_root or not directory.is_relative_to(candidate_root):
        raise ValueError('output must be a NEW subdirectory of .local/postman-candidates; live Postman paths are protected')
    if directory.exists():
        raise ValueError('candidate directory already exists; overwrite refused')
    return directory


def generate(output_directory):
    output_directory = candidate_directory(output_directory)
    import yaml
    ROOT = Path(__file__).resolve().parents[1]
    OUT = output_directory
    METHODS = {'get', 'post', 'put', 'patch', 'delete'}
    VARIABLES = {
        'baseUrl': 'http://localhost:3000', 'apiPrefix': '/api/v1',
        'customerPhone': '0900000001', 'driverPhone': '0900000002',
        'adminPhone': '', 'customerPassword': '', 'driverPassword': '', 'adminPassword': '',
        'customerToken': '', 'driverToken': '', 'adminToken': '',
        'customerId': '', 'driverId': '', 'bookingId': '', 'tripId': '',
        'paymentId': '', 'invitationId': '', 'notificationId': '', 'reviewId': '',
        'otpId': '', 'otpCode': '', 'callbackRawBody': '', 'callbackTimestamp': '',
        'callbackSignature': '', 'tamperedToken': '', 'page': '1', 'limit': '10',
        'latitude': '10.8', 'longitude': '106.7',
    }


    def write_json(path, data):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('x', encoding='utf-8', newline='\n') as handle:
            handle.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


    def event(kind, code):
        return {'listen': kind, 'script': {'type': 'text/javascript', 'exec': code.strip().splitlines()}}


    def resolve(value, doc):
        """Dereference only local OpenAPI refs; normalize nullable for JSON Schema draft 7."""
        if isinstance(value, list):
            return [resolve(v, doc) for v in value]
        if not isinstance(value, dict):
            return value
        if '$ref' in value:
            assert value['$ref'].startswith('#/'), 'External refs require review'
            target = doc
            for key in value['$ref'][2:].split('/'):
                target = target[key.replace('~1', '/').replace('~0', '~')]
            return resolve(target, doc)
        result = {k: resolve(v, doc) for k, v in value.items() if k != 'nullable'}
        for bound in ['Minimum', 'Maximum']:
            name = 'exclusive' + bound
            if isinstance(result.get(name), bool):
                exclusive = result.pop(name)
                if exclusive:
                    result[name] = result.pop(bound.lower())
        if value.get('nullable'):
            return {'anyOf': [result, {'type': 'null'}]}
        return result


    specs = []
    ops = {}
    sources = []
    for source in sorted((ROOT / 'docs/api').glob('*.yaml')):
        doc = yaml.safe_load(source.read_text(encoding='utf-8'))
        assert doc['openapi'] == '3.0.3'
        assert doc['servers'][0]['url'] in ['http://localhost:3000', 'http://localhost:3000/api/v1']
        sources.append({'path': source.relative_to(ROOT).as_posix(),
                        'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
        entries = []
        for path, path_item in doc['paths'].items():
            for method, op in path_item.items():
                if method not in METHODS:
                    continue
                oid = op['operationId']
                assert oid not in ops, 'Duplicate operationId'
                ops[oid] = (doc, path, method.upper(), op, source.name)
                entries.append(oid)
                resolve(op, doc)  # Fail before writing on unresolved references.
        specs.append((source.stem, entries))
    assert len(specs) == 10
    assert len({(m, p) for _, p, m, _, _ in ops.values()}) == len(ops)


    def request(oid, *, label=None, role=None, body=None, expected=None, before='', after='', auth=None):
        doc, path, method, op, filename = ops[oid]
        role = role or next(iter(op.get('x-allowed-roles', [])), 'CUSTOMER')
        role_key = role.lower()
        public = op.get('security', doc.get('security', [])) == []
        prefix = '' if filename == '10-health.yaml' else '{{apiPrefix}}'
        raw = '{{baseUrl}}' + prefix + re.sub(r'\{([^{}]+)\}', r'{{\1}}', path)
        query, headers = [], [{'key': 'Accept', 'value': 'application/json'}]
        pre = []
        for param in op.get('parameters', []):
            name = param['name']
            if param['in'] == 'query':
                enabled = param.get('required', False) or name in ['page', 'limit']
                value = '{{' + name + '}}' if name in VARIABLES else str(param['schema'].get('enum', [''])[0])
                query.append({'key': name, 'value': value, 'disabled': not enabled})
            if name == 'Idempotency-Key':
                key = {'createBooking': 'bookingKey', 'createPayment': 'paymentKey', 'retryPayment': 'retryKey'}[oid]
                headers.append({'key': name, 'value': '{{' + key + '}}'})
                pre.append('pm.environment.set(' + json.dumps(key) + ', pm.variables.replaceIn("{{$guid}}"));')
            if name in ['X-Mock-Signature', 'X-Mock-Timestamp']:
                key = 'callbackSignature' if name.endswith('Signature') else 'callbackTimestamp'
                headers.append({'key': name, 'value': '{{' + key + '}}'})
        url = {'raw': raw, 'host': ['{{baseUrl}}'], 'path': (prefix + path).strip('/').split('/')}
        url['path'] = [re.sub(r'\{([^{}]+)\}', r'{{\1}}', v) if not v.startswith('{{') else v for v in url['path']]
        if query:
            url['query'] = query
            enabled = [x for x in query if not x['disabled']]
            if enabled:
                url['raw'] += '?' + '&'.join(x['key'] + '=' + x['value'] for x in enabled)
        req = {'method': method, 'url': url, 'header': headers,
               'description': f'Source: docs/api/{filename} | operationId: {oid}\n\n' + op.get('description', '')}
        if auth:
            req['auth'] = {'type': 'bearer', 'bearer': [{'key': 'token', 'value': auth, 'type': 'string'}]}
        elif public or oid == 'handleMockCallback':
            req['auth'] = {'type': 'noauth'}
        else:
            req['auth'] = {'type': 'bearer', 'bearer': [{'key': 'token', 'value': '{{' + role_key + 'Token}}', 'type': 'string'}]}

        content = op.get('requestBody', {}).get('content', {}).get('application/json')
        if content is not None:
            data = copy.deepcopy(body if body is not None else next(iter(content.get('examples', {}).values()), {}).get('value', {}))
            if oid in ['registerAccount', 'loginAccount', 'requestDriverOtp', 'verifyDriverOtp']:
                data['phone'] = '{{' + ('driver' if 'Otp' in oid else role_key) + 'Phone}}'
            if oid in ['registerAccount', 'loginAccount']:
                data['password'] = '{{' + role_key + 'Password}}'
            if oid == 'registerAccount':
                data['role'] = role
                if role == 'DRIVER':
                    data['otpId'] = '{{otpId}}'
            if oid == 'verifyDriverOtp':
                data['code'] = '{{otpCode}}'
            req['body'] = {'mode': 'raw', 'raw': json.dumps(data, ensure_ascii=False, indent=2),
                           'options': {'raw': {'language': 'json'}}}
            headers.append({'key': 'Content-Type', 'value': 'application/json'})
        if oid == 'handleMockCallback':
            req['body']['raw'] = '{{callbackRawBody}}'
            pre.append('''const body = pm.variables.get('callbackRawBody');
    const parsed = JSON.parse(body);
    if (String(parsed.timestamp) !== String(pm.variables.get('callbackTimestamp'))) throw new Error('Callback timestamp mismatch');
    if (!/^sha256=[0-9a-f]{64}$/.test(pm.variables.get('callbackSignature') || '')) throw new Error('Sign callback outside Postman first');
    pm.request.body.update(body);''')
        if oid == 'createPayment':
            pre.append("if (pm.variables.get('tripStatus') !== 'COMPLETED' || pm.variables.get('tripStatusTripId') !== pm.variables.get('tripId')) throw new Error('GET current Trip and verify COMPLETED before payment');")
        if oid == 'retryPayment':
            pre.append("if (pm.variables.get('paymentStatus') !== 'FAILED') throw new Error('GET FAILED payment before retry; max 3 attempts');")
        pre.append(before)
        auth_reference = req['auth'].get('bearer', [{}])[0].get('value', '')
        pre.append('const authReference = ' + json.dumps(auth_reference) + ';')
        pre.append('''const needed = [pm.request.url.toString(), pm.request.body ? pm.request.body.raw : '', authReference];
    const keys = new Set(needed.join(' ').match(/\\{\\{[A-Za-z][A-Za-z0-9_]*\\}\\}/g) || []);
    for (const token of keys) {
      const key = token.slice(2,-2);
      if (!pm.variables.get(key)) throw new Error('Set local environment variable: ' + key);
    }''')
        success = [int(k) for k in op['responses'] if str(k).startswith('2')]
        statuses = expected or success
        schemas = {}
        for status in statuses:
            response = op['responses'].get(str(status), {})
            schema = response.get('content', {}).get('application/json', {}).get('schema')
            if schema:
                schemas[status] = resolve(schema, doc)
        tests = f'''const expected = {json.dumps(statuses)};
    pm.test('HTTP status matches scenario', () => pm.expect(pm.response.code).to.be.oneOf(expected));
    pm.test('JSON content type', () => pm.expect(pm.response.headers.get('Content-Type') || '').to.match(/application\\/json/i));
    const body = pm.response.json();
    const schemas = {json.dumps(schemas, ensure_ascii=False)};
    if (schemas[pm.response.code]) pm.test('Response matches API schema', () => pm.response.to.have.jsonSchema(schemas[pm.response.code]));
    if (expected.includes(pm.response.code) && pm.response.code < 300) {{
    '''
        # Save only resource identities from successful responses; never use accountId as profile ID.
        tests += '''  for (const key of ['customerId','driverId','bookingId','tripId','paymentId','invitationId','notificationId','reviewId','otpId']) {
        if (body[key]) pm.environment.set(key, body[key]);
      }
      if (body.booking) {
        pm.environment.set('bookingId', body.booking.bookingId);
        if (body.booking.tripId) pm.environment.set('tripId', body.booking.tripId);
      }
    '''
        if oid == 'loginAccount':
            tests += f"  pm.test('Login role is {role}', () => pm.expect(body.account.role).to.eql('{role}'));\n  if (body.account.role === '{role}') pm.environment.set('{role_key}Token', body.accessToken);\n"
        if oid == 'requestDriverOtp':
            tests += "  if (body.mockCode) pm.environment.set('otpCode', body.mockCode);\n"
        if oid == 'listMyInvitations':
            tests += "  const offer = body.items.find(x => x.bookingId === pm.variables.get('bookingId') && x.status === 'PENDING');\n  if (offer) pm.environment.set('invitationId', offer.invitationId);\n"
        if oid == 'listMyNotifications':
            tests += "  if (body.items.length) pm.environment.set('notificationId', body.items[0].notificationId);\n"
        if oid == 'getTrip' or oid in ['arriveTrip', 'startTrip', 'completeTrip']:
            tests += "  pm.environment.set('tripStatus', body.status);\n  pm.environment.set('tripStatusTripId', body.tripId);\n"
        if oid in ['createPayment', 'retryPayment', 'getPayment']:
            tests += "  pm.environment.set('paymentStatus', body.status);\n  pm.environment.set('paymentAmount', String(body.amount));\n  pm.environment.set('paymentReferenceCode', body.referenceCode);\n"
        if oid == 'createBooking':
            tests += "  pm.environment.set('bookingReplayId', body.bookingId);\n  pm.environment.set('bookingReplayBody', pm.variables.replaceIn(pm.request.body.raw));\n"
        if oid == 'createPayment':
            tests += "  pm.environment.set('paymentReplayId', body.paymentId);\n"
        states = {'arriveTrip': 'ARRIVED', 'startTrip': 'IN_PROGRESS', 'completeTrip': 'COMPLETED', 'cancelBooking': 'CANCELED'}
        if oid in states:
            tests += f"  pm.test('Business state {states[oid]}', () => pm.expect(body.status).to.eql('{states[oid]}'));\n"
        if oid == 'gatewayServiceHealth':
            tests += "  pm.test('12 unique component names', () => pm.expect(new Set(body.components.map(x => x.name)).size).to.eql(12));\n"
        tests += '}\n' + after
        return {'name': label or f'{oid} | {op["summary"]}', 'request': req,
                'event': [event('prerequest', '\n'.join(pre)), event('test', tests)], 'response': []}


    catalog = [{'name': name, 'item': [request(oid) for oid in entries]} for name, entries in specs]
    catalog[0]['item'].extend([
        request('registerAccount', role='DRIVER', label='registerDriver | Verified OTP required'),
        request('loginAccount', role='DRIVER', label='loginDriver'),
        request('loginAccount', role='ADMIN', label='loginAdmin | Seeded account; no public admin registration'),
    ])


    def replay(oid, label, key, ident):
        item = request(oid, label=label, expected=[200])
        script = '\n'.join(item['event'][0]['script']['exec'])
        script = '\n'.join(line for line in script.splitlines() if f'pm.environment.set("{key}"' not in line)
        script += f"\nif (!pm.variables.get('{key}') || !pm.variables.get('{ident}')) throw new Error('Run original request first');"
        if oid == 'createBooking':
            script += "\npm.request.body.update(pm.variables.get('bookingReplayBody'));"
        item['event'][0] = event('prerequest', script)
        field = 'bookingId' if oid == 'createBooking' else 'paymentId'
        test = '\n'.join(item['event'][1]['script']['exec'])
        # Compare against the original ID before any response-capture code can update it.
        test = f"const originalId = pm.variables.get('{ident}');\n" + test
        test += f"\npm.test('Replay returns original resource', () => pm.expect(body.{field}).to.eql(originalId));"
        item['event'][1] = event('test', test)
        return item


    scenarios = []
    scenarios.append({'name': '11 - Booking idempotency (run on a separate fixture)', 'item': [
        request('createBooking', label='A - Create booking with a new key'),
        replay('createBooking', 'B - Replay exact booking request', 'bookingKey', 'bookingReplayId'),
    ]})
    conflict = request('createBooking', label='C - Same booking key, different payload rejected', expected=[409])
    conflict['event'][0] = event('prerequest', '''if (!pm.variables.get('bookingKey') || !pm.variables.get('bookingReplayBody')) throw new Error('Run original booking first');
    const changed = JSON.parse(pm.variables.get('bookingReplayBody'));
    changed.destination.latitude += 0.001;
    pm.request.body.update(JSON.stringify(changed));''')
    scenarios[-1]['item'].append(conflict)
    scenarios.append({'name': '12 - Payment after COMPLETED (manual signed callback)', 'item': [
        request('getTrip', role='CUSTOMER', label='A - Verify Trip is COMPLETED',
                after="pm.test('Payment prerequisite', () => pm.expect(body.status).to.eql('COMPLETED'));"),
        request('createPayment', label='B - Create payment (attempt 1)'),
        replay('createPayment', 'C - Replay payment with original key', 'paymentKey', 'paymentReplayId'),
        request('handleMockCallback', label='D - Signed COMPLETED callback (external signer required)',
                after="pm.test('Payment completed', () => pm.expect(body.status).to.eql('COMPLETED'));"),
        request('handleMockCallback', label='E - Duplicate identical signed callback',
                after="pm.test('Duplicate acknowledged', () => pm.expect(body.duplicate).to.eql(true));"),
        request('getPayment', label='F - Verify payment COMPLETED',
                after="pm.test('Payment COMPLETED', () => pm.expect(body.status).to.eql('COMPLETED'));"),
        request('getPaymentSummary', label='G - Verify one completed attempt',
                after="pm.test('Paid exactly once', () => {pm.expect(body.hasCompleted).to.eql(true); pm.expect(body.attempts.filter(x => x.status === 'COMPLETED').length).to.eql(1);});"),
    ]})
    invalid_callback = request('handleMockCallback', label='H - Invalid callback signature rejected, including duplicate events', expected=[401])
    for header in invalid_callback['request']['header']:
        if header['key'] == 'X-Mock-Signature':
            header['value'] = 'sha256=' + '0' * 64
    scenarios[-1]['item'].append(invalid_callback)
    scenarios.append({'name': '13 - FAILED payment then retry (separate Trip fixture)', 'item': [
        request('handleMockCallback', label='A - Signed FAILED callback (sign separately)',
                after="pm.test('Payment failed', () => pm.expect(body.status).to.eql('FAILED'));"),
        request('getPayment', label='B - Verify FAILED original payment',
                after="pm.test('Retry prerequisite', () => pm.expect(body.status).to.eql('FAILED')); pm.environment.set('failedPaymentId', body.paymentId);"),
        request('retryPayment', label='C - Retry with NEW idempotency key',
                after="pm.test('New attempt', () => {pm.expect(body.paymentId).not.to.eql(pm.variables.get('failedPaymentId')); pm.expect(body.attemptNumber).to.be.within(2,3);});"),
        request('handleMockCallback', label='D - Sign COMPLETED callback for NEW paymentId',
                after="pm.test('Retry completed', () => pm.expect(body.status).to.eql('COMPLETED'));"),
    ]})

    sql = request('loginAccount', label='25 - SQL injection rejected', expected=[400, 401])
    sql['request']['body']['raw'] = json.dumps({'phone': "' OR 1=1 --", 'password': 'invalid-input-only'})
    nosql = copy.deepcopy(sql)
    nosql['name'] = '25 - NoSQL operator injection rejected'
    nosql['request']['body']['raw'] = json.dumps({'phone': {'$ne': None}, 'password': {'$ne': None}})
    xss = request('updateMyCustomer', label='26 - XSS input rejected', body={'fullName': "<script>alert('hack')</script>"}, expected=[400])
    forbidden = request('getMyDriver', role='CUSTOMER', label='28 - CUSTOMER cannot call DRIVER API', expected=[403])
    missing = request('getIdentity', label='27 - Missing token rejected', expected=[401])
    missing['request']['auth'] = {'type': 'noauth'}
    tampered = request('getIdentity', label='27 - Tampered real JWT rejected', auth='{{tamperedToken}}', expected=[401])
    tampered['event'][0] = event('prerequest', r'''const token = pm.variables.get('customerToken');
    if (!token || token.split('.').length !== 3) throw new Error('Login CUSTOMER first');
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    payload.role = 'ADMIN'; payload.sub = '000000000000000000000099';
    parts[1] = btoa(JSON.stringify(payload)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    pm.variables.set('tamperedToken', parts.join('.'));''')
    limited = request('createBooking', label='29 - Over-limit booking (run ONLY after exhausting limiter)', expected=[429],
                      after="pm.test('Retry-After present', () => pm.expect(Number(pm.response.headers.get('Retry-After'))).to.be.above(0));")
    limited['request']['header'] = [h for h in limited['request']['header'] if h['key'] != 'Idempotency-Key'] + [{'key': 'Idempotency-Key', 'value': '{{$guid}}'}]
    scenarios.append({'name': '14 - Security (manual fixtures; not a load generator)',
                      'item': [sql, nosql, xss, missing, tampered, forbidden, limited]})
    scenarios.append({'name': '15 - Alternative business paths (separate fixtures)', 'item': [
        request('setDriverAvailability', label='23 - Driver OFFLINE', body={'isOnline': False}),
        request('decideDriverApproval', label='22 - Reject driver', body={'decision': 'REJECTED', 'reason': 'Incomplete demo documents'}),
        request('respondInvitation', label='16 - Reject invitation', body={'decision': 'REJECT'}),
        request('listMyNotifications', role='DRIVER', label='Driver notifications'),
        request('gatewayReady', label='Readiness dependency failure', expected=[503]),
        request('gatewayServiceHealth', label='Service health dependency failure', expected=[503]),
    ]})

    collection = {
        'info': {'name': 'CAB System - Gateway REST (docs/api)',
                 'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                 'description': 'CANDIDATE ONLY - not the Phase 6 test suite. Source: docs/api/01-auth.yaml through 10-health.yaml. Catalog plus manual scenario folders; do not run the entire collection as one workflow. Runtime NOT_RUN; backend not implemented. Import local environment. All requests use Gateway REST, no direct gRPC. See postman/README.md.'},
        'variable': [{'key': 'baseUrl', 'value': VARIABLES['baseUrl']}, {'key': 'apiPrefix', 'value': VARIABLES['apiPrefix']}],
        'item': catalog + scenarios,
    }
    environment = {'name': 'CAB - Local Gateway (template)', '_postman_variable_scope': 'environment',
                   'values': [{'key': k, 'value': v, 'enabled': True,
                               'type': 'secret' if k.endswith(('Password', 'Token', 'Signature')) or k == 'otpCode' else 'default'}
                              for k, v in VARIABLES.items()]}
    write_json(OUT / 'collections/CAB-System.postman_collection.json', collection)
    # Never replace a user's edited environment, even if generation is run again.
    env_path = OUT / 'environments/CAB-Local.postman_environment.json'
    if not env_path.exists():
        write_json(env_path, environment)
    write_json(OUT / 'documents/api-source-manifest.json', {'sources': sources, 'operationCount': len(ops), 'runtimeStatus': 'NOT_RUN'})
    print(f'Generated {len(ops)} unique Gateway operations plus role variants and scenario requests; runtime NOT_RUN.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, help='Explicit NEW candidate directory, not a live collection path')
    args = parser.parse_args()
    if args.output_dir is None:
        parser.exit(2, 'Generation disabled by default: Phase 6 assertions, variables and fixtures must be preserved. No files written.\n')
    try:
        generate(args.output_dir)
    except ValueError as error:
        parser.exit(2, str(error) + '\n')


if __name__ == '__main__':
    main()
