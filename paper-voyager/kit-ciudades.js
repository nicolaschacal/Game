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
export function karst({ x = 60, base = 118, h = 70, w = 16, c = '#93B09C', veg = '#6F956F', seed = 1 } = {}) {
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

export const PIEZAS = { puenteColgante, puenteArco, torreReloj, cupula, techoTeja, fachada, casas, farolitos, karst, chimenea, macizo, junco, globo, palmera, agua };

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
