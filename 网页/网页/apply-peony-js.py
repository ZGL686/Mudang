"""Localize visible captions in the unmodified source interaction engine."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'peony-art/source-app.js'
TARGET = ROOT / 'wp-content/themes/davidwhyte/app.js'
script = SOURCE.read_text(encoding='utf-8')
for old, new in {
    'Open the landscape': '走入画卷',
}.items():
    if old not in script:
        raise ValueError(f'Missing source label: {old}')
    script = script.replace(old, new)
TARGET.write_text(script, encoding='utf-8')
