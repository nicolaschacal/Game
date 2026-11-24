// KIT DE CIUDADES: piezas de papel paramétricas + paleta derivada + composición automática "tipo San Francisco".
// Cómo se usa: ver CIUDADES.md. Una ciudad es una FICHA de datos (fichas-ciudades.js); fila(ficha) la convierte en la misma fila
// que consume armar() en destinos.js (mismo orden de campos), con lmScale / lmX / fore ya calculados.
//
// Estilo (el de todo el juego, calibrado contra San Francisco):
//  · cada pieza devuelve { f, d, box }: f = formas planas (llevan el borde crema de recorte), d = detalles finos encima (sin borde),
//    box = [x0, y0, x1, y1] en unidades del SVG 120×120;
//  · luz desde la IZQUIERDA: el lado derecho de cada volumen lleva una sombra del mismo color oscurecido a opacidad baja (.35–.5);
//  · nada de suelo propio: las piezas bajan hasta la base (y = 110–118, queda bajo el piso) y las lomas del destino (FORE) tapan el pie;
//  · tonos de papel apagados: usar tono() para pasar cualquier color por el filtro de saturación/luz del juego.
export const CREAM = '#FFF4DC';
const INK = '#3A2A3E';
export const f1 = n => +(+n).toFixed(1);
const f2 = n => +(+n).toFixed(2);

// ───────────────────────── color ─────────────────────────
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const mix = (a, b, t) => toHex(hex(a).map((v, i) => v * (1 - t) + hex(b)[i] * t));
export const shade = (c, t) => mix(c, INK, t);      // oscurecer hacia la tinta violácea del juego (no hacia negro)
export const luz = (c, t) => mix(c, CREAM, t);      // aclarar hacia el papel crema
export function hsl(c) {
  const [r, g, b] = hex(c).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0; const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, s, l];
}
export function deHsl(h, s, l) {
  s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}
// Filtro de papel: baja la saturación (tope .55) y lleva la luz a la franja .34–.84 (lo que ya funciona en el juego).
// Los monumentos aprobados viven ahí: San Francisco #D2502E es el más saturado que se acepta.
export const tono = (c, smax = .55) => { const [h, s, l] = hsl(c); return deHsl(h, Math.min(s, smax), Math.max(.34, Math.min(.84, l))); };
// Familia de tonos de una pieza a partir de su color principal
export const tonos = c => ({ c, luz: luz(c, .32), som: shade(c, .2), osc: shade(c, .38), lin: shade(c, .28) });

