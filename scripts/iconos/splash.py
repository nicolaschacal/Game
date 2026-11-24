# Splash nativo (assets/splash*.png): captura la pantalla de carga del juego (logo) a 2732x2732 para que al abrir la app no haya salto. Necesita el juego servido en localhost:8765.
import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':846,'height':846},device_scale_factor=2732/846)
    await pg.add_init_script("Object.defineProperty(document,'fonts',{value:{ready:new Promise(()=>{}),load:()=>Promise.resolve([])}})")
    await pg.goto('http://localhost:8765/?rico', wait_until='commit'); await pg.wait_for_timeout(1500)
    await pg.add_style_tag(content="#splash .load,#rico,.rico,[class*=rico]{display:none!important} #splash .sball{animation:none!important}")
    await pg.evaluate("for(const e of document.querySelectorAll('body *')){if(e.children.length===0&&/TEST MODE|MODO PRUEBA/.test(e.textContent))e.style.display='none'}")
    await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/nat_splash.png')
    await b.close()
asyncio.run(main())
from PIL import Image
im=Image.open('/tmp/nat_splash.png').convert('RGB'); im.save('assets/splash.png'); im.save('assets/splash-dark.png')
