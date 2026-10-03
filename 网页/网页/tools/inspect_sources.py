from pathlib import Path
import zipfile, json, xml.etree.ElementTree as ET
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent.parent
DEST = ROOT / 'story-assets'
DEST.mkdir(exist_ok=True)
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def doc(name):
    with zipfile.ZipFile(WORKSPACE / name) as z:
        xml = ET.fromstring(z.read('word/document.xml'))
    paragraphs = [''.join(t.text or '' for t in p.findall('.//w:t', NS)) for p in xml.findall('.//w:p', NS)]
    tables = [[[ ''.join(t.text or '' for t in c.findall('.//w:t', NS)) for c in r.findall('w:tc',NS)] for r in table.findall('w:tr',NS)] for table in xml.findall('.//w:tbl',NS)]
    return {'paragraphs':paragraphs, 'tables':tables}

sources = {'storyboard':doc('牡丹真国色_全六场分镜_文字版(1).docx'), 'narrative':doc('主线内容(2)(1).docx')}
(DEST / 'source-documents.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
groups = {'一':'a','二':'b','三':'c','四':'d'}
manifest = []
with zipfile.ZipFile(WORKSPACE/'生成图.zip') as z:
    for info in z.infolist():
        parts = info.filename.split('/')
        if len(parts)!=3 or parts[1] not in groups or not parts[2].endswith('.png'): continue
        number = int(Path(parts[2]).stem)
        target = DEST / f'{groups[parts[1]]}-{number:02}.png'
        if not target.exists(): target.write_bytes(z.read(info))
        with Image.open(target) as im:
            manifest.append({'id':target.stem,'source':info.filename,'file':target.name,'size':im.size})
(DEST/'image-manifest.json').write_text(json.dumps(sorted(manifest,key=lambda x:x['id']),ensure_ascii=False,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
for prefix in groups.values():
    files=sorted(DEST.glob(prefix+'-*.png'))
    sheet=Image.new('RGB',(1200, len(range(0,len(files),3))*270),'#e8e4dc')
    draw=ImageDraw.Draw(sheet)
    for index,file in enumerate(files):
        with Image.open(file) as im: thumb=ImageOps.contain(im,(390,230))
        x=(index%3)*400; y=(index//3)*270
        sheet.paste(thumb,(x+(390-thumb.width)//2,y))
        draw.text((x+10,y+235),file.stem,font=font,fill='#181818')
    sheet.save(DEST/f'contact-{prefix}.jpg',quality=90)
print(json.dumps({'images':len(manifest),'tables':sources['storyboard']['tables']},ensure_ascii=False))