// ───────────────────────── primitivas SVG ─────────────────────────
export const P = (d, c, o = '') => `<path d="${d}" fill="${c}"${o}/>`;
export const R = (x, y, w, h, c, o = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${c}"${o}/>`;
export const C = (x, y, r, c, o = '') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${c}"${o}/>`;
export const Ln = (d, c, w = 1.4, o = '') => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"${o}/>`;
export const SOMBRA = ' opacity=".45"';
const arcoD = (x, y, w, h) => `M${f1(x)} ${f1(y + h)} V${f1(y + w / 2)} A${f1(w / 2)} ${f1(w / 2)} 0 0 1 ${f1(x + w)} ${f1(y + w / 2)} V${f1(y + h)}Z`;
export const arco = (x, y, w, h, c, o = '') => P(arcoD(x, y, w, h), c, o);
// recorte de papel: TODAS las formas reciben el borde crema (una sola silueta) y los detalles van encima
export const cut = (shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
// recorte para FORE (lado s en unidades de mundo): borde más fino para que se vea del mismo grosor que el del monumento
export const cutFore = (s, shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="${(5 * 8.5 / s).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
let sd = 1; const rnd = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296; export const semilla = n => { sd = n; };
const pieza = (f, d, box) => ({ f, d, box });
const union = boxes => boxes.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);

// ───────────────────────── MONUMENTO = capas de piezas ─────────────────────────
// monumento([p1, p2], [p3]) → { svg, box }. Cada capa es una hoja de papel: sus piezas comparten UNA silueta con borde crema,
// y la capa de adelante tapa a la de atrás con su propio borde (así se lee la profundidad, como en el papercut real).
// Con una sola capa el resultado es idéntico a cut(f, d) (San Francisco sale byte a byte igual).
export function monumento(...capas) {
  const cs = capas.map(c => (Array.isArray(c) ? c : [c]).flat().filter(Boolean));
  const grupo = ps => { const f = ps.map(p => p.f).join(''), d = ps.map(p => p.d).join(''); return `<g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${f}</g>${f}${d}`; };
  const svg = `<svg viewBox="0 0 120 120">${cs.map(grupo).join('')}</svg>`;
  const box = union(cs.flat().map(p => p.box)), b = [Math.max(0, box[0] - 3.5), Math.max(0, box[1] - 3.5), Math.min(120, box[2] + 3.5), Math.min(118, box[3])];
  return { svg, box: b };
}

// ═════════════════════════ PIEZAS ═════════════════════════

// Puente colgante (San Francisco por defecto: con estos valores reproduce exactamente el Golden Gate aprobado)
export function puenteColgante(o = {}) {
  const c = o.c ?? '#D2502E', osc = o.osc ?? '#B8402A', med = o.med ?? '#C94A30', som = o.som ?? '#A8402A';
  const [ta, tb] = o.torres ?? [30, 84], top = o.top ?? 20, base = o.base ?? 118, tablero = o.tablero ?? 74, barras = o.barras ?? [34, 52], cuelga = o.cuelga ?? 28.5;
  const h = base - top, a = ta + 3, b = tb + 3, span = b - a;
  const f = `<rect x="${ta}" y="${top}" width="6" height="${h}" fill="${c}"/><rect x="${tb}" y="${top}" width="6" height="${h}" fill="${c}"/>`
    + barras.map(y => `<rect x="${ta - 1}" y="${y}" width="8" height="4" fill="${c}"/><rect x="${tb - 1}" y="${y}" width="8" height="4" fill="${c}"/>`).join('')
    + `<rect x="2" y="${tablero}" width="116" height="5" fill="${c}"/><rect x="1" y="${tablero - 8}" width="8" height="40" fill="${osc}"/><rect x="111" y="${tablero - 8}" width="8" height="40" fill="${osc}"/>`;
  const ty = top + 2, ya = tablero - 4;
  const d = `<path d="M6 ${ya} Q20 ${ya - 4} ${a} ${ty} M114 ${ya} Q100 ${ya - 4} ${b} ${ty} M${a} ${ty} Q60 ${tablero + 4} ${b} ${ty}" stroke="${osc}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    + Array.from({ length: 12 }, (_, i) => { const x = a + 7 + i * 4, t = (x - a) / span, y = ty + 4 * cuelga * t * (1 - t); return `<path d="M${x} ${y.toFixed(1)} L${x} ${tablero}" stroke="${med}" stroke-width=".9"/>`; }).join('')
    + [14, 22, 28].map(x => `<path d="M${x} ${(tablero - 8 - (x - 6) * 1.5).toFixed(1)} L${x} ${tablero}" stroke="${med}" stroke-width=".9"/>`).join('')
    + [92, 98, 106].map(x => `<path d="M${x} ${(tablero - 8 - (114 - x) * 1.5).toFixed(1)} L${x} ${tablero}" stroke="${med}" stroke-width=".9"/>`).join('')
    + `<rect x="2" y="${tablero + 3}" width="116" height="2" fill="${som}"/><rect x="${a}" y="${top}" width="3" height="${h}" fill="${som}" opacity=".5"/><rect x="${b}" y="${top}" width="3" height="${h}" fill="${som}" opacity=".5"/>`;
  return pieza(f, d, [1, top, 119, base]);
}

// Puente de arco de piedra (n ojos) con pretil; el agua la pone el paisaje
export function puenteArco({ x0 = 10, x1 = 110, y = 86, base = 118, n = 3, c = '#C9B48E', grosor = 8 } = {}) {
  const T = tonos(c), w = (x1 - x0) / n; let ojos = '', dov = '';
  for (let i = 0; i < n; i++) { const a = x0 + i * w + w * .12, bb = x0 + (i + 1) * w - w * .12, r = (bb - a) / 2; ojos += `M${f1(a)} ${base} V${f1(y + grosor + r * .6)} A${f1(r)} ${f1(r * .9)} 0 0 1 ${f1(bb)} ${f1(y + grosor + r * .6)} V${base}Z `;
    dov += Ln(`M${f1(a - 1)} ${f1(y + grosor + r * .6)} A${f1(r + 1)} ${f1(r * .9 + 1)} 0 0 1 ${f1(bb + 1)} ${f1(y + grosor + r * .6)}`, T.luz, 1.4); }
  const f = R(x0, y, x1 - x0, base - y, c) + R(x0 - 2, y - 4, x1 - x0 + 4, 4.5, T.luz);
  const d = P(ojos, T.osc) + dov + R(x0, y + .5, x1 - x0, 1.4, T.som) + R(x1 - (x1 - x0) * .18, y, (x1 - x0) * .18, base - y, T.som, SOMBRA);
  return pieza(f, d, [x0 - 2, y - 4, x1 + 2, base]);
}

// Torre (campanario / torre del reloj). techo: 'cupula' | 'aguja' | 'pira' | 'plano'
export function torreReloj({ x = 60, w = 14, top = 20, base = 118, c = '#D9B27A', techo = 'cupula', cTecho, reloj = true, yReloj, ventanas = true } = {}) {
  const T = tonos(c), ct = cTecho ?? '#7FA58C', TT = tonos(ct), x0 = x - w / 2, cuerpo = top + w * .9;
  let f = R(x0, cuerpo, w, base - cuerpo, c) + R(x0 - 1.6, cuerpo - 2, w + 3.2, 3.6, T.luz) + R(x0 + w * .1, top + w * .35, w * .8, w * .62, c), d = '';
  const yb = top + w * .35; // base del techo
  if (techo === 'cupula') { f += P(`M${f1(x0 + w * .02)} ${f1(yb)} C${f1(x0 + w * .02)} ${f1(yb - w * .55)} ${f1(x - w * .22)} ${f1(yb - w * .78)} ${f1(x)} ${f1(yb - w * .8)} C${f1(x + w * .22)} ${f1(yb - w * .78)} ${f1(x + w * .98 - w / 2)} ${f1(yb - w * .55)} ${f1(x + w * .48)} ${f1(yb)}Z`, ct) + R(x - .8, yb - w * .8 - 6, 1.6, 6.5, TT.osc);
    d += P(`M${f1(x)} ${f1(yb - w * .8)} C${f1(x + w * .22)} ${f1(yb - w * .78)} ${f1(x + w * .48)} ${f1(yb - w * .55)} ${f1(x + w * .48)} ${f1(yb)} L${f1(x + w * .1)} ${f1(yb)} C${f1(x + w * .2)} ${f1(yb - w * .4)} ${f1(x + w * .12)} ${f1(yb - w * .66)} ${f1(x)} ${f1(yb - w * .8)}Z`, TT.som, SOMBRA)
      + Ln(`M${f1(x - w * .22)} ${f1(yb - w * .3)} Q${f1(x - w * .2)} ${f1(yb - w * .6)} ${f1(x - w * .05)} ${f1(yb - w * .72)}`, TT.luz, 1.2) + C(x, yb - w * .8 - 6.5, 1.3, TT.osc); }
  else if (techo === 'aguja' || techo === 'pira') { const alto = techo === 'aguja' ? w * 2.2 : w * 1.1; f += P(`M${f1(x0 - .5)} ${f1(yb)} L${f1(x)} ${f1(yb - alto)} L${f1(x0 + w + .5)} ${f1(yb)}Z`, ct);
    d += P(`M${f1(x)} ${f1(yb - alto)} L${f1(x0 + w + .5)} ${f1(yb)} L${f1(x)} ${f1(yb)}Z`, TT.som, SOMBRA); }
  else f += R(x0 - 1, yb - 2, w + 2, 2.5, T.luz);
  const yr = yReloj ?? cuerpo + w * .7, rr = w * .3;
  if (reloj) d += C(x, yr, rr + .9, T.lin) + C(x, yr, rr, '#FBF1DE') + Ln(`M${f1(x)} ${f1(yr)} V${f1(yr - rr * .7)} M${f1(x)} ${f1(yr)} L${f1(x + rr * .5)} ${f1(yr + rr * .2)}`, INK, 1.1);
  if (ventanas) { const y1 = (reloj ? yr + rr + 4 : cuerpo + 4); for (let y = y1; y < base - 14; y += 13) d += arco(x - w * .16, y, w * .32, 7, T.osc); d += arco(x - w * .2, top + w * .42, w * .4, w * .45, T.osc); }
  d += R(x0, cuerpo + 4, w, 1.2, T.luz) + R(x0 + w * .68, cuerpo, w * .32, base - cuerpo, T.som, SOMBRA);
  return pieza(f, d, [x0 - 1.6, top - (techo === 'aguja' ? w * 1.9 : techo === 'cupula' ? w * .5 + 6 : techo === 'pira' ? w * .8 : 0), x0 + w + 1.6, base]);
}

// Alminar magrebí (Kutubía): torre cuadrada de piedra rojiza con paños de arcos lobulados y sebka (rombos), friso de cerámica,
// almenas dentadas, linterna con su cupulita y el yamur de tres bolas doradas
export function alminar({ x = 60, w = 26, top = 18, base = 118, c = '#C98E6A', cFriso = '#6E9C8E', cOro = '#D9AE52' } = {}) {
  const T = tonos(c), x0 = x - w / 2, hl = w * .62, lw = w * .5, yt = top + hl + w * .1; // yt = tope del fuste (base de las almenas)
  let f = R(x0, yt, w, base - yt, c), d = '';
  // almenas del fuste
  for (let i = 0; i < 5; i++) { const mx = x0 + i * w / 5 + w / 20; f += P(`M${f1(mx)} ${f1(yt)} V${f1(yt - 3.4)} L${f1(mx + w / 20)} ${f1(yt - 5)} L${f1(mx + w / 10)} ${f1(yt - 3.4)} V${f1(yt)}Z`, c); }
  // linterna, cupulita y yamur
  const lx0 = x - lw / 2, ly = yt - hl * .78;
  f += R(lx0, ly, lw, yt - ly, c) + P(`M${f1(lx0 - .8)} ${f1(ly)} Q${f1(x)} ${f1(ly - lw * .62)} ${f1(lx0 + lw + .8)} ${f1(ly)}Z`, cFriso) + R(x - .5, ly - lw * .62 - 9, 1, 9, T.osc);
  [3.2, 2.6, 2].forEach((r, i) => { f += C(x, ly - lw * .62 - 2.6 - i * 3.4, r, cOro); });
  for (let i = 0; i < 4; i++) { const mx = lx0 + i * lw / 4 + lw / 16; f += R(mx, ly - 2.6, lw / 8, 2.6, c); }
  d += arco(x - lw * .18, ly + 4, lw * .36, (yt - ly) * .55, T.osc) + R(lx0 + lw * .7, ly, lw * .3, yt - ly, T.som, SOMBRA);
  // friso de cerámica bajo las almenas y paños decorados por piso
  d += R(x0, yt + 1.2, w, 3.2, cFriso) + R(x0, yt + 1.2, w, .8, luz(cFriso, .4));
  const pisos = [[yt + 9, 'sebka'], [yt + 9 + (base - yt) * .27, 'arcos'], [yt + 9 + (base - yt) * .52, 'ventana']];
  pisos.forEach(([y, tipo]) => {
    const pw = w * .64, px = x - pw / 2, ph = (base - yt) * .2;
    d += R(px - 1.2, y - 1.2, pw + 2.4, ph + 2.4, T.lin, ' opacity=".35"');
    if (tipo === 'sebka') { let rr = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const cx = px + pw * (i + .5) / 4, cy = y + ph * (j + .5) / 3; rr += `M${f1(cx)} ${f1(cy - ph / 6)} L${f1(cx + pw / 8)} ${f1(cy)} L${f1(cx)} ${f1(cy + ph / 6)} L${f1(cx - pw / 8)} ${f1(cy)}Z `; } d += Ln(rr, T.osc, .9); }
    else if (tipo === 'arcos') { for (let i = 0; i < 3; i++) d += arco(px + pw * (i / 3 + .06), y + ph * .1, pw * .22, ph * .86, T.osc); }
    else d += arco(x - pw * .16, y, pw * .32, ph, T.osc) + Ln(`M${f1(x - pw * .26)} ${f1(y - 1)} Q${f1(x)} ${f1(y - ph * .5)} ${f1(x + pw * .26)} ${f1(y - 1)}`, T.luz, 1.2);
  });
  d += R(x0 + w * .66, yt, w * .34, base - yt, T.som, SOMBRA) + R(x0, yt, w, 1, T.luz);
  return pieza(f, d, [x0 - .5, ly - lw * .62 - 13, x0 + w + .5, base]);
}

// Minarete otomano: fuste fino de piedra, uno o dos balcones (şerefe) con baranda y el cono largo de plomo en punta ("lápiz")
export function minarete({ x = 60, w = 5, top = 10, base = 118, c = '#E2D6C8', cTecho = '#8E9AAA', balcones = 2 } = {}) {
  const T = tonos(c), TT = tonos(cTecho), x0 = x - w / 2, cono = w * 4.2, yc = top + cono;
  let f = R(x0, yc, w, base - yc, c) + P(`M${f1(x0 - .3)} ${f1(yc + .5)} L${f1(x)} ${f1(top)} L${f1(x0 + w + .3)} ${f1(yc + .5)}Z`, cTecho) + R(x - .4, top - 3.5, .8, 4, TT.osc), d = '';
  for (let i = 0; i < balcones; i++) { const yb = yc + 9 + i * (base - yc) * .2;
    f += P(`M${f1(x0 - 1.8)} ${f1(yb)} L${f1(x0 + w + 1.8)} ${f1(yb)} L${f1(x0 + w + .2)} ${f1(yb + 3)} L${f1(x0 - .2)} ${f1(yb + 3)}Z`, T.luz);
    d += R(x0 - 1.8, yb - 1.6, w + 3.6, .8, T.lin) + R(x0 - 1.8, yb - .9, w + 3.6, .9, T.luz) + R(x0 - .2, yb + 3, w + .4, .8, T.osc); }
  d += P(`M${f1(x)} ${f1(top)} L${f1(x0 + w + .3)} ${f1(yc + .5)} L${f1(x)} ${f1(yc + .5)}Z`, TT.som, SOMBRA) + R(x0 + w * .55, yc, w * .45, base - yc, T.som, SOMBRA)
    + R(x0, yc + 1, w, 1.1, T.lin) + R(x - .6, yc + 4, 1.2, 3, T.osc);
  return pieza(f, d, [x0 - 1.8, top - 3.5, x0 + w + 1.8, base]);
}

// Cúpula sobre tambor. tipo: 'semi' (semiesfera) | 'bulbo' (cebolla) | 'chapitel' (en punta). y = base de la cúpula
export function cupula({ x = 60, y = 50, w = 30, tipo = 'semi', c = '#7FA58C', tambor = 0, cTambor, linterna = true, costillas = 5 } = {}) {
  const T = tonos(c), h = tipo === 'semi' ? w * .55 : tipo === 'bulbo' ? w * .95 : w * .9, ctb = cTambor ?? '#E8D3A8', TB = tonos(ctb);
  // mitad izquierda (de la base al tope) y derecha (del tope a la base): la derecha se reusa para la sombra
  const [izq, der] = tipo === 'bulbo'
    ? [`M${f1(x - w * .42)} ${f1(y)} C${f1(x - w * .7)} ${f1(y - h * .35)} ${f1(x - w * .3)} ${f1(y - h * .62)} ${f1(x)} ${f1(y - h)}`, `C${f1(x + w * .3)} ${f1(y - h * .62)} ${f1(x + w * .7)} ${f1(y - h * .35)} ${f1(x + w * .42)} ${f1(y)}`]
    : tipo === 'chapitel'
      ? [`M${f1(x - w / 2)} ${f1(y)} C${f1(x - w / 2)} ${f1(y - h * .45)} ${f1(x - w * .12)} ${f1(y - h * .7)} ${f1(x)} ${f1(y - h)}`, `C${f1(x + w * .12)} ${f1(y - h * .7)} ${f1(x + w / 2)} ${f1(y - h * .45)} ${f1(x + w / 2)} ${f1(y)}`]
      : [`M${f1(x - w / 2)} ${f1(y)} C${f1(x - w / 2)} ${f1(y - h * .78)} ${f1(x - w * .28)} ${f1(y - h)} ${f1(x)} ${f1(y - h)}`, `C${f1(x + w * .28)} ${f1(y - h)} ${f1(x + w / 2)} ${f1(y - h * .78)} ${f1(x + w / 2)} ${f1(y)}`];
  const dome = `${izq} ${der}Z`;
  let f = '', d = '', top = y - h;
  if (tambor) { f += R(x - w * .46, y, w * .92, tambor, ctb) + R(x - w * .52, y - 1.5, w * 1.04, 3, TB.luz);
    for (let i = 0; i < 4; i++) d += arco(x - w * .36 + i * w * .2, y + tambor * .3, w * .1, tambor * .55, TB.osc);
    d += R(x + w * .2, y, w * .26, tambor, TB.som, SOMBRA); }
  f += P(dome, c);
  // costillas (gajos) que convergen arriba, luz a la izquierda y sombra a la derecha
  for (let i = 1; i < costillas; i++) { const t = i / costillas - .5, bx = x + t * w * (tipo === 'bulbo' ? .84 : 1); d += Ln(`M${f1(bx)} ${f1(y - .5)} Q${f1(x + t * w * .75)} ${f1(y - h * .62)} ${f1(x)} ${f1(y - h + 1)}`, T.som, 1); }
  d += P(`M${f1(x)} ${f1(y - h)} ${der} L${f1(x + w * .14)} ${f1(y)} Q${f1(x + w * .18)} ${f1(y - h * .6)} ${f1(x)} ${f1(y - h)}Z`, T.som, SOMBRA)
    + Ln(`M${f1(x - w * .32)} ${f1(y - h * .25)} Q${f1(x - w * .3)} ${f1(y - h * .62)} ${f1(x - w * .1)} ${f1(y - h * .85)}`, T.luz, 1.6) + R(x - w / 2 - .5, y - 1.6, w + 1, 1.8, T.osc);
  if (linterna) { const lw = Math.max(4, w * .16), lh = lw * 1.1; f += R(x - lw / 2, top - lh + 1, lw, lh, ctb) + P(`M${f1(x - lw * .65)} ${f1(top - lh + 1.5)} Q${f1(x)} ${f1(top - lh * 2)} ${f1(x + lw * .65)} ${f1(top - lh + 1.5)}Z`, c) + R(x - .7, top - lh * 2.2, 1.4, lh * .7, T.osc);
    d += R(x - lw * .2, top - lh + 2.5, lw * .4, lh * .55, TB.osc); top -= lh * 2.2; }
  return pieza(f, d, [x - w / 2 - (tipo === 'bulbo' ? w * .08 : 0), top, x + w / 2 + (tipo === 'bulbo' ? w * .08 : 0), y + tambor]);
}

// Techo de pagoda / teja curva (aleros que se levantan en las puntas, filas de tejas canal). y = línea del alero
export function techoTeja({ x0 = 20, x1 = 100, y = 60, alto = 12, c = '#8E5A44', vuelo = 4, curva = 3, cumbrera = true } = {}) {
  const T = tonos(c), m = (x0 + x1) / 2, ent = Math.min((x1 - x0) * .22, alto * .9);
  const d0 = `M${f1(x0 - vuelo)} ${f1(y - curva)} Q${f1(x0 + ent * .2)} ${f1(y - alto * .15)} ${f1(x0 + ent)} ${f1(y - alto)} L${f1(x1 - ent)} ${f1(y - alto)} Q${f1(x1 - ent * .2)} ${f1(y - alto * .15)} ${f1(x1 + vuelo)} ${f1(y - curva)} L${f1(x1 + vuelo - 1.5)} ${f1(y + 1.2)} Q${f1(m)} ${f1(y + 2)} ${f1(x0 - vuelo + 1.5)} ${f1(y + 1.2)}Z`;
  let det = '';
  for (let x = x0 + 2; x < x1 - 1; x += 3.2) { const k = (x - m) / ((x1 - x0) / 2), xt = m + k * ((x1 - x0) / 2 - ent); det += `M${f1(xt)} ${f1(y - alto + 1.4)} L${f1(x)} ${f1(y + .6)} `; }
  let f = P(d0, c), d = Ln(det, T.som, .9) + Ln(`M${f1(x0 - vuelo + 1.5)} ${f1(y + .4)} Q${f1(m)} ${f1(y + 1.2)} ${f1(x1 + vuelo - 1.5)} ${f1(y + .4)}`, T.luz, 1.3)
    + P(`M${f1(m)} ${f1(y - alto)} L${f1(x1 - ent)} ${f1(y - alto)} Q${f1(x1 - ent * .2)} ${f1(y - alto * .15)} ${f1(x1 + vuelo)} ${f1(y - curva)} L${f1(x1 + vuelo - 1.5)} ${f1(y + 1.2)} Q${f1(m + (x1 - m) * .6)} ${f1(y + 1.8)} ${f1(m + (x1 - m) * .5)} ${f1(y + 1.6)}Z`, T.osc, ' opacity=".28"');
  if (cumbrera) { f += P(`M${f1(x0 + ent - 2.5)} ${f1(y - alto - 2.2)} L${f1(x1 - ent + 2.5)} ${f1(y - alto - 2.2)} L${f1(x1 - ent + 4)} ${f1(y - alto - 4.4)} L${f1(x1 - ent + 4.6)} ${f1(y - alto + .6)} L${f1(x0 + ent - 4.6)} ${f1(y - alto + .6)} L${f1(x0 + ent - 4)} ${f1(y - alto - 4.4)}Z`, T.osc); }
  return pieza(f, d, [x0 - vuelo, y - alto - (cumbrera ? 4.4 : 0), x1 + vuelo, y + 2]);
}

// Fachada: bloque con pisos de arcos o ventanas, cornisa y bandas. pisos = [{ tipo: 'arcos'|'ventanas'|'puertas', n }], de arriba hacia abajo
export function fachada({ x0 = 10, x1 = 110, y0 = 60, base = 118, c = '#DDBE90', cVentana, pisos = [{ tipo: 'arcos', n: 8 }, { tipo: 'arcos', n: 8 }], cornisa = true, bandas = true, sombra = .22 } = {}) {
  const T = tonos(c), cv = cVentana ?? T.osc, w = x1 - x0, hp = (base - y0 - 4) / pisos.length;
  let f = R(x0, y0, w, base - y0, c), d = '';
  if (cornisa) { f += R(x0 - 1.8, y0 - 2.6, w + 3.6, 3.8, T.luz); d += R(x0 - 1.8, y0 + .6, w + 3.6, 1, T.som); }
  pisos.forEach((p, i) => { const yt = y0 + 4 + i * hp, n = p.n, cw = w / n, vw = cw * (p.tipo === 'puertas' ? .56 : .46), vh = hp * (p.tipo === 'puertas' ? .78 : .62);
    for (let k = 0; k < n; k++) { const vx = x0 + k * cw + (cw - vw) / 2, vy = yt + (hp - vh) * (p.tipo === 'puertas' ? 1 : .45);
      d += p.tipo === 'ventanas' ? R(vx, vy, vw, vh, cv) + R(vx, vy, vw, .9, T.luz) : arco(vx, vy, vw, vh, cv) + Ln(`M${f1(vx - .6)} ${f1(vy + vw / 2)} A${f1(vw / 2 + .6)} ${f1(vw / 2 + .6)} 0 0 1 ${f1(vx + vw + .6)} ${f1(vy + vw / 2)}`, T.luz, 1); }
    if (bandas && i > 0) d += R(x0, yt - 1.2, w, 1.6, T.luz); });
  if (sombra) d += R(x1 - w * sombra, y0, w * sombra, base - y0, T.som, SOMBRA);
  return pieza(f, d, [x0 - 1.8, y0 - 2.6, x1 + 1.8, base]);
}

// Fila de casas angostas (shophouses / casas tubo): cada casa = { w, h, c } (h = altura de la pared, sin techo).
// techo: 'teja' (teja curva oriental) | 'gablete' (europeo) | 'plano'. balcones / persianas / faroles de alero opcionales.
export function casas({ x0 = 4, base = 118, defs = [], techo = 'teja', cTecho = '#8E5A44', balcon = true, cPersiana = '#6F9A8E', farolitos = ['#C85A40', '#D9A040'], puertas = true } = {}) {
  let f = '', d = '', x = x0, top = base;
  defs.forEach((h0, i) => { const { w, h, c } = h0, T = tonos(c), yt = base - h, pisos = h0.pisos ?? (h > 34 ? 2 : 1); top = Math.min(top, yt - 12);
    f += R(x, yt, w, h, c);
    if (techo === 'teja') { const r = techoTeja({ x0: x + 1, x1: x + w - 1, y: yt + 1, alto: h0.alto ?? Math.min(10, w * .36), c: h0.cTecho ?? cTecho, vuelo: 3, curva: 2.6 }); f += r.f; d += r.d; }
    else if (techo === 'gablete') { f += P(`M${f1(x - 1)} ${f1(yt + 1)} L${f1(x + w / 2)} ${f1(yt - w * .55)} L${f1(x + w + 1)} ${f1(yt + 1)}Z`, h0.cTecho ?? cTecho); }
    // sombra del alero sobre la pared, luz a la izquierda (franja derecha más oscura)
    d += R(x, yt + 1.5, w, 3, T.osc, ' opacity=".3"') + R(x + w * .78, yt, w * .22, h, T.som, ' opacity=".4"');
    const hp = (h - 4) / pisos;
    for (let p = 0; p < pisos; p++) { const py = yt + 4 + p * hp, arriba = p < pisos - 1 || pisos === 1 && false;
      if (p === pisos - 1 && puertas) { // planta baja: frente de tienda con puertas de madera
        d += R(x + w * .14, py + hp * .25, w * .72, hp * .75, '#9C765C') + R(x + w * .4, py + hp * .42, w * .2, hp * .58, '#6E4E3E') + Ln(`M${f1(x + w * .27)} ${f1(py + hp * .3)} V${f1(py + hp)} M${f1(x + w * .73)} ${f1(py + hp * .3)} V${f1(py + hp)}`, '#B89070', 1) + R(x + w * .1, py + hp * .2, w * .8, 1.4, shade(c, .3)); }
      else { // pisos de arriba: ventanas con persianas y balcón de madera
        const vw = w * .26, vy = py + hp * .2, vh = hp * .5; d += R(x + w * .16, vy, vw, vh, cPersiana) + R(x + w * .58, vy, vw, vh, cPersiana) + Ln(`M${f1(x + w * .16 + vw / 2)} ${f1(vy)} V${f1(vy + vh)} M${f1(x + w * .58 + vw / 2)} ${f1(vy)} V${f1(vy + vh)}`, shade(cPersiana, .3), .8);
        if (balcon) { const by = vy + vh + 1; d += R(x - .5, by, w + 1, 1.6, '#7A5238') + R(x - .5, by - 4.5, w + 1, 1, '#7A5238'); for (let k = x + 1.5; k < x + w; k += 2.6) d += R(k, by - 4.5, .7, 4.5, '#7A5238'); } } }
    if (farolitos && h0.farol !== false) { const fc = farolitos[i % farolitos.length]; d += farol(x + w * .2, yt + 8.5, 2.2, fc) + farol(x + w * .8, yt + 8.5, 2.2, farolitos[(i + 1) % farolitos.length]); }
    x += w; });
  return pieza(f, d, [x0 - 3, top, x + 3, base]);
}
// farolito de seda colgado (pieza chica, va en los detalles: con borde crema grueso quedaría una mancha)
export const farol = (x, y, r, c) => Ln(`M${f1(x)} ${f1(y - r * 2.2)} V${f1(y - r * 1.1)}`, '#5E4636', .7) + `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * 1.25)}" fill="${c}" stroke="${CREAM}" stroke-width=".7"/>`
  + R(x - r * .55, y - r * 1.45, r * 1.1, r * .4, '#5E4636') + R(x - r * .55, y + r * 1.05, r * 1.1, r * .4, '#5E4636') + Ln(`M${f1(x)} ${f1(y + r * 1.45)} v${f1(r * .8)}`, c, .8) + Ln(`M${f1(x - r * .4)} ${f1(y - r * .6)} Q${f1(x - r * .6)} ${f1(y)} ${f1(x - r * .4)} ${f1(y + r * .6)}`, luz(c, .45), .7);
// Guirnalda de farolitos (cuelga en comba entre dos puntos)
export function farolitos({ x0 = 10, x1 = 110, y = 60, comba = 6, n = 7, colores = ['#C85A40', '#D9A040', '#B8607A'], r = 2.3, y1 } = {}) {
  const ye = y1 ?? y, at = t => [x0 + (x1 - x0) * t, y + (ye - y) * t + comba * 4 * t * (1 - t)];
  let d = Ln(`M${f1(x0)} ${f1(y)} Q${f1((x0 + x1) / 2)} ${f1((y + ye) / 2 + comba * 2)} ${f1(x1)} ${f1(ye)}`, '#5E4636', .7);
  for (let i = 0; i < n; i++) { const [fx, fy] = at((i + .5) / n); d += farol(fx, fy + r * 2.2, r, colores[i % colores.length]); }
  return pieza('', d, [x0, Math.min(y, ye), x1, Math.max(y, ye) + comba + r * 4]);
}

// Peñasco de caliza (karst): dedal alto apenas asimétrico, con estratos, sombra derecha y copa de vegetación
const karstD = (x, b, h, w) => `M${f1(x - w)} ${b} C${f1(x - w * 1.08)} ${f1(b - h * .55)} ${f1(x - w * .8)} ${f1(b - h * .97)} ${f1(x - w * .08)} ${f1(b - h)} C${f1(x + w * .62)} ${f1(b - h * 1.02)} ${f1(x + w * .98)} ${f1(b - h * .62)} ${f1(x + w)} ${b}Z`;
const karstS = (x, b, h, w) => `M${f1(x + w * .2)} ${f1(b - h * .99)} C${f1(x + w * .7)} ${f1(b - h * .96)} ${f1(x + w * .98)} ${f1(b - h * .62)} ${f1(x + w)} ${b} L${f1(x + w * .45)} ${b} C${f1(x + w * .6)} ${f1(b - h * .5)} ${f1(x + w * .55)} ${f1(b - h * .85)} ${f1(x + w * .2)} ${f1(b - h * .99)}Z`;
export function karst({ x = 60, base = 118, h = 70, w = 16, c = '#93B09C', veg = '#6F956F', seed = 1, vetas } = {}) {
  semilla(seed * 31 + 7); const T = tonos(c), top = base - h;
  let d = P(karstS(x, base, h, w), T.som, ' opacity=".55"');
  // copa de selva: dosel de puntas suaves que baja un poco por los costados
  let cap = `M${f1(x - w * .9)} ${f1(top + h * .28)} `; const n = 6;
  for (let i = 0; i <= n; i++) { const t = i / n, cx = x - w * .9 + t * w * 1.8, cy = top + h * (.02 + .24 * Math.pow(Math.abs(t - .45) * 2, 2)) - rnd() * 2.2; cap += `Q${f1(cx - w * .12)} ${f1(cy - 2.4)} ${f1(cx)} ${f1(cy)} `; }
  cap += `L${f1(x + w * .9)} ${f1(top + h * .3)} Q${f1(x)} ${f1(top + h * .2)} ${f1(x - w * .9)} ${f1(top + h * .28)}Z`;
  d += `<clipPath id="kc${seed}"><path d="${karstD(x, base, h, w)}"/></clipPath><g clip-path="url(#kc${seed})">${P(cap, veg)}${P(`M${f1(x + w * .2)} ${f1(top)} L${f1(x + w)} ${f1(top)} L${f1(x + w)} ${f1(top + h * .3)} L${f1(x + w * .3)} ${f1(top + h * .26)}Z`, shade(veg, .2), ' opacity=".5"')}</g>`;
  // estratos de la roca y manchas de verde colgante
  for (let i = 0; i < 4; i++) { const yy = top + h * (.38 + i * .14), x1 = x - w * (.75 - rnd() * .2), x2 = x + w * (.1 + rnd() * .4); d += Ln(`M${f1(x1)} ${f1(yy)} Q${f1((x1 + x2) / 2)} ${f1(yy - 1.6)} ${f1(x2)} ${f1(yy + .6)}`, T.lin, 1, ' opacity=".55"'); }
  for (let i = 0; i < 4; i++) { const yy = top + h * (.3 + rnd() * .35), xx = x - w * .65 + rnd() * w * 1.1; d += Ln(`M${f1(xx)} ${f1(yy)} q${f1(-.6)} ${f1(3)} ${f1(.2)} ${f1(5 + rnd() * 4)}`, veg, 1.6, ' opacity=".6"'); }
  // vetas: chorreaduras de color (la caliza naranja de Krabi), recortadas a la roca
  if (vetas) { let v = ''; for (let i = 0; i < 7; i++) { const xx = x - w * .8 + rnd() * w * 1.5, y1 = top + h * (.22 + rnd() * .2); v += Ln(`M${f1(xx)} ${f1(y1)} q${f1((rnd() - .5) * 2)} ${f1(h * .2)} ${f1((rnd() - .5) * 2.4)} ${f1(h * (.3 + rnd() * .35))}`, vetas, 1.4 + rnd() * 1.6, ' opacity=".4"'); }
    d += `<g clip-path="url(#kc${seed})">${v}</g>`; }
  d += Ln(`M${f1(x - w * .7)} ${f1(top + h * .35)} Q${f1(x - w * .78)} ${f1(top + h * .6)} ${f1(x - w * .74)} ${f1(top + h * .85)}`, T.luz, 1.3);
  return pieza(P(karstD(x, base, h, w), c), d, [x - w * 1.02, top - 2.5, x + w, base]);
}

// Chimenea de hada (Capadocia): cono de toba con cuello y "sombrero" de basalto, surcos de erosión y casas-cueva
export function chimenea({ x = 60, base = 118, h = 60, w = 14, c = '#E2C29E', sombrero = '#A88A76', cuevas = 2, seed = 1 } = {}) {
  semilla(seed * 17 + 3); const T = tonos(c), S = tonos(sombrero), nw = w * .4, hw = nw * 1.6, cap = hw * .66, cuello = base - h + cap * .7, top = cuello - cap;
  // cono de toba de laderas convexas que se angosta en un cuello; encima el sombrero de basalto, apenas más ancho que el cuello
  const cuerpo = `M${f1(x - w)} ${base} C${f1(x - w * .92)} ${f1(base - h * .32)} ${f1(x - nw * 1.5)} ${f1(base - h * .72)} ${f1(x - nw)} ${f1(cuello)} L${f1(x + nw)} ${f1(cuello)} C${f1(x + nw * 1.5)} ${f1(base - h * .72)} ${f1(x + w * .92)} ${f1(base - h * .32)} ${f1(x + w)} ${base}Z`;
  const gorro = `M${f1(x - hw)} ${f1(cuello + 1)} C${f1(x - hw * 1.02)} ${f1(top + cap * .2)} ${f1(x - hw * .5)} ${f1(top)} ${f1(x)} ${f1(top)} C${f1(x + hw * .5)} ${f1(top)} ${f1(x + hw * 1.02)} ${f1(top + cap * .2)} ${f1(x + hw)} ${f1(cuello + 1)} Q${f1(x)} ${f1(cuello + 2.4)} ${f1(x - hw)} ${f1(cuello + 1)}Z`;
  let d = P(`M${f1(x + nw * .15)} ${f1(cuello)} L${f1(x + nw)} ${f1(cuello)} C${f1(x + nw * 1.5)} ${f1(base - h * .72)} ${f1(x + w * .92)} ${f1(base - h * .32)} ${f1(x + w)} ${base} L${f1(x + w * .3)} ${base} C${f1(x + w * .38)} ${f1(base - h * .35)} ${f1(x + nw * .5)} ${f1(base - h * .7)} ${f1(x + nw * .15)} ${f1(cuello)}Z`, T.som, SOMBRA);
  // surcos de erosión que siguen la curva del cono (pocos y suaves) y bandas horizontales de toba
  for (let i = 0; i < 4; i++) { const t = -.62 + i * .42 + (rnd() - .5) * .12; d += Ln(`M${f1(x + t * nw)} ${f1(cuello + 3 + rnd() * 5)} C${f1(x + t * nw * 1.6)} ${f1(base - h * .66)} ${f1(x + t * w * .85)} ${f1(base - h * .35)} ${f1(x + t * w * .95)} ${f1(base - 1)}`, T.lin, .8, ' opacity=".45"'); }
  for (let i = 0; i < 2; i++) { const yy = base - h * (.22 + i * .2), ww = w * (.86 - i * .2); d += Ln(`M${f1(x - ww)} ${f1(yy)} Q${f1(x)} ${f1(yy + 2)} ${f1(x + ww)} ${f1(yy)}`, T.luz, 1, ' opacity=".7"'); }
  for (let i = 0; i < cuevas; i++) { const yy = base - h * (.18 + i * .22 + rnd() * .06), ww = Math.max(2.2, w * .15), xx = x - w * .45 + rnd() * w * .5; d += arco(xx, yy, ww, ww * 1.4, '#7A5C4C'); }
  d += Ln(`M${f1(x - w * .72)} ${f1(base - h * .15)} C${f1(x - w * .6)} ${f1(base - h * .4)} ${f1(x - nw * 1.4)} ${f1(base - h * .66)} ${f1(x - nw * .8)} ${f1(cuello + 3)}`, T.luz, 1.3)
    + P(`M${f1(x + hw * .1)} ${f1(top)} C${f1(x + hw * .5)} ${f1(top)} ${f1(x + hw * 1.02)} ${f1(top + cap * .2)} ${f1(x + hw)} ${f1(cuello + 1)} Q${f1(x + hw * .5)} ${f1(cuello + 2)} ${f1(x + hw * .3)} ${f1(cuello + 2)} Q${f1(x + hw * .45)} ${f1(top + cap * .4)} ${f1(x + hw * .1)} ${f1(top)}Z`, S.osc, SOMBRA)
    + Ln(`M${f1(x - hw * .75)} ${f1(top + cap * .55)} Q${f1(x - hw * .55)} ${f1(top + cap * .1)} ${f1(x - hw * .1)} ${f1(top + cap * .05)}`, S.luz, 1.1);
  return pieza(P(cuerpo, c) + P(gorro, sombrero), d, [x - w, top, x + w, base]);
}
// Macizo de toba (o roca): loma de cumbre ondulada que une las piezas de adelante con el paisaje; estratos y luz a la izquierda
export function macizo({ x0 = 0, x1 = 120, base = 118, alto = 40, c = '#E2C8AC', ondas = 5, seed = 2 } = {}) {
  semilla(seed * 13 + 1); const T = tonos(c), w = x1 - x0; let d0 = `M${x0} ${base} L${x0} ${f1(base - alto * .55)} `;
  for (let i = 0; i < ondas; i++) { const xa = x0 + w * (i + .5) / ondas, xb = x0 + w * (i + 1) / ondas, ya = base - alto * (.75 + rnd() * .25), yb = base - alto * (.5 + rnd() * .2); d0 += `Q${f1(xa)} ${f1(ya - alto * .2)} ${f1(xb)} ${f1(i === ondas - 1 ? base - alto * .5 : yb)} `; }
  d0 += `L${x1} ${base}Z`;
  let d = ''; for (let i = 0; i < 3; i++) { const yy = base - alto * (.18 + i * .14); d += Ln(`M${f1(x0 + w * .05)} ${f1(yy)} Q${f1(x0 + w * .5)} ${f1(yy - 3)} ${f1(x1 - w * .05)} ${f1(yy + 1)}`, T.lin, .9, ' opacity=".4"'); }
  return pieza(P(d0, c), d, [x0, base - alto * 1.1, x1, base]);
}

// Junco (barco de velas de abanico con listones). y = línea de flotación; s = escala (1 ≈ 40 de largo)
export function junco({ x = 60, y = 100, s = 1, c = '#8A5A44', vela = '#C98A62' } = {}) {
  const T = tonos(c), V = tonos(vela), k = v => f1(v * s);
  const g = inner => `<g transform="translate(${f1(x)} ${f1(y)})">${inner}</g>`;
  const casco = `M${k(-20)} ${k(-5)} L${k(-22)} ${k(-9)} L${k(-15)} ${k(-7)} L${k(14)} ${k(-7)} L${k(20)} ${k(-12)} L${k(22)} ${k(-11)} L${k(17)} ${k(1)} Q${k(0)} ${k(3)} ${k(-15)} ${k(1)}Z`;
  const velaD = (cx, b, hh, ww) => `M${k(cx - ww * .15)} ${k(b)} L${k(cx - ww * .55)} ${k(b - hh * .35)} Q${k(cx - ww * .6)} ${k(b - hh * .8)} ${k(cx - ww * .2)} ${k(b - hh)} L${k(cx + ww * .45)} ${k(b - hh * .92)} Q${k(cx + ww * .55)} ${k(b - hh * .5)} ${k(cx + ww * .4)} ${k(b)}Z`;
  const velas = [[-9, -9, 22, 13], [3, -9, 30, 16], [14, -10, 18, 11]];
  let f = P(casco, c) + velas.map(([cx, b, hh, ww]) => P(velaD(cx, b, hh, ww), vela)).join(''), d = '';
  velas.forEach(([cx, b, hh, ww]) => { for (let i = 1; i < 5; i++) { const yy = b - hh * i / 5; d += Ln(`M${k(cx - ww * .5)} ${k(yy)} L${k(cx + ww * .48)} ${k(yy - hh * .04)}`, V.osc, Math.max(.6, .9 * s)); }
    d += Ln(`M${k(cx)} ${k(b + 1)} L${k(cx + ww * .05)} ${k(b - hh - 2)}`, T.osc, Math.max(.8, 1.2 * s)) + P(`M${k(cx + ww * .1)} ${k(b)} L${k(cx + ww * .45)} ${k(b - hh * .92)} Q${k(cx + ww * .55)} ${k(b - hh * .5)} ${k(cx + ww * .4)} ${k(b)}Z`, V.som, ' opacity=".4"'); });
  d += Ln(`M${k(-16)} ${k(-3)} L${k(17)} ${k(-3)}`, T.luz, Math.max(.7, 1 * s)) + P(`M${k(-15)} ${k(-1)} Q${k(0)} ${k(1.5)} ${k(17)} ${k(-1)} L${k(17)} ${k(1)} Q${k(0)} ${k(3)} ${k(-15)} ${k(1)}Z`, T.osc, ' opacity=".5"');
  return pieza(g(f), g(d), [x - 22 * s, y - 27 * s, x + 22 * s, y + 3 * s]);
}

// Globo aerostático (gajos de dos colores, canasta y cuerdas)
export function globo({ x = 60, y = 30, r = 9, c = '#C8705A', c2 = '#E3C27A' } = {}) {
  const T = tonos(c);
  const env = `M${f1(x - r)} ${f1(y)} Q${f1(x - r)} ${f1(y - r * 1.3)} ${f1(x)} ${f1(y - r * 1.3)} Q${f1(x + r)} ${f1(y - r * 1.3)} ${f1(x + r)} ${f1(y)} Q${f1(x + r * .7)} ${f1(y + r * .9)} ${f1(x + r * .3)} ${f1(y + r * 1.15)} L${f1(x - r * .3)} ${f1(y + r * 1.15)} Q${f1(x - r * .7)} ${f1(y + r * .9)} ${f1(x - r)} ${f1(y)}Z`;
  const f = P(env, c) + R(x - r * .26, y + r * 1.55, r * .52, r * .42, '#8A6448');
  const d = P(`M${f1(x - r * .36)} ${f1(y - r * 1.12)} Q${f1(x - r * .48)} ${f1(y)} ${f1(x - r * .15)} ${f1(y + r * 1.1)} L${f1(x + r * .15)} ${f1(y + r * 1.1)} Q${f1(x + r * .48)} ${f1(y)} ${f1(x + r * .36)} ${f1(y - r * 1.12)} Q${f1(x)} ${f1(y - r * 1.34)} ${f1(x - r * .36)} ${f1(y - r * 1.12)}Z`, c2)
    + P(`M${f1(x + r * .55)} ${f1(y - r * 1.05)} Q${f1(x + r)} ${f1(y - r * .9)} ${f1(x + r)} ${f1(y)} Q${f1(x + r * .7)} ${f1(y + r * .9)} ${f1(x + r * .3)} ${f1(y + r * 1.15)} Q${f1(x + r * .7)} ${f1(y)} ${f1(x + r * .55)} ${f1(y - r * 1.05)}Z`, T.som, SOMBRA)
    + Ln(`M${f1(x - r * .3)} ${f1(y + r * 1.15)} L${f1(x - r * .24)} ${f1(y + r * 1.55)} M${f1(x + r * .3)} ${f1(y + r * 1.15)} L${f1(x + r * .24)} ${f1(y + r * 1.55)}`, '#6B4A2E', .8)
    + Ln(`M${f1(x - r * .95)} ${f1(y - r * .1)} Q${f1(x)} ${f1(y + r * .35)} ${f1(x + r * .95)} ${f1(y - r * .1)}`, T.osc, .9, ' opacity=".5"') + Ln(`M${f1(x - r * .7)} ${f1(y - r * .7)} Q${f1(x - r * .55)} ${f1(y - r * 1.05)} ${f1(x - r * .25)} ${f1(y - r * 1.18)}`, luz(c, .5), 1.1);
  return pieza(f, d, [x - r, y - r * 1.3, x + r, y + r * 2]);
}

// Palmera (tronco curvo + hojas en punta)
export function palmera({ x = 60, base = 118, h = 40, lean = 4, ct = '#9A7A56', cf = '#6E9A62' } = {}) {
  const tx = x + lean, ty = base - h, L = h * .42;
  const hoja = (dx, dy) => `M${f1(tx)} ${f1(ty)} Q${f1(tx + dx * .5)} ${f1(ty + dy * .5 - L * .32)} ${f1(tx + dx)} ${f1(ty + dy)} Q${f1(tx + dx * .45)} ${f1(ty + dy * .42)} ${f1(tx)} ${f1(ty + 1)}Z`;
  const f = P(`M${f1(x - h * .03)} ${base} Q${f1(x + lean * .15)} ${f1(base - h * .55)} ${f1(tx - h * .02)} ${f1(ty)} L${f1(tx + h * .02)} ${f1(ty)} Q${f1(x + lean * .15 + h * .05)} ${f1(base - h * .55)} ${f1(x + h * .03)} ${base}Z`, ct)
    + P([[-L, L * .45], [-L * .8, -L * .2], [-L * .2, -L * .5], [L * .35, -L * .42], [L * .85, -L * .1], [L, L * .45]].map(([a, c]) => hoja(a, c)).join(' '), cf);
  let d = ''; for (let i = 1; i < 6; i++) { const yy = base - h * i / 6; d += Ln(`M${f1(x + lean * (i / 6) - h * .03)} ${f1(yy)} h${f1(h * .06)}`, shade(ct, .3), .7); }
  d += P([[L * .35, -L * .42], [L * .85, -L * .1], [L, L * .45]].map(([a, c]) => hoja(a, c)).join(' '), shade(cf, .25), ' opacity=".45"');
  return pieza(f, d, [tx - L, ty - L * .5, tx + L, base]);
}

// Agua con brillos (lámina recortada de orilla irregular). Va en FORE (ver aguaFore) o dentro de un monumento
export function agua({ x0 = 4, x1 = 116, y0 = 100, y1 = 120, c = '#A9CBC6', brillos = 5, seed = 3 } = {}) {
  semilla(seed); const w = x1 - x0;
  const f = P(`M${x0} ${y1} Q${f1(x0 + w * .1)} ${f1(y0 + .5)} ${f1(x0 + w * .3)} ${y0} Q${f1(x0 + w * .5)} ${f1(y0 - .8)} ${f1(x1 - w * .3)} ${y0} Q${f1(x1 - w * .1)} ${f1(y0 + .5)} ${x1} ${y1} Q${f1(x0 + w / 2)} ${f1(y1 + 1.5)} ${x0} ${y1}Z`, c);
  let d = P(`M${f1(x0 + w * .08)} ${f1(y0 + 2.4)} Q${f1(x0 + w * .5)} ${f1(y0 + 1.2)} ${f1(x1 - w * .08)} ${f1(y0 + 2.4)} L${f1(x1 - w * .06)} ${f1(y0 + 4)} Q${f1(x0 + w * .5)} ${f1(y0 + 2.8)} ${f1(x0 + w * .06)} ${f1(y0 + 4)}Z`, shade(c, .12), ' opacity=".6"');
  for (let i = 0; i < brillos; i++) { const y = y0 + 5 + (y1 - y0 - 8) * (i + .5) / brillos, ww = 5 + rnd() * 9, x = x0 + w * .12 + rnd() * (w * .76 - ww); d += Ln(`M${f1(x)} ${f1(y)} h${f1(ww)}`, luz(c, .6), 1.1, ' opacity=".85"'); }
  return pieza(f, d, [x0, y0, x1, y1]);
}

// ───────────── Tanda 2: arquitectura de Asia oriental, castillos, costa de caliza ─────────────

// Muro (con puertas): pared de y a base, albardilla de teja arriba y arcos de puerta oscuros con su dovela clara.
//   piedra: true → muro de sillares (ishigaki / terraza de piedra): hiladas desparejas en vez de friso; talud: cuánto se abre abajo cada costado
//   arcos: [{ x, w, h }] (h desde la base). cTeja: color de la albardilla (sin cTeja, cornisa clara)
export function muro({ x0 = 10, x1 = 110, y = 70, base = 118, c = '#B46252', arcos = [], piedra = false, talud = 0, cTeja, seed = 4, pilastras = 0 } = {}) {
  semilla(seed); const T = tonos(c), w = x1 - x0, h = base - y;
  const d0 = talud ? `M${f1(x0 - talud)} ${base} Q${f1(x0 - talud * .12)} ${f1(base - h * .45)} ${f1(x0)} ${f1(y)} L${f1(x1)} ${f1(y)} Q${f1(x1 + talud * .12)} ${f1(base - h * .45)} ${f1(x1 + talud)} ${base}Z` : `M${f1(x0)} ${base} V${f1(y)} H${f1(x1)} V${base}Z`;
  let f = P(d0, c), d = '';
  if (cTeja) { const TT = tonos(cTeja); f += P(`M${f1(x0 - 2.5)} ${f1(y + 1)} L${f1(x0 + 1)} ${f1(y - 3.2)} L${f1(x1 - 1)} ${f1(y - 3.2)} L${f1(x1 + 2.5)} ${f1(y + 1)}Z`, cTeja); d += R(x0 - 2, y + .2, w + 4, 1, TT.osc) + Ln(`M${f1(x0 + 1)} ${f1(y - 2.6)} H${f1(x1 - 1)}`, TT.luz, .9); }
  else if (!piedra) { f += R(x0 - 1.5, y - 2.4, w + 3, 3, T.luz); }
  if (piedra) { // hiladas de sillares desparejos, con juntas trabadas
    for (let yy = y + 4, k = 0; yy < base; yy += 4.6 + rnd() * 1.4, k++) { const xa = x0 - (talud ? talud * Math.pow((yy - y) / h, 2) * .9 : 0) + 1, xb = x1 + (talud ? talud * Math.pow((yy - y) / h, 2) * .9 : 0) - 1;
      d += Ln(`M${f1(xa)} ${f1(yy)} Q${f1((xa + xb) / 2)} ${f1(yy + (rnd() - .5) * 1.2)} ${f1(xb)} ${f1(yy)}`, T.lin, .7, ' opacity=".5"');
      for (let xx = xa + 2 + rnd() * 5; xx < xb - 2; xx += 5 + rnd() * 6) d += Ln(`M${f1(xx)} ${f1(yy)} v${f1(-3.6 - rnd())}`, T.lin, .6, ' opacity=".45"'); }
    for (let i = 0; i < 5; i++) { const xx = x0 + w * (.08 + rnd() * .8), yy = y + h * (.15 + rnd() * .7); d += R(xx, yy, 3 + rnd() * 4, 2.6, T.luz, ' opacity=".5"'); } }
  else { d += R(x0, y + 4, w, 1, T.som, ' opacity=".6"'); for (let yy = y + 12; yy < base - 4; yy += 11) d += Ln(`M${f1(x0 + 1)} ${f1(yy)} H${f1(x1 - 1)}`, T.lin, .6, ' opacity=".35"'); }
  // pilastras: postes de piedra con viga (terrazas de Bulguksa) o pilastras apenas marcadas y zócalo en sombra (muros rojos)
  for (let i = 1; i < pilastras; i++) { const xx = x0 + w * i / pilastras;
    d += piedra ? R(xx - 1.8, y + 1, 3.6, h, T.luz, ' opacity=".75"') + R(xx + 1.8, y + 1, .9, h, T.som, ' opacity=".5"') : R(xx - 2.2, y + 6, 4.4, h - 6, T.som, ' opacity=".22"') + R(xx - 2.2, y + 6, 1, h - 6, T.luz, ' opacity=".35"'); }
  if (pilastras && piedra) d += R(x0, y + h * .42, w, 2.6, T.luz, ' opacity=".7"') + R(x0, y + h * .42 + 2.6, w, .8, T.som, ' opacity=".5"');
  if (pilastras && !piedra) d += R(x0, base - h * .22, w, h * .22, T.som, ' opacity=".28"') + R(x0, base - h * .22, w, 1.2, T.luz, ' opacity=".6"');
  arcos.forEach(a => { const ay = base - a.h; d += arco(a.x - a.w / 2, ay, a.w, a.h + 1, '#4E3634') + Ln(`M${f1(a.x - a.w / 2 - 1.2)} ${f1(ay + a.w / 2)} A${f1(a.w / 2 + 1.2)} ${f1(a.w / 2 + 1.2)} 0 0 1 ${f1(a.x + a.w / 2 + 1.2)} ${f1(ay + a.w / 2)}`, T.luz, 1.3)
    + Ln(`M${f1(a.x)} ${f1(ay + a.w * .5)} V${base}`, '#3A2A2C', .7, ' opacity=".6"'); });
  d += talud ? P(`M${f1(x1 - w * .16)} ${f1(y)} L${f1(x1)} ${f1(y)} Q${f1(x1 + talud * .12)} ${f1(base - h * .45)} ${f1(x1 + talud)} ${base} L${f1(x1 - w * .16 + talud * .5)} ${base}Z`, T.som, SOMBRA) : R(x1 - w * .16, y, w * .16, h, T.som, SOMBRA);
  return pieza(f, d, [x0 - talud - 2.5, y - (cTeja ? 3.2 : 2.4), x1 + talud + 2.5, base]);
}

// Pabellón de madera (Ciudad Prohibida, templos coreanos, puertas): cuerpo con columnas y celosías, uno o dos techos de teja curva.
//   cBanda: friso pintado bajo el alero (dancheong coreano, viga verde china); techos: 1 | 2 (el de arriba más angosto)
export function pabellon({ x0 = 20, x1 = 100, y = 70, base = 118, c = '#B8665A', cTecho = '#8C8E96', cCol, cBanda, columnas = 6, techos = 1, alto, vuelo = 6, celosia = true, alto2 } = {}) {
  const T = tonos(c), w = x1 - x0, al = alto ?? Math.min(16, w * .22), cc = cCol ?? shade(c, .14), cw = w / columnas;
  let fBody = R(x0, y, w, base - y, c), d = '', fUp = '', dUp = '', fRoof2 = '', dRoof2 = '';
  if (cBanda) d += R(x0, y + 1.6, w, 2.8, cBanda) + R(x0, y + 4.4, w, .9, luz(cBanda, .45));
  for (let i = 0; i <= columnas; i++) d += R(x0 + i * cw - 1.1, y + 3, 2.2, base - y - 3, cc);
  if (celosia) for (let i = 0; i < columnas; i++) { const vx = x0 + i * cw + cw * .2, vw = cw * .6, vy = y + 7.5, vh = Math.min((base - y) * .42, 15);
    d += R(vx, vy, vw, vh, T.osc, ' opacity=".5"'); for (let k = 1; k < 4; k++) d += Ln(`M${f1(vx + vw * k / 4)} ${f1(vy)} V${f1(vy + vh)}`, T.luz, .55, ' opacity=".7"'); d += Ln(`M${f1(vx)} ${f1(vy + vh / 2)} H${f1(vx + vw)}`, T.luz, .55, ' opacity=".7"'); }
  d += R(x1 - w * .2, y, w * .2, base - y, T.som, SOMBRA);
  const r1 = techoTeja({ x0, x1, y: y + 1, alto: al, c: cTecho, vuelo, curva: vuelo * .7, cumbrera: techos < 2 });
  let top = y - al - (techos < 2 ? 4.4 : 0);
  if (techos > 1) { const h2 = alto2 ?? al * .9, ux0 = x0 + w * .17, ux1 = x1 - w * .17, uw = ux1 - ux0, ub = y - al + 1, uy = ub - h2;
    fUp = R(ux0, uy, uw, ub - uy + 2, c); if (cBanda) dUp += R(ux0, uy + 1.4, uw, 2.4, cBanda);
    for (let i = 0; i <= 4; i++) dUp += R(ux0 + i * uw / 4 - .9, uy + 3, 1.8, ub - uy - 4, cc);
    dUp += R(ux1 - uw * .2, uy, uw * .2, ub - uy - 1, T.som, SOMBRA);
    const r2 = techoTeja({ x0: ux0, x1: ux1, y: uy + 1, alto: al * .9, c: cTecho, vuelo: vuelo * .85, curva: vuelo * .6 }); fRoof2 = r2.f; dRoof2 = r2.d; top = uy - al * .9 - 4.4; }
  return pieza(fUp + fBody + r1.f + fRoof2, dUp + d + r1.d + dRoof2, [x0 - vuelo, top, x1 + vuelo, base]);
}

// Torre del homenaje de castillo japonés (tenshu): pisos blancos que se angostan hacia arriba, techos de teja curva verde,
// el último piso oscuro con friso dorado y los shachihoko dorados en la cumbrera. y0 = donde termina la muralla de piedra.
// Devuelve además .techos (eje, ancho e y de cada alero) para poner hastiales (hastial) en una capa de adelante.
export function tenshu({ x = 60, y0 = 84, base = 118, anchos = [58, 48, 40, 32, 24], hp = 11, c = '#EDE6D8', cTecho = '#7C9E92', oro = '#C9A65A', cAlto = '#4E6260' } = {}) {
  const T = tonos(c), TA = tonos(cAlto); let fW = '', fR = '', d = '', dR = '', yb = base, techos = [];
  anchos.forEach((w, i) => { const ultimo = i === anchos.length - 1, top = i === 0 ? y0 - hp : yb - hp, cw = ultimo ? cAlto : c, Tw = ultimo ? TA : T;
    fW += R(x - w / 2, top, w, yb - top + (i ? 1 : 0), cw);
    // ventanas chicas (con hueco al centro, donde va el hastial del piso de abajo) y sombra derecha
    const n = Math.max(2, Math.round(w / 9)); for (let k = 0; k < n; k++) { const vx = x - w / 2 + (k + .5) * w / n - 1.4; if (!ultimo && Math.abs(vx + 1.4 - x) < w * .16 && i % 2 === 1) continue; d += R(vx, top + hp * .38, 2.8, hp * .32, ultimo ? oro : '#6A625E', ultimo ? ' opacity=".8"' : ''); }
    if (ultimo) d += R(x - w / 2, top + hp * .18, w, 1.2, oro) + R(x - w / 2, top + hp * .82, w, 1.2, oro);
    d += R(x + w / 2 - w * .2, top, w * .2, yb - top, Tw.som, SOMBRA) + R(x - w / 2, top + 1.6, w, 1.4, Tw.osc, ' opacity=".35"');
    const al = hp * (ultimo ? .85 : .6), r = techoTeja({ x0: x - w / 2 - 1, x1: x + w / 2 + 1, y: top + 1, alto: al, c: cTecho, vuelo: ultimo ? 4.5 : 5, curva: ultimo ? 4 : 3.6, cumbrera: ultimo });
    fR = r.f + fR; dR += r.d; techos.push({ x, w: w + 2, y: top + 1, alto: al }); // los techos de arriba van debajo de los de abajo
    if (!ultimo) dR += Ln(`M${f1(x - w / 2 - 4)} ${f1(top + 2.4)} H${f1(x + w / 2 + 4)}`, luz(cTecho, .55), .8, ' opacity=".8"');
    if (ultimo) { const yr = top + 1 - al - 2.6, xa = x - w / 2 + al * .9 - 2, xb = x + w / 2 - al * .9 + 2; // shachihoko: pececitos dorados de cola levantada
      dR += [[xa, 1], [xb, -1]].map(([sx, s]) => P(`M${f1(sx)} ${f1(yr)} q${f1(s * 2.6)} -.6 ${f1(s * 2.2)} -3.6 q${f1(-s * .4)} -1.6 ${f1(-s * 1.8)} -2.6 q${f1(s * .2)} 1.8 ${f1(-s * .9)} 3.2Z`, oro)).join('') + Ln(`M${f1(xa + 1)} ${f1(yr + .6)} H${f1(xb - 1)}`, oro, .8, ' opacity=".7"'); }
    yb = top + 1 - al * .5; });
  const p = pieza(fW + fR, d + dR, [x - anchos[0] / 2 - 6, yb - 12, x + anchos[0] / 2 + 6, base]); p.techos = techos; return p;
}
// Hastial (frontón triangular o curvo sobre un techo: chidori-hafu / kara-hafu). (x, y) = centro de su base, w ancho, h alto
export function hastial({ x = 60, y = 60, w = 16, h = 8, c = '#EDE6D8', marco = '#7C9E92', oro = '#C9A65A', curvo = false } = {}) {
  const M = tonos(marco);
  const out = curvo ? `M${f1(x - w / 2 - 1)} ${f1(y + 1)} Q${f1(x - w * .32)} ${f1(y + .4)} ${f1(x - w * .22)} ${f1(y - h * .6)} Q${f1(x - w * .1)} ${f1(y - h - 1)} ${f1(x)} ${f1(y - h - 1)} Q${f1(x + w * .1)} ${f1(y - h - 1)} ${f1(x + w * .22)} ${f1(y - h * .6)} Q${f1(x + w * .32)} ${f1(y + .4)} ${f1(x + w / 2 + 1)} ${f1(y + 1)}Z`
    : `M${f1(x - w / 2 - 1.5)} ${f1(y + 1)} Q${f1(x - w * .2)} ${f1(y - h * .35)} ${f1(x)} ${f1(y - h - 1.5)} Q${f1(x + w * .2)} ${f1(y - h * .35)} ${f1(x + w / 2 + 1.5)} ${f1(y + 1)}Z`;
  const inn = curvo ? `M${f1(x - w * .3)} ${f1(y)} Q${f1(x - w * .14)} ${f1(y - h * .62)} ${f1(x)} ${f1(y - h * .66)} Q${f1(x + w * .14)} ${f1(y - h * .62)} ${f1(x + w * .3)} ${f1(y)}Z`
    : `M${f1(x - w * .32)} ${f1(y)} L${f1(x)} ${f1(y - h * .72)} L${f1(x + w * .32)} ${f1(y)}Z`;
  const d = P(inn, c) + P(`M${f1(x)} ${f1(y - h * .7)} L${f1(x + w * .32)} ${f1(y)} L${f1(x)} ${f1(y)}Z`, shade(c, .2), ' opacity=".35"') + C(x, y - h * .3, Math.max(.9, w * .06), oro) + Ln(`M${f1(x - w / 2)} ${f1(y + .4)} H${f1(x + w / 2)}`, M.osc, .8);
  return pieza(P(out, marco), d, [x - w / 2 - 1.5, y - h - 1.5, x + w / 2 + 1.5, y + 1]);
}

// Escalinata-puente de piedra (Bulguksa): tramo de escalones de frente, con el ojo de puente en arco a media altura y barandas a los costados
export function escalinata({ x = 40, w = 12, y = 70, base = 118, c = '#C8BCA8', ojo = .5 } = {}) {
  const T = tonos(c), h = base - y, yo = y + h * ojo;
  const f = R(x - w / 2, y, w, h, c) + R(x - w / 2 - 1.6, y - 2, 1.6, h + 2, T.luz) + R(x + w / 2, y - 2, 1.6, h + 2, T.luz);
  let d = ''; for (let yy = y + 2.2; yy < base; yy += 2.4) if (Math.abs(yy - yo) > w * .55) d += Ln(`M${f1(x - w / 2 + .6)} ${f1(yy)} H${f1(x + w / 2 - .6)}`, T.lin, .7, ' opacity=".6"');
  d += arco(x - w * .36, yo - w * .3, w * .72, w * .66, '#5A4A40') + Ln(`M${f1(x - w * .44)} ${f1(yo + .3)} A${f1(w * .44)} ${f1(w * .44)} 0 0 1 ${f1(x + w * .44)} ${f1(yo + .3)}`, T.luz, 1)
    + R(x + w * .2, y, w * .3, h, T.som, SOMBRA);
  return pieza(f, d, [x - w / 2 - 1.6, y - 2, x + w / 2 + 1.6, base]);
}

// Puente curvo de madera (puente Thê Húc de Hanói, puentes de jardín): tablero en arco, baranda con postes y patas que bajan al agua
export function puenteCurvo({ x0 = 6, x1 = 70, y = 88, alto = 10, c = '#B8665A', base = 118, patas = 5, grosor = 3.2 } = {}) {
  const T = tonos(c), m = (x0 + x1) / 2, yc = y - alto * 2;
  const curva = (dy, dir = 1) => dir > 0 ? `M${f1(x0)} ${f1(y + dy)} Q${f1(m)} ${f1(yc + dy)} ${f1(x1)} ${f1(y + dy)}` : `L${f1(x1)} ${f1(y + dy)} Q${f1(m)} ${f1(yc + dy)} ${f1(x0)} ${f1(y + dy)}`;
  let f = P(`${curva(0)} ${curva(grosor, -1).replace(/^L/, 'L')}Z`, c) + P(`${curva(-4.6)} ${curva(-3.4, -1)}Z`, c), d = '';
  for (let i = 0; i < patas; i++) { const t = (i + .5) / patas, [px, py] = [x0 + (x1 - x0) * t, y + (yc - y) * 2 * t * (1 - t)]; f += R(px - 1, py + grosor - .5, 2, base - py, c); d += R(px + .3, py + grosor, .7, base - py, T.som, SOMBRA); }
  for (let i = 0; i <= 14; i++) { const t = i / 14, px = x0 + (x1 - x0) * t, py = y + (yc - y) * 2 * t * (1 - t); d += Ln(`M${f1(px)} ${f1(py - 4)} V${f1(py)}`, T.osc, .8, ' opacity=".8"'); }
  d += Ln(curva(grosor - .6), T.osc, 1, ' opacity=".5"') + Ln(curva(.6), T.luz, .8);
  return pieza(f, d, [x0 - 1, yc - 5, x1 + 1, base]);
}

// Acantilado de caliza (paredes de bahía, islas de pared alta): bloque de laderas casi verticales, cima ondulada con selva, vetas y alero
//   cara: 'izq' | 'der' → de qué lado está la pared que mira al centro (más vertical y con alero); vetas: color de las chorreaduras
export function acantilado({ x0 = 0, x1 = 50, base = 118, h = 80, c = '#B4A890', veg = '#7E9C74', cara = 'der', vetas, seed = 1 } = {}) {
  semilla(seed * 19 + 5); const T = tonos(c), w = x1 - x0, top = base - h, iz = cara === 'izq';
  // contorno: lado "abierto" en talud suave, lado de la cara casi a plomo con un alero arriba
  const L = iz ? [x0 + w * .02, x0 - w * .04] : [x0 - w * .06, x0 + w * .12], Rr = iz ? [x1 + w * .06, x1 - w * .12] : [x1 - w * .02, x1 + w * .04];
  let path = `M${f1(L[1])} ${base} C${f1(L[0])} ${f1(base - h * .5)} ${f1(L[0])} ${f1(top + h * .2)} ${f1(x0 + w * .08)} ${f1(top + h * .08)} `;
  const n = 4; for (let i = 0; i < n; i++) { const xa = x0 + w * (.08 + .84 * (i + .5) / n), xb = x0 + w * (.08 + .84 * (i + 1) / n), ya = top - rnd() * h * .05, yb = top + h * (.02 + rnd() * .06); path += `Q${f1(xa)} ${f1(ya)} ${f1(xb)} ${f1(yb)} `; }
  path += `C${f1(Rr[0])} ${f1(top + h * .2)} ${f1(Rr[0])} ${f1(base - h * .5)} ${f1(Rr[1])} ${base}Z`;
  const id = 'ac' + seed + Math.round(x0);
  let d = `<clipPath id="${id}"><path d="${path}"/></clipPath><g clip-path="url(#${id})">`;
  // selva en la cima (copa de puntas suaves que baja un poco por las paredes)
  let cap = `M${f1(x0 - 4)} ${f1(top + h * .2)} `; for (let i = 0; i <= 7; i++) { const t = i / 7, cx = x0 - 4 + t * (w + 8), cy = top + h * (.1 + .06 * Math.abs(t - .5)) + (rnd() - .5) * 3; cap += `Q${f1(cx - w * .05)} ${f1(cy - 3)} ${f1(cx)} ${f1(cy)} `; }
  cap += `L${f1(x1 + 4)} ${f1(top - 10)} L${f1(x0 - 4)} ${f1(top - 10)}Z`;
  d += P(cap, veg) + P(`M${f1(x0 - 4)} ${f1(top - 10)} H${f1(x1 + 4)} V${f1(top + h * .2)} L${f1(iz ? x0 + w * .35 : x0 + w * .65)} ${f1(top + h * .18)}Z`, shade(veg, .22), ' opacity=".35"');
  // la pared de la cara en sombra (luz desde la izquierda) y el alero
  d += iz ? P(`M${f1(x0 - 8)} ${base} V${f1(top)} L${f1(x0 + w * .22)} ${f1(top)} L${f1(x0 + w * .12)} ${base}Z`, T.som, ' opacity=".2"') : P(`M${f1(x1 + 8)} ${base} V${f1(top)} L${f1(x1 - w * .28)} ${f1(top)} L${f1(x1 - w * .16)} ${base}Z`, T.som, ' opacity=".5"');
  for (let i = 0; i < 6; i++) { const xx = x0 + w * (.12 + rnd() * .76), y1 = top + h * (.2 + rnd() * .15); d += Ln(`M${f1(xx)} ${f1(y1)} q${f1((rnd() - .5) * 3)} ${f1(h * .25)} ${f1((rnd() - .5) * 2)} ${f1(h * (.35 + rnd() * .3))}`, vetas ?? T.lin, vetas ? 1.6 : .9, vetas ? ' opacity=".42"' : ' opacity=".45"'); }
  for (let i = 0; i < 3; i++) { const yy = top + h * (.42 + i * .17); d += Ln(`M${f1(x0 + w * .1)} ${f1(yy)} Q${f1(x0 + w * .5)} ${f1(yy - 2)} ${f1(x1 - w * .15)} ${f1(yy + 1)}`, T.lin, .8, ' opacity=".35"'); }
  for (let i = 0; i < 4; i++) { const xx = x0 + w * (.15 + rnd() * .7), yy = top + h * (.2 + rnd() * .2); d += Ln(`M${f1(xx)} ${f1(yy)} q-.6 3 .2 ${f1(5 + rnd() * 5)}`, veg, 1.6, ' opacity=".65"'); }
  d += `</g>` + Ln(`M${f1(L[0] + (iz ? 3 : 4))} ${f1(top + h * .3)} Q${f1(L[0] + 2)} ${f1(top + h * .6)} ${f1(L[0] + 3)} ${f1(base - h * .1)}`, T.luz, 1.3, ' opacity=".8"');
  return pieza(P(path, c), d, [Math.min(L[1], x0 - w * .06), top - h * .06, Math.max(Rr[1], x1 + w * .06), base]);
}

// Barca de cola larga (long-tail tailandesa): casco largo y fino de proa muy levantada con cintas de colores, toldo y la caña del motor
export function colaLarga({ x = 60, y = 100, s = 1, c = '#9A6E50', toldo = '#C9B48E', cintas = ['#C8705A', '#D9B060', '#7FA8B0'], dir = 1 } = {}) {
  const T = tonos(c), k = v => f1(v * s);
  const g = inner => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${dir} 1)">${inner}</g>`;
  const casco = `M${k(-26)} ${k(-15)} Q${k(-22)} ${k(-5)} ${k(-12)} ${k(-3)} L${k(20)} ${k(-3)} Q${k(23)} ${k(-3.4)} ${k(24)} ${k(-5.6)} L${k(22)} ${k(1)} Q${k(0)} ${k(2.4)} ${k(-14)} ${k(1)} Q${k(-22)} ${k(-1)} ${k(-27.5)} ${k(-14)}Z`;
  const f = P(casco, c) + R(-8 * s, -11.5 * s, 22 * s, 1.8 * s, toldo);
  let d = Ln(`M${k(-12)} ${k(-1)} H${k(21)}`, T.luz, Math.max(.6, .8 * s)) + P(`M${k(-14)} ${k(1)} Q${k(0)} ${k(2.4)} ${k(22)} ${k(1)} L${k(22)} ${k(-.6)} Q${k(0)} ${k(.8)} ${k(-14)} ${k(-.6)}Z`, T.osc, ' opacity=".5"')
    + [-6, 3, 12].map(px => Ln(`M${k(px)} ${k(-10)} V${k(-3)}`, T.osc, Math.max(.5, .7 * s))).join('')
    + Ln(`M${k(18)} ${k(-5)} L${k(34)} ${k(1.5)}`, '#5E4A40', Math.max(.6, .9 * s)) + R(14.5 * s, -8 * s, 4 * s, 3 * s, '#6E625A');
  cintas.forEach((cc, i) => { d += Ln(`M${k(-25.5 + i * .6)} ${k(-13 + i * 1.6)} q${k(-1.2)} ${k(2)} ${k(-.4)} ${k(4)}`, cc, Math.max(.7, 1.1 * s)); });
  return pieza(g(f), g(d), [x - 28 * s, y - 16 * s, x + 34 * s, y + 3 * s]);
}

