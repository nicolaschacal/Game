// BORRADORES de destinos (tanda 2): mismo formato que DESTINOS de destinos.js (con su FORE), pero NO están en el mapa, ni en precios,
// ni en rutas, ni en el orden de mundos. Sólo se ven con index.html?preview=<Nombre> (p. ej. ?preview=Iguazu, ?preview=Xian), que arranca el
// inicio y la partida con ese destino sin guardar nada. Nombre y país van en español sin i18n (son borradores).
// Regla de todos: el recorte del monumento NO trae suelo propio (baja hasta el borde y = 110–118, que queda bajo el piso) y el paisaje del
// destino (colinas en la paleta de las montañas del fondo, agua y árboles como capas recortadas) va delante en FORE, tapando la base, como San Francisco.
import { ADORNOS, LUZ } from './adornos.js';
const CREAM = '#FFF4DC';
const cut = (shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
// recorte de paisaje para FORE (lado s grande): borde crema más fino, para que se vea del mismo grosor que el del monumento
const cutS = (s, shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="${(5 * 8.5 / s).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
// los cinco que ya gustaban (y Luxor) vienen de los bocetos: se escalan para que su base (y = 110) baje a y = 118, bajo el piso
const FITB = dx => `translate(${60 + dx} 118) scale(.95) translate(-60 -110)`;
const cutF = (dx, shapes, details = '') => cut(`<g transform="${FITB(dx)}">${shapes}</g>`, `<g transform="${FITB(dx)}">${details}</g>`);
const win = (x, y, cols, rows, c = '#FFE9A8', dx = 5, dy = 7, w = 2.6, h = 3.6) => { let s = ''; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += `<rect x="${x + i * dx}" y="${y + j * dy}" width="${w}" height="${h}" fill="${c}"/>`; return s; };
const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const shade = (c, t) => mix(c, '#3A2A3E', t);
const Rr = (x, y, w, h, c, o = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${o}/>`;
const Pp = (d, c, o = '') => `<path d="${d}" fill="${c}"${o}/>`;
const Cc = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const Ln = (d, c, w = 1.4, o = '') => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"${o}/>`;
const archW = (x, y, w, h, c) => `<path d="M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h}Z" fill="${c}"/>`;
const f1 = n => +n.toFixed(1);
let sd = 1; const rnd = () => (sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296; const seed = n => { sd = n; };
// ── piezas de paisaje en el estilo de papel del juego ──
// pino de tres pisos (como los del costado de la pista, pero lejano)
const pino = (x, b, h) => { const w = h * .34; return `M${f1(x)} ${f1(b - h)} L${f1(x + w * .5)} ${f1(b - h * .64)} L${f1(x + w * .26)} ${f1(b - h * .64)} L${f1(x + w * .78)} ${f1(b - h * .32)} L${f1(x + w * .48)} ${f1(b - h * .32)} L${f1(x + w)} ${f1(b)} L${f1(x - w)} ${f1(b)} L${f1(x - w * .48)} ${f1(b - h * .32)} L${f1(x - w * .78)} ${f1(b - h * .32)} L${f1(x - w * .26)} ${f1(b - h * .64)} L${f1(x - w * .5)} ${f1(b - h * .64)}Z`; };
const pinos = (x0, x1, base, h0, h1, step = 5) => { let d = ''; for (let x = x0; x <= x1; x += step * (.75 + rnd() * .5)) d += pino(x, typeof base === 'function' ? base(x) : base, h0 + rnd() * (h1 - h0)); return d; };
// álamo (columna en llama), palmera (tronco curvo + hojas en punta)
const alamo = (x, b, h) => { const w = h * .17; return `M${x} ${b - h} Q${x + w * 1.3} ${b - h * .55} ${x + w * .45} ${b} L${x - w * .45} ${b} Q${x - w * 1.3} ${b - h * .55} ${x} ${b - h}Z`; };
const palma = (x, b, h, l, ct, cf) => { const tx = x + l, ty = b - h, L = h * .42; const hoja = (dx, dy) => `M${f1(tx)} ${f1(ty)} Q${f1(tx + dx * .5)} ${f1(ty + dy * .5 - L * .32)} ${f1(tx + dx)} ${f1(ty + dy)} Q${f1(tx + dx * .45)} ${f1(ty + dy * .42)} ${f1(tx)} ${f1(ty + 1)}Z`;
  return Pp(`M${f1(x - h * .03)} ${b} Q${f1(x + l * .15)} ${f1(b - h * .55)} ${f1(tx - h * .02)} ${f1(ty)} L${f1(tx + h * .02)} ${f1(ty)} Q${f1(x + l * .15 + h * .05)} ${f1(b - h * .55)} ${f1(x + h * .03)} ${b}Z`, ct)
    + Pp([[-L, L * .45], [-L * .8, -L * .2], [-L * .2, -L * .5], [L * .35, -L * .42], [L * .85, -L * .1], [L, L * .45]].map(([a, c]) => hoja(a, c)).join(' '), cf); };
// selva: dosel continuo con copas en punta suave (una sola silueta, nada de bolas sueltas)
const dosel = (x0, x1, base, top, amp, n) => { let d = `M${x0} ${base} L${x0} ${f1(top + amp * rnd() * .5)}`, xa = x0; const st = (x1 - x0) / n; while (xa < x1 - st * .3) { const xb = Math.min(x1, xa + st * (.6 + rnd() * .9)), w = xb - xa, ym = top - amp * (.3 + rnd() * .9); d += ` Q${f1(xa + w * .08)} ${f1(ym + amp * .15)} ${f1(xa + w * .35)} ${f1(ym)} Q${f1(xa + w * .7)} ${f1(ym - amp * .12)} ${f1(xb)} ${f1(top + amp * rnd() * .5)}`; xa = xb; } return d + ` L${x1} ${base}Z`; }; // copas de ancho y alto desparejos (selva), una sola silueta
const doselL = (x0, x1, base, top, amp, n) => dosel(x0 + 7, x1 - 7, base, top, amp, n).replace(/^M\S+ \S+ L/, `M${x0} ${base} Q${x0 + 2} ${top + 10} `).replace(/ L\S+ \S+Z$/, ` Q${x1 - 2} ${top + 10} ${x1} ${base}Z`); // con laderas: sin bordes verticales
// colina kárstica (dedal alto, apenas asimétrico)
const karst = (x, b, h, w) => `M${f1(x - w)} ${b} C${f1(x - w * 1.08)} ${f1(b - h * .55)} ${f1(x - w * .8)} ${f1(b - h * .97)} ${f1(x - w * .08)} ${f1(b - h)} C${f1(x + w * .62)} ${f1(b - h * 1.02)} ${f1(x + w * .98)} ${f1(b - h * .62)} ${f1(x + w)} ${b}Z`;
const karstSombra = (x, b, h, w) => `M${f1(x + w * .2)} ${f1(b - h * .99)} C${f1(x + w * .7)} ${f1(b - h * .96)} ${f1(x + w * .98)} ${f1(b - h * .62)} ${f1(x + w)} ${b} L${f1(x + w * .45)} ${b} C${f1(x + w * .6)} ${f1(b - h * .5)} ${f1(x + w * .55)} ${f1(b - h * .85)} ${f1(x + w * .2)} ${f1(b - h * .99)}Z`;
// agua: lámina recortada de orilla irregular (se ve como el espejo del lago/río entre las colinas); NUNCA de borde a borde de la pantalla
const lamina = (y0, y1, x0 = 4, x1 = 116) => { const w = x1 - x0; return `M${x0} ${y1} Q${f1(x0 + w * .1)} ${y0 + .5} ${f1(x0 + w * .3)} ${y0} Q${f1(x0 + w * .5)} ${y0 - .8} ${f1(x1 - w * .3)} ${y0} Q${f1(x1 - w * .1)} ${y0 + .5} ${x1} ${y1} Q${f1(x0 + w / 2)} ${y1 + 1.5} ${x0} ${y1}Z`; };
const brillos = (y0, y1, c, n = 5, x0 = 18, x1 = 102) => { let s = ''; for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + .5) / n, w = 6 + rnd() * 10, x = x0 + rnd() * (x1 - x0 - w); s += Ln(`M${f1(x)} ${f1(y)} h${f1(w)}`, c, 1.1, ' opacity=".8"'); } return s; };
// lomas del frente en la paleta del destino (como San Francisco): centro bajo, dos laterales y dos más cercanas un tono más oscuras
const lomas = (h = 2.2, k = 'dune', o = {}) => [
  { t: 'hill', x: o.cx ?? .5, w: o.cw ?? 7, h: h * (o.ch ?? .8), c: [2, 3, .6], dz: .45, kind: k },
  { t: 'hill', x: o.lx ?? .02, w: 8, h: h * 1.2, c: [2, 3, .5], dz: .5, kind: k }, { t: 'hill', x: o.rx ?? .98, w: 8, h: h * 1.1, c: [2, 3, .5], dz: .5, kind: k },
  { t: 'hill', x: -.12, w: 7, h: h * .8, c: 3, dz: .8, kind: k }, { t: 'hill', x: 1.12, w: 6, h: h * .72, c: 3, dz: .8, kind: k }];

const M = {}, F = {};

// ───────── Iguazú: anfiteatro de saltos todos iguales (una sola altura), basalto y selva paranaense arriba ─────────
{ seed(11); const ey = x => { const t = (x - 8) / 104; return 38 + 24 * t * (1 - t); };
  const XS = [9, 26, 43, 60, 77, 94], caidas = XS.map(x => `M${x} ${f1(ey(x) + 1)} Q${x + 7} ${f1(ey(x + 7) - 1.6)} ${x + 14} ${f1(ey(x + 14) + 1)} L${x + 15} 118 L${x - 1} 118Z`).join(' ');
  M.iguazu = cut(
    Pp(doselL(2, 118, 46, 28, 6, 8), '#5E9A5C') + palma(20, 32, 20, -2, '#7A6A4A', '#4E8A50') + palma(96, 30, 24, 2, '#7A6A4A', '#4E8A50') + Pp('M0 118 Q4 70 6 46 L8 38 Q60 62 112 38 L114 46 Q116 70 120 118Z', '#6E6A58') + Pp(caidas, '#F4FAFA'),
    Pp('M8 38 Q60 62 112 38 L112 42 Q60 66 8 42Z', '#56523F', ' opacity=".6"')
    + XS.map(x => Ln(`M${x + 3.5} ${f1(ey(x) + 6)} L${x + 3} 116 M${x + 8} ${f1(ey(x) + 4)} L${x + 8.2} 116 M${x + 11.5} ${f1(ey(x) + 8)} L${x + 12} 116`, '#CFE6EE', 1.2)).join('')
    );
  F['Iguazú'] = [{ t: 'cut', at: .5, svg: cutS(9, Pp(doselL(0, 120, 120, 104, 4, 12), '#4A8A50') + palma(22, 110, 22, -2, '#8A6A44', '#3F7A46') + palma(100, 109, 26, 2, '#8A6A44', '#3F7A46'), Pp(doselL(6, 114, 120, 110, 3, 9), '#3E7A46')), x: .5, s: 9, dz: .15 },
    { t: 'hill', x: .0, w: 6, h: 2.8, c: [2, 3, .5], dz: .5 }, { t: 'hill', x: 1.0, w: 6, h: 2.6, c: [2, 3, .5], dz: .5 },
    { t: 'hill', x: -.15, w: 7, h: 2, c: 3, dz: .8 }, { t: 'hill', x: 1.15, w: 6, h: 1.8, c: 3, dz: .8 }]; }

// ───────── Xi'an: Gran Pagoda del Ganso Salvaje (Tang, siete pisos de ladrillo) entre los techos del templo Da Ci'en ─────────
{ let y = 104, d = '', det = ''; const H = [14, 12.5, 11.5, 10.5, 9.5, 8.5, 8];
  H.forEach((h, i) => { const w = 40 - 3 * i; d += Rr(f1(60 - w / 2), f1(y - h), w, h + .4, '#D9BC8E') + Rr(f1(60 - w / 2 - 2.5), f1(y - h - 1.4), w + 5, 2.6, '#B8966A');
    det += archW(57.6, f1(y - h + 3), 4.8, f1(h - 4.6), '#6B4A30') + Rr(f1(60 - w / 2), f1(y - h + 1.2), w, 1, '#C9A578') + Rr(f1(60 + w / 2 - 3), f1(y - h + 1.2), 3, h - 1, '#BE9F72', ' opacity=".7"'); y -= h + 1.4; });
  const sala = x => Rr(x + 4, 100, 22, 18, '#B8503A') + Pp(`M${x} 101 Q${x + 6} 99.5 ${x + 7} 94 L${x + 23} 94 Q${x + 24} 99.5 ${x + 30} 101Z`, '#6E7480');
  M.xian = cut(Rr(30, 102, 60, 16, '#C9A97E') + d + Pp(`M47 ${f1(y + 1.4)} L60 ${f1(y - 7)} L73 ${f1(y + 1.4)}Z`, '#B8966A') + Rr(59, f1(y - 20), 2, 14, '#9A7A4C') + Cc(60, f1(y - 16), 2.4, '#9A7A4C') + sala(0) + sala(90),
    det + `<path d="M30 106 h60 M30 111 h60" stroke="#B8966A" stroke-width="1"/>` + Rr(8, 106, 3, 12, '#8A3A2A') + Rr(17, 106, 3, 12, '#8A3A2A') + Rr(100, 106, 3, 12, '#8A3A2A') + Rr(109, 106, 3, 12, '#8A3A2A') + Ln('M7 97 h16 M97 97 h16', '#5A606C', 1));
  F["Xi'an"] = lomas(2.1, 'dune', { ch: .62 }); }

// ───────── Guilin: torres kársticas del río Li en capas que se aclaran hacia atrás; el río es sólo una lámina entre las capas ─────────
{ const atras = [[14, 78, 12], [36, 96, 11], [58, 82, 13], [82, 100, 12], [106, 76, 12]], medio = [[24, 58, 13], [50, 46, 12], [72, 64, 14], [98, 52, 12]];
  M.guilin = cut(atras.map(([x, h, w]) => Pp(karst(x, 118, h, w), '#A9C8B8')).join('') + medio.map(([x, h, w]) => Pp(karst(x, 118, h, w), '#86AE98')).join(''),
    atras.map(([x, h, w]) => Pp(karstSombra(x, 118, h, w), '#93B8A6')).join('') + medio.map(([x, h, w]) => Pp(karstSombra(x, 118, h, w), '#729C86')).join('')
    + medio.map(([x, h]) => Ln(`M${x - 6} ${118 - h * .55} q4 -2 8 0 M${x - 3} ${118 - h * .35} q4 -2 7 0`, '#6E967F', 1)).join(''));
  const fr = [[13, 46, 11], [31, 30, 9], [90, 34, 10], [108, 48, 11]];
  F['Guilin'] = [
    { t: 'cut', at: .5, svg: cutS(9, Pp(lamina(106, 116, 22, 98), '#C6E2E0'), brillos(108, 114, '#EAF6F4', 3, 32, 88) + Rr(56, 106.6, 9, 1.6, '#8A6A44') + Ln('M60 106.6 v-4', '#6B4A2E', .8)), x: .5, s: 9, dz: .1 },
    { t: 'cut', at: .5, svg: cutS(9, fr.map(([x, h, w]) => Pp(karst(x, 118, h, w), '#5E8A72')).join(''), fr.map(([x, h, w]) => Pp(karstSombra(x, 118, h, w), '#4E7862')).join('')), x: .5, s: 9, dz: .2, ro: 45 },
    { t: 'hill', x: -.18, w: 7, h: 1.6, c: 3, dz: .9 }, { t: 'hill', x: 1.18, w: 6, h: 1.5, c: 3, dz: .9 }]; }

// ───────── Hong Kong: skyline del puerto (IFC, Bank of China, Central Plaza) SIN fondo propio; el agua es una lámina delante ─────────
{ const bajos = [[2, 10, 74], [11, 9, 64], [36, 6, 60], [48, 9, 66], [72, 9, 58], [92, 8, 62], [100, 9, 70], [109, 9, 80]];
  M.hk = cut(bajos.map(([x, w, t], i) => Rr(x, t, w, 118 - t, ['#9AA4BE', '#A8B0C8', '#8E98B4'][i % 3])).join('')
    + Pp('M20 118 L20 22 L21.6 22 L21.6 15 L23.4 15 L23.4 10 L28.6 10 L28.6 15 L30.4 15 L30.4 22 L32 22 L32 118Z', '#B8C6DA')
    + Pp('M38 118 L38 40 L40 36 L44 36 L46 40 L46 118Z', '#C8B4D0') + Rr(41.6, 26, .9, 10, '#C8B4D0')
    + Pp('M56 118 L56 46 L61 40 L61 32 L65 26 L65 18 L69 13 L69 118Z', '#A9BCD4') + Rr(64.5, 6, .9, 12, '#A9BCD4') + Rr(68.2, 3, .9, 10, '#A9BCD4')
    + Pp('M80 118 L80 30 L84 24 L88 30 L88 118Z', '#D6C08E') + Rr(83.6, 14, .8, 10, '#D6C08E'),
    Ln('M22.5 24 V116 M26 17 V116 M29.5 24 V116', '#E6EEF6', .7) + Ln('M57 48 L68 70 M68 48 L57 70 M57 72 L68 94 M68 72 L57 94 M61 34 L68 46 M64 28 L68 34', '#EEF2FA', .9) + Ln('M56 70 h13 M56 94 h13', '#EEF2FA', .9)
    + win(4, 78, 2, 5, '#FFE9A8', 4, 7, 1.6, 2.4) + win(13, 68, 2, 6, '#FFE9A8', 3.6, 7, 1.6, 2.4) + win(50, 70, 2, 6, '#FFE9A8', 4, 7, 1.6, 2.4) + win(74, 62, 2, 7, '#FFE9A8', 4, 7, 1.6, 2.4) + win(102, 74, 2, 5, '#FFE9A8', 4, 7, 1.6, 2.4)
    + win(81.5, 36, 2, 10, '#FFF4C8', 3, 7, 1.4, 2.2) + win(39.5, 44, 2, 9, '#FFE9A8', 3, 7, 1.4, 2.2) + Pp('M80 30 L84 24 L88 30Z', '#C9A85A'));
  F['Hong Kong'] = [{ t: 'cut', at: .5, svg: cutS(10, Pp(lamina(108, 117, 6, 114), '#6E78A8'), brillos(106, 115, '#FFE9A8', 6) + Pp('M76 104 L86 104 L84 106.4 L78 106.4Z', '#5A3A2A') + Pp('M78.6 104 L79.4 96 L82 104Z M82.6 104 L83.4 98 L85.6 104Z', '#C9503A')), x: .5, s: 10, dz: .12 },
    { t: 'hill', x: -.08, w: 7, h: 2.2, c: [2, 3, .5], dz: .55 }, { t: 'hill', x: 1.08, w: 7, h: 2, c: [2, 3, .5], dz: .55 },
    { t: 'hill', x: -.2, w: 6, h: 1.6, c: 3, dz: .9 }, { t: 'hill', x: 1.2, w: 6, h: 1.5, c: 3, dz: .9 }]; }

// (Busan pasó a destino real: ficha en fichas-ciudades.js)

// ───────── Cairns: selva tropical de montaña (Kuranda/Barron) con el Skyrail; delante la costa de la Esplanade con palmeras ─────────
{ seed(23);
  M.cairns = cut(Pp('M0 118 Q6 76 14 54 Q24 42 34 40 Q44 26 56 30 Q68 16 82 26 Q96 20 106 36 Q114 46 118 70 Q120 90 120 118Z', '#7FAE88')
    + Pp('M0 118 Q8 92 20 80 Q32 66 44 70 Q54 58 64 64 Q78 54 92 66 Q106 60 114 76 Q120 90 120 118Z', '#4E8A5E'),
    Pp(dosel(0, 120, 118, 92, 4, 14), '#3E7A50', ' opacity=".55"') + Ln('M10 88 Q14 86 18 88 M34 74 Q38 72 42 74 M66 64 Q70 62 74 64 M96 70 Q100 68 104 70 M22 54 Q26 52 30 54 M60 38 Q64 36 68 38 M90 32 Q94 30 98 32', '#6E9E78', 1.1)
    + Ln('M6 100 L104 40', '#4A4A50', .7) + [[22, 90.3], [46, 75.7], [70, 61], [92, 47.6]].map(([x, y]) => Ln(`M${x} ${y} v3`, '#4A4A50', .6) + Rr(x - 1.2, y + 3, 2.4, 2.2, '#E8452C')).join('') + [[34, 83], [80, 54.5]].map(([x, y]) => Ln(`M${x} ${y} L${x} ${y + 26}`, '#8A8A90', .9)).join(''));
  F['Cairns'] = [{ t: 'cut', at: .5, svg: cutS(7, Pp('M4 120 Q8 113 20 112 Q60 110 100 112 Q112 113 116 120Z', '#F2E3B5') + palma(16, 114, 40, -4, '#9A7A52', '#3E9A5A') + palma(30, 113, 52, 3, '#9A7A52', '#4FA85A') + palma(90, 113, 46, -3, '#9A7A52', '#3E9A5A') + palma(104, 114, 34, 4, '#9A7A52', '#4FA85A')), x: .5, s: 5.5, dz: .15, ro: 45 },
    { t: 'hill', x: .5, w: 7, h: 1.2, c: [2, 3, .6], dz: .35 }, { t: 'hill', x: .0, w: 6, h: 2.6, c: [2, 3, .5], dz: .5 }, { t: 'hill', x: 1.0, w: 6, h: 2.4, c: [2, 3, .5], dz: .5 }, { t: 'hill', x: -.15, w: 7, h: 1.7, c: 3, dz: .8 }, { t: 'hill', x: 1.15, w: 6, h: 1.5, c: 3, dz: .8 }]; }

// ───────── Queenstown: The Remarkables nevados sobre el lago Wakatipu, álamos dorados y el TSS Earnslaw ─────────
{ const sierra = 'M0 118 Q4 96 10 80 L16 70 L22 72 L30 52 L36 56 L44 34 L50 42 L56 30 L62 40 L70 26 L78 38 L86 32 L94 46 L100 44 L108 60 L114 66 Q118 84 120 118Z';
  M.queens = cut(Pp(sierra, '#8A94AE'),
    `<clipPath id="qn"><path d="${sierra}"/></clipPath><g clip-path="url(#qn)">` + Pp('M0 0 L120 0 L120 74 L112 72 L106 64 L100 56 L94 58 L88 46 L82 50 L76 50 L70 40 L64 50 L58 44 L52 52 L44 46 L38 64 L30 62 L22 80 L14 78 L0 86Z', '#FFFFFF')
    + Pp('M44 34 L50 42 L48 58 L40 52Z M56 30 L62 40 L58 54Z M70 26 L78 38 L74 58 L66 52Z M86 32 L94 46 L90 60 L84 52Z M30 52 L36 56 L34 70 L28 68Z', '#6E7894', ' opacity=".45"')
    + Pp('M0 118 L0 96 Q30 88 60 94 Q90 88 120 96 L120 118Z', '#9A8E6E') + `</g>`);
  F['Queenstown'] = [{ t: 'cut', at: .5, svg: cutS(11, Pp(lamina(108, 117, 4, 116), '#6F9CD0'), brillos(107, 115, '#CFE2F4', 5) + Rr(52, 104.2, 8, 1.8, '#F6F2EA') + Rr(55, 101.6, 1.4, 2.8, '#C9503A')), x: .5, s: 11, dz: .12 },
    { t: 'cut', at: .5, svg: cutS(5, Pp(alamo(10, 118, 34) + alamo(19, 118, 44) + alamo(27, 118, 30), '#E8B84A') + Pp(alamo(96, 118, 38) + alamo(106, 118, 30), '#D99A3A')), x: .5, s: 5, dz: .2, ro: 45 },
    { t: 'hill', x: .0, w: 6, h: 2.2, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: 1.0, w: 6, h: 2, c: [2, 3, .5], dz: .45 },
    { t: 'hill', x: -.12, w: 7, h: 1.8, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: 1.12, w: 7, h: 1.6, c: [2, 3, .6], dz: .5 },
    { t: 'hill', x: -.25, w: 6, h: 1.4, c: 3, dz: .9 }, { t: 'hill', x: 1.25, w: 6, h: 1.3, c: 3, dz: .9 }]; }

// ───────── Fez: medina escalonada en el valle, minarete de la Qarawiyyin con su franja verde y techos de teja verde ─────────
{ seed(37); const tope = x => 46 + ((x - 46) / 64) ** 2 * 40; let a = '', b = '', det = '';
  for (let x = 1; x < 118; x += 7 + rnd() * 3) { const w = 7 + rnd() * 3, t = f1(tope(x) + rnd() * 6), c = ['#E8D2A8', '#DCC098', '#D0B088', '#E2C8A0'][Math.floor(rnd() * 4)]; a += Rr(f1(x), t, f1(w), f1(118 - t), c); det += Rr(f1(x + 2), f1(t + 4), 1.8, 2.4, '#7A5A3A'); }
  for (let x = 4; x < 116; x += 8 + rnd() * 3) { const w = 8 + rnd() * 3, t = f1(tope(x) + 16 + rnd() * 6), c = ['#F0DDB8', '#E4CCA4', '#D8BA90'][Math.floor(rnd() * 3)]; b += Rr(f1(x), t, f1(w), f1(118 - t), c); det += Rr(f1(x + 2.4), f1(t + 4), 1.8, 2.4, '#7A5A3A') + Rr(f1(x + 5.4), f1(t + 4), 1.8, 2.4, '#7A5A3A'); }
  M.fez = cut(a + Rr(40, 16, 10, 102, '#EBDDBE') + Rr(42.4, 8, 5.2, 8.4, '#EBDDBE') + Pp('M41.6 8.4 L45 3 L48.4 8.4Z', '#3E9A6A') + Pp('M64 52 L67 46 L83 46 L86 52Z', '#3E9A6A') + Rr(65, 52, 20, 10, '#E8D2A8') + b,
    Rr(40, 22, 10, 3, '#3E9A6A') + Rr(40, 27, 10, 1.4, '#3E9A6A') + archW(43, 32, 4, 7, '#3E9A6A') + archW(43, 46, 4, 6, '#8A6A44') + Rr(44.6, 0, .8, 3.4, '#D9A63A') + det + Ln('M66 48.6 h18', '#2E7A50', .9));
  F['Fez'] = lomas(2.2, 'dune', { ch: .7 }); }

// ───────── Merzouga: dunas del Erg Chebbi con cresta afilada (cara de sombra) y una caravana minúscula en la cresta ─────────
{ const D = [['M-10 118 Q20 80 46 44 Q56 30 64 28 Q72 28 80 40 Q100 66 130 118Z', 'M-10 118 Q20 80 46 44 Q56 30 64 28 Q60 44 52 60 Q44 78 46 96 Q48 108 44 118Z', '#F2B666', '#D98C48'],
    ['M-10 118 Q10 84 26 70 Q32 66 38 68 Q52 80 74 118Z', 'M-10 118 Q10 84 26 70 Q32 66 38 68 Q30 82 26 96 Q24 108 26 118Z', '#F4C277', '#DE9550'],
    ['M56 118 Q76 90 92 76 Q98 72 104 74 Q118 88 130 118Z', 'M56 118 Q76 90 92 76 Q98 72 104 74 Q96 88 92 100 Q90 110 92 118Z', '#F4C277', '#DE9550']];
  const camello = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-2.4 0 V-2.6 Q-2.6 -4 -1.4 -4.2 Q-.4 -5.6 .8 -4.4 Q1.6 -4 2 -4.6 L2.8 -6 L3.6 -5.8 L3 -3.6 L2.4 -2.6 V0 H1.8 V-2.4 H-1.6 V0Z" fill="#6A3E22"/><path d="M-.6 -5 L-.2 -7.2 L.6 -7 L.4 -4.8Z" fill="#6A3E22"/></g>`;
  M.merzouga = cut(D.map(([l, o, a, b]) => Pp(l, a) + Pp(o, b)).join(''),
    [[90, 78.6], [95.5, 75.6], [101, 74.6], [106.5, 76.2]].map(([x, y]) => camello(x, y)).join('') + Ln('M70 33 Q86 52 96 70', '#FFD9A0', .9, ' opacity=".6"'));
  F['Merzouga'] = lomas(1.8, 'dune', { ch: .6 }); }

// ───────── Las Vegas: skyline lejano de casinos (Stratosphere, Wynn, Bellagio, París, Luxor); el letrero va chico, delante ─────────
{ M.vegas = cut([[2, 96, 12], [20, 100, 10], [44, 98, 8], [72, 94, 8], [86, 102, 10], [108, 98, 10]].map(([x, t, w]) => Rr(x, t, w, 118 - t, '#7A6A98')).join('') + Rr(13, 30, 3.4, 88, '#C8C0D8') + Pp('M8 30 Q8 22 14.7 21 Q21.4 22 21.4 30Z', '#C8C0D8') + Rr(14.2, 3, 1, 18, '#C8C0D8')
    + Pp('M30 118 L30 30 Q37 26 44 32 L44 118Z', '#C9A06A') + Rr(56, 34, 16, 84, '#D8D0E0') + Pp('M48 118 L48 50 L52 46 L66 46 L70 50 L70 118Z', '#E8DCC4')
    + Pp('M78 118 L80.4 80 L81.4 66 L82 50 L82.6 66 L83.6 80 L86 118Z', '#B07A5A') + Pp('M88 118 L103 60 L118 118Z', '#3E3A5A'),
    Pp('M8 30 Q8 22 14.7 21 Q21.4 22 21.4 30Z', '#E27AB0', ' opacity=".55"') + win(31.5, 36, 3, 11, '#FFE9A8', 4, 7, 1.6, 2.4) + win(58, 40, 3, 10, '#FFE9A8', 5, 7, 2, 2.4) + win(50, 54, 4, 8, '#FFF4C8', 5, 7, 2, 2.2)
    + Ln('M79.6 92 h6.8 M80.8 72 h4.4', '#8A5A3E', 1) + Ln('M103 60 L95 92', '#5A5678', .8) + [[2, 96, 12, '#F27AB0'], [20, 100, 10, '#5AD0E0'], [44, 98, 8, '#F2C14E'], [72, 94, 8, '#5AD0E0'], [86, 102, 10, '#F27AB0'], [108, 98, 10, '#F2C14E']].map(([x, t, w, c]) => Rr(x, t, w, 1.6, c) + win(x + 1.5, t + 4, Math.floor(w / 3.4), 2, '#FFE9A8', 3.4, 5, 1.6, 1.8)).join(''));
  const star = Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 4 : 9; return `${f1(60 + Math.cos(a) * r)} ${f1(26 + Math.sin(a) * r)}`; }).join(' L');
  F['Las Vegas'] = [...lomas(1.5, 'dune', { ch: .55 }),
    { t: 'cut', at: .5, svg: cut(Rr(46, 64, 4, 54, '#8A8590') + Rr(70, 64, 4, 54, '#8A8590') + Pp('M60 34 Q80 40 94 52 Q80 64 60 70 Q40 64 26 52 Q40 40 60 34Z', '#F6F2EA') + Pp(`M${star}Z`, '#F2C14E'),
      Pp('M60 39 Q76 44 87 52 Q76 60 60 65 Q44 60 33 52 Q44 44 60 39Z', '#E8452C') + Rr(40, 50, 40, 4, '#FFFFFF') + [...Array(9)].map((_, i) => Cc(36 + i * 6, 44.6 + Math.abs(i - 4) * 1.2, 1.2, '#F2B937')).join('')), x: .05, s: 2.1, dz: 2.2, ro: 46 }]; }

