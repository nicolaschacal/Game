#!/usr/bin/env python3
"""Control de calidad automático de las ciudades (ver CIUDADES.md).

Arma www/ (node scripts/build-www.mjs), lo sirve en un puerto local (NO la raíz: three.js de unpkg está bloqueado por el proxy),
abre cada ciudad con Playwright + chromium (swiftshader, 390×844, DPR 2) con ?preview=<Nombre>, empieza la partida y saca la captura
de la carrera. Después pinta el monumento y las lomas delanteras de colores planos (sólo para medir) y verifica reglas medibles:

  borde      el recorte del monumento no se corta contra los bordes de la pantalla
  base       la base queda tapada por las lomas del destino (no flota ni deja ver el pie del dibujo / un rectángulo de suelo)
  tamaño     el área visible es comparable a la de San Francisco (0.55×–1.6×) y el ancho no es mínimo
  pausa      el botón de pausa no tapa una parte importante del monumento
  color      saturación media y p90 dentro del rango de las ciudades aprobadas (nada de colores chillones)
  contraste  contraste interno y contra el fondo dentro del rango de las aprobadas (integrado y apagado, no "pegado")
  plano      no hay rectángulos grandes de un solo color sin detalle

Uso:
  python3 scripts/qa-ciudades.py                        # San Francisco + las ciudades hechas con ficha (fichas-ciudades.js)
  python3 scripts/qa-ciudades.py --ciudades "Melbourne,Hoi An"
  python3 scripts/qa-ciudades.py --todas                # todas las de destinos.js
  python3 scripts/qa-ciudades.py --calibrar             # recalcula los rangos con las aprobadas (REF) y los imprime
  Opciones: --out qa  --puerto 8790  --sin-build  --www www

Salida: qa/galeria.png (todas lado a lado, San Francisco primero, con el resultado de cada regla), qa/<ciudad>.png (captura),
qa/<ciudad>-mascaras.png (lo que midió), qa/reporte.json y qa/reporte.md. Sale con código 1 si alguna ciudad falla.
"""
import argparse, json, os, re, socket, subprocess, sys, time, unicodedata, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Aprobadas por el usuario: San Francisco (la referencia) y monumentos viejos que gustan. Sirven para calibrar los rangos de color/contraste.
REF = ['San Francisco', 'Kioto', 'París', 'Londres', 'Moscú', 'Venecia', 'Chiang Mai']
# Rangos calibrados con --calibrar sobre REF (min/max de las aprobadas con un margen); ver CIUDADES.md
RANGOS = {  # medidos con --calibrar (SF 0.47/0.94/0.213/0.131; París 0.27/0.49/0.197/0.110; Moscú 0.54/0.93/0.207/0.133; Chiang Mai 0.54/0.95/0.171/0.049)
    'sat_media': (0.0, 0.55), 'sat_p90': (0.0, 0.96),          # tope: apenas por encima de las aprobadas más vivas (SF, Moscú, Chiang Mai)
    'contraste_interno': (0.0, 0.25), 'contraste_fondo': (0.0, 0.20),  # Kioto (0.286/0.268, estilo viejo de una sola capa) queda afuera a propósito:
}                                                               # el usuario rechazó dos veces monumentos de alto contraste
PAUSA = (330, 98, 380, 148)  # botón de pausa en px CSS (390×844)
VIEW_W, VIEW_H, DPR, CROP_H = 390, 844, 2, 480


def norm(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower())


def puerto_libre(p):
    for q in range(p, p + 50):
        with socket.socket() as s:
            if s.connect_ex(('127.0.0.1', q)):
                return q
    raise SystemExit('sin puerto libre')


def ciudades_por_defecto():
    src = open(os.path.join(RAIZ, 'paper-voyager/fichas-ciudades.js'), encoding='utf8').read()
    return list(dict.fromkeys(['San Francisco'] + re.findall(r"FICHAS\['([^']+)'\]\s*=", src)))


