#!/usr/bin/env python3
"""Primary Phase 6 callback signer. Offline only; key from MOCK_CALLBACK_SECRET."""
import argparse
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]


def signing_secret():
    """Read only process environment; never read Postman variables or prompt."""
    secret = os.environ.get('MOCK_CALLBACK_SECRET', '')
    if len(secret.encode('utf-8')) < 32:
        raise ValueError('MOCK_CALLBACK_SECRET must match the backend key and be at least 32 bytes; set it in the process environment')
    return secret


def prepare(environment, payment_id, reference, amount, result, secret, timestamp=None, event_id=None):
    if not re.fullmatch(r'[0-9a-f]{24}', payment_id):
        raise ValueError('payment-id must be a lowercase 24-hex ObjectId')
    if type(amount) is not int or not 0 <= amount <= 10**12:
        raise ValueError('amount must be an integer in [0, 10^12]')
    if not isinstance(reference, str) or not 1 <= len(reference) <= 128:
        raise ValueError('reference must have 1-128 characters')
    if result not in ['COMPLETED', 'FAILED']:
        raise ValueError('result must be COMPLETED or FAILED')
    timestamp = int(time.time()) if timestamp is None else timestamp
    event_id = str(uuid.uuid4()) if event_id is None else event_id
    if type(timestamp) is not int or not 0 <= timestamp <= 9999999999:
        raise ValueError('timestamp outside the callback contract')
    if not isinstance(event_id, str) or not 1 <= len(event_id) <= 128:
        raise ValueError('event-id must have 1-128 characters')
    if any(marker in value for value in [reference, event_id] for marker in ['{{', '}}']):
        raise ValueError('Postman variable markers are not allowed inside signed callback fields')
    if not isinstance(secret, str) or len(secret.encode('utf-8')) < 32:
        raise ValueError('signing key must have at least 32 bytes')
    entries = environment.get('values')
    if not isinstance(entries, list) or any(not isinstance(x, dict) or not isinstance(x.get('key'), str) for x in entries):
        raise ValueError('env-in must be a Postman environment with a values list')
    if len({x['key'] for x in entries}) != len(entries):
        raise ValueError('duplicate environment keys require review')
    payload = {'eventId': event_id, 'paymentId': payment_id, 'referenceCode': reference,
               'amount': amount, 'currency': 'VND', 'result': result, 'timestamp': timestamp}
    # Serialize ONCE. Export precisely the bytes that were signed, without a trailing LF.
    raw = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
    signed = (str(timestamp) + '\n' + raw).encode('utf-8')
    signature = 'sha256=' + hmac.new(secret.encode('utf-8'), signed, hashlib.sha256).hexdigest()
    values = {}
    for entry in entries:
        normalized = re.sub(r'[^a-z]', '', entry['key'].lower())
        if 'secret' in normalized or normalized == 'signingkey' or ('callback' in normalized and normalized.endswith('key')):
            continue
        # Prevent accidental copying of the signing key under an unexpected variable name.
        if secret in json.dumps(entry, ensure_ascii=False):
            continue
        values[entry['key']] = entry
    for key, value in {'callback_payload': raw, 'callback_signature': signature,
                       'callback_timestamp': str(timestamp), 'callback_payment_id': payment_id,
                       'callback_expected_status': result, 'callback_duplicate_expected': 'false'}.items():
        values[key] = {'key': key, 'value': value, 'type': 'secret', 'enabled': True}
    prepared = {**environment, 'name': 'CAB Local - prepared callback (private)', 'values': list(values.values())}
    if secret in json.dumps(prepared, ensure_ascii=False):
        raise ValueError('signing key found in environment metadata; output refused')
    return prepared


def write_private_environment(output, environment):
    output = Path(output).resolve()
    local_root = (ROOT / '.local').resolve()
    if not (output.name.startswith('.env.') and output.name != '.env.example') and not output.is_relative_to(local_root):
        raise ValueError('output must be inside .local/ or use an ignored .env.* filename')
    if output.is_relative_to(ROOT):
        ignored = subprocess.run(['git', 'check-ignore', '--no-index', '-q', '--', output.relative_to(ROOT).as_posix()], cwd=ROOT)
        if ignored.returncode != 0:
            raise ValueError('output is not ignored by Git; refusing to export local credentials')
    if output.exists():
        raise ValueError('output exists; choose a new path, never overwrite a local environment')
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('x', encoding='utf-8', newline='\n') as handle:
        json.dump(environment, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    try:
        output.chmod(0o600)
    except OSError:
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--env-in', type=Path, required=True, help='Locally exported Phase 6 environment; existing variables are preserved')
    parser.add_argument('--out', type=Path, default=Path('.local/callback.postman_environment.json'))
    parser.add_argument('--payment-id', required=True)
    parser.add_argument('--reference', required=True)
    parser.add_argument('--amount', type=int, required=True)
    parser.add_argument('--result', choices=['COMPLETED', 'FAILED'], required=True)
    parser.add_argument('--event-id')
    parser.add_argument('--timestamp', type=int, help='Optional timestamp for an explicit stale-event test')
    args = parser.parse_args()
    try:
        secret = signing_secret()
        environment = json.loads(args.env_in.read_text(encoding='utf-8-sig'))
        result = prepare(environment, args.payment_id, args.reference, args.amount, args.result,
                         secret, args.timestamp, args.event_id)
        write_private_environment(args.out, result)
    except (ValueError, OSError) as error:
        parser.exit(2, 'Callback preparation refused: ' + str(error) + '\n')
    print('Prepared a local signed environment; key not exported. No HTTP request sent.')
    print('It may contain preserved session credentials; do not commit or share it.')


if __name__ == '__main__':
    main()
