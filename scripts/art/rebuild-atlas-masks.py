"""Repack replacement art masks using the source engine's unchanged atlas layout.

Only asset files are changed. The packed RGB distance convention and per-layer
padding are taken from the original renderer metadata.
"""
from pathlib import Path
import json, re, shutil
import numpy as np
from PIL import Image, ImageOps
from collections import deque

ROOT = Path(__file__).resolve().parents[2]
ATLAS = ROOT / 'public/assets/experience/xp/textures/atlas'
ART = ROOT / 'materials/artwork/experience'
QA = ROOT / 'docs/qa/current'
# Artwork tile bounds in a 900-unit inspection grid. AI sheet placement does
# not exactly match the engine UV rectangles; repack each complete cutout.
ART_BOUNDS = {
 'tree_1':[0,0,289,240], 'land_front_3':[290,0,581,145],
 'land_front_4':[580,0,770,66], 'land_back_2':[290,145,722,239],
 'background_2':[0,240,432,368], 'walker_1':[434,240,496,368],
 'sheep_4':[496,240,609,306], 'sheep_1':[610,240,699,299],
 'sheep_2':[496,306,637,350], 'land_back_1':[0,368,432,470],
 'land_back_4':[433,368,723,463], 'land_back_3':[0,471,433,568],
 'cow_2':[440,463,589,562], 'sheep_3':[591,463,721,535],
 'land_front_5':[0,569,289,656], 'land_front_1':[290,566,563,655],
 'cow_3':[564,553,709,650], 'land_front_7':[0,658,295,735],
 'viaduc_1':[296,656,724,735], 'land_back_5':[0,736,431,815],
 'land_front_6':[432,736,606,815], 'cow_1':[610,735,728,811],
 'land_front_2':[0,815,283,853], 'sheep_5':[284,815,341,847],
 'sheep_6':[342,812,405,844], 'sheep_7':[407,811,464,842],
}
source = (ART / 'source-app.js').read_text(encoding='utf-8')
def metadata(name):
    return dict(json.loads(re.search(name + r"=JSON.parse\('(.*?)'\)", source).group(1)))

def edt1(f):
    # Exact squared Euclidean lower-envelope transform (finite sentinel).
    n = len(f); v = np.zeros(n, dtype=int); z = np.empty(n+1)
    k = 0; z[0] = -np.inf; z[1] = np.inf
    for q in range(1, n):
        s = ((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])
        while s <= z[k]:
            k -= 1
            s = ((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])
        k += 1; v[k] = q; z[k] = s; z[k+1] = np.inf
    k = 0; out = np.empty(n)
    for q in range(n):
        while z[k+1] < q: k += 1
        out[q] = (q-v[k])**2+f[v[k]]
    return out

def distance(features):
    d = np.where(features, 0., 1e12)
    for y in range(d.shape[0]): d[y] = edt1(d[y])
    for x in range(d.shape[1]): d[:, x] = edt1(d[:, x])
    return np.sqrt(d)

def encode(d):
    packed = np.clip(np.rint(d*1000+255**3/2), 0, 255**3-1).astype(np.int64)
    return np.stack([packed//65025, packed//255 % 255, packed % 255,
                     np.full(d.shape, 255)], axis=-1).astype('uint8')

