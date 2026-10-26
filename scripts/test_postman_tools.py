"""Offline regression checks for callback utilities and generator write guards.

Uses synthetic credentials only. Never generates or rewrites a collection.
"""
import copy
import hashlib
import hmac
import importlib.util
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from prepare_callback import prepare, write_private_environment


class PostmanToolTests(unittest.TestCase):
    def setUp(self):
        self.secret = secrets.token_hex(32)
        self.environment = {'name': 'synthetic session', 'values': [
            {'key': 'customer_token', 'value': 'synthetic-token', 'enabled': True},
            {'key': 'booking_original', 'value': '{"bookingId":"snapshot"}', 'enabled': True},
            {'key': 'MOCK_CALLBACK_SECRET', 'value': self.secret, 'enabled': True},
            {'key': 'signingKey', 'value': self.secret, 'enabled': True},
        ]}
        self.kwargs = dict(environment=self.environment, payment_id='000000000000000000000008',
                           reference='MOCK-REFERENCE', amount=20000, result='COMPLETED',
                           secret=self.secret, timestamp=1793059200, event_id='fixture-event')

    def test_raw_utf8_and_preservation(self):
        original = copy.deepcopy(self.environment)
        prepared = prepare(**{**self.kwargs, 'reference': 'MOCK-\u0111\u01a1n'})
        values = {x['key']: x['value'] for x in prepared['values']}
        raw = values['callback_payload']
        expected = 'sha256=' + hmac.new(self.secret.encode(), ('1793059200\n' + raw).encode('utf-8'), hashlib.sha256).hexdigest()
        self.assertTrue(hmac.compare_digest(expected, values['callback_signature']))
        self.assertEqual(json.loads(raw)['referenceCode'], 'MOCK-\u0111\u01a1n')
        self.assertFalse(raw.endswith('\n'))
        self.assertEqual(values['customer_token'], 'synthetic-token')
        self.assertEqual(values['booking_original'], original['values'][1]['value'])
        self.assertNotIn(self.secret, json.dumps(prepared, ensure_ascii=False))
        self.assertNotIn('MOCK_CALLBACK_SECRET', values)
        self.assertNotIn('signingKey', values)
        self.assertEqual(original, self.environment)

    def test_contract_validation_and_no_template_replacement(self):
        for change in [dict(amount=-1), dict(amount=10**12+1), dict(amount=True),
                       dict(timestamp=-1), dict(timestamp=10**10), dict(result='SUCCESS'),
                       dict(payment_id='bad'), dict(reference=''), dict(event_id=''),
                       dict(reference='{{payment_reference}}'), dict(event_id='{{event}}'),
                       dict(secret='short')]:
            with self.subTest(change=list(change)):
                with self.assertRaises(ValueError):
                    prepare(**{**self.kwargs, **change})

    def test_duplicate_environment_keys_rejected(self):
        env = copy.deepcopy(self.environment)
        env['values'].append(copy.deepcopy(env['values'][0]))
        with self.assertRaises(ValueError):
            prepare(**{**self.kwargs, 'environment': env})

    def test_private_output_and_overwrite_guard(self):
        with tempfile.TemporaryDirectory(prefix='cab-postman-tools-') as folder:
            work = Path(folder).resolve()
            self.assertEqual(work.parent, Path(tempfile.gettempdir()).resolve())
            output = work / '.env.signed.json'
            prepared = prepare(**self.kwargs)
            write_private_environment(output, prepared)
            before = output.read_bytes()
            with self.assertRaises(ValueError):
                write_private_environment(output, prepared)
            self.assertEqual(before, output.read_bytes())
            with self.assertRaises(ValueError):
                write_private_environment(work / 'public-environment.json', prepared)
            with self.assertRaises(ValueError):
                write_private_environment(ROOT / '.env.example', prepared)

    def test_primary_cli_environment_only_and_compatibility_bytes(self):
        with tempfile.TemporaryDirectory(prefix='cab-postman-cli-') as folder:
            work = Path(folder).resolve()
            self.assertEqual(work.parent, Path(tempfile.gettempdir()).resolve())
            env_in = work / '.env.input.json'
            env_in.write_text(json.dumps(self.environment), encoding='utf-8')
            primary_out = work / '.env.primary.json'
            common = ['--payment-id', self.kwargs['payment_id'], '--amount', '20000',
                      '--result', 'COMPLETED', '--event-id', 'fixture-event', '--timestamp', '1793059200']
            command = [sys.executable, '-B', str(ROOT / 'scripts/prepare_callback.py'),
                       '--env-in', str(env_in), '--out', str(primary_out), '--reference', 'MOCK-REFERENCE'] + common
            clean = {k: v for k, v in os.environ.items() if k not in ['MOCK_CALLBACK_SECRET','CAB_MOCK_CALLBACK_SECRET']}
            missing = subprocess.run(command, env=clean, capture_output=True)
            self.assertNotEqual(missing.returncode, 0)
            self.assertFalse(primary_out.exists())  # Key in input environment is never accepted.
            process_env = {**clean, 'MOCK_CALLBACK_SECRET': self.secret}
            completed = subprocess.run(command, env=process_env, capture_output=True)
            self.assertEqual(completed.returncode, 0, completed.stderr.decode(errors='replace'))
            self.assertNotIn(self.secret.encode(), completed.stdout + completed.stderr)
            compat_out = work / '.env.compatibility.json'
            compat = [sys.executable, '-B', str(ROOT / 'scripts/sign_mock_callback.py'),
                      '--environment', str(env_in), '--output', str(compat_out), '--reference-code', 'MOCK-REFERENCE'] + common
            subprocess.run(compat, env=process_env, check=True, capture_output=True)
            primary = {x['key']: x['value'] for x in json.loads(primary_out.read_text(encoding='utf-8'))['values']}
            older = {x['key']: x['value'] for x in json.loads(compat_out.read_text(encoding='utf-8'))['values']}
            self.assertEqual(primary['callback_payload'], older['callbackRawBody'])
            self.assertEqual(primary['callback_signature'], older['callbackSignature'])
            self.assertEqual(primary['callback_timestamp'], older['callbackTimestamp'])
            digest = hashlib.sha256(primary_out.read_bytes()).hexdigest()
            refused = subprocess.run(command, env=process_env, capture_output=True)
            self.assertNotEqual(refused.returncode, 0)
            self.assertEqual(digest, hashlib.sha256(primary_out.read_bytes()).hexdigest())

    def test_generator_never_targets_live_artifacts(self):
        paths = list((ROOT / 'postman/collections').glob('*.json'))
        paths += list((ROOT / 'postman/environments').glob('*.json'))
        paths.append(ROOT / 'postman/documents/api-source-manifest.json')
        before = {p: p.read_bytes() for p in paths}
        spec = importlib.util.spec_from_file_location('candidate_generator', ROOT / 'scripts/sync_postman.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)  # Import must have no output side effects.
        for target in [ROOT / 'postman', ROOT / 'postman/collections', ROOT / 'docs/api', ROOT / '.local/postman-candidates', ROOT / '.local/postman-candidates/../escape']:
            with self.subTest(target=target.name), self.assertRaises(ValueError):
                module.candidate_directory(target)
        for arguments in [[], ['--output-dir', str(ROOT / 'postman')]]:
            refused = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/sync_postman.py')] + arguments, capture_output=True)
            self.assertNotEqual(refused.returncode, 0)
        self.assertEqual(before, {p: p.read_bytes() for p in paths})


if __name__ == '__main__':
    unittest.main()