// ───────── Gran Cañón: dos paredes anchas en estratos que se abren hacia el fondo, con templos (buttes) lejanos del color del horizonte ─────────
{ const fi = 'M0 118 L0 96 L4 94 L6 82 L10 80 L12 66 L16 64 L18 52 L22 50 L24 44 L30 44 L32 52 L36 54 L38 66 L42 68 L44 80 L50 82 L52 118Z', fc = 'M46 118 L48 84 L52 82 L54 70 L58 68 L60 58 L66 58 L68 68 L72 70 L74 82 L78 84 L80 118Z';
  const fd = 'M120 118 L120 98 L116 96 L114 84 L110 82 L108 70 L104 68 L102 56 L98 54 L96 48 L88 48 L86 58 L84 60 L82 72 L78 74 L76 86 L70 88 L68 118Z';
  const capas = ['#F0D0A0', '#E0A058', '#C9603E', '#B04A38', '#8E4A3C'], cy = [38, 52, 64, 78, 92, 120];
  const est = (id, k) => `<g clip-path="url(#${id})">` + capas.map((c, i) => Rr(0, cy[i], 120, cy[i + 1] - cy[i], mix(c, '#F4E4D4', k))).join('') + `</g>`;
  M.canon = cut(Pp(fc, '#E0B090') + Pp(fi, '#C9603E') + Pp(fd, '#C9603E'),
    `<clipPath id="gc"><path d="${fc}"/></clipPath><clipPath id="gi"><path d="${fi}"/></clipPath><clipPath id="gd"><path d="${fd}"/></clipPath>`
    + est('gc', .45) + est('gi', 0) + est('gd', 0) + Pp(fi, '#3A2A3E', ' opacity=".12"') + Ln('M18 52 H32 M90 58 H102 M12 66 H38 M84 72 H108 M6 82 H44', '#FFF4DC', .8, ' opacity=".4"'));
  F['Gran Cañón'] = lomas(1.6, 'peak', { ch: .45 }); }

