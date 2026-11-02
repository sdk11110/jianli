import asyncio, io, json, sys
from pathlib import Path
from PIL import Image

SERVICE = Path(r'F:\工作记录\2026\八\生图项目')
sys.path.insert(0, str(SERVICE))
from app.backend.config import Settings
from app.backend.providers.image2 import Image2Client
from app.backend.providers.birefnet import BiRefNetMatter

OUT = Path(__file__).parent / 'assets' / 'character'
REF = Path(r'F:\工作记录\2026\九\intorduce\home\assets\character\generated\wave.png')
IDENTITY = '''Use the attached character as the strict identity and clothing reference, create a NEW single full-body pose. Same short tousled dark brown bob, silver crescent hair clip, amber eyes, freckles, orange knitted scarf, cobalt button-up shirt, brown pleated skirt, cream socks, sneakers and brown leather satchel with bear charm. Same refined warm 3D illustrated rendering. No white jacket, no hoodie. Same character proportions, face, outfit and materials. Pure solid white studio background, no floor, no shadow, no text, no annotations, no collage. Full figure, no clipping. Clean clear silhouette with 8% margin. '''
JOBS = {
 'reading': 'Sitting sideways on a low stack of two closed books, knees together, reading an open orange notebook held in both hands, eyes looking down at the pages, absorbed gentle expression, headphones around her neck. A single charming cinematic editorial illustration.',
 'coffee': 'Standing relaxed, raising a small ceramic coffee cup near her lips, eyes softly closed and happy smile as she enjoys the aroma. Other hand holding her bag strap. Head slightly tilted. No floating objects. A single charming cinematic editorial illustration.'
}

async def main():
 OUT.mkdir(parents=True, exist_ok=True)
 settings = Settings(_env_file=SERVICE / '.env')
 provider = Image2Client(settings)
 matter = BiRefNetMatter(mode='auto', prefer_gpu=True)
 async def job(key, pose):
  raw = OUT / (key + '-raw.png')
  prompt = IDENTITY + pose
  (OUT / (key + '-prompt.txt')).write_text(prompt, encoding='utf-8')
  if not raw.exists():
   print('GENERATING', key, flush=True)
   await provider.generate(prompt, quality='high', size='1536x2048', destination=raw, source_images=[REF])
  matte = await asyncio.to_thread(matter.matte, raw.read_bytes())
  im = Image.open(io.BytesIO(matte.png_bytes)).convert('RGBA')
  im.save(OUT / (key + '.png'))
  print('DONE', key, matte.model, flush=True)
 await asyncio.gather(*(job(k,v) for k,v in JOBS.items()))

asyncio.run(main())
