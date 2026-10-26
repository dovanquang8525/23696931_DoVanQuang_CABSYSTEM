"""Compatibility CLI for the older camelCase catalog; Phase 6 uses prepare_callback.py.

No independent signer or password prompt. Uses the primary signer's byte handling,
validation and private-output rules. Prefer MOCK_CALLBACK_SECRET; the historical
CAB_MOCK_CALLBACK_SECRET process variable remains supported for old CLI callers.
"""
import argparse
import json
import os
from pathlib import Path

from prepare_callback import prepare, write_private_environment


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--payment-id', required=True)
    parser.add_argument('--reference-code', required=True)
    parser.add_argument('--amount', required=True, type=int)
    parser.add_argument('--result', choices=['COMPLETED', 'FAILED'], required=True)
    parser.add_argument('--event-id')
    parser.add_argument('--timestamp', type=int)
    parser.add_argument('--environment', type=Path)
    parser.add_argument('--output', type=Path, default=Path('.env.postman-callback.json'))
    args = parser.parse_args()
    try:
        current = os.environ.get('MOCK_CALLBACK_SECRET', '')
        historical = os.environ.get('CAB_MOCK_CALLBACK_SECRET', '')
        if current and historical and current != historical:
            raise ValueError('process signing-key variables disagree; use one backend key')
        secret = current or historical
        if not secret:
            raise ValueError('set MOCK_CALLBACK_SECRET in the process environment; no interactive fallback')
        template = args.environment or Path(__file__).resolve().parents[1] / 'postman/environments/CAB-Local.postman_environment.json'
        environment = json.loads(template.read_text(encoding='utf-8-sig'))
        prepared = prepare(environment, args.payment_id, args.reference_code, args.amount,
                           args.result, secret, args.timestamp, args.event_id)
        values = {entry['key']: entry for entry in prepared['values']}
        for old, new in [('callbackRawBody','callback_payload'), ('callbackTimestamp','callback_timestamp'), ('callbackSignature','callback_signature')]:
            values[old] = {**values[new], 'key': old}
        prepared['values'] = list(values.values())
        prepared['name'] = 'CAB - compatibility catalog signed callback (private)'
        write_private_environment(args.output, prepared)
    except (ValueError, OSError) as error:
        parser.exit(2, 'Callback preparation refused: ' + str(error) + '\n')
    print('Prepared compatibility environment using the primary signer. Key not exported; no HTTP sent.')
    print('Phase 6 uses prepare_callback.py and snake_case variables instead.')


if __name__ == '__main__':
    main()