// ───────── Banff: Mount Rundle (losa inclinada) con vetas de nieve, bosque de pinos y la orilla de Vermilion Lakes ─────────
{ seed(41); const rundle = 'M0 118 L0 96 L20 82 L50 62 L76 38 L86 22 L90 26 L96 46 L104 66 L112 80 L120 86 L120 118Z';
  M.banff = cut(Pp(rundle, '#9AA4B4'),
    Pp('M86 22 L90 26 L96 46 L104 66 L112 80 L120 86 L120 118 L98 118 L92 72 L88 40Z', '#76809A') + Ln('M30 78 L60 56 M42 76 L70 52 M56 74 L80 44 M66 72 L84 36 M20 88 L48 70', '#FFFFFF', 1.6, ' opacity=".85"')
    + Pp(pinos(-2, 122, 118, 12, 20, 4.6), '#5A8A6A') + Pp(pinos(0, 120, 120, 10, 16, 5), '#3E6A56'));
  F['Banff'] = [{ t: 'cut', at: .5, svg: cutS(11, Pp(lamina(108, 117, 8, 112), '#7CC4C4'), brillos(108, 115, '#D8F2F0', 4)), x: .5, s: 11, dz: .12 },
    { t: 'cut', at: .5, svg: (seed(43), cutS(7, Pp(pinos(2, 40, 118, 14, 30, 6) + pinos(84, 118, 118, 12, 26, 6), '#3E6A56'))), x: .5, s: 7, dz: .6, ro: 45 },
    { t: 'hill', x: .0, w: 6, h: 2.5, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: 1.0, w: 6, h: 2.3, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: -.15, w: 7, h: 1.8, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: 1.15, w: 7, h: 1.6, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: -.28, w: 6, h: 1.4, c: 3, dz: .9 }, { t: 'hill', x: 1.28, w: 6, h: 1.3, c: 3, dz: .9 }]; }

