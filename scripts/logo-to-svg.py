#!/usr/bin/env python3
"""Genera el logo PAPER / VOYAGER como SVG con letras convertidas a paths (sin <text>, sin fuentes web).

Toma los contornos reales de assets/fonts/LilitaOne.ttf (fontTools), con avances y kerning de
HarfBuzz (uharfbuzz) mas el letter-spacing del CSS, y reproduce las sombras de .logo b (clasico) y
body.gpapel (papel). Escribe el bloque <!--pv-logo-defs--> en index.html (se define una sola vez) y,
si todavia quedan, sustituye los <b>PAPER</b><b>VOYAGER</b> por <svg><use/></svg>.

Uso:  pip install fonttools uharfbuzz --break-system-packages
      python3 scripts/logo-to-svg.py            # actualiza index.html
      python3 scripts/logo-to-svg.py --print    # solo imprime el SVG
"""
import re, sys, pathlib
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = ROOT / 'assets/fonts/LilitaOne.ttf'
W = 320  # ancho del viewBox (1 unidad = 1px CSS)
# texto, tamano px, line-height px, letter-spacing px, variable de color de la cara
LINES = [('PAPER', 60, 54, 2, 'var(--cream)', ('#8F2C1E', '#6c2016')),
         ('VOYAGER', 56, 58, 1, 'var(--gold)', ('#A9701B', '#7d5010'))]

tt = TTFont(str(FONT)); gs = tt.getGlyphSet(); upm = tt['head'].unitsPerEm
asc, desc = tt['hhea'].ascent, -tt['hhea'].descent
blob = hb.Blob.from_file_path(str(FONT)); face = hb.Face(blob); font = hb.Font(face)

def r(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def line_path(text, size, lh, ls, top):
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {'kern': True, 'liga': True})
    k = size / upm
    total = sum(p.x_advance * k + ls for p in buf.glyph_positions)  # CSS suma el spacing tras cada letra
    x = (W - total) / 2
    base = top + (lh - (asc + desc) * k) / 2 + asc * k  # baseline dentro de la linea (half-leading de CSS)
    order = tt.getGlyphOrder(); d = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(gs, ntos=r)
        gs[order[info.codepoint]].draw(TransformPen(pen, (k, 0, 0, -k, x + pos.x_offset * k, base - pos.y_offset * k)))
        d.append(pen.getCommands()); x += pos.x_advance * k + ls
    return ''.join(d)

def build():
    out = ['<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>',
           '<filter id="pvBlur" x="-20%" y="-40%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>']
    top = 0
    for n, (text, size, lh, ls, fc, (c1, c2)) in enumerate(LINES, 1):
        out.append(f'<path id="pvP{n}" d="{line_path(text, size, lh, ls, top)}"/>')
        u = lambda dx, dy, fill: f'<use href="#pvP{n}" x="{dx}" y="{dy}" fill="{fill}"/>'
        classic = ''.join(u(dx, dy, '#1B1730') for dx, dy in [(-3, 9), (3, 9), (0, -3), (-3, 0), (3, 0), (0, 9)]) + u(0, 5, '#E8452C')
        paper = f'<g filter="url(#pvBlur)" style="opacity:var(--lgb,.45)">{u(0, 10, "#000")}</g>' + u(0, 5, c2) + u(0, 3, c1)
        out.append(f'<g id="pvL{n}"><g style="display:var(--lgc,inline)">{classic}</g><g style="display:var(--lgp,none)">{paper}</g>{u(0, 0, fc)}</g>')
        top += lh
    out.append('</defs></svg>')
    return ''.join(out), top

def logo_use(h):
    return (f'<svg class="lgsvg" viewBox="0 0 {W} {h}" role="img" aria-label="Paper Voyager">'
            '<use class="l1" href="#pvL1"/><use class="l2" href="#pvL2"/></svg>')

if __name__ == '__main__':
    defs, h = build()
    if '--print' in sys.argv: print(defs); sys.exit()
    p = ROOT / 'index.html'; s = p.read_text(encoding='utf-8')
    blk = f'<!--pv-logo-defs-->{defs}<!--/pv-logo-defs-->'
    if '<!--pv-logo-defs-->' in s:
        s = re.sub(r'<!--pv-logo-defs-->.*?<!--/pv-logo-defs-->', lambda m: blk, s, flags=re.S)
    else:
        s = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + '\n' + blk, s, count=1)
    s = s.replace('<b>PAPER</b><b>VOYAGER</b>', logo_use(h))
    s = re.sub(r'<svg class="lgsvg" viewBox="0 0 \d+ \d+"', f'<svg class="lgsvg" viewBox="0 0 {W} {h}"', s)
    p.write_text(s, encoding='utf-8'); print('index.html actualizado; alto de las dos lineas =', h)