// ───────────── Tanda 3: África austral (sabana, desierto del Namib, costa del Índico y del Atlántico) ─────────────

// rama ahusada (cuadrilátero de ancho w1 en el arranque a w2 en la punta): troncos y ramas que reciben el borde crema
export const rama = (x1, y1, x2, y2, w1, w2 = w1) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  return `M${f1(x1 + nx * w1 / 2)} ${f1(y1 + ny * w1 / 2)} L${f1(x2 + nx * w2 / 2)} ${f1(y2 + ny * w2 / 2)} L${f1(x2 - nx * w2 / 2)} ${f1(y2 - ny * w2 / 2)} L${f1(x1 - nx * w1 / 2)} ${f1(y1 - ny * w1 / 2)}Z`; };

// Baobab de Grandidier (Avenida de los Baobabs): tronco en columna lisa y alta, apenas más ancho abajo, y arriba una copa CORTA
// y plana de ramas gruesas que se abren como dedos; hojas en matas planas (nada de bolitas). w = medio ancho del tronco
export function baobab({ x = 60, base = 118, h = 80, w = 7, c = '#B89A80', hoja = '#8E9E74', seed = 1, ramas = 6 } = {}) {
  semilla(seed * 23 + 11); const T = tonos(c), yt = base - h * .8, L = h * .2;
  const tronco = `M${f1(x - w * 1.18)} ${base} C${f1(x - w * 1.08)} ${f1(base - h * .25)} ${f1(x - w * 1.02)} ${f1(base - h * .55)} ${f1(x - w * .78)} ${f1(yt)} L${f1(x + w * .78)} ${f1(yt)} C${f1(x + w * 1.02)} ${f1(base - h * .55)} ${f1(x + w * 1.08)} ${f1(base - h * .25)} ${f1(x + w * 1.18)} ${base}Z`;
  let f = P(tronco, c), d = '', puntas = [];
  for (let i = 0; i < ramas; i++) { const t = i / (ramas - 1) - .5, a = t * 2.1 + (rnd() - .5) * .18, x0 = x + t * w * 1.2, l = L * (.8 + rnd() * .35) * (1 - Math.abs(t) * .3);
    const x2 = x0 + Math.sin(a) * l, y2 = yt + 1 - Math.cos(a) * l * .95; f += P(rama(x0, yt + 2, x2, y2, w * .42, w * .17), c); puntas.push([x2, y2, a]);
    const a2 = a + (t < 0 ? -.5 : .5) * (.6 + rnd() * .4), x3 = x2 + Math.sin(a2) * l * .45, y3 = y2 - Math.cos(a2) * l * .4; d += P(rama(x0 + (x2 - x0) * .7, yt + 2 - (yt + 2 - y2) * .7, x3, y3, w * .16, w * .07), T.som); puntas.push([x3, y3, a2]); }
  // matas de hojas planas sobre las puntas (en los detalles: con borde crema grueso quedarían manchas)
  puntas.forEach(([px, py], i) => { const rx = w * (.55 + rnd() * .35), ry = w * .22; d += P(`M${f1(px - rx)} ${f1(py + ry * .3)} Q${f1(px - rx * .6)} ${f1(py - ry * 1.4)} ${f1(px - rx * .1)} ${f1(py - ry * .9)} Q${f1(px + rx * .3)} ${f1(py - ry * 1.8)} ${f1(px + rx * .7)} ${f1(py - ry * .7)} Q${f1(px + rx * 1.1)} ${f1(py - ry * .2)} ${f1(px + rx)} ${f1(py + ry * .3)}Z`, i % 3 ? hoja : shade(hoja, .15)); });
  // corteza: sombra derecha, luz izquierda, arrugas verticales suaves y anillos de la base
  d += P(`M${f1(x + w * .25)} ${f1(yt)} L${f1(x + w * .78)} ${f1(yt)} C${f1(x + w * 1.02)} ${f1(base - h * .55)} ${f1(x + w * 1.08)} ${f1(base - h * .25)} ${f1(x + w * 1.18)} ${base} L${f1(x + w * .4)} ${base} C${f1(x + w * .5)} ${f1(base - h * .4)} ${f1(x + w * .4)} ${f1(base - h * .6)} ${f1(x + w * .25)} ${f1(yt)}Z`, T.som, SOMBRA)
    + Ln(`M${f1(x - w * .62)} ${f1(yt + 4)} C${f1(x - w * .82)} ${f1(base - h * .5)} ${f1(x - w * .86)} ${f1(base - h * .25)} ${f1(x - w * .9)} ${f1(base - 4)}`, T.luz, Math.max(.8, w * .16), ' opacity=".8"');
  for (let i = 0; i < 4; i++) { const xx = x + w * (-.5 + i * .3 + (rnd() - .5) * .1); d += Ln(`M${f1(xx)} ${f1(yt + 6 + rnd() * 8)} Q${f1(xx + (rnd() - .5) * w * .3)} ${f1(base - h * .4)} ${f1(xx + (xx - x) * .2)} ${f1(base - 2)}`, T.lin, .7, ' opacity=".4"'); }
  for (let i = 0; i < 3; i++) { const yy = base - h * (.12 + i * .1); d += Ln(`M${f1(x - w)} ${f1(yy)} Q${f1(x)} ${f1(yy + 1.4)} ${f1(x + w)} ${f1(yy)}`, T.lin, .6, ' opacity=".3"'); }
  return pieza(f, d, [x - L * 1.1, yt - L * 1.15, x + L * 1.1, base]);
}