// ───────── Salar de Uyuni: volcán Tunupa con sus franjas, otro volcán en el horizonte y la isla Incahuasi con cardones; delante, sólo sal ─────────
{ const cardon = (x, b, h) => `M${x - .7} ${b} V${b - h} H${x + .7} V${b}Z M${x - .7} ${b - h * .5} H${x - 2.2} V${b - h * .8} H${x - 1.4} V${b - h * .6} H${x - .7}Z M${x + .7} ${b - h * .4} H${x + 2} V${b - h * .7} H${x + 1.3} V${b - h * .5} H${x + .7}Z`;
  M.uyuni = cut(Pp('M60 118 L84 66 Q90 60 96 66 L120 104 L120 118Z', '#C4CCE0') + Pp('M-4 118 L24 50 Q32 40 40 50 L74 118Z', '#C98A6A') + Pp('M36 118 Q44 98 56 96 Q66 92 74 100 Q82 104 86 118Z', '#A89080'),
    Pp('M24 50 Q32 40 40 50 L36 52 L33 48 L30 53 L27 49Z', '#FFFFFF') + Pp('M84 66 Q90 60 96 66 L94 68 L90 65 L87 69Z', '#FFFFFF') + Ln('M14 76 Q30 70 48 76 M8 90 Q30 82 56 90 M4 104 Q30 96 64 104', '#E0A878', 2.4) + Ln('M18 66 Q30 62 44 66', '#B06A56', 2)
    + Pp([[46, 97, 6], [52, 95, 8], [60, 93, 7], [67, 95, 6], [74, 99, 5]].map(([x, b, h]) => cardon(x, b, h)).join(' '), '#5E7A4A'));
  F['Salar de Uyuni'] = [{ t: 'hill', x: .55, w: 6, h: .9, c: '#F4F2EE', dz: .3, kind: 'dune' }, { t: 'hill', x: .05, w: 6, h: 1.6, c: [0, 1, .5], dz: .5 }, { t: 'hill', x: 1.0, w: 6, h: 1.4, c: [0, 1, .5], dz: .5 }, { t: 'hill', x: -.2, w: 7, h: 1.1, c: 1, dz: .8 }, { t: 'hill', x: 1.2, w: 7, h: 1, c: 1, dz: .8 }]; }