def clean_tile(tile):
    # Remove disconnected neighbouring-tile slivers captured at crop borders.
    # Analyse a small occupancy mask, keeping substantial painted components.
    small = tile.copy(); small.thumbnail((320,320))
    occupied = np.asarray(small).max(axis=2)>18
    labels = np.zeros(occupied.shape,dtype=np.int32); parts=[]; label=0
    hh,ww=occupied.shape
    for yy,xx in zip(*np.where(occupied)):
        if labels[yy,xx]: continue
        label+=1; labels[yy,xx]=label; q=deque([(yy,xx)])
        count=0; xmin=xmax=xx; ymin=ymax=yy
        while q:
            y,x=q.popleft();count+=1
            xmin=min(xmin,x);xmax=max(xmax,x);ymin=min(ymin,y);ymax=max(ymax,y)
            for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
                ny,nx=y+dy,x+dx
                if 0<=ny<hh and 0<=nx<ww and occupied[ny,nx] and not labels[ny,nx]:
                    labels[ny,nx]=label;q.append((ny,nx))
        parts.append((label,count,(xmax-xmin+1)/(ymax-ymin+1)))
    largest=max(p[1] for p in parts)
    keep=[i for i,n,ratio in parts if n>=max(5,largest*.004) and ratio<30]
    matte=Image.fromarray((np.isin(labels,keep)*255).astype('uint8')).resize(tile.size,Image.Resampling.NEAREST)
    # Expand the retained component mask a little to preserve antialiased edges.
    from PIL import ImageFilter
    matte=matte.filter(ImageFilter.MaxFilter(5))
    return Image.composite(tile,Image.new('RGB',tile.size),matte)

def main():
    for name in ['sdf.png', 'texture.jpg', 'texture_mask.jpg']:
        backup = ART / ('before-mask-repair-' + name)
        if not backup.exists(): shutil.copy2(ATLAS/name, backup)
    paint, sdf = metadata('l2'), metadata('s2')
    sheet = Image.open(ART/'peony-atlas-ai.png').convert('RGB')
    art = Image.new('RGB',(4096,4096))
    for name, data in paint.items():
        r=data['atlasRemap']; x,y,w,h=[round(r[k]*4096) for k in ['x','y','z','w']]
        bounds=ART_BOUNDS[name]
        box=tuple(round(v*sheet.size[i%2]/900) for i,v in enumerate(bounds))
        tile=ImageOps.contain(clean_tile(sheet.crop(box)),(w-4,h-4),Image.Resampling.LANCZOS)
        # Align to the ground baseline retained by the original scene model.
        art.paste(tile,(x+(w-tile.width)//2,y+h-tile.height-2))
    rgb = np.asarray(art)
    # This art is a black-backed atlas. Preserve coloured dark ink, reject only
    # near-black empty pixels; no photographic background removal is performed.
    mask = rgb.max(axis=2) > 18
    output = np.zeros((1024,1024,4), dtype='uint8')
    output[:] = encode(np.array([[1000.]]))[0,0]
    report = []
    for name, data in sdf.items():
        r = paint[name]['atlasRemap']; a = data['atlasRemap']
        x,y,w,h = [round(r[k]*4096) for k in ['x','y','z','w']]
        sx,sy,sw,sh = [round(a[k]*1024) for k in ['x','y','z','w']]
        # Each SDF tile was exported from a framebuffer and is vertically
        # reversed relative to its paint tile (verified against original art).
        yy,xx = np.mgrid[:sh,:sw]
        u = ((xx+.5)/sw-.5)*data['scale']['x']+.5
        v = ((yy+.5)/sh-.5)*data['scale']['y']+.5
        ix = np.clip((u*w).astype(int),0,w-1)+x
        iy = np.clip((v*h).astype(int),0,h-1)+y
        inside = (mask[iy,ix] & (u>=0)&(u<1)&(v>=0)&(v<1))[::-1]
        # Positive outside, negative inside; convert packed-atlas pixels back
        # to the original padded source-image pixel distance used by GLSL.
        scale = data['pixelSize']['x']/sw
        signed = (distance(inside)-distance(~inside))*scale
        output[sy:sy+sh,sx:sx+sw] = encode(signed)
        report.append({'layer':name,'occupiedPixels':int(inside.sum()),'region':[sx,sy,sw,sh]})
    art.save(ATLAS/'texture.jpg', quality=95, subsampling=0)
    Image.fromarray((mask*255).astype('uint8')).save(ATLAS/'texture_mask.jpg', quality=100, subsampling=0)
    Image.fromarray(output).save(ATLAS/'sdf.png')
    QA.mkdir(parents=True, exist_ok=True)
    (QA/'atlas-mask-repair.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(f'Rebuilt {len(report)} layer masks and packed distance fields; interaction code unchanged.')

if __name__ == '__main__': main()
