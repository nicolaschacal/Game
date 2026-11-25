# Genera assets/icon*.png desde scripts/iconos/icono.html (necesita el juego servido en www, p. ej. python3 -m http.server 8765 dentro de www)
# Después: npm run assets (regenera los íconos nativos de iOS y Android)
import asyncio,sys,shutil,json
from playwright.async_api import async_playwright
from PIL import Image
# ícono oficial: Nilo en el globo, de cerca, sobre cielo con nubes de papel
L=sys.argv[1] if len(sys.argv)>1 else '{"gx":92,"gy":-60,"gw":840,"tilt":-6,"cielo":"nubes"}'
POSE=sys.argv[2] if len(sys.argv)>2 else 'globo'  # saludo | juego
OUT=sys.argv[3] if len(sys.argv)>3 else 'assets/'
async def main():
  shutil.copy('scripts/iconos/icono.html','www/_icono.html')
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for mode,out,tr,m in [('icon','icon.png',False,'RGB'),('fg','icon-foreground.png',True,'RGBA'),('bg','icon-background.png',False,'RGB')]:
      pg=await b.new_page(viewport={'width':1024,'height':1024})
      await pg.goto('http://localhost:8765/_icono.html?m=%s&s=1024&L=%s&pose=%s'%(mode,__import__('urllib.parse').parse.quote(L),POSE)); await pg.wait_for_timeout(2500)
      await pg.screenshot(path='/tmp/'+out,omit_background=tr,clip={'x':0,'y':0,'width':1024,'height':1024})
      Image.open('/tmp/'+out).convert(m).save(OUT+out); await pg.close()
    await b.close()
asyncio.run(main())

# ícono web de «Agregar a inicio» = el de la app
if OUT=='assets/':
  im=Image.open('assets/icon.png').convert('RGB'); im.resize((180,180),Image.LANCZOS).save('paper-voyager/apple-touch-icon.png'); im.resize((512,512),Image.LANCZOS).save('paper-voyager/app-icon-512.png')