// ───────── Bariloche: cordillera nevada (Catedral/Tronador), cerros de bosque y el Nahuel Huapi; pinos de papel a los costados ─────────
{ seed(53); const cord = 'M0 118 Q4 80 8 62 L12 48 L20 52 L32 32 L42 44 L52 38 L64 18 L76 36 L86 28 L98 46 L108 40 L112 48 Q117 72 120 118Z';
  const cerro = x => 86 + 10 * Math.cos((x - 30) / 18);
  M.bariloche = cut(Pp(cord, '#A8B8D4') + Pp(`M0 118 L0 ${f1(cerro(0))} ${[...Array(25)].map((_, i) => `L${i * 5} ${f1(cerro(i * 5))}`).join(' ')} L120 118Z`, '#5E8A6A'),
    `<clipPath id="bc"><path d="${cord}"/></clipPath><g clip-path="url(#bc)">` + Pp('M0 0 L120 0 L120 60 L108 50 L100 56 L92 44 L86 40 L78 48 L72 38 L64 34 L56 44 L50 46 L42 52 L36 42 L30 46 L22 60 L14 56 L6 62 L0 64Z', '#FFFFFF')
    + Pp('M64 18 L76 36 L70 60 L62 50Z M32 32 L42 44 L38 62 L30 56Z M86 28 L98 46 L94 64 L84 52Z', '#7F92B4', ' opacity=".45"') + `</g>` + Pp(pinos(-2, 122, cerro, 9, 15, 4.4), '#4E7A5A'));
  F['Bariloche'] = [{ t: 'cut', at: .5, svg: cutS(11, Pp(lamina(108, 117, 6, 114), '#5F8FC8'), brillos(107, 115, '#CFE0F2', 5)), x: .5, s: 11, dz: .12 },
    { t: 'cut', at: .5, svg: (seed(59), cutS(7, Pp(pinos(0, 36, 118, 16, 34, 6.5), '#3E6A50') + Pp(pinos(86, 120, 118, 14, 30, 6.5), '#46745A'))), x: .5, s: 7, dz: .6, ro: 45 },
    { t: 'hill', x: .0, w: 6, h: 2.5, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: 1.0, w: 6, h: 2.3, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: -.15, w: 7, h: 1.8, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: 1.15, w: 7, h: 1.6, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: -.28, w: 6, h: 1.4, c: 3, dz: .9 }, { t: 'hill', x: 1.28, w: 6, h: 1.3, c: 3, dz: .9 }]; }

// ───────── Santorini: Oia sobre la caldera, casitas blancas en cascada, cúpulas azules, campanario y molino ─────────
{ seed(61); const borde = x => x < 6 ? 66 : x < 36 ? 66 - (x - 6) * .2 : Math.min(92, 60 + (x - 36) ** 1.25 * .38), cliff = 'M0 118 Q2 84 6 66 Q20 58 36 60 Q56 62 72 70 Q90 78 104 84 Q114 90 120 118Z';
  let casas = '', det = '';
  for (let r = 0; r < 5; r++) for (let x = 4 + r * 4; x < 104 - r * 2; x += 6 + rnd() * 2.6) { const w = 5 + rnd() * 2.6, h = 4 + rnd() * 2, b = borde(x + w / 2) + 1.5 - r * 4.4 + (r === 4 ? 0 : 0); if ((r === 4 && rnd() < .55) || (r === 3 && rnd() < .25)) continue;
    const c = rnd() < .12 ? '#F2C8A8' : '#FFFFFF'; casas += Rr(f1(x), f1(b - h), f1(w), f1(h + 2.4), c); det += Rr(f1(x + w * .3), f1(b - h * .55), 1.2, 1.6, '#3E6FC0') + Rr(f1(x + w - 1.1), f1(b - h), 1.1, f1(h + 2.4), '#DDE3EE'); }
  for (let k = 0; k < 9; k++) { const x = 36 + k * 7 + rnd() * 3, b = borde(x) + 5 + rnd() * 6; casas += Rr(f1(x), f1(b), 4.6, 3.6, '#FFFFFF'); }
  const cupula = (x, b, r) => Rr(x - r, b, r * 2, 5, '#FFFFFF') + Pp(`M${x - r} ${b} Q${x - r} ${b - r * 1.2} ${x} ${b - r * 1.2} Q${x + r} ${b - r * 1.2} ${x + r} ${b}Z`, '#3E6FC0');
  M.santorini = cut(Pp(cliff, '#A8705A') + casas + cupula(34, 42, 4) + cupula(58, 62, 3.4) + cupula(80, 78, 3) + Rr(48, 34, 5, 12, '#FFFFFF') + Rr(10, 44, 5, 14, '#FFFFFF') + Pp('M9 44 Q12.5 40 16 44Z', '#8A5A3A'),
    `<clipPath id="sc"><path d="${cliff}"/></clipPath><g clip-path="url(#sc)">` + Pp('M0 118 L0 92 L18 88 L30 96 L46 94 L60 104 L76 102 L92 112 L120 110 L120 118Z', '#8A5444') + Pp('M14 70 L22 84 L18 98 L12 86Z M40 74 L48 90 L44 100Z M66 86 L72 98 L68 106Z', '#C48A70') + `</g>` + det
    + archW(49.2, 36, 2.6, 4, '#3E6FC0') + Ln('M50.5 34 V30 M49 31.6 H52', '#8A8590', .7) + Ln('M12.5 42 L6 36 M12.5 42 L19 36 M12.5 42 L12.5 33 M12.5 42 L5 43 M12.5 42 L20 44', '#8A5A3A', .8) + Ln('M34 37.2 V34 M58 57.9 V55', '#F2C14E', .7));
  F['Santorini'] = [{ t: 'hill', x: .0, w: 6, h: 2.2, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: 1.05, w: 6, h: 1.6, c: [2, 3, .5], dz: .45 }, { t: 'hill', x: -.2, w: 6, h: 1.5, c: 3, dz: .9 }, { t: 'hill', x: 1.26, w: 6, h: 1.2, c: 3, dz: .9 }]; }

