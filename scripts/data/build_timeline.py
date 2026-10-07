"""Build the animation timeline from the two supplied documents, without rewriting quotes."""
from pathlib import Path
import json,re

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'source/data'
docs=json.loads((DATA/'source-documents.json').read_text(encoding='utf-8'))
paragraphs=docs['narrative']['paragraphs']
rows=[row for table in docs['storyboard']['tables'][2:] for row in table[1:]]
assert len(rows)==18

def excerpt(p,start,end):
    text=paragraphs[p]
    begin=text.index(start)
    stop=text.index(end,begin)+len(end)
    return {'paragraph':p,'start':begin,'end':stop,'text':text[begin:stop]}

quotes=[
 excerpt(0,'唯有牡丹','动京城。'),
 excerpt(0,'花朵硕大','威仪；'),
 excerpt(0,'牡丹，不仅仅','具象化身。'),
 excerpt(4,'武则天命人','皇家园林。'),
 excerpt(5,'牡丹拒不奉诏','属于后世虚构。'),
 excerpt(6,'民间传说又','精神内核。'),
 excerpt(13,'中宗喜爱春日游园','游赏赋诗。'),
 excerpt(12,'长安、洛阳','士族圈层。'),
 excerpt(14,'普通百姓','观赏。'),
 excerpt(19,'凤凰代表','家业兴旺的心愿。'),
 excerpt(20,'岁末迎新','灯彩之上。'),
 excerpt(21,'铜镜、瓷器','牡丹纹样。'),
 excerpt(28,'云想衣裳','露华浓'),
 excerpt(27,'宫中常以','经典审美，'),
 excerpt(30,'繁华终会落幕','盛世崩塌。'),
 excerpt(31,'晚唐文人','悲情底色。'),
 excerpt(7,'如今洛阳牡丹','文化印记。'),
 excerpt(32,'人与花双向成就','代代流传。'),
]

# x/y are fractions of the 16:9 stage, zoom is camera scale. Shot-specific
# foreground animation remains independent from the camera and pointer parallax.
cameras=[
 [[0,0,1.06],[.025,0,1.06]], [[-.10,.03,1.2],[-.10,.03,1.6]],
 [[-.06,0,1.12],[.06,-.015,1.17]], [[0,.055,1.16],[0,-.04,1.09]],
 [[0,0,1.02],[0,0,1.10]], [[0,.05,1.08],[0,-.02,1.25]],
 [[-.045,0,1.12],[.045,0,1.12]], [[0,0,1.0],[-.12,.02,1.48]],
 [[.04,0,1.13],[-.04,.025,1.19]], [[-.035,.02,1.24],[.035,-.02,1.35]],
 [[0,0,1.35],[0,0,1.02]], [[-.035,0,1.18],[.05,0,1.25]],
 [[-.045,0,1.12],[.035,-.02,1.27]], [[0,0,1.30],[-.02,.02,1.55]],
 [[0,0,1.28],[0,-.065,1.05]], [[-.03,0,1.10],[.02,0,1.26]],
 [[0,-.05,1.32],[0,.02,1.05]], [[0,-.02,1.15],[0,.03,1.00]],
]
motions=['scroll-unroll','dew','petal-vortex','watering','winter-split','fire-rebirth','water-banquet','gate-light','spring-walk','silk','lantern','artifacts','pavilion','hair-flower','storm','ruins','sunrise','crown']
transitions=['unroll','ink','gold','map','crack','flame','ember','light-path','petal','red-silk','candle','focus','gold','pan','flash','petal','dawn','crown']
refs=['a-07','a-04','a-03','a-06','a-10','a-11','b-05','b-04','b-02','c-03','c-05','c-07','d-03','d-02','d-05','d-08','d-09','a-15']
chapters=['冠绝群芳','神都花事','花出宫墙','吉祥入画','人花盛衰','花开不败']
shots=[]
cursor=0
for i,row in enumerate(rows):
    duration=int(re.search(r'(\d+)s',row[1]).group(1))
    shots.append({'id':i+1,'chapter':i//3,'chapterTitle':chapters[i//3],
      'start':cursor,'end':cursor+duration,'duration':duration,'label':row[2],
      'elements':row[3],'transitionSource':row[4],'cameraSource':row[5],
      'reference':f'materials/images/story-originals/{refs[i]}.png','motion':motions[i],
      'transition':transitions[i],'camera':cameras[i],'quote':quotes[i],
      'context':'民间传说' if i in [4,5] else ('史实记载' if i==3 else ''),
      'artReady':False,'layersAvailable':i<3 or i in (8,10,12),
      'acceptance':{'timing':'source-exact','layerMotion':'needs-runtime-review','storyboardFidelity':'needs-visual-review'}})
    cursor+=duration

data={'title':'牡丹真国色','duration':cursor,'sourceDurationNote':'文档概要约115秒；18镜逐镜时长之和119秒，以逐镜标注为准。',
      'sourceFiles':['materials/documents/牡丹真国色_全六场分镜_文字版(1).docx','materials/documents/主线内容(2)(1).docx','materials/local/生成图.zip'],
      'chapters':chapters,'shots':shots,'narrative':paragraphs}
assert cursor==119
for shot in shots:
    q=shot['quote']; assert paragraphs[q['paragraph']][q['start']:q['end']]==q['text']
(DATA/'story-timeline.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(shots)} shots, {cursor} seconds, {len(quotes)} exact narrative excerpts')
