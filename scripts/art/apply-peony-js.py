"""Rebuild the relocated and localized graphics engine from the archived source."""
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'materials/artwork/experience/source-app.js'
TARGET = ROOT / 'public/vendor/experience/engine.js'
spec = importlib.util.spec_from_file_location('engine_adapter', ROOT/'scripts/lib/adapt-experience-engine.py')
adapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(adapter)

TARGET.parent.mkdir(parents=True, exist_ok=True)
TARGET.write_text(adapter.adapt_engine(SOURCE.read_text(encoding='utf-8')), encoding='utf-8')
print('Rebuilt the localized experience engine with the Vite asset roots.')