// ───────── Lhasa (ruta China): Palacio de Potala, Palacio Blanco escalonado y Palacio Rojo con techos dorados, sobre el Marpo Ri ─────────
{ M.lhasa = cut(Pp('M0 118 L8 96 Q30 76 60 72 Q90 76 112 94 L120 118Z', '#B8A07A') + Pp('M6 112 L14 64 L106 64 L114 112Z', '#F6F2EA') + Pp('M28 64 L31 44 L89 44 L92 64Z', '#F6F2EA')
    + Pp('M43 64 L45 28 L75 28 L77 64Z', '#A8403A') + Pp('M49 28 L51 23 L57 23 L59 28Z M61 28 L63 22 L69 22 L71 28Z', '#E2B04A'),
    Rr(45, 28, 30, 3, '#6E2A24') + Rr(31, 44, 58, 2.4, '#8A5A44') + Rr(14, 64, 92, 2.4, '#8A5A44') + win(48, 35, 6, 3, '#4A2A24', 4.4, 8, 2, 3) + win(17, 70, 10, 4, '#4A3A34', 3.4, 9, 1.8, 3) + win(78, 70, 9, 4, '#4A3A34', 3.4, 9, 1.8, 3) + win(34, 49, 3, 2, '#4A3A34', 3.6, 7, 1.8, 2.6) + win(78, 49, 3, 2, '#4A3A34', 3.6, 7, 1.8, 2.6)
    + Rr(48, 70, 24, 38, '#A8403A') + win(51, 74, 5, 4, '#4A2A24', 4, 9, 2, 3) + Ln('M10 110 L30 98 M110 110 L90 98', '#FFFFFF', 1.4) + Ln('M54 21 v2 M66 20 v2', '#F2C14E', .8));
  F['Lhasa'] = lomas(2, 'peak', { ch: .5 }); }

// ───────── Hangzhou (ruta China): Pagoda Leifeng sobre su colina junto al Lago del Oeste ─────────
{ let y = 96, d = '', det = ''; for (let i = 0; i < 5; i++) { const w = 40 - 5 * i, h = 11 - i, cx = 60, R = w / 2 + 5;
    d += Rr(cx - w / 2, y - h, w, h + 1, '#C9583A'); det += win(cx - w / 2 + 2, y - h + 1.6, Math.floor((w - 2) / 5), 1, '#F2C14E', 5, 0, 1.2, h - 2.4) + Rr(cx - w / 2, y - 2.4, w, 2.4, '#8A3A2A');
    y -= h; d += Pp(`M${cx - R} ${y - 2} Q${cx - R + 3} ${y + 1.4} ${cx - w / 2 + 2} ${y + .6} L${cx + w / 2 - 2} ${y + .6} Q${cx + R - 3} ${y + 1.4} ${cx + R} ${y - 2} L${cx + w / 2 - 1} ${y - 5} L${cx - w / 2 + 1} ${y - 5}Z`, '#4A4A58'); y -= 5; }
  M.hangzhou = cut(Pp('M0 118 L0 104 Q30 90 60 92 Q90 88 120 102 L120 118Z', '#7FA88A') + d + Pp(`M53 ${y} L60 ${y - 6} L67 ${y}Z`, '#4A4A58') + Rr(59.2, y - 16, 1.6, 10, '#E2B04A'),
    det + Cc(60, y - 10, 1.6, '#E2B04A') + Cc(60, y - 13, 1.2, '#E2B04A') + (seed(67), Pp(pinos(0, 40, x => 104 - x * .25, 6, 11, 4) + pinos(80, 120, x => 92 + (x - 80) * .25, 6, 11, 4), '#5E8A6A')));
  F['Hangzhou'] = [{ t: 'cut', at: .5, svg: cutS(11, Pp(lamina(108, 117, 4, 116), '#8CC0C8'), brillos(107, 115, '#E0F2F2', 5) + Pp('M34 106 Q40 101 46 106Z', '#F6F2EA')), x: .5, s: 11, dz: .12 },
    { t: 'hill', x: -.12, w: 7, h: 1.7, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: 1.12, w: 7, h: 1.5, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: -.26, w: 6, h: 1.3, c: 3, dz: .9 }, { t: 'hill', x: 1.26, w: 6, h: 1.2, c: 3, dz: .9 }]; }

// ───────── Los que ya gustaban (bocetos tanda 2), sin suelo propio: sólo se integran con FORE ─────────
M.saigon = cutF(0, 
  Rr(38, 58, 44, 52, '#C25A3C') + Pp('M36 60 L60 42 L84 60Z', '#B04E34') + Rr(14, 54, 24, 56, '#C9623F') + Rr(82, 54, 24, 56, '#C9623F')
  + Rr(17, 32, 18, 24, '#C9623F') + Rr(85, 32, 18, 24, '#C9623F') + Pp('M15 33 L26 8 L37 33Z', '#4A4350') + Pp('M83 33 L94 8 L105 33Z', '#4A4350')
  + Rr(25.4, 0, 1.2, 9, '#F2C14E') + Rr(22.5, 2.6, 7, 1.2, '#F2C14E') + Rr(93.4, 0, 1.2, 9, '#F2C14E') + Rr(90.5, 2.6, 7, 1.2, '#F2C14E')
  + Rr(55, 100, 10, 5, '#E8D6B0') + Rr(58, 88, 4, 12, '#FFFFFF') + Cc(60, 86, 2.6, '#FFFFFF'),
  Rr(14, 54, 24, 2.4, '#8E3A26') + Rr(82, 54, 24, 2.4, '#8E3A26') + Rr(38, 70, 44, 2, '#A8442A', ' opacity=".6"') + Rr(38, 84, 44, 2, '#A8442A', ' opacity=".6"')
  + [[19, 38], [27, 38], [87, 38], [95, 38]].map(([x, y]) => archW(x, y, 6, 14, '#3A2A3E')).join('') + win(17, 62, 3, 4, '#F2D8A8', 7, 11, 3.6, 6) + win(85, 62, 3, 4, '#F2D8A8', 7, 11, 3.6, 6)
  + Cc(60, 68, 6.4, '#F2E6C8') + Cc(60, 68, 3.8, '#8EB7C8') + `<path d="M60 61.6 V74.4 M53.6 68 H66.4" stroke="#C9A868" stroke-width="1"/>`
  + `<path d="M50 110 V92 Q50 84 60 84 Q70 84 70 92 V110Z" fill="#5A3426"/>` + `<path d="M40 82 V98 M80 82 V98" stroke="#E8D6B0" stroke-width="2.4"/>`
  + `<path d="M26 8 L26 34 M94 8 L94 34 M20 22 L32 22 M88 22 L100 22" stroke="#6A6070" stroke-width="1"/><path d="M60 42 L84 60 L88 60 L60 46Z" fill="#8E3A26" opacity=".5"/>`
  + `<path d="M16 110 V60 M104 110 V60" stroke="#8E3A26" stroke-width="2" opacity=".4"/>`);
const flag = (x, d) => Rr(x, 62, 1.4, 48, '#8A8590') + Rr(d > 0 ? x + 1.4 : x - 12, 62, 12, 3, '#F2A23A') + Rr(d > 0 ? x + 1.4 : x - 12, 65, 12, 3, '#FFFFFF') + Rr(d > 0 ? x + 1.4 : x - 12, 68, 12, 3, '#3E9A5A');
M.delhi = cutF(0, 
  Rr(28, 36, 64, 60, '#D9A87A') + Rr(32, 28, 56, 9, '#D9A87A') + Rr(42, 21, 36, 8, '#C99A6E') + Pp('M48 21 Q60 10 72 21Z', '#8A5A44') + Rr(21, 96, 78, 6, '#C99A6E') + Rr(13, 102, 94, 8, '#B8895E') + flag(10, 1) + flag(110, -1),
  archW(47, 52, 26, 44, '#F6E4D0') + `<path d="M47 96 V74 A13 13 0 0 1 73 74 V96" stroke="#A8764E" stroke-width="1.6" fill="none"/>` + Rr(28, 36, 64, 2.6, '#B8895E') + Rr(32, 28, 56, 2, '#B8895E') + Rr(42, 21, 36, 1.6, '#A8764E')
  + win(32, 42, 4, 8, '#B8764E', 3.6, 6.6, 2.4, 1.4) + win(78, 42, 4, 8, '#B8764E', 3.6, 6.6, 2.4, 1.4) + `<path d="M28 36 V96 M92 36 V96" stroke="#B8895E" stroke-width="2.4"/><rect x="28" y="36" width="64" height="60" fill="none"/>`
  + `<path d="M13 106 h94" stroke="#A8764E" stroke-width="1" opacity=".6"/><path d="M60 14 L60 18 M55 16 L65 16" stroke="#F2B937" stroke-width="1.4"/>`);
