"""Read Postman v3 YAML through the shared read-only Node adapter; JSON remains supported."""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def _adapter(mode, file):
    result = subprocess.run(
        ['node', str(ROOT / 'scripts/postman-format.cjs'), mode, str(file)],
        cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise ValueError('Postman artifact could not be read; run node scripts/check-postman-v3.cjs for diagnostics')
    return json.loads(result.stdout)


def load_collection(file):
    return _adapter('collection', file)


def load_environment(file):
    file = Path(file)
    if file.suffix.lower() == '.json' and file.is_file():
        try:
            return json.loads(file.read_text(encoding='utf-8-sig'))
        except json.JSONDecodeError:
            pass
    return _adapter('environment', file)


def artifact_hash(file):
    return _adapter('hash', file)


def environment_text(environment, output):
    if Path(output).suffix.lower() not in ['.yaml', '.yml']:
        return json.dumps(environment, ensure_ascii=False, indent=2) + '\n'
    result = subprocess.run(
        ['node', str(ROOT / 'scripts/postman-format.cjs'), 'yaml'],
        input=json.dumps(environment, ensure_ascii=False), cwd=ROOT,
        capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise ValueError('YAML environment serialization refused')
    return result.stdout
