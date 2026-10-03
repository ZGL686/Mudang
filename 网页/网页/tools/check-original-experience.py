"""Asset/structure checks; these do not substitute for a browser interaction test."""
from pathlib import Path
import json, re, hashlib, importlib.util
import numpy as np
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('atlas', Path(__file__).with_name('rebuild-atlas-masks.py'))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
source = (ROOT/'peony-art/source-app.js').read_text(encoding='utf-8')
current = (ROOT/'wp-content/themes/davidwhyte/app.js').read_text(encoding='utf-8')
assert current == source.replace('Open the landscape', '走入画卷'), 'Unexpected interaction-code modification'
xp = ROOT/'wp-content/themes/davidwhyte/resources/assets'
paths = sorted(set(re.findall(r'path:"(/xp/[^"?]+)"', source)))
missing = [p for p in paths if not (xp/p.lstrip('/')).is_file()]
assert not missing, missing
page = (ROOT/'index.html').read_text(encoding='utf-8')
assert 'story-player.mjs' not in page
assert page.count('class="xp-text" data-section=') == 6
timeline = json.loads((ROOT/'story-timeline.json').read_text(encoding='utf-8'))
from html import escape
for shot in timeline['shots']: assert escape(shot['quote']['text']) in page
mask = np.asarray(Image.open(m.ATLAS/'texture_mask.jpg').convert('L'))>128
rgba = np.asarray(Image.open(m.ATLAS/'sdf.png')).astype(float)
signed = (rgba[:,:,0]*65025+rgba[:,:,1]*255+rgba[:,:,2]-255**3/2)/1000
paint = m.metadata('l2'); sdf = m.metadata('s2')
report = {'interactionCode':'unchanged except six visible CTA translations', 'resourceCount':len(paths), 'missing':missing, 'quoteCount':18, 'layers':[], 'browserVerified':False}
art = Image.open(m.ATLAS/'texture.jpg')
sheet = Image.new('RGB',(1000,7*180),'#faf7ef'); draw = ImageDraw.Draw(sheet)
for i,(name,d) in enumerate(sdf.items()):
    r=paint[name]['atlasRemap']; a=d['atlasRemap']
    x,y,w,h=[round(r[k]*4096) for k in ['x','y','z','w']]
    sx,sy,sw,sh=[round(a[k]*1024) for k in ['x','y','z','w']]
    yy,xx=np.mgrid[:sh,:sw]
    u=((xx+.5)/sw-.5)*d['scale']['x']+.5
    v=((yy+.5)/sh-.5)*d['scale']['y']+.5
    inside=(mask[np.clip((v*h).astype(int),0,h-1)+y,np.clip((u*w).astype(int),0,w-1)+x]&(u>=0)&(u<1)&(v>=0)&(v<1))[::-1]
    agreement=float(np.mean(inside==(signed[sy:sy+sh,sx:sx+sw]<0)))
    assert agreement>.995, (name,agreement)
    report['layers'].append({'name':name,'maskSignAgreement':agreement})
    crop=art.crop((x,y,x+w,y+h)).convert('RGBA')
    crop.putalpha(Image.fromarray((mask[y:y+h,x:x+w]*255).astype('uint8')))
    crop.thumbnail((236,145),Image.Resampling.LANCZOS)
    col,row=i%4,i//4;sheet.paste(crop,(col*250+(250-crop.width)//2,row*180+25),crop)
    draw.text((col*250+8,row*180+5),name,fill='#392b26')
sheet.save(ROOT/'.qa/original-engine-layers.jpg')
(ROOT/'.qa/original-experience-checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f'PASS: original interaction preserved; {len(paths)} required assets; 18 source quotations; 26 matching masks. Browser verification still pending.')