// 27 Jaipur: Hawa Mahal rosa, cinco pisos de fachada de panal y cúpulas
const HW = [[8, 104, 82, 110, '#E48A80'], [14, 92, 66, 82, '#EE9C90'], [24, 72, 52, 66, '#E48A80'], [34, 52, 38, 52, '#EE9C90'], [44, 32, 26, 38, '#E48A80']];
const hdome = (x, y, r) => Pp(`M${x - r} ${y} Q${x - r * 1.05} ${y - r * 1.3} ${x} ${y - r * 2} Q${x + r * 1.05} ${y - r * 1.3} ${x + r} ${y}Z`, '#F6C8BC');
M.hawa = cutF(0, 
  HW.map(([x, w, y0, y1, c]) => Rr(x, y0, w, y1 - y0, c)).join('') + hdome(60, 26, 8) + [38, 82].map(x => hdome(x, 38, 6)).join('') + [28, 92].map(x => hdome(x, 52, 5)).join('') + [19, 101].map(x => hdome(x, 66, 5)).join('') + [13, 107].map(x => hdome(x, 82, 5)).join(''),
  HW.map(([x, w, y0, y1], i) => Rr(x, y0, w, 2.4, '#FFF1E0') + Array.from({ length: Math.floor((w - 4) / 8) }, (_, k) => k).map(k => { const wx = x + 3 + k * 8, h = i ? 8 : 9; return (i === 0 ? [88] : [y0 + 5]).map(wy => archW(wx - .8, wy - .8, 6.4, h + .8, '#FFF1E0') + archW(wx, wy, 4.8, h, '#7A2E34')).join(''); }).join('') + (i === 0 ? Rr(x, 100, w, 1.6, '#FFF1E0') : '')).join('')
  + Array.from({ length: 12 }, (_, k) => archW(12 + k * 8, 100, 4.8, 8, '#7A2E34')).join('')
  + `<path d="M60 18 V22" stroke="#F2B937" stroke-width="1.4"/><path d="M8 82 h104 M14 66 h92 M24 52 h72 M34 38 h52" stroke="#C9645A" stroke-width="1" opacity=".5"/>`);
// 28 Samarcanda: Registán, tres madrasas con pishtaq, cúpulas turquesa acostilladas y minaretes
const rdome = (cx, b, r, h, c) => Pp(`M${cx - r} ${b} Q${cx - r * 1.1} ${b - h * .7} ${cx} ${b - h} Q${cx + r * 1.1} ${b - h * .7} ${cx + r} ${b}Z`, c);
M.registan = cutF(0, 
  Rr(6, 76, 32, 34, '#E2C48A') + Rr(82, 76, 32, 34, '#E2C48A') + Rr(14, 68, 16, 9, '#D6B678') + Rr(90, 68, 16, 9, '#D6B678') + rdome(22, 68, 14, 28, '#3AA5B8') + rdome(98, 68, 14, 28, '#3AA5B8')
  + Rr(38, 34, 44, 76, '#EBD29A') + Rr(3, 44, 9, 66, '#E6CC92') + Rr(108, 44, 9, 66, '#E6CC92') + rdome(7.5, 46, 6, 14, '#3AA5B8') + rdome(112.5, 46, 6, 14, '#3AA5B8') + Cc(7.5, 30, 1.6, '#F2C14E') + Cc(112.5, 30, 1.6, '#F2C14E'),
  Rr(38, 34, 44, 6, '#3AA5B8') + Rr(38, 44, 44, 2, '#2F7F96') + Pp('M46 110 V66 Q46 48 60 42 Q74 48 74 66 V110Z', '#2F7F96') + Pp('M50 110 V68 Q50 52 60 46 Q70 52 70 68 V110Z', '#EBD29A')
  + Pp('M54 110 V72 Q54 58 60 52 Q66 58 66 72 V110Z', '#3A6F96') + `<path d="M58 110 V80 Q58 72 60 70 Q62 72 62 80 V110Z" fill="#1E3A5A"/>` + win(41, 52, 1, 6, '#3AA5B8', 0, 8, 3, 3) + win(77, 52, 1, 6, '#3AA5B8', 0, 8, 3, 3)
  + [[22, 82], [98, 82]].map(([x, y]) => `<path d="M${x - 7} 110 V${y + 8} Q${x - 7} ${y - 2} ${x} ${y - 4} Q${x + 7} ${y - 2} ${x + 7} ${y + 8} V110Z" fill="#2F7F96"/>` + `<path d="M${x - 4} 110 V${y + 12} Q${x - 4} ${y + 2} ${x} ${y} Q${x + 4} ${y + 2} ${x + 4} ${y + 12} V110Z" fill="#E2C48A"/>`).join('')
  + [22, 98].map(x => `<path d="M${x} 68 Q${x - 8} 56 ${x} 40 M${x} 68 Q${x + 8} 56 ${x} 40 M${x - 11} 68 Q${x - 14} 58 ${x - 4} 46 M${x + 11} 68 Q${x + 14} 58 ${x + 4} 46" stroke="#7FD0DC" stroke-width="1.2" fill="none"/>`).join('')
  + [7.5, 112.5].map(x => `<path d="M${x - 4.5} 62 h9 M${x - 4.5} 80 h9 M${x - 4.5} 98 h9" stroke="#3AA5B8" stroke-width="3"/>`).join('') + `<path d="M7 46 Q7.5 40 7.5 36 M112 46 Q112.5 40 112.5 36" stroke="#2F7F96" stroke-width="1" />`);
M.luxor = cutF(14, 
  Pp('M5.4 110 L10 34 L38 34 L40.3 110Z', '#D6B070') + Pp('M53.7 110 L56 34 L84 34 L88.6 110Z', '#D6B070') + Rr(38, 44, 18, 66, '#8A6A44')
  + Rr(7, 30, 32, 5, '#E0BE82') + Rr(55, 30, 32, 5, '#E0BE82') + Pp('M42.8 110 L45 30 L48 20 L51 30 L53.2 110Z', '#C9785A') + Rr(16.4, 12, 1.4, 20, '#6B4A2E') + Rr(70.4, 12, 1.4, 20, '#6B4A2E')
  + Pp('M17.8 12 L27 15 L17.8 19Z', '#E8452C') + Pp('M71.8 12 L81 15 L71.8 19Z', '#E8452C'),
  Pp('M45 30 L48 20 L51 30Z', '#F2C14E') + Rr(16, 44, 3, 44, '#9A7A4C') + Rr(27, 44, 3, 44, '#9A7A4C') + Rr(63, 44, 3, 44, '#9A7A4C') + Rr(75, 44, 3, 44, '#9A7A4C')
  + `<path d="M10 44 h28 M12 94 h26 M58 44 h28 M60 94 h26" stroke="#B8905A" stroke-width="1.4"/><path d="M45.6 40 v6 M45.6 52 v6 M50.4 40 v6 M50.4 52 v6 M45.6 66 v6 M50.4 66 v6" stroke="#8A4A30" stroke-width="1.4"/>`
  + Pp('M5.4 110 L10 34 L14 34 L11.5 110Z M84 34 L88.6 110 L83.4 110Z', '#9A7A4C', ' opacity=".4"'));
M.frontenac = cutF(0, 
  Pp('M4 110 L4 88 Q30 82 60 86 Q90 82 116 88 L116 110Z', '#8E8A94') + Rr(14, 56, 92, 32, '#B9694A') + Pp('M10 58 L24 40 L96 40 L110 58Z', '#4FA08A') + Rr(10, 44, 16, 44, '#C9794E') + Rr(94, 44, 16, 44, '#C9794E')
  + Pp('M8 46 L18 16 L28 46Z', '#4FA08A') + Pp('M92 46 L102 16 L112 46Z', '#4FA08A') + Rr(48, 32, 24, 56, '#C9794E') + Pp('M44 34 L60 6 L76 34Z', '#4FA08A') + Rr(59.4, 0, 1.2, 8, '#8A8590')
  + Pp('M28 56 L34 44 L40 56Z M80 56 L86 44 L92 56Z', '#4FA08A') + Rr(4, 84, 112, 6, '#A89A8A'),
  win(13, 52, 2, 4, '#F2D8A8', 6, 9, 3, 5) + win(97, 52, 2, 4, '#F2D8A8', 6, 9, 3, 5) + win(52, 42, 3, 6, '#F2D8A8', 6, 8, 3, 4.6) + win(18, 62, 4, 3, '#F2D8A8', 5.6, 8, 3, 4.6) + win(76, 62, 4, 3, '#F2D8A8', 5.6, 8, 3, 4.6)
  + `<path d="M8 46 L18 16 L18 46Z M92 46 L102 16 L102 46Z M44 34 L60 6 L60 34Z" fill="#3F8070" opacity=".5"/><path d="M10 58 L110 58 M18 24 L18 46 M102 24 L102 46" stroke="#3F8070" stroke-width="1" opacity=".7"/>`
  + `<path d="M4 88 h112" stroke="#8A7A6A" stroke-width="1"/>` + win(6, 85, 14, 1, '#8A7A6A', 8, 0, 3.6, 2) + `<path d="M60 4 L66 6 L60 8Z" fill="#3E5BA9"/><circle cx="60" cy="14" r="2.4" fill="#F6F2EA"/>`);
