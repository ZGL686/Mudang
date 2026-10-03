"""Pad generated art to the source atlas silhouette used by the unchanged SDF shader."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
ATLAS = ROOT / 'wp-content/themes/davidwhyte/resources/assets/xp/textures/atlas'
ORIGINAL_MASK = ROOT / 'peony-art/original-uv-mask.jpg'
current = np.asarray(Image.open(ATLAS / 'texture.jpg').convert('RGB')).copy()
old_mask = np.asarray(Image.open(ORIGINAL_MASK).convert('L'))

# The original distance field retains its precise UV silhouettes. Generated art
# can have a slightly narrower footprint, so pad only those otherwise black pixels.
gap = (old_mask > 85) & (current.max(axis=2) < 18)
yy, xx = np.indices(gap.shape, dtype=np.int32)
shade = (xx * 13 + yy * 7) % 11 - 5
for channel, base in enumerate((240, 235, 225)):
    current[:, :, channel][gap] = (base + shade[gap]).astype(np.uint8)
Image.fromarray(current).save(ATLAS / 'texture.jpg', quality=95, subsampling=0)
Image.fromarray(old_mask).save(ATLAS / 'texture_mask.jpg', quality=95)
print(f'Padded {int(gap.sum())} atlas pixels to match the original SDF footprint')