def todas():
    src = open(os.path.join(RAIZ, 'paper-voyager/destinos.js'), encoding='utf8').read()
    tabla = src[src.index('const TABLA = ['):]
    tabla = tabla[:tabla.index('\n];')]
    return [m.group(1) or m.group(2) for m in re.finditer(r"^\s*(?:\['[^']*', '([^']+)'|fila\(FICHAS\['([^']+)'\]\))", tabla, re.M)]


# ── en la página: pinta el monumento / las lomas de un color plano (misma silueta, mismo alfa) o los esconde ──
JS_PINTAR = r"""([modo]) => {
  const L = window.__W && __W.look; if (!L) return 'sin escenario';
  const ms = L.children.filter(m => m.userData.qa === 'monumento'), fs = L.children.filter(m => m.userData.qa === 'fore');
  const guarda = m => { if (!m.userData.qaO) m.userData.qaO = { map: m.material.map, col: m.material.color.getHex(), tm: m.material.toneMapped, vis: m.visible }; return m.userData.qaO; };
  const plano = (m, css) => { const o = guarda(m), img = o.map && o.map.image;
    if (img) { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      g.globalCompositeOperation = 'source-in'; g.fillStyle = css; g.fillRect(0, 0, c.width, c.height);
      const T = new o.map.constructor(c); T.colorSpace = o.map.colorSpace; m.material.map = T; m.material.color.setHex(0xffffff); }
    else m.material.color.set(css);
    m.material.toneMapped = false; m.material.needsUpdate = true; m.visible = true; };
  const vuelve = m => { const o = m.userData.qaO; if (!o) return; m.material.map = o.map; m.material.color.setHex(o.col); m.material.toneMapped = o.tm; m.visible = o.vis; m.material.needsUpdate = true; };
  [...ms, ...fs].forEach(vuelve);
  if (modo === 'mon') ms.forEach(m => plano(m, '#FF00FF'));
  if (modo === 'mon-solo') { ms.forEach(m => plano(m, '#FF00FF')); fs.forEach(m => { guarda(m); m.visible = false; }); }
  if (modo === 'fore') { fs.forEach(m => plano(m, '#00FFFF')); ms.forEach(m => { guarda(m); m.visible = false; }); }
  return ms.length + ' monumento, ' + fs.length + ' capas FORE';
}"""


def captura(pg):
    return np.asarray(Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': VIEW_W, 'height': CROP_H}))).convert('RGB'))


def capturar(b, base, nombre, out):
    ctx = b.new_context(viewport={'width': VIEW_W, 'height': VIEW_H}, device_scale_factor=DPR)
    pg = ctx.new_page()
    errs = {'inicio': [], 'partida': []}
    fase = ['inicio']
    pg.on('pageerror', lambda e: errs[fase[0]].append(str(e)))
    pg.on('console', lambda m: errs[fase[0]].append(m.text) if m.type == 'error' else None)
    pg.goto(base + 'privacidad.html')
    pg.evaluate("()=>{localStorage.clear();localStorage['pv.trip']=JSON.stringify({v:1,traveler:'nilo',at:0,passports:['as','am','eu','af','oc'],trips:3,visits:{}});localStorage['pv.tuto2']='1'}")
    pg.goto(base + 'index.html?debug&preview=' + nombre)
    pg.wait_for_timeout(6000)
    fase[0] = 'partida'
    pg.evaluate("document.getElementById('play').click()")
    pg.wait_for_timeout(4500)
    A = captura(pg)
    info = pg.evaluate(JS_PINTAR, ['mon']); pg.wait_for_timeout(350); M = captura(pg)
    pg.evaluate(JS_PINTAR, ['mon-solo']); pg.wait_for_timeout(350); F = captura(pg)
    pg.evaluate(JS_PINTAR, ['fore']); pg.wait_for_timeout(350); G = captura(pg)
    pg.evaluate(JS_PINTAR, ['nada']); pg.wait_for_timeout(300)
    ctx.close()
    Image.fromarray(A).save(os.path.join(out, norm(nombre) + '.png'))
    return A, M, F, G, errs, info


def mascara(img, col):
    r, g, b = [img[..., i].astype(int) for i in range(3)]
    if col == 'mag':
        return (r > 190) & (g < 90) & (b > 190)
    return (r < 90) & (g > 190) & (b > 190)


def luma(img):
    x = img.astype(float) / 255
    return 0.299 * x[..., 0] + 0.587 * x[..., 1] + 0.114 * x[..., 2]


def saturacion(img):
    x = img.astype(float) / 255
    mx, mn = x.max(2), x.min(2)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)