// Acacia paraguas (sabana): tronco que se abre en dos o tres brazos y una copa ANCHA y chata en dos pisos de hojas. w = medio ancho de la copa
export function acacia({ x = 60, base = 118, h = 36, w = 20, c = '#7A6250', copa = '#8E9C68', seed = 1 } = {}) {
  semilla(seed * 7 + 5); const T = tonos(copa), yc = base - h, tr = Math.max(1.6, h * .06);
  let f = P(rama(x, base, x - w * .05, base - h * .45, tr * 1.3, tr), c) + P(rama(x - w * .05, base - h * .45, x - w * .42, yc + 3, tr, tr * .5), c) + P(rama(x - w * .05, base - h * .45, x + w * .38, yc + 2, tr, tr * .5), c) + P(rama(x - w * .05, base - h * .5, x + w * .02, yc + 1, tr * .8, tr * .4), c);
  // copa: dos pisos planos, abajo casi recto y arriba apenas abombado, borde de hojitas
  const piso = (y, ww, hh) => { let s = `M${f1(x - ww)} ${f1(y)} `; const n = 7; for (let i = 0; i <= n; i++) { const t = i / n, px = x - ww + t * ww * 2, py = y - hh * (1 - Math.pow(2 * t - 1, 2) * .55) - rnd() * 1.2; s += `Q${f1(px - ww / n)} ${f1(py - 1.6)} ${f1(px)} ${f1(py)} `; }
    return s + `L${f1(x + ww)} ${f1(y)} Q${f1(x)} ${f1(y + 1.6)} ${f1(x - ww)} ${f1(y)}Z`; };
  f += P(piso(yc + 4, w, w * .16), copa) + P(piso(yc - w * .1, w * .66, w * .14), copa);
  const d = P(`M${f1(x - w)} ${f1(yc + 4)} Q${f1(x)} ${f1(yc + 5.6)} ${f1(x + w)} ${f1(yc + 4)} L${f1(x + w * .9)} ${f1(yc + 2.4)} Q${f1(x)} ${f1(yc + 3.6)} ${f1(x - w * .9)} ${f1(yc + 2.4)}Z`, T.osc, ' opacity=".45"')
    + P(`M${f1(x + w * .2)} ${f1(yc - w * .1)} L${f1(x + w * .66)} ${f1(yc - w * .1)} L${f1(x + w)} ${f1(yc + 4)} L${f1(x + w * .35)} ${f1(yc + 4)}Z`, T.som, ' opacity=".35"')
    + Ln(`M${f1(x - w * .8)} ${f1(yc + 1)} Q${f1(x - w * .3)} ${f1(yc - w * .08)} ${f1(x + w * .1)} ${f1(yc - w * .02)}`, T.luz, 1, ' opacity=".8"') + P(rama(x + tr * .3, base, x + tr * .2, base - h * .45, tr * .6, tr * .4), shade(c, .25), ' opacity=".5"');
  return pieza(f, d, [x - w - 2, yc - w * .3 - 2, x + w + 2, base]);
}

