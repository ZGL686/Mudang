"""Asset/structure checks; these do not substitute for a browser interaction test."""
from pathlib import Path
import json, re, importlib.util, subprocess
import numpy as np
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[2]
QA = ROOT/'docs/qa/current'
QA.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('atlas', ROOT/'scripts/art/rebuild-atlas-masks.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
adapter_spec = importlib.util.spec_from_file_location('engine_adapter', ROOT/'scripts/lib/adapt-experience-engine.py')
adapter = importlib.util.module_from_spec(adapter_spec); adapter_spec.loader.exec_module(adapter)
source = (ROOT/'materials/artwork/experience/source-app.js').read_text(encoding='utf-8')
current = (ROOT/'public/vendor/experience/engine.js').read_text(encoding='utf-8')
assert current == adapter.adapt_engine(source), 'Unexpected modification beyond the deterministic localization/relocation adapter'
xp = ROOT/'public/assets/experience'
paths = sorted(set(re.findall(r'path:"(/xp/[^"?]+)"', source)))
missing = [p for p in paths if not (xp/p.lstrip('/')).is_file()]
assert not missing, missing
for file in ['source/styles/experience-loader.css','source/styles/experience-vendor.css','source/styles/experience.css']:
    assert (ROOT/file).is_file(), f'Missing relocated engine dependency: {file}'
page = (ROOT/'index.html').read_text(encoding='utf-8')
assert '/source/main.jsx' in page, 'Main document must bootstrap React'
assert 'story-player.mjs' not in page
rendered = subprocess.run(['node',str(ROOT/'scripts/qa/check-experience-content.mjs')],cwd=ROOT,check=True,capture_output=True,text=True,encoding='utf-8')
content_report = json.loads(rendered.stdout.strip().splitlines()[-1])
assert content_report['chapterCount']==6 and content_report['quoteCount']==18 and content_report['textHookCount']==6
mask = np.asarray(Image.open(m.ATLAS/'texture_mask.jpg').convert('L'))>128
rgba = np.asarray(Image.open(m.ATLAS/'sdf.png')).astype(float)
signed = (rgba[:,:,0]*65025+rgba[:,:,1]*255+rgba[:,:,2]-255**3/2)/1000
paint = m.metadata('l2'); sdf = m.metadata('s2')
report = {'interactionCode':'matches deterministic CTA/resource/bootstrap adapter of archived source', 'resourceCount':len(paths), 'missing':missing, 'content':content_report, 'quoteCount':18, 'layers':[], 'browserVerified':False}
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
assert len(report['layers'])==26, 'All original atlas masks must be checked'
sheet.save(QA/'original-engine-layers.jpg')
(QA/'original-experience-checks.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(f'PASS: deterministic engine adaptation; {len(paths)} required assets; 18 source quotations rendered by React; 26 matching masks. Browser verification still pending.')