def medir(A, M, F, G):
    vis, full, fore = mascara(M, 'mag'), mascara(F, 'mag'), mascara(G, 'cyan')
    H, W = vis.shape
    m = {}
    if full.sum() < 50:
        return {'error': 'no se encontró el monumento'}, vis, full, fore
    ys, xs = np.nonzero(full)
    m['bbox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    m['area_visible'] = int(vis.sum())
    m['ancho'] = int(xs.max() - xs.min())
    # base: para cada columna del monumento visible, ¿qué hay justo debajo de su píxel visible más bajo?
    cub = otro = exp = 0
    for x in range(W):
        col = np.nonzero(vis[:, x])[0]
        if len(col) < 3:
            continue
        yb = col.max()
        debajo = slice(yb + 1, min(H, yb + 7))
        if fore[debajo, x].any():
            cub += 1
        elif full[debajo, x].any():
            otro += 1  # lo tapa otra cosa (adorno, pista): no cuenta ni a favor ni en contra
        else:
            exp += 1   # se ve el final del dibujo: flota o deja ver su suelo
    n = max(1, cub + exp)
    m['base_tapada'] = round(cub / n, 3)
    m['base_expuesta'] = round(exp / n, 3)
    # pausa: cuánto del monumento queda debajo del botón
    x0, y0, x1, y1 = [v * DPR for v in PAUSA]
    m['bajo_pausa'] = round(float(full[y0:y1, x0:x1].sum()) / max(1, full.sum()), 3)
    # color y contraste sobre los píxeles visibles del monumento en la captura real
    px = vis & ~mascara(A, 'mag')
    L, S = luma(A), saturacion(A)
    m['sat_media'] = round(float(S[px].mean()), 3)
    m['sat_p90'] = round(float(np.percentile(S[px], 90)), 3)
    m['contraste_interno'] = round(float(L[px].std()), 3)
    # contra el fondo: anillo de 24 px alrededor del dibujo que no es monumento ni loma (cielo, montañas lejanas)
    try:
        from scipy.ndimage import binary_dilation, label
        anillo = binary_dilation(full, iterations=24) & ~full & ~fore
    except ImportError:
        binary_dilation = label = None
        anillo = np.zeros_like(full)
        bx0, by0, bx1, by1 = m['bbox']
        anillo[max(0, by0 - 24):by1, max(0, bx0 - 24):min(W, bx1 + 24)] = True
        anillo &= ~full & ~fore
    anillo[int(m['bbox'][3] * .85):, :] = False
    m['contraste_fondo'] = round(abs(float(L[px].mean()) - float(L[anillo].mean())) if anillo.any() else 0, 3)
    # rectángulos planos: zonas grandes de un solo color (sin ventanas, sombras ni detalles)
    m['plano_max'] = 0.0
    if label is not None:
        a = A.astype(int)
        igual = np.ones(vis.shape, bool)
        for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0), (2, 0), (0, 2)):
            igual &= np.abs(a - np.roll(a, (dy, dx), (0, 1))).max(2) <= 7
        lab, k = label(igual & px)
        if k:
            tam = np.bincount(lab.ravel())[1:]
            i = int(tam.argmax()) + 1
            yy, xx = np.nonzero(lab == i)
            caja = (yy.max() - yy.min() + 1) * (xx.max() - xx.min() + 1)
            rect = tam[i - 1] / caja
            m['plano_max'] = round(float(tam[i - 1]) / max(1, px.sum()), 3)
            m['plano_rect'] = round(float(rect), 3)
    return m, vis, full, fore