// Jirafa de perfil (mira hacia dir): patas largas, lomo en bajada, cuello alto y manchas poligonales. s = escala (1 ≈ 74 de alto)
export function jirafa({ x = 60, base = 118, s = 1, dir = 1, c = '#D8B07C', mancha = '#A8744E', cuello = 0 } = {}) {
  const T = tonos(c), k = v => f1(v * s), g = inner => `<g transform="translate(${f1(x)} ${f1(base)}) scale(${dir} 1)">${inner}</g>`;
  const hx = 21 + cuello * 6, hy = -70 + Math.abs(cuello) * 6; // cabeza (cuello > 0: estirado hacia adelante, como comiendo de una acacia)
  const pata = (x1, x2) => P(`M${k(x1 - 1.6)} ${k(-30)} L${k(x2 - 1.1)} ${k(-2)} L${k(x2 - 1.6)} ${k(0)} L${k(x2 + 1.6)} ${k(0)} L${k(x2 + 1.1)} ${k(-2)} L${k(x1 + 1.6)} ${k(-30)}Z`, c);
  const f = pata(-10, -11) + pata(-6, -4) + pata(7, 8) + pata(11, 13)
    + P(`M${k(-14)} ${k(-29)} Q${k(-16)} ${k(-37)} ${k(-9)} ${k(-38)} L${k(8)} ${k(-43)} Q${k(15)} ${k(-44)} ${k(15)} ${k(-35)} Q${k(14)} ${k(-28)} ${k(9)} ${k(-27)} L${k(-10)} ${k(-26)}Z`, c)
    + P(rama(+k(9), +k(-38), +k(hx - 2), +k(hy + 4), 9 * s, 3.6 * s), c)
    + P(`M${k(hx - 4)} ${k(hy + 1)} Q${k(hx - 3)} ${k(hy - 4)} ${k(hx + 1)} ${k(hy - 3)} L${k(hx + 7)} ${k(hy + 1)} Q${k(hx + 8)} ${k(hy + 3.4)} ${k(hx + 5.5)} ${k(hy + 3.6)} L${k(hx - 1)} ${k(hy + 4)}Z`, c);
  let d = Ln(`M${k(hx - 2)} ${k(hy - 2.6)} l${k(-.6)} ${k(-3.4)} M${k(hx)} ${k(hy - 3)} l${k(.3)} ${k(-3.4)}`, T.osc, Math.max(.6, .9 * s)) + P(`M${k(hx - 2.8)} ${k(hy - 2)} l${k(-2.6)} ${k(-1)} l${k(1.6)} ${k(2.4)}Z`, T.som)
    + C(+k(hx + 1.6), +k(hy - .4), Math.max(.4, .6 * s), '#4A3A36') + Ln(`M${k(-14)} ${k(-34)} Q${k(-17)} ${k(-26)} ${k(-16)} ${k(-19)}`, T.osc, Math.max(.6, .8 * s)) + C(+k(-16), +k(-18.4), Math.max(.6, 1 * s), T.osc);
  // manchas poligonales (más chicas en el cuello y las patas), sombra de panza y crin
  const sp = [[-9, -33, 3.2], [-3, -35, 3.6], [3, -37, 3.4], [9, -38, 3], [-6, -29.5, 2.4], [1, -30.5, 2.6], [8, -31, 2.4], [12, -34, 2]];
  for (let i = 0; i < 6; i++) { const t = (i + .5) / 6; sp.push([9 + (hx - 2 - 9) * t + .8, -38 + (hy + 4 + 38) * t, 2.1 - t * .9]); }
  sp.forEach(([a, b, r], i) => d += P(`M${k(a - r)} ${k(b)} L${k(a - r * .3)} ${k(b - r * .8)} L${k(a + r * .8)} ${k(b - r * .5)} L${k(a + r)} ${k(b + r * .4)} L${k(a + r * .1)} ${k(b + r * .8)} L${k(a - r * .8)} ${k(b + r * .5)}Z`, i % 2 ? mancha : shade(mancha, .08), ' opacity=".85"'));
  [[-10, -11], [7, 8]].forEach(([x1, x2]) => d += C(+k(x1 + (x2 - x1) * .3), +k(-22), Math.max(.5, 1 * s), mancha, ' opacity=".6"'));
  d += P(`M${k(-10)} ${k(-26)} L${k(9)} ${k(-27)} Q${k(14)} ${k(-28)} ${k(15)} ${k(-33)} L${k(13)} ${k(-31)} Q${k(4)} ${k(-29)} ${k(-10)} ${k(-28)}Z`, T.osc, ' opacity=".35"')
    + Ln(`M${k(8)} ${k(-42)} L${k(hx - 4)} ${k(hy + 1)}`, shade(mancha, .2), Math.max(.6, 1.1 * s), ' opacity=".7"');
  const bx = dir > 0 ? [x - 18 * s, x + (hx + 9) * s] : [x - (hx + 9) * s, x + 18 * s];
  return pieza(g(f), g(d), [bx[0], base + (hy - 8) * s, bx[1], base]);
}

// Montaña de cumbre ancha y nevada (volcán como el Kibo): laderas largas y cóncavas, cumbre casi plana apenas abombada,
// casquete de nieve con el borde de abajo dentado (glaciares) y canaletas. x0/x1 = pie, (xa, xb) = hombros de la cumbre
export function volcan({ x0 = 0, x1 = 120, xa = 40, xb = 84, base = 118, top = 40, c = '#9C94AC', nieve = '#EEF0F2', bajaNieve = 12, seed = 1 } = {}) {
  semilla(seed * 29 + 3); const T = tonos(c), N = tonos(nieve), m = (xa + xb) / 2;
  const perfil = `M${f1(x0)} ${base} C${f1(x0 + (xa - x0) * .45)} ${f1(base - (base - top) * .3)} ${f1(xa - (xa - x0) * .3)} ${f1(top + 9)} ${f1(xa)} ${f1(top + 2.5)} Q${f1(m)} ${f1(top - 3)} ${f1(xb)} ${f1(top + 2)} C${f1(xb + (x1 - xb) * .3)} ${f1(top + 8)} ${f1(x1 - (x1 - xb) * .45)} ${f1(base - (base - top) * .32)} ${f1(x1)} ${base}Z`;
  // nieve: sigue el borde de la cumbre y baja en lenguas dentadas
  let nv = `M${f1(xa - (xa - x0) * .16)} ${f1(top + 6.4)} C${f1(xa - (xa - x0) * .08)} ${f1(top + 4)} ${f1(xa - 2)} ${f1(top + 3)} ${f1(xa)} ${f1(top + 2.5)} Q${f1(m)} ${f1(top - 3)} ${f1(xb)} ${f1(top + 2)} C${f1(xb + 2)} ${f1(top + 2.6)} ${f1(xb + (x1 - xb) * .08)} ${f1(top + 3.8)} ${f1(xb + (x1 - xb) * .18)} ${f1(top + 6.6)} `;
  const xs0 = xa - (xa - x0) * .16, xs1 = xb + (x1 - xb) * .18, n = 9;
  for (let i = n; i >= 0; i--) { const xx = xs0 + (xs1 - xs0) * i / n, yy = top + 5 + bajaNieve * (.45 + rnd() * .55) * (1 - Math.pow((i / n - .5) * 2, 4) * .4); nv += `L${f1(xx + (xs1 - xs0) / n * .5)} ${f1(yy - bajaNieve * .45)} L${f1(xx)} ${f1(yy)} `; }
  const f = P(perfil, c), d0 = P(nv + 'Z', nieve);
  let d = P(`M${f1(m + 6)} ${f1(top - .4)} Q${f1(xb)} ${f1(top + 1)} ${f1(xb)} ${f1(top + 2)} C${f1(xb + (x1 - xb) * .3)} ${f1(top + 8)} ${f1(x1 - (x1 - xb) * .45)} ${f1(base - (base - top) * .32)} ${f1(x1)} ${base} L${f1(m + (x1 - m) * .35)} ${base} C${f1(m + (x1 - m) * .3)} ${f1(base - (base - top) * .4)} ${f1(m + 12)} ${f1(top + 20)} ${f1(m + 6)} ${f1(top - .4)}Z`, T.som, SOMBRA) + d0
    + P(`M${f1(m + 8)} ${f1(top)} Q${f1(xb)} ${f1(top + 1)} ${f1(xs1)} ${f1(top + 6.6)} L${f1(xs1 - 6)} ${f1(top + bajaNieve * .8)} L${f1(m + 12)} ${f1(top + 6)}Z`, N.som, ' opacity=".55"');
  // canaletas de la ladera y franja de bosque más abajo (apenas más verde)
  d += `<clipPath id="vo${seed}"><path d="${perfil}"/></clipPath><g clip-path="url(#vo${seed})">`;
  for (let i = 0; i < 7; i++) { const xx = x0 + (x1 - x0) * (.12 + i * .12 + (rnd() - .5) * .04), yy = top + bajaNieve + 4 + rnd() * 8; d += Ln(`M${f1(xx)} ${f1(yy)} Q${f1(xx + (xx - m) * .12)} ${f1(yy + 14)} ${f1(xx + (xx - m) * .3)} ${f1(yy + 26 + rnd() * 10)}`, T.lin, .8, ' opacity=".4"'); }
  d += '</g>' + Ln(`M${f1(x0 + (xa - x0) * .3)} ${f1(base - (base - top) * .38)} C${f1(xa - (xa - x0) * .35)} ${f1(top + 16)} ${f1(xa - 6)} ${f1(top + 8)} ${f1(xa)} ${f1(top + 3)}`, T.luz, 1.3, ' opacity=".8"');
  return pieza(f, d, [x0, top - 4, x1, base]);
}