F['Ho Chi Minh'] = lomas(2, 'dune', { ch: .5 });
F['Delhi'] = lomas(1.9, 'dune', { ch: .45 });
F['Jaipur'] = lomas(1.8, 'dune', { ch: .4 });
F['Samarcanda'] = lomas(1.9, 'dune', { ch: .45 });
F['Quebec'] = lomas(2.1, 'dune', { ch: .55 });
F['Luxor'] = [{ t: 'cut', at: .5, svg: cutS(10, Pp(lamina(108, 117, 6, 114), '#5FB5C9'), brillos(107, 115, '#BFEAF2', 4) + Pp('M76 104.6 L90 104.6 Q88 107 84 107 L80 107 Q77 106.4 76 104.6Z', '#8A5A34') + Pp('M78.6 104 L86 86 L88.6 104Z', '#F8F4EA') + Ln('M78.6 104 L86 86', '#8A6A3E', .7)), x: .62, s: 10, dz: .12 },
  { t: 'cut', at: .5, svg: cutS(9, palma(6, 117, 36, -2, '#9A7A52', '#5E9A4A') + palma(16, 117, 28, 3, '#9A7A52', '#6FAA55') + palma(113, 117, 32, 2, '#9A7A52', '#5E9A4A')), x: .5, s: 9, dz: .3, ro: 45 },
  { t: 'hill', x: -.1, w: 7, h: 1.6, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: 1.1, w: 7, h: 1.4, c: [2, 3, .6], dz: .5 }, { t: 'hill', x: -.24, w: 6, h: 1.3, c: 3, dz: .9 }, { t: 'hill', x: 1.24, w: 6, h: 1.2, c: 3, dz: .9 }];

// ───────── Tabla (mismo orden de campos que TABLA en destinos.js) ─────────
const PAV = '#8D919B', VEREDA = '#6F737D';
const TABLA = [
  ['CATARATAS', 'Iguazú', 'Argentina', M.iguazu, '#E2F2E4', '#B4DCC0', '#86C098', '#6FA85A', '#8DBF6A', '#5F9447', 'dune', 'leaves', 11, ['palmeraTropical', 'helecho', 'farolSelva']],
  ['PAGODA', "Xi'an", 'China', M.xian, '#F2E6CE', '#DDC7A2', '#B89874', '#C9AE80', '#B59A6E', '#9A8058', 'dune', 'sand', 15, ['pino', 'rocaJardin', 'farolPiedra']],
  ['KARST', 'Guilin', 'China', M.guilin, '#E3EFEA', '#B8D4C6', '#7FA88F', '#8FBF78', '#A8C48A', '#7FA46A', 'dune', 'bamboo', 9, ['bambu', 'bambuAlto', 'farolBosque']],
  ['PUERTO', 'Hong Kong', 'China', M.hk, '#E4DCEF', '#B8A8D6', '#7A6AA8', '#8E94B0', PAV, VEREDA, 'dune', 'lanterns', 18.6, ['arbolUrbano', 'taxi', 'farolModerno']],
  ['SELVA', 'Cairns', 'Australia', M.cairns, '#E0F2EC', '#B4DCC4', '#7FBC98', '#E8DDB8', '#EFE6C6', '#DCCDA0', 'dune', 'leaves', 10.5, ['palmeraTropical', 'sombrilla', 'farolTiki']],
  ['LAGO', 'Queenstown', 'Nueva Zelanda', M.queens, '#E6EEF8', '#BCCCE4', '#7F98C4', '#C9B25A', '#B8A878', '#968660', 'peak', 'leaves', 15, ['arbolOtono', 'arbustoNieve', 'farolMontana']],
  ['NILO', 'Luxor', 'Egipto', M.luxor, '#FBE3C4', '#F2C896', '#D69A62', '#D4B98A', '#C9A86A', '#A8884E', 'dune', 'sand', 16.5, ['palmera', 'columna', 'farolDesierto']],
  ['MEDINA', 'Fez', 'Marruecos', M.fez, '#F0E6D6', '#E0C9A8', '#B8946C', '#C9A97A', '#B89A70', '#9A7E58', 'dune', 'sand', 13, ['olivo', 'puesto', 'farolDesierto']],
  ['ERG', 'Merzouga', 'Marruecos', M.merzouga, '#FDE9C4', '#F5C987', '#E39A4E', '#E8B86E', '#D9A056', '#B87E3E', 'dune', 'sand', 8, ['palmera', 'duna', 'farolDesierto']],
  ['LUCES', 'Las Vegas', 'EE.UU.', M.vegas, '#E8DCF4', '#C0A0E0', '#8A64B4', '#C9A888', PAV, VEREDA, 'dune', 'sand', 19, ['palmera', 'neon', 'farolModerno']],
  ['CAÑÓN', 'Gran Cañón', 'EE.UU.', M.canon, '#F4E4D4', '#E8C4A8', '#B08A82', '#B98C64', '#C99A6E', '#A07850', 'peak', 'sand', 10, ['cactus', 'rocaArena', 'farolDesierto']],
  ['LAGO', 'Banff', 'Canadá', M.banff, '#E0F0F2', '#B8D8DC', '#7FA8B4', '#7FAE78', '#8DB07A', '#6A9460', 'peak', 'leaves', 9, ['pinoNevado', 'arbustoNieve', 'farolBosque']],
  ['SALAR', 'Salar de Uyuni', 'Bolivia', M.uyuni, '#EEF2FA', '#DCE4F0', '#B6C4DC', '#F0EDE8', '#E6E2DC', '#C9C4BC', 'peak', 'snow', 13, ['cactus', 'llama', 'farolDesierto']],
  ['LAGO', 'Bariloche', 'Argentina', M.bariloche, '#E4EEF6', '#BCD2E6', '#7F9CC0', '#8FB070', '#B0A488', '#8A7A5C', 'peak', 'leaves', 14, ['pino', 'arbusto', 'farolMontana']],
  ['CALDERA', 'Santorini', 'Grecia', M.santorini, '#E8F0FA', '#D8D0C8', '#B09A90', '#E8C9B4', '#E4DCD0', '#C4B8A8', 'dune', 'leaves', 17.5, ['olivo', 'anfora', 'farolMediterraneo']],
  ['MOTOS', 'Ho Chi Minh', 'Vietnam', M.saigon, '#F8E8D2', '#F0D2B2', '#D8AE90', '#9DBB6A', '#B8AC9C', '#958A7A', 'dune', 'petals', 15, ['palmeraTropical', 'bici', 'farolPapel']],
  ['PUERTA', 'Delhi', 'India', M.delhi, '#F5E4D2', '#E8C8A8', '#C99A7C', '#7FAF5A', '#C9A27A', '#A8845E', 'dune', 'leaves', 16.8, ['arbolUrbano', 'anfora', 'farolPiedra']],
  ['PALACIO ROSA', 'Jaipur', 'India', M.hawa, '#FBE0DA', '#F2BDB0', '#D98F86', '#E3B896', '#D9A48A', '#B8806C', 'dune', 'petals', 9, ['acacia', 'chhatri', 'farolDesierto']],
  ['REGISTÁN', 'Samarcanda', 'Uzbekistán', M.registan, '#E4F0F2', '#C2DDE0', '#8CBCC4', '#D6C096', '#C9B07C', '#A8925E', 'dune', 'sand', 12.5, ['cipres', 'anfora', 'farolDesierto']],
  ['CASTILLO', 'Quebec', 'Canadá', M.frontenac, '#E6ECF4', '#C4D2E4', '#8CA2C4', '#C9A472', '#9A9AA4', '#7E7E8A', 'dune', 'leaves', 16, ['arbolOtono', 'quiosco', 'farolEuropeo']],
  ['PALACIO', 'Lhasa', 'China (Tíbet)', M.lhasa, '#E6F0FA', '#C9D6E8', '#9AA8C4', '#C9B48C', '#C9C2AE', '#A59D86', 'peak', 'snow', 12, ['pino', 'rocaGris', 'farolMontana']],
  ['LAGO', 'Hangzhou', 'China', M.hangzhou, '#E4F0EA', '#C4DCCC', '#8CB49C', '#9FBF7A', '#C9C2AE', '#A59D86', 'dune', 'petals', 16, ['cerezo', 'loto', 'farolPapel']],
];
// Escala / desplazamiento opcionales del monumento (como LM_ESCALA / LM_X de destinos.js)
const LM_ESCALA = { 'Gran Cañón': 1.2, 'Guilin': 1.15, 'Queenstown': 1.15, 'Banff': 1.15, 'Bariloche': 1.15 };
const LM_X = { 'Gran Cañón': -.6 };
const armar = ([name, place, country, art, fog, c1, c2, around, ground, hillColor, ridge, wx, hour, names]) => ({
  name, place, country, art, ground, hill: 'plaza', hillColor, wx, hour, id: 'look', biome: 'borrador', lmScale: LM_ESCALA[place] || 1, lmX: LM_X[place] || 0, fore: F[place] || null, draft: true,
  look: { fog, ground: around, far: [mix(fog, c1, .55), c1, mix(c1, c2, .5), c2], ridge, props: names.map(k => ADORNOS[k]), lamps: names.map(k => /^farol/.test(k)), lights: names.map(k => LUZ[k] || null) } });
export const DRAFT = TABLA.map(armar);
// ?preview=Iguazu / iguazú / Xian / Xi'an / salar-de-uyuni …: sin tildes, mayúsculas ni signos
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const draftDe = q => DRAFT.find(d => norm(d.place) === norm(q) || norm(d.place).startsWith(norm(q)) && norm(q).length > 3) || null;