def reglas(m, ref):
    if 'error' in m:
        return {'monumento': (False, m['error'])}
    H, W = CROP_H * DPR, VIEW_W * DPR
    x0, y0, x1, y1 = m['bbox']
    r = {}
    r['borde'] = (x0 > 3 and x1 < W - 4 and y0 > 3, f"recorte x {x0}–{x1} de {W}")
    r['base'] = (m['base_tapada'] >= .7 and m['base_expuesta'] <= .12, f"tapada {m['base_tapada']:.0%}, expuesta {m['base_expuesta']:.0%}")
    if ref:
        ka, kw = m['area_visible'] / ref['area_visible'], m['ancho'] / ref['ancho']
        r['tamaño'] = (.55 <= ka <= 1.6 and kw >= .5, f"área {ka:.2f}× SF, ancho {kw:.2f}× SF")
    r['pausa'] = (m['bajo_pausa'] <= .03, f"{m['bajo_pausa']:.1%} bajo el botón de pausa")
    for k in ('sat_media', 'sat_p90'):
        lo, hi = RANGOS[k]
        r['color' if k == 'sat_media' else 'color p90'] = (lo <= m[k] <= hi, f"{k} {m[k]:.2f} (aprobadas ≤ {hi})")
    for k in ('contraste_interno', 'contraste_fondo'):
        lo, hi = RANGOS[k]
        r[k.replace('_', ' ')] = (lo <= m[k] <= hi, f"{m[k]:.3f} (aprobadas ≤ {hi})")
    grande = m['plano_max'] > .2 and m.get('plano_rect', 0) > .8
    r['plano'] = (not grande, f"mayor zona lisa {m['plano_max']:.0%} del monumento (rect {m.get('plano_rect', 0):.2f})")
    return r


def lamina_mascaras(A, vis, full, fore, path):
    o = (A.astype(float) * .45 + 255 * .55)
    o[full & ~vis] = [235, 150, 235]
    o[vis] = [200, 0, 200]
    o[fore] = o[fore] * .4 + np.array([0, 190, 200]) * .6
    Image.fromarray(o.astype('uint8')).save(path)


def fuente(t, texto=False):
    for f in (() if texto else ('assets/fonts/Nunito-900.ttf',)) + ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'assets/fonts/Nunito-700.ttf'):
        p = f if f.startswith('/') else os.path.join(RAIZ, f)
        if os.path.exists(p):
            return ImageFont.truetype(p, t)
    return ImageFont.load_default()