// Nube larga y chata (el "mantel" de Table Mountain, la franja de nubes que ciñe al Kilimanjaro, la bruma de las cataratas):
// abajo casi recta, arriba con jorobas suaves. Va en su PROPIA capa, cruzada delante de la montaña: así queda metida en la escena
export function nube({ x0 = 10, x1 = 110, y = 60, h = 8, c = '#F4F0EA', seed = 1, jorobas = 6 } = {}) {
  semilla(seed * 41 + 9); const w = x1 - x0, T = tonos(c);
  let s = `M${f1(x0)} ${f1(y)} Q${f1(x0 - 2)} ${f1(y - h * .5)} ${f1(x0 + w * .04)} ${f1(y - h * .55)} `;
  for (let i = 0; i < jorobas; i++) { const xa = x0 + w * (i + .5) / jorobas, xb = x0 + w * (i + 1) / jorobas, hh = h * (.65 + rnd() * .45) * (1 - Math.pow((i + .5) / jorobas * 2 - 1, 2) * .35); s += `Q${f1(xa)} ${f1(y - hh - h * .55)} ${f1(Math.min(xb, x1 - w * .04))} ${f1(y - h * (.45 + rnd() * .2))} `; }
  s += `Q${f1(x1 + 2)} ${f1(y - h * .4)} ${f1(x1)} ${f1(y)} Q${f1(x0 + w / 2)} ${f1(y + 1.6)} ${f1(x0)} ${f1(y)}Z`;
  const d = P(`M${f1(x0 + 2)} ${f1(y - .2)} Q${f1(x0 + w / 2)} ${f1(y + 1.4)} ${f1(x1 - 2)} ${f1(y - .2)} L${f1(x1 - 4)} ${f1(y - h * .32)} Q${f1(x0 + w / 2)} ${f1(y - h * .1)} ${f1(x0 + 4)} ${f1(y - h * .32)}Z`, T.som, ' opacity=".4"');
  return pieza(P(s, c), d, [x0 - 2, y - h * 1.7, x1 + 2, y + 1.6]);
}

// Duna estrella del Namib (Sossusvlei, Big Daddy, Duna 45): cresta filosa que baja en S desde la cumbre; la cara de la izquierda
// al sol y la de la derecha en sombra (el corte de luz es lo que la hace reconocible), con ondas de viento finas
export function duna({ x0 = 0, x1 = 120, xc = 66, base = 118, top = 30, c = '#D49A78', sombra, seed = 1 } = {}) {
  semilla(seed * 13 + 7); const T = tonos(c), so = sombra ?? shade(c, .3), h = base - top;
  // silueta: el lomo de la izquierda sube cóncavo, se arquea y termina en una cumbre apenas redondeada; la cara de la derecha cae en
  // curva y se abre al pie. Así no se lee como una pirámide (lados rectos), sino como arena
  const xs = xc - (xc - x0) * .5, ys = top + h * .52; // hombro del lomo
  const perfil = `M${f1(x0)} ${base} C${f1(x0 + (xc - x0) * .3)} ${f1(base - h * .1)} ${f1(xs - (xc - x0) * .12)} ${f1(ys + h * .06)} ${f1(xs)} ${f1(ys)} C${f1(xs + (xc - xs) * .45)} ${f1(ys - h * .1)} ${f1(xc - (xc - xs) * .18)} ${f1(top + h * .1)} ${f1(xc - 1.5)} ${f1(top + .6)} Q${f1(xc)} ${f1(top - .6)} ${f1(xc + 1.5)} ${f1(top + .8)} C${f1(xc + (x1 - xc) * .32)} ${f1(top + h * .4)} ${f1(xc + (x1 - xc) * .55)} ${f1(base - h * .08)} ${f1(x1)} ${base}Z`;
  // cresta: de la cumbre baja en S hacia la izquierda; todo lo que queda a su derecha está en sombra
  const cr = `M${f1(xc)} ${f1(top)} C${f1(xc - (xc - x0) * .02)} ${f1(top + h * .3)} ${f1(xc - (xc - x0) * .2)} ${f1(top + h * .4)} ${f1(xc - (xc - x0) * .22)} ${f1(top + h * .62)} S${f1(xc + (x1 - xc) * .1)} ${f1(base - h * .06)} ${f1(xc + (x1 - xc) * .05)} ${base}`;
  let d = `<clipPath id="du${seed}"><path d="${perfil}"/></clipPath><g clip-path="url(#du${seed})">`
    + P(`${cr} L${f1(x1 + 2)} ${base} L${f1(x1 + 2)} ${f1(top - 2)} L${f1(xc)} ${f1(top - 2)}Z`, so, ' opacity=".55"')
    + Ln(cr, luz(c, .4), 1.1, ' opacity=".9"');
  // ondas de viento: arcos finos sobre la cara al sol
  for (let i = 0; i < 6; i++) { const yy = top + h * (.35 + i * .1), xx = x0 + (xc - x0) * (.28 + rnd() * .3) + i * 1.5, ww = 8 + rnd() * 10; d += Ln(`M${f1(xx - ww / 2)} ${f1(yy)} Q${f1(xx)} ${f1(yy - 1.6)} ${f1(xx + ww / 2)} ${f1(yy + .4)}`, T.som, .7, ' opacity=".5"'); }
  for (let i = 0; i < 4; i++) { const yy = top + h * (.45 + i * .13), xx = xc + (x1 - xc) * (.3 + rnd() * .25), ww = 6 + rnd() * 8; d += Ln(`M${f1(xx - ww / 2)} ${f1(yy)} Q${f1(xx)} ${f1(yy - 1.4)} ${f1(xx + ww / 2)} ${f1(yy + .4)}`, shade(so, .15), .7, ' opacity=".4"'); }
  return pieza(P(perfil, c), d + '</g>', [x0, top - 1, x1, base]);
}

// Árbol muerto de Deadvlei (acacia de camello seca hace siglos): tronco corto y retorcido que se abre en ramas finas y quebradas
export function arbolSeco({ x = 60, base = 118, h = 30, c = '#6E5A54', seed = 1, abre = 1 } = {}) {
  semilla(seed * 37 + 1); const T = tonos(c), yt = base - h * .38, tr = Math.max(1.4, h * .075);
  let f = P(`M${f1(x - tr * 1.2)} ${base} Q${f1(x - tr * .6)} ${f1(base - h * .2)} ${f1(x - tr * .9)} ${f1(yt)} L${f1(x + tr * .7)} ${f1(yt)} Q${f1(x + tr * .4)} ${f1(base - h * .2)} ${f1(x + tr * 1.3)} ${base}Z`, c), d = '';
  const brazos = [[-1.05, .95], [-.45, 1], [.15, 1.05], [.7, .9], [1.15, .7]];
  brazos.forEach(([a0, lk]) => { const a = a0 * abre + (rnd() - .5) * .2, l = h * .5 * lk, mx = x + Math.sin(a) * l * .5, my = yt - Math.cos(a) * l * .5, x2 = x + Math.sin(a * 1.15) * l, y2 = yt - Math.cos(a * 1.15) * l * (.85 + rnd() * .2);
    d += P(rama(x, yt + 1, mx + (rnd() - .5) * 2, my, tr * .9, tr * .55), c) + P(rama(mx, my, x2, y2, tr * .55, tr * .2), c);
    for (let j = 0; j < 2; j++) { const t = .5 + j * .3, px = mx + (x2 - mx) * t, py = my + (y2 - my) * t, b = a + (j ? .7 : -.6); d += Ln(`M${f1(px)} ${f1(py)} l${f1(Math.sin(b) * l * .22)} ${f1(-Math.cos(b) * l * .22)}`, c, Math.max(.5, tr * .22)); } });
  d += Ln(`M${f1(x + tr * .2)} ${f1(base)} Q${f1(x + tr * .1)} ${f1(base - h * .2)} ${f1(x + tr * .3)} ${f1(yt)}`, T.osc, .8, ' opacity=".6"');
  return pieza(f, `<g stroke="${CREAM}" stroke-width="1.6" stroke-linejoin="round" paint-order="stroke">${d}</g>`, [x - h * .6, base - h * 1.02, x + h * .6, base]);
}

// Catarata ancha sobre un acantilado de basalto (Cataratas Victoria). La pieza es un CERRO entero, no un bloque: la silueta es la
// selva del borde (copas irregulares) que baja por los dos costados hasta el suelo; dentro, la pared de basalto con diaclasas y el
// agua cayendo en cortinas separadas por promontorios, pintadas encima (sin borde propio). cortinas = [[x0, x1], …]
export function cascada({ x0 = 0, x1 = 120, top = 50, base = 118, c = '#A89C90', agua = '#E6ECEC', veg = '#7E9C6C', cortinas = [[14, 40], [46, 74], [80, 104]], seed = 1, laderas = .13 } = {}) {
  semilla(seed * 17 + 9); const T = tonos(c), A = tonos(agua), V = tonos(veg), w = x1 - x0, ra = x0 + w * laderas, rb = x1 - w * laderas; // ra–rb: ancho de la pared
  // silueta: ladera izquierda de selva, borde de copas sobre la pared, ladera derecha
  let sil = `M${f1(x0)} ${base} C${f1(x0 + (ra - x0) * .45)} ${f1(top + (base - top) * .7)} ${f1(ra - (ra - x0) * .35)} ${f1(top + 4)} ${f1(ra)} ${f1(top - 3)} `;
  const nc = 18; for (let i = 1; i <= nc; i++) { const xx = ra + (rb - ra) * i / nc; sil += `Q${f1(xx - (rb - ra) / nc / 2)} ${f1(top - 6.5 - rnd() * 3.5)} ${f1(xx)} ${f1(top - 2.5 - rnd() * 1.6)} `; }
  sil += `C${f1(rb + (x1 - rb) * .35)} ${f1(top + 4)} ${f1(x1 - (x1 - rb) * .45)} ${f1(top + (base - top) * .7)} ${f1(x1)} ${base}Z`;
  const f = P(sil, veg);
  // pared de basalto (dentro de la silueta, debajo de la franja de selva) que se angosta hacia abajo como un cañón
  const pared = `M${f1(ra + 1)} ${f1(top + 1)} L${f1(rb - 1)} ${f1(top + 1)} L${f1(rb - w * .03)} ${base} L${f1(ra + w * .03)} ${base}Z`;
  let d = P(pared, c) + P(`M${f1(ra + 1)} ${f1(top + 1)} L${f1(rb - 1)} ${f1(top + 1)} L${f1(rb - 1)} ${f1(top + 3)} L${f1(ra + 1)} ${f1(top + 3)}Z`, T.osc, ' opacity=".5"');
  for (let i = 0; i < 12; i++) { const xx = ra + (rb - ra) * (.04 + i * .085 + (rnd() - .5) * .03); d += Ln(`M${f1(xx)} ${f1(top + 5)} L${f1(xx + (rnd() - .5) * 2)} ${base}`, T.lin, .8, ' opacity=".45"'); }
  for (let i = 0; i < 6; i++) { const yy = top + (base - top) * (.12 + i * .14); d += Ln(`M${f1(ra + 2)} ${f1(yy)} Q${f1(ra + (rb - ra) * .3)} ${f1(yy + 1.2)} ${f1((ra + rb) / 2)} ${f1(yy - .4)} T${f1(rb - 2)} ${f1(yy + .4)}`, T.lin, .7, ' opacity=".4"'); }
  for (let i = 0; i < 8; i++) { const xx = ra + (rb - ra) * rnd(), yy = top + (base - top) * (.15 + rnd() * .7); d += R(xx, yy, 2 + rnd() * 3, 1.4, T.luz, ' opacity=".5"'); }
  // cortinas de agua: borde irregular, más anchas abajo, estrías y espuma en el labio
  cortinas.forEach(([a, b]) => { const yb = base, ab = (b - a) * .06; let lb = `M${f1(a)} ${f1(top + .4)} Q${f1((a + b) / 2)} ${f1(top - 1)} ${f1(b)} ${f1(top + .4)} `;
    for (let k = 1; k <= 6; k++) lb += `L${f1(b + ab * (k / 6) * 2 + (rnd() - .5) * 2.2)} ${f1(top + (yb - top) * k / 6)} `; lb += `L${f1(a - ab * 2)} ${yb} `;
    for (let k = 5; k >= 1; k--) lb += `L${f1(a - ab * (k / 6) * 2 + (rnd() - .5) * 2.2)} ${f1(top + (yb - top) * k / 6)} `;
    d += P(lb + 'Z', agua);
    for (let xx = a + 1.6; xx < b - 1; xx += 2.2 + rnd() * 1.6) d += Ln(`M${f1(xx)} ${f1(top + 2 + rnd() * 4)} L${f1(xx + (xx - (a + b) / 2) * .05)} ${f1(yb)}`, rnd() < .55 ? A.som : luz(agua, .5), .7 + rnd() * .5, ' opacity=".75"');
    d += P(`M${f1(a - .5)} ${f1(top + .8)} Q${f1((a + b) / 2)} ${f1(top - .8)} ${f1(b + .5)} ${f1(top + .8)} L${f1(b + .5)} ${f1(top + 3)} Q${f1((a + b) / 2)} ${f1(top + 1.6)} ${f1(a - .5)} ${f1(top + 3)}Z`, '#F6F6F2', ' opacity=".9"'); });
  // selva: copas con luz a la izquierda y sombra a la derecha; las laderas con algo de textura
  d += P(`M${f1(rb - w * .02)} ${f1(top - 2)} C${f1(rb + (x1 - rb) * .35)} ${f1(top + 4)} ${f1(x1 - (x1 - rb) * .45)} ${f1(top + (base - top) * .7)} ${f1(x1)} ${base} L${f1(rb)} ${base} L${f1(rb - w * .03)} ${f1(top + 4)}Z`, V.som, SOMBRA);
  for (let i = 0; i < 10; i++) { const xx = i < 5 ? x0 + (ra - x0) * (.3 + i * .12) : rb + (x1 - rb) * (.05 + (i - 5) * .12), yy = top + 14 + rnd() * (base - top - 24); d += P(`M${f1(xx)} ${f1(yy + 3)} Q${f1(xx + 2)} ${f1(yy - 2)} ${f1(xx + 4.4)} ${f1(yy + 3)}Z`, i % 2 ? V.luz : V.som, ' opacity=".6"'); }
  return pieza(f, d, [x0, top - 10, x1, base]);
}

// Faro de torre ahusada con anillos de color, balcón y linterna con cúpula (Swakopmund: blanco con la punta roja)
export function faro({ x = 60, w = 12, top = 20, base = 118, c = '#EEE6DA', banda = '#C27A66', bandas = [[0, .14]] } = {}) {
  const T = tonos(c), B = tonos(banda), yl = top + w * 1.3, wa = w * .62; // yl = balcón; la torre va de w (abajo) a wa (arriba)
  const xi = y => w / 2 - (w / 2 - wa / 2) * (base - y) / (base - yl);
  let f = P(`M${f1(x - w / 2)} ${base} L${f1(x - wa / 2)} ${f1(yl)} L${f1(x + wa / 2)} ${f1(yl)} L${f1(x + w / 2)} ${base}Z`, c)
    + R(x - wa / 2 - 2.2, yl - 2, wa + 4.4, 2.4, B.osc) + R(x - wa * .34, top + w * .5, wa * .68, yl - top - w * .5 - 1.6, '#E8E2D4')
    + P(`M${f1(x - wa * .44)} ${f1(top + w * .55)} Q${f1(x)} ${f1(top - w * .1)} ${f1(x + wa * .44)} ${f1(top + w * .55)}Z`, banda) + R(x - .6, top - w * .3, 1.2, w * .4, B.osc);
  let d = '';
  bandas.forEach(([a, b]) => { const ya = yl + (base - yl) * a, yb = yl + (base - yl) * b; d += P(`M${f1(x - xi(ya))} ${f1(ya)} L${f1(x + xi(ya))} ${f1(ya)} L${f1(x + xi(yb))} ${f1(yb)} L${f1(x - xi(yb))} ${f1(yb)}Z`, banda); });
  d += R(x - wa * .26, top + w * .68, wa * .52, yl - top - w * .68 - 2.4, '#C9C2A8', ' opacity=".8"') + Ln(`M${f1(x - wa / 2 - 2)} ${f1(yl - 4.6)} H${f1(x + wa / 2 + 2)}`, B.osc, .7)
    + [.3, .55, .8].map(t => { const yy = yl + (base - yl) * t; return R(x - 1, yy - 2.4, 2, 3.4, T.osc); }).join('')
    + P(`M${f1(x + wa * .1)} ${f1(yl)} L${f1(x + wa / 2)} ${f1(yl)} L${f1(x + w / 2)} ${base} L${f1(x + w * .14)} ${base}Z`, T.som, SOMBRA);
  return pieza(f, d, [x - w / 2 - 1, top - w * .3, x + w / 2 + 1, base]);
}

// Edificio de galerías (Casa de las Maravillas de Zanzíbar, arquitectura colonial de costa): bloque de varios pisos rodeado de
// galerías con columnas finas de hierro, barandas y la sombra honda del corredor detrás de las columnas
export function veranda({ x0 = 20, x1 = 100, y0 = 50, base = 118, pisos = 3, c = '#E8E0D0', cCol, cSombra = '#8E8C88', col = 10, oSombra = .5, wCol = 1.4 } = {}) {
  const T = tonos(c), cc = cCol ?? luz(c, .35), w = x1 - x0, hp = (base - y0 - 3) / pisos;
  let f = R(x0, y0, w, base - y0, c) + R(x0 - 2, y0 - 3, w + 4, 3.4, T.luz), d = '';
  for (let p = 0; p < pisos; p++) { const yt = y0 + 3 + p * hp;
    d += R(x0 + 1, yt + 1.6, w - 2, hp - 2.6, cSombra, ` opacity="${oSombra}"`); // corredor en sombra
    for (let i = 0; i <= col; i++) { const xx = x0 + 1 + (w - 2) * i / col; d += R(xx - wCol / 2, yt + 1, wCol, hp - 1.4, cc) + R(xx + wCol / 2 - .3, yt + 1, .5, hp - 1.4, T.som, ' opacity=".6"'); }
    d += R(x0, yt, w, 1.6, T.luz) + R(x0, yt + hp - 3.2, w, .7, cc) + R(x0, yt + hp - 1.2, w, 1.2, T.som, ' opacity=".7"');
    for (let xx = x0 + 1.5; xx < x1 - 1; xx += 1.6) d += R(xx, yt + hp - 3.2, .4, 2.2, cc, ' opacity=".8"'); }
  d += R(x1 - w * .16, y0, w * .16, base - y0, T.som, SOMBRA);
  return pieza(f, d, [x0 - 2, y0 - 3, x1 + 2, base]);
}

