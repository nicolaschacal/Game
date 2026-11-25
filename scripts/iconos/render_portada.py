# Ícono oficial «portada»: Nilo en el globo en papercut (scripts/iconos/portada.html). Necesita el juego servido en localhost:8765.
# Es el ícono oficial. Después: npm run assets
import asyncio,shutil,sys
from playwright.async_api import async_playwright
from PIL import Image
L=sys.argv[1] if len(sys.argv)>1 else '{}'; OUT=sys.argv[2] if len(sys.argv)>2 else 'assets/'
async def main():
  shutil.copy('scripts/iconos/portada.html','www/_portada.html')
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for mode,out,tr,m in [('icon','icon.png',False,'RGB'),('fg','icon-foreground.png',True,'RGBA'),('bg','icon-background.png',False,'RGB')]:
      pg=await b.new_page(viewport={'width':1024,'height':1024})
      await pg.goto('http://localhost:8765/_portada.html?m=%s&L=%s'%(mode,L)); await pg.wait_for_timeout(2200)
      await pg.screenshot(path='/tmp/'+out,omit_background=tr,clip={'x':0,'y':0,'width':1024,'height':1024}); Image.open('/tmp/'+out).convert(m).save(OUT+out); await pg.close()
    await b.close()
asyncio.run(main())
import random
from PIL import ImageChops
def grano(path):  # grano de cartulina suave, como el resto del juego
  im=Image.open(path); mode=im.mode; im=im.convert('RGBA'); W,H=im.size
  random.seed(7); n=Image.new('L',(W//2,H//2)); n.putdata([random.randint(234,255) for _ in range((W//2)*(H//2))]); n=n.resize((W,H),Image.NEAREST)
  rgb=ImageChops.multiply(im.convert('RGB'),Image.merge('RGB',(n,n,n)))
  Image.merge('RGBA',(*rgb.split(),im.split()[3])).convert(mode).save(path)
for f in ['icon.png','icon-foreground.png','icon-background.png']: grano(OUT+f)
if OUT=='assets/':
  im=Image.open('assets/icon.png').convert('RGB'); im.resize((180,180),Image.LANCZOS).save('paper-voyager/apple-touch-icon.png'); im.resize((512,512),Image.LANCZOS).save('paper-voyager/app-icon-512.png')