def galeria(items, path, ancho=460):
    """Lámina: captura del fondo de cada ciudad (San Francisco primero) con sus reglas debajo."""
    top, alto = 140, 520  # franja del fondo (px de captura a DPR 2) → se reduce a ancho 390
    th = int(alto * ancho / (VIEW_W * DPR))
    f1, f2 = fuente(22), fuente(14, texto=True)
    filas_txt = max(len(it['reglas']) for it in items) if items else 0
    H = 44 + th + 14 + 22 * filas_txt + 16
    g = Image.new('RGB', (len(items) * (ancho + 16) + 16, H), '#EFE6D6')
    d = ImageDraw.Draw(g)
    for i, it in enumerate(items):
        x = 16 + i * (ancho + 16)
        im = Image.fromarray(it['A'][top:top + alto]).resize((ancho, th), Image.LANCZOS)
        ok = all(v[0] for v in it['reglas'].values())
        d.rounded_rectangle((x - 6, 8, x + ancho + 6, H - 8), 12, fill='#FFF4DC', outline='#D2502E' if it['ref'] else ('#5E9A5C' if ok else '#C0392B'), width=4)
        d.text((x, 14), it['nombre'] + ('  · referencia' if it['ref'] else ''), font=f1, fill='#3A2A3E')
        g.paste(im, (x, 44))
        y = 44 + th + 8
        for k, (v, txt) in it['reglas'].items():
            d.text((x, y), ('✔ ' if v else '✘ ') + f"{k}: {txt}"[:62], font=f2, fill='#3E7A44' if v else '#B0302A')
            y += 22
    g.save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--ciudades')
    ap.add_argument('--todas', action='store_true')
    ap.add_argument('--calibrar', action='store_true')
    ap.add_argument('--out', default='qa')
    ap.add_argument('--www', default='www')
    ap.add_argument('--puerto', type=int, default=8790)
    ap.add_argument('--sin-build', action='store_true')
    a = ap.parse_args()
    os.chdir(RAIZ)
    out = os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    lista = REF if a.calibrar else todas() if a.todas else [c.strip() for c in a.ciudades.split(',')] if a.ciudades else ciudades_por_defecto()
    if 'San Francisco' in lista:
        lista.remove('San Francisco')
    lista = ['San Francisco'] + lista  # siempre primero: es la referencia de tamaño
    if not a.sin_build:
        subprocess.run(['node', 'scripts/build-www.mjs'], check=True, stdout=subprocess.DEVNULL)
    port = puerto_libre(a.puerto)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', a.www], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    from playwright.sync_api import sync_playwright
    items, ref, falla = [], None, False
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
            for nombre in lista:
                A, M, F, G, errs, info = capturar(b, f'http://localhost:{port}/', nombre, out)
                m, vis, full, fore = medir(A, M, F, G)
                if nombre == 'San Francisco':
                    ref = m
                r = reglas(m, ref)
                r['consola'] = (not errs['inicio'] and not errs['partida'], 'sin errores' if not errs['inicio'] and not errs['partida'] else '; '.join(errs['inicio'] + errs['partida'])[:120])
                lamina_mascaras(A, vis, full, fore, os.path.join(out, norm(nombre) + '-mascaras.png'))
                ok = all(v[0] for v in r.values())
                falla |= not ok and nombre != 'San Francisco'
                print(('OK   ' if ok else 'FALLA') + f" {nombre}  ({info})")
                for k, (v, t) in r.items():
                    print(f"   {'✔' if v else '✘'} {k}: {t}")
                items.append({'nombre': nombre, 'ref': nombre == 'San Francisco', 'A': A, 'reglas': r, 'medidas': m, 'errores': errs})
            b.close()
    finally:
        srv.kill()
    if a.calibrar:
        print('\nRANGOS calibrados (max de las aprobadas + 10 %):')
        for k in RANGOS:
            v = [it['medidas'][k] for it in items if k in it['medidas']]
            print(f"  '{k}': (0.0, {max(v) * 1.1:.3f}),   # aprobadas: " + ', '.join(f"{it['nombre']} {it['medidas'][k]}" for it in items))
    galeria(items, os.path.join(out, 'galeria.png'))
    json.dump([{k: v for k, v in it.items() if k != 'A'} for it in items], open(os.path.join(out, 'reporte.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    with open(os.path.join(out, 'reporte.md'), 'w') as f:
        f.write('# QA de ciudades\n\n')
        for it in items:
            f.write(f"## {it['nombre']}{' (referencia)' if it['ref'] else ''}\n\n")
            for k, (v, t) in it['reglas'].items():
                f.write(f"- {'✔' if v else '✘'} **{k}**: {t}\n")
            f.write('\n')
    print(f"\nLámina: {os.path.join(out, 'galeria.png')} · reporte: {os.path.join(out, 'reporte.md')}")
    sys.exit(1 if falla else 0)


if __name__ == '__main__':
    main()