// Dhow (velero del Índico): casco de proa lanzada y popa alta, palo inclinado hacia adelante y una gran vela latina triangular
export function dhow({ x = 60, y = 100, s = 1, c = '#8E6A50', vela = '#E4D8C2', dir = 1 } = {}) {
  const T = tonos(c), V = tonos(vela), k = v => f1(v * s), g = inner => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${dir} 1)">${inner}</g>`;
  const casco = `M${k(-20)} ${k(-8)} L${k(-17)} ${k(-8)} L${k(-15)} ${k(-5.5)} L${k(14)} ${k(-5.5)} L${k(26)} ${k(-10)} L${k(23)} ${k(-2)} Q${k(14)} ${k(2)} ${k(-12)} ${k(1.4)} Q${k(-18)} ${k(.6)} ${k(-20)} ${k(-8)}Z`;
  const velaD = `M${k(16)} ${k(-8)} L${k(-12)} ${k(-48)} Q${k(-8)} ${k(-24)} ${k(-14)} ${k(-8.5)} Q${k(2)} ${k(-11)} ${k(16)} ${k(-8)}Z`;
  const f = P(casco, c) + P(velaD, vela);
  let d = Ln(`M${k(2)} ${k(-5.5)} L${k(-1)} ${k(-30)}`, T.osc, Math.max(.7, 1.1 * s)) + Ln(`M${k(17)} ${k(-7.4)} L${k(-13)} ${k(-49.5)}`, T.osc, Math.max(.6, .9 * s))
    + P(`M${k(-12)} ${k(-48)} Q${k(-8)} ${k(-24)} ${k(-14)} ${k(-8.5)} L${k(-5)} ${k(-9.6)} Q${k(-5)} ${k(-28)} ${k(-12)} ${k(-48)}Z`, V.som, ' opacity=".45"');
  for (let i = 1; i < 4; i++) d += Ln(`M${k(16 - i * 7)} ${k(-8 - i * 10)} Q${k(-6 + i * .4)} ${k(-12 - i * 2)} ${k(-13.4)} ${k(-9 - i * 1.4)}`, V.osc, Math.max(.4, .55 * s), ' opacity=".5"');
  d += Ln(`M${k(-15)} ${k(-3.2)} L${k(22)} ${k(-4)}`, T.luz, Math.max(.6, .9 * s)) + P(`M${k(-12)} ${k(1.4)} Q${k(14)} ${k(2)} ${k(23)} ${k(-2)} L${k(23.5)} ${k(-.6)} Q${k(10)} ${k(-.2)} ${k(-12)} ${k(-.4)}Z`, T.osc, ' opacity=".5"');
  return pieza(g(f), g(d), [x - 21 * s, y - 50 * s, x + 27 * s, y + 2.5 * s]);
}

// Montaña de cumbre plana (Table Mountain): meseta larga a nivel, paredes casi a plomo con contrafuertes y canaletas, y
// laderas de escombros que bajan hasta el suelo. (xa, xb) = bordes de la meseta
export function mesa({ x0 = 0, x1 = 120, xa = 22, xb = 92, base = 118, top = 40, c = '#9AA6B4', seed = 1, pared = .42 } = {}) {
  semilla(seed * 11 + 3); const T = tonos(c), h = base - top, pie = top + h * pared; // pie = donde la pared se apoya en las laderas
  const perfil = `M${f1(x0)} ${base} C${f1(x0 + (xa - x0) * .5)} ${f1(base - h * .22)} ${f1(xa - (xa - x0) * .25)} ${f1(pie + 2)} ${f1(xa - 1.5)} ${f1(pie - 4)} L${f1(xa)} ${f1(top + 1.2)} L${f1(xb)} ${f1(top)} L${f1(xb + 1.5)} ${f1(pie - 6)} C${f1(xb + (x1 - xb) * .3)} ${f1(pie + 2)} ${f1(x1 - (x1 - xb) * .45)} ${f1(base - h * .25)} ${f1(x1)} ${base}Z`;
  let d = P(`M${f1(x0 + 2)} ${f1(base)} C${f1(x0 + (xa - x0) * .5)} ${f1(base - h * .2)} ${f1(xa - (xa - x0) * .2)} ${f1(pie + 4)} ${f1(xa + 2)} ${f1(pie)} Q${f1((xa + xb) / 2)} ${f1(pie + 3)} ${f1(xb - 2)} ${f1(pie - 1)} C${f1(xb + (x1 - xb) * .25)} ${f1(pie + 5)} ${f1(x1 - (x1 - xb) * .5)} ${f1(base - h * .22)} ${f1(x1 - 2)} ${base}Z`, T.luz, ' opacity=".28"'); // laderas más claras (escombros con fynbos)
  // pared: contrafuertes y canaletas verticales que bajan desde el borde de la meseta
  for (let i = 0; i < 12; i++) { const xx = xa + 3 + (xb - xa - 6) * (i + rnd() * .5) / 12, l = (pie - top) * (.6 + rnd() * .35); d += Ln(`M${f1(xx)} ${f1(top + 2.5)} L${f1(xx + (rnd() - .5) * 1.6)} ${f1(top + 2.5 + l)}`, T.lin, .8 + rnd() * .5, ' opacity=".5"'); }
  d += Ln(`M${f1(xa + 1)} ${f1(top + 3)} L${f1(xb - 1)} ${f1(top + 2)}`, T.luz, 1, ' opacity=".7"') + Ln(`M${f1(xa + 2)} ${f1(pie - 2)} Q${f1((xa + xb) / 2)} ${f1(pie + 1)} ${f1(xb - 2)} ${f1(pie - 3)}`, T.lin, .8, ' opacity=".4"')
    + P(`M${f1(xb - 10)} ${f1(top)} L${f1(xb)} ${f1(top)} L${f1(xb + 1.5)} ${f1(pie - 6)} C${f1(xb + (x1 - xb) * .3)} ${f1(pie + 2)} ${f1(x1 - (x1 - xb) * .45)} ${f1(base - h * .25)} ${f1(x1)} ${base} L${f1(xb + (x1 - xb) * .2)} ${base} C${f1(xb)} ${f1(pie + 10)} ${f1(xb - 8)} ${f1(pie)} ${f1(xb - 10)} ${f1(top)}Z`, T.som, SOMBRA);
  for (let i = 0; i < 5; i++) { const xx = x0 + (x1 - x0) * (.08 + i * .2 + rnd() * .05), yy = pie + 10 + rnd() * 14; d += Ln(`M${f1(xx)} ${f1(yy)} q${f1((xx - (xa + xb) / 2) * .06)} 8 ${f1((xx - (xa + xb) / 2) * .14)} 18`, T.lin, .7, ' opacity=".35"'); }
  return pieza(P(perfil, c), d, [x0, top - 1, x1, base]);
}

// Morro de granito (Pan de Azúcar, Morro da Urca): domo de laderas casi a plomo y cumbre redondeada, inclinado (`lean`);
// estrías verticales de la roca lavada por la lluvia y un manto de selva (`verde` = fracción de la altura) que sube por el pie
const morroD = (x, b, top, w, ln) => { const h = b - top; return `M${f1(x - w)} ${b} C${f1(x - w * 1.02)} ${f1(b - h * .55)} ${f1(x - w * .66 + ln)} ${f1(top)} ${f1(x - w * .04 + ln)} ${f1(top)} C${f1(x + w * .52 + ln)} ${f1(top)} ${f1(x + w * 1.02)} ${f1(b - h * .5)} ${f1(x + w)} ${b}Z`; };
export function morro({ x = 60, w = 20, top = 20, base = 118, lean = 0, c = '#B2A8A6', veg = '#7E9E78', verde = .3, seed = 1 } = {}) {
  semilla(seed * 37 + 13); const T = tonos(c), V = tonos(veg), h = base - top, id = `mr${seed}`;
  let g = P(`M${f1(x + w * .12 + lean)} ${f1(top + h * .01)} Q${f1(x + w * .36 + lean)} ${f1(top + h * .06)} ${f1(x + w * .5 + lean)} ${f1(top + h * .12)} C${f1(x + w * .8 + lean)} ${f1(top + h * .28)} ${f1(x + w * 1.02)} ${f1(base - h * .42)} ${f1(x + w)} ${base} L${f1(x + w * .3)} ${base} C${f1(x + w * .42)} ${f1(base - h * .5)} ${f1(x + w * .3 + lean)} ${f1(top + h * .3)} ${f1(x + w * .12 + lean)} ${f1(top + h * .01)}Z`, T.som, SOMBRA);
  // estrías: líneas finas que bajan siguiendo la curva del domo
  for (let i = 0; i < 9; i++) { const t = (i + .5 + (rnd() - .5) * .4) / 9, xx = x - w * .7 + t * w * 1.4 + lean * (1 - t * .3), y1 = top + h * (.08 + Math.pow(Math.abs(t - .5) * 2, 2) * .2 + rnd() * .06);
    g += Ln(`M${f1(xx)} ${f1(y1)} Q${f1(xx + (t - .5) * w * .3)} ${f1(y1 + h * .3)} ${f1(xx + (t - .5) * w * .5)} ${f1(y1 + h * (.4 + rnd() * .25))}`, T.lin, .7 + rnd() * .5, ' opacity=".42"'); }
  for (let i = 0; i < 5; i++) { const xx = x - w * .5 + rnd() * w + lean * .6, yy = top + h * (.15 + rnd() * .35); g += R(xx, yy, 1.6 + rnd() * 2.4, 1.1, T.luz, ' opacity=".45"'); }
  // manto de selva al pie: borde de copas irregular que sube más por la ladera izquierda (la que da al mar)
  const yv = base - h * verde; let m = `M${f1(x - w - 2)} ${base} L${f1(x - w - 2)} ${f1(yv - h * .1)} `; const n = 9;
  for (let i = 1; i <= n; i++) { const xx = x - w - 2 + (w * 2 + 4) * i / n, yy = yv - h * .1 * (1 - i / n) + rnd() * h * .06; m += `Q${f1(xx - w / n)} ${f1(yy - 3.2)} ${f1(xx)} ${f1(yy)} `; }
  m += `L${f1(x + w + 2)} ${base}Z`;
  g += P(m, veg) + P(`M${f1(x + w * .35)} ${base} L${f1(x + w * .35)} ${f1(yv)} L${f1(x + w + 2)} ${f1(yv + 2)} L${f1(x + w + 2)} ${base}Z`, V.som, ' opacity=".5"');
  for (let i = 0; i < 7; i++) { const xx = x - w * .9 + rnd() * w * 1.7, yy = yv + 2 + rnd() * h * verde * .6; g += P(`M${f1(xx)} ${f1(yy + 2.6)} Q${f1(xx + 1.8)} ${f1(yy - 1.6)} ${f1(xx + 3.8)} ${f1(yy + 2.6)}Z`, i % 2 ? V.luz : V.som, ' opacity=".6"'); }
  for (let i = 0; i < 3; i++) { const xx = x - w * .72 + lean * .3 + rnd() * w * .3, yy = top + h * (.3 + rnd() * .25); g += P(`M${f1(xx)} ${f1(yy + 3)} q2 -4 4.4 0 q-2 1.4 -4.4 0Z`, veg, ' opacity=".8"'); } // matas colgadas de la pared
  const d = `<clipPath id="${id}"><path d="${morroD(x, base, top, w, lean)}"/></clipPath><g clip-path="url(#${id})">${g}</g>`
    + Ln(`M${f1(x - w * .62 + lean * .8)} ${f1(top + h * .2)} Q${f1(x - w * .82)} ${f1(top + h * .45)} ${f1(x - w * .86)} ${f1(top + h * .62)}`, T.luz, 1.2, ' opacity=".8"');
  return pieza(P(morroD(x, base, top, w, lean), c), d, [x - w * 1.03, top - h * .04, x + w * 1.03, base]);
}

// Teleférico entre dos cumbres: cable doble en comba y una cabina chica a mitad de camino (va en los detalles de una capa de adelante)
export function teleferico({ a = [20, 80], b = [80, 30], comba = 4, t = .45, c = '#5E5864', cabina = '#D9A26A' } = {}) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + comba, q = (u0, k) => (1 - k) * (1 - k) * u0[0] + 2 * (1 - k) * k * mx + k * k * u0[1];
  const px = q([a[0], b[0]], t), py = q([a[1], b[1]], t);
  const d = Ln(`M${f1(a[0])} ${f1(a[1])} Q${f1(mx)} ${f1(my)} ${f1(b[0])} ${f1(b[1])}`, c, .6, ' opacity=".8"') + Ln(`M${f1(a[0])} ${f1(a[1] + 1)} Q${f1(mx)} ${f1(my + 1)} ${f1(b[0])} ${f1(b[1] + 1)}`, c, .45, ' opacity=".6"')
    + Ln(`M${f1(px)} ${f1(py)} V${f1(py + 2)}`, c, .6) + `<rect x="${f1(px - 2.2)}" y="${f1(py + 2)}" width="4.4" height="3.2" rx="1" fill="${cabina}" stroke="${CREAM}" stroke-width=".6"/>`
    + R(px - 1.4, py + 2.7, 2.8, 1, '#EEF2F2', ' opacity=".8"');
  return pieza('', d, [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]) + comba + 6]);
}

// Chorro de agua en caída libre (Salto Ángel): hilo fino que nace en el borde de la pared, se ensancha, se abre en hebras y
// se deshace en bruma antes de llegar abajo. Sólo detalles (sin borde grueso: con el borde crema se volvería una cinta)
export function chorro({ x = 60, top = 30, fin = 96, w = 3, deriva = 3, c = '#EEF2F0', seed = 1 } = {}) {
  semilla(seed * 43 + 5); const L = fin - top, A = tonos(c);
  let d = P(`M${f1(x - w * .35)} ${f1(top)} Q${f1(x - w * .5 + deriva * .3)} ${f1(top + L * .4)} ${f1(x - w + deriva)} ${f1(fin)} L${f1(x + w + deriva)} ${f1(fin)} Q${f1(x + w * .5 + deriva * .3)} ${f1(top + L * .4)} ${f1(x + w * .35)} ${f1(top)}Z`, c, ' opacity=".92"');
  for (let i = 0; i < 5; i++) { const k = (i + .5) / 5 - .5; d += Ln(`M${f1(x + k * w * .5)} ${f1(top + 2)} Q${f1(x + k * w + deriva * .3)} ${f1(top + L * .5)} ${f1(x + k * w * 2.2 + deriva)} ${f1(fin + 2)}`, i % 2 ? A.som : '#FFFFFF', .5, ' opacity=".6"'); }
  for (let i = 0; i < 6; i++) { const yy = top + L * (.55 + rnd() * .4), xx = x + deriva * ((yy - top) / L) + (rnd() - .5) * w * 2.6; d += `<circle cx="${f1(xx)}" cy="${f1(yy)}" r="${f1(.5 + rnd() * .8)}" fill="${c}" opacity=".7"/>`; }
  d += P(`M${f1(x - w * .6)} ${f1(top + .6)} Q${f1(x)} ${f1(top - 1)} ${f1(x + w * .6)} ${f1(top + .6)} L${f1(x + w * .5)} ${f1(top + 2.2)} Q${f1(x)} ${f1(top + 1.4)} ${f1(x - w * .5)} ${f1(top + 2.2)}Z`, '#FFFFFF', ' opacity=".9"'); // labio de espuma
  return pieza('', d, [x - w * 1.2, top - 1, x + w * 1.2 + deriva, fin + 3]);
}

// Tepui (Auyán-tepui, Roraima): meseta de arenisca con la pared partida en bloques por grietas verticales, el borde de arriba
// almenado con cantos redondeados (no una regla), una cornisa a media altura con selva colgada, verde en la cumbre y laderas de
// selva desde el pie de la pared (`pie`). `muesca` = x de la hendidura del borde de donde cae el agua
export function tepui({ x0 = 0, x1 = 120, xa = 26, xb = 100, top = 30, pie = 80, base = 118, c = '#AE9890', veg = '#7E9E70', muesca, seed = 1, bloques = 7 } = {}) {
  semilla(seed * 53 + 17); const T = tonos(c), V = tonos(veg), H = pie - top, id = `tp${seed}`, n = bloques, bw = (xb - xa) / n;
  const ys = []; for (let i = 0; i <= n; i++) { const xx = xa + bw * i; ys.push(top + rnd() * 3.4 + (muesca != null && Math.abs(xx - muesca) < bw * .7 ? 3.6 : 0)); }
  let s = `M${f1(x0)} ${base} C${f1(x0 + (xa - x0) * .5)} ${f1(base - (base - pie) * .35)} ${f1(xa - (xa - x0) * .3)} ${f1(pie + 3)} ${f1(xa - 1)} ${f1(pie)} `
    + `L${f1(xa + 1)} ${f1(top + H * .56)} L${f1(xa - 2)} ${f1(top + H * .5)} L${f1(xa + .4)} ${f1(ys[0] + 3)} Q${f1(xa + .4)} ${f1(ys[0])} ${f1(xa + 3)} ${f1(ys[0])} `;
  for (let i = 1; i <= n; i++) { const xx = xa + bw * i, ya = ys[i - 1], yb = ys[i];
    if (i < n) s += `L${f1(xx - 1.6)} ${f1(ya)} Q${f1(xx)} ${f1(ya)} ${f1(xx)} ${f1(Math.max(ya, yb) + 1.4)} Q${f1(xx)} ${f1(yb)} ${f1(xx + 1.6)} ${f1(yb)} `;
    else s += `L${f1(xb - 3)} ${f1(ya)} Q${f1(xb - .4)} ${f1(ya)} ${f1(xb - .4)} ${f1(ya + 3)} `; }
  s += `L${f1(xb + 2)} ${f1(top + H * .5)} L${f1(xb - .6)} ${f1(top + H * .56)} L${f1(xb + 1)} ${f1(pie)} C${f1(xb + (x1 - xb) * .3)} ${f1(pie + 3)} ${f1(x1 - (x1 - xb) * .5)} ${f1(base - (base - pie) * .35)} ${f1(x1)} ${base}Z`;
  let g = '';
  // grietas verticales que parten la pared en columnas, unas más hondas (banda de sombra) que otras
  for (let i = 1; i < n; i++) { const xx = xa + bw * i + (rnd() - .5) * 1.2; g += Ln(`M${f1(xx)} ${f1(ys[i] + 2)} L${f1(xx + (rnd() - .5) * 1.6)} ${f1(pie + 2)}`, T.osc, 1, ' opacity=".55"');
    if (rnd() < .45) g += P(`M${f1(xx)} ${f1(ys[i] + 3)} L${f1(xx + 2.6)} ${f1(ys[i] + 5)} L${f1(xx + 2.2)} ${f1(pie)} L${f1(xx)} ${f1(pie)}Z`, T.som, ' opacity=".38"'); }
  for (let i = 0; i < n * 2; i++) { const xx = xa + 2 + rnd() * (xb - xa - 4), y1 = top + 6 + rnd() * H * .5; g += Ln(`M${f1(xx)} ${f1(y1)} l${f1((rnd() - .5))} ${f1(4 + rnd() * 9)}`, T.lin, .6, ' opacity=".4"'); }
  for (let i = 0; i < 3; i++) { const yy = top + H * (.22 + i * .26); g += Ln(`M${f1(xa + 2)} ${f1(yy)} Q${f1((xa + xb) / 2)} ${f1(yy + 1.4)} ${f1(xb - 2)} ${f1(yy - .4)}`, T.luz, .7, ' opacity=".35"'); }
  // sombra del costado derecho de la pared y de la ladera
  g += P(`M${f1(xb - (xb - xa) * .2)} ${f1(top - 2)} L${f1(xb + 4)} ${f1(top - 2)} L${f1(x1 + 2)} ${base} L${f1(xb - (xb - xa) * .1)} ${base} L${f1(xb - (xb - xa) * .16)} ${f1(pie)}Z`, T.som, SOMBRA);
  // cumbre verde, cornisa con selva colgada y laderas de selva
  let cap = `M${f1(xa - 3)} ${f1(top - 6)} L${f1(xb + 3)} ${f1(top - 6)} L${f1(xb + 3)} ${f1(top + 3)} `;
  for (let i = n; i >= 0; i--) cap += `Q${f1(xa + bw * i + bw * .5)} ${f1(ys[Math.min(n, i)] + 4.6 + rnd() * 1.6)} ${f1(xa + bw * i)} ${f1(ys[i] + 2.4)} `;
  g += P(cap + 'Z', shade(veg, .08));
  const yc = top + H * .5; for (let i = 0; i < 5; i++) { const xx = xa + 4 + rnd() * (xb - xa - 14), w = 5 + rnd() * 8; g += P(`M${f1(xx)} ${f1(yc + 1)} Q${f1(xx + w / 2)} ${f1(yc - 2.6)} ${f1(xx + w)} ${f1(yc + 1)} L${f1(xx + w * .7)} ${f1(yc + 3 + rnd() * 3)} L${f1(xx + w * .3)} ${f1(yc + 2)}Z`, veg, ' opacity=".85"'); }
  let lad = `M${f1(x0 - 2)} ${base} L${f1(x0 - 2)} ${f1(pie + 2)} `; for (let i = 1; i <= 12; i++) { const xx = x0 - 2 + (x1 - x0 + 4) * i / 12; lad += `Q${f1(xx - (x1 - x0) / 24)} ${f1(pie - 2.6 - rnd() * 2)} ${f1(xx)} ${f1(pie + 1 + rnd() * 2)} `; }
  g += P(lad + `L${f1(x1 + 2)} ${base}Z`, veg) + P(`M${f1(xb - 6)} ${f1(pie)} L${f1(x1 + 2)} ${f1(pie)} L${f1(x1 + 2)} ${base} L${f1(xb - 2)} ${base}Z`, V.som, ' opacity=".45"');
  for (let i = 0; i < 8; i++) { const xx = x0 + rnd() * (x1 - x0), yy = pie + 4 + rnd() * (base - pie - 8); g += P(`M${f1(xx)} ${f1(yy + 3)} Q${f1(xx + 2)} ${f1(yy - 2)} ${f1(xx + 4.4)} ${f1(yy + 3)}Z`, i % 2 ? V.luz : V.som, ' opacity=".6"'); }
  const d = `<clipPath id="${id}"><path d="${s}"/></clipPath><g clip-path="url(#${id})">${g}</g>` + Ln(`M${f1(xa - .6)} ${f1(top + 5)} L${f1(xa - .2)} ${f1(top + H * .48)}`, T.luz, 1.1, ' opacity=".75"');
  return pieza(P(s, c), d, [x0, top - 1, x1, base]);
}

// Andenes incas: terrazas de piedra en escalera que suben hacia `lado` ('izq' = el escalón más alto a la izquierda), cada una
// con su borde de pasto arriba, hiladas de piedra y la sombra que el pasto echa sobre el muro de abajo
export function andenes({ x0 = 0, x1 = 80, base = 118, n = 5, alto = 7, paso = 9, lado = 'izq', c = '#B8AC98', veg = '#8DB070', seed = 1 } = {}) {
  semilla(seed * 61 + 7); const T = tonos(c), V = tonos(veg), izq = lado === 'izq';
  let f = '', d = '';
  for (let k = 0; k < n; k++) { const yt = base - (k + 1) * alto, a = izq ? x0 : x0 + k * paso, b = izq ? x1 - k * paso : x1;
    f += R(a, yt, b - a, base - yt, c);
    d += R(a, yt + 2.2, b - a, 1.4, T.osc, ' opacity=".35"'); // sombra del pasto
    for (let r = 0; r < 2; r++) { const yy = yt + 3.4 + r * (alto - 3.6) / 2; d += Ln(`M${f1(a + .6)} ${f1(yy)} H${f1(b - .6)}`, T.lin, .5, ' opacity=".45"');
      for (let xx = a + 2 + rnd() * 3 + r * 2; xx < b - 1; xx += 4 + rnd() * 3) d += Ln(`M${f1(xx)} ${f1(yy)} v${f1((alto - 3.6) / 2)}`, T.lin, .45, ' opacity=".4"'); }
    d += P(`M${f1(a - .4)} ${f1(yt + 2.4)} L${f1(a - .4)} ${f1(yt)} ` + Array.from({ length: 8 }, (_, i) => `Q${f1(a + (b - a) * (i + .5) / 8)} ${f1(yt - 1.4 - rnd())} ${f1(a + (b - a) * (i + 1) / 8)} ${f1(yt)}`).join(' ') + ` L${f1(b + .4)} ${f1(yt + 2.4)}Z`, veg)
      + R(a, yt + .4, (b - a) * .5, .7, V.luz, ' opacity=".6"'); }
  return pieza(f, d, [x0 - .4, base - n * alto - 2, x1 + .4, base]);
}

// Ruinas incas: casitas de piedra sin techo con los hastiales (paredes de punta) en pie, puertas y nichos trapezoidales.
// defs = [{ x, w, h, gablete }] (h = altura del muro; gablete = punta arriba)
export function ruinas({ base = 118, defs = [], c = '#C2B6A2', seed = 2 } = {}) {
  semilla(seed * 67 + 3); const T = tonos(c); let f = '', d = '', top = base, xa = 999, xb = -999;
  const trap = (x, y, w, h) => P(`M${f1(x - w / 2)} ${f1(y + h)} L${f1(x - w * .36)} ${f1(y)} L${f1(x + w * .36)} ${f1(y)} L${f1(x + w / 2)} ${f1(y + h)}Z`, T.osc);
  defs.forEach(({ x, w, h, gablete = false }) => { const yt = base - h, g = gablete ? w * .42 : 0; top = Math.min(top, yt - g); xa = Math.min(xa, x); xb = Math.max(xb, x + w);
    f += gablete ? P(`M${f1(x)} ${base} L${f1(x)} ${f1(yt)} L${f1(x + w / 2)} ${f1(yt - g)} L${f1(x + w)} ${f1(yt)} L${f1(x + w)} ${base}Z`, c) : R(x, yt, w, h, c) + P(`M${f1(x)} ${f1(yt)} l2 -1.6 l2.4 1 l3 -2 l2 1.4 L${f1(x + w)} ${f1(yt)}Z`, c);
    for (let yy = yt + 3; yy < base - 1; yy += 2.8) d += Ln(`M${f1(x + .5)} ${f1(yy)} H${f1(x + w - .5)}`, T.lin, .4, ' opacity=".4"');
    const nn = Math.max(1, Math.round(w / 9)); for (let i = 0; i < nn; i++) { const cx = x + w * (i + .5) / nn; d += i === Math.floor(nn / 2) && h > 10 ? trap(cx, base - h * .62, w / nn * .5, h * .62) : trap(cx, yt + h * .25, w / nn * .34, h * .28); }
    d += R(x + w * .76, yt - g * .3, w * .24, h + g * .3, T.som, ' opacity=".35"'); });
  return pieza(f, d, [xa, top, xb, base]);
}

export const PIEZAS = { puenteColgante, puenteArco, torreReloj, cupula, techoTeja, fachada, casas, farolitos, karst, chimenea, macizo, junco, globo, palmera, agua,
  muro, pabellon, tenshu, hastial, escalinata, puenteCurvo, acantilado, colaLarga, baobab, acacia, jirafa, volcan, nube, duna, arbolSeco, cascada, faro, veranda, dhow, mesa, morro, teleferico, chorro, tepui, andenes, ruinas };

// ═════════════════════════ PALETA ═════════════════════════
// Una semilla de color (el tono de las colinas del destino) → paleta completa. Reglas sacadas de las 65 filas de destinos.js:
// el tono se mantiene, la saturación sube hacia la bruma (bruma ×1.315, colina clara ×1.09, colina oscura ×1) y la luz es fija
// (bruma .933, colina clara .839, colina oscura .737: exactamente las de San Francisco; Moscú y París andan igual). Saturación de la colina oscura: .12–.5.
const PAV = '#8D919B', VEREDA = '#6F737D';
const SUELOS = { // suelo alrededor de la pista · pista · piso ya construido, por tipo de paisaje (hue del destino entra en ciudad/desierto)
  ciudad: () => ['#B8BCC4', PAV, VEREDA],
  costa: () => ['#E8DDB8', '#EFE6C6', '#DCCDA0'],
  desierto: h => { const hh = h > 60 && h < 300 ? 38 : h; return [deHsl(hh + 10, .55, .74), deHsl(hh + 12, .58, .78), deHsl(hh + 8, .42, .64)]; },
  montana: () => ['#8FB07A', '#A4C08E', '#6F9460'],
  selva: () => ['#7FAE6A', '#93BF78', '#5F9447'],
  nieve: () => ['#DCE6EC', '#E6EDF2', '#C3CDD8'],
  pueblo: () => ['#D6C2A0', '#C9B694', '#A8956F'],
};
export function paleta(semillaColor, paisaje = 'ciudad') {
  const [h, s0] = hsl(semillaColor), s = Math.max(.12, Math.min(.5, s0));
  const [around, ground, hill] = (SUELOS[paisaje] || SUELOS.ciudad)(h);
  return { fog: deHsl(h, Math.min(.86, s * 1.315), .9333), c1: deHsl(h, s * 1.09, .8392), c2: deHsl(h, s, .7373), around, ground, hill };
}
const RIDGE = { costa: 'dune', montana: 'peak', ciudad: 'city', desierto: 'dune', selva: 'dune', nieve: 'peak' };
const LOMAS = { costa: 'dune', montana: 'peak', ciudad: 'city', desierto: 'dune', selva: 'dune', nieve: 'peak' }; // tipo de capa delantera por paisaje
const CLIMA = { costa: 'bubbles', montana: 'leaves', ciudad: 'leaves', desierto: 'sand', selva: 'leaves', nieve: 'snow' };

// ═════════════════════════ COMPOSICIÓN AUTOMÁTICA ═════════════════════════
// Geometría del fondo (scene3d.js): el recorte del monumento es un plano de lado S = 8.5·lmScale anclado abajo en y = -1.2, centrado en
// x = 5.2 - (S - 8.5)/2 + lmX, a z = -33; el SVG ocupa los 232 px centrales de una textura de 256 (margen de 12). El piso está en y = -.36.
const u = v => (12 + v * 232 / 120) / 256;                 // unidad SVG → fracción del plano (desde la izquierda / desde arriba)
const mundo = (box, k) => { const S = 8.5 * k; return { W: S * (u(box[2]) - u(box[0])), top: -1.2 + S * (1 - u(box[1])), y: v => -1.2 + S * (1 - u(v)) }; };
// Referencia: San Francisco tal cual quedó aprobado (recorte 0–120 × 16.5–118, escala 1, lmX -.8, y su FORE a mano)
const SF = { box: [0, 16.5, 120, 118], lmX: -.8, tapar: .395 };
const SF_M = mundo(SF.box, 1), SF_CX = 5.2 + SF.lmX, SF_DER = SF_CX + SF_M.W / 2, SF_ALTO = SF_M.top + .36, SF_HC = 2.3;
// FORE de San Francisco, pasado a coordenadas del recuadro del monumento (bx: 0 = borde izq. del dibujo, 1 = borde der.; w en anchos
// del dibujo; h en múltiplos de la loma central). Es la plantilla de todas las ciudades.
const SF_FORE = [
  { x: .5, w: 7, h: 2.3, c: [2, 3, .7], dz: .45, rol: 'centro' }, { x: .04, w: 9, h: 3.6, c: [2, 3, .55], dz: .5, rol: 'izq' }, { x: .98, w: 8, h: 3.3, c: [2, 3, .55], dz: .5, rol: 'der' },
  { x: -.1, w: 7, h: 1.9, c: 3, dz: .8, rol: 'cerca' }, { x: 1.1, w: 6, h: 1.7, c: 3, dz: .8, rol: 'cerca' }];
const PLANTILLA = SF_FORE.map(f => ({ ...f, bx: (f.x - u(SF.box[0])) / (u(SF.box[2]) - u(SF.box[0])), kw: f.w / SF_M.W, kh: f.h / SF_HC }));

// ficha.monumento ya armado ({ svg, box }) → { lmScale, lmX, fore }
export function componer(ficha, mon) {
  const box = mon.box, paisaje = ficha.paisaje || 'ciudad', o = ficha.composicion || {};
  const m1 = mundo(box, 1), alto1 = m1.top + .36;
  // 1) escala: mismo ancho que San Francisco; si el dibujo es más alto que ancho, que tenga el área de San Francisco sin pasar 1.12× su altura
  let k = o.escala ?? Math.min(SF_M.W / m1.W, Math.sqrt(SF_M.W * SF_ALTO / (m1.W * alto1)) * (o.tamano ?? 1), SF_ALTO * 1.12 / alto1, 1.6);
  k = f2(Math.max(.6, k));
  const S = 8.5 * k, M = mundo(box, k);
  // 2) posición: centrado donde va el puente, sin pasar el borde derecho del puente (lo que no se corta en pantalla)
  const cx = o.centro ?? Math.min(SF_CX, SF_DER - M.W / 2), cxSvg = (box[0] + box[2]) / 2;
  const lmX = o.x ?? f2(cx - S * (u(cxSvg) - .5) - (5.2 - (S - 8.5) / 2));
  // 3) lomas delanteras: la plantilla de San Francisco escalada al ancho del dibujo; la central sube hasta tapar `tapar` de su altura
  const tapar = o.tapar ?? SF.tapar, yc = box[3] - tapar * (box[3] - box[1]), hc = M.y(yc) + .4;
  // Las capas delanteras siguen al PAISAJE, no siempre son montañas: ciudad → perfiles de edificios ('city'); montaña/nieve → picos ('peak');
  // costa/desierto/selva → lomas suaves ('dune'). La ficha puede forzarlo con composicion.lomas.
  const kind = o.lomas ?? LOMAS[paisaje] ?? 'dune';
  const bx2plano = bx => u(box[0]) + bx * (u(box[2]) - u(box[0]));
  const agua0 = o.agua ?? (paisaje === 'costa'), hA = o.aguaAlto ?? hc * .62;
  const minLat = agua0 ? hA * 1.3 : 0; // con agua, las lomas de los costados tienen que tapar las puntas de la lámina
  let fore = o.fore ?? PLANTILLA.map(p => ({ t: 'hill', x: f2(bx2plano(p.bx)), w: f1(p.kw * M.W), h: f1(p.rol === 'centro' ? p.kh * hc : Math.max(p.kh * hc * (o.laterales ?? 1), p.rol === 'cerca' ? minLat * .7 : minLat)), c: p.c, dz: p.dz, kind }));
  // 4) extras del paisaje: costa / río → agua con brillos entre el monumento y las lomas; ciudad → hilera de edificios bajos
  const extras = [];
  if (agua0) { const sA = f1(M.W * (o.aguaAncho ?? 1.05)), yA = 120 - (hA / sA) * 120 / .906; // y del borde del agua en su recorte
    const a = agua({ x0: 6, x1: 114, y0: f1(Math.max(40, yA)), y1: 120, c: o.cAgua ?? ficha.cAgua ?? '#A9C8CC', brillos: 4, seed: 5 });
    const ex = typeof o.enAgua === 'function' ? o.enAgua({ y0: f1(Math.max(40, yA)), s: sA }) : {}; // lo que va EN el agua: bajo = reflejos (debajo), f = recortes con borde, d = detalles
    const svg = `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="${(5 * 8.5 / sA).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${a.f}${ex.f || ''}</g>${a.f}${a.d}${ex.bajo || ''}${ex.f || ''}${ex.d || ''}</svg>`;
    extras.push({ t: 'cut', svg, x: f2(bx2plano(.5)), s: sA, y: 0, dz: .3, at: .5 }); }
  // ciudad: hilera continua de edificios bajos (la textura 'city' del horizonte) que tapa el zócalo de punta a punta, entre el monumento y las lomas
  if (paisaje === 'ciudad' && o.edificios !== false) extras.push({ t: 'hill', x: f2(bx2plano(.5)), w: f1(M.W * 1.3), h: f1(hc * (o.edificiosAlto ?? .8)), c: [1, 2, .65], dz: .4, kind: 'city' });
  fore = [...extras, ...fore, ...(o.foreExtra || [])];
  // solo: el monumento va sin nada delante (ni lomas, ni edificios, ni agua); para los que ya resaltan solos, como Melbourne
  if (o.solo) fore = [...(o.foreExtra || [])];
  return { lmScale: k, lmX, fore };
}

// ═════════════════════════ FICHA → FILA ═════════════════════════
// Devuelve la MISMA fila de 14 campos que usa TABLA en destinos.js, con lmScale / lmX / fore pegados como propiedades
// (armar() los toma de ahí en vez de LM_ESCALA / LM_X / FORE). Así los índices guardados no cambian: la fila va en el mismo lugar.
export function fila(ficha) {
  const mon = ficha.monumento.svg ? ficha.monumento : monumento(...ficha.monumento);
  const p = { ...paleta(ficha.color, ficha.suelo || ficha.paisaje), ...(ficha.paleta || {}) };
  const r = [ficha.mundo, ficha.nombre, ficha.pais, mon.svg, p.fog, p.c1, p.c2, p.around, p.ground, p.hill, ficha.horizonte ?? RIDGE[ficha.paisaje] ?? 'dune',
    ficha.clima ?? CLIMA[ficha.paisaje] ?? 'leaves', ficha.hora ?? 12, ficha.adornos];
  Object.assign(r, componer(ficha, mon), { box: mon.box, ficha });
  return r;
}
