// Nilo v2 (vista frontal) — rediseño en lenguaje papel. NO está conectado al juego todavía.
// Mismo lienzo 120×120 y mismo encuadre que NILO (nilo-art.js): se puede reemplazar sin tocar tamaños.
// Cada parte es un recorte de cartulina independiente (cara, gorra, antiparras, bufanda, abrigo, brazos, piernas…)
// con su canto (copia más oscura corrida), facetas planas de luz/sombra recortadas a la forma, grano de cartulina y
// un único borde crema grueso (7) alrededor de la silueta. El recorte irregular se calcula UNA vez por pieza con
// semilla fija: los frames sólo mueven piezas con translate/rotate, así los bordes no tiemblan.
// Uso: import { NILO2 } from './nilo-v2.js'  →  NILO2.idle (36 cuadros, ~9 fps ≈ 4 s) y NILO2.wave (6 cuadros, ~10 fps).
const INK = '#2B2236', CREMA = '#FFF4DC';
const f1 = n => +n.toFixed(1);
const mkr = s => { let a = s >>> 0 || 1; return () => (a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296; };
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
// ── geometría (mismos helpers que runner-papel.js) ──
const cub = (a, b, c, d, n = 7) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; });
const qud = (a, b, c, n = 6) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]; });
function P(d) {
  const t = d.match(/[MLCQZ]|-?[\d.]+/g), pts = []; let i = 0, cur = [0, 0], cmd;
  const num = () => +t[i++];
  while (i < t.length) {
    if (/[MLCQZ]/.test(t[i])) cmd = t[i++];
    if (cmd === 'Z') continue;
    if (cmd === 'M' || cmd === 'L') { cur = [num(), num()]; pts.push(cur); }
    else if (cmd === 'C') { const b = [num(), num()], c = [num(), num()], e = [num(), num()]; pts.push(...cub(cur, b, c, e)); cur = e; }
    else if (cmd === 'Q') { const b = [num(), num()], e = [num(), num()]; pts.push(...qud(cur, b, e)); cur = e; }
  }
  return pts;
}
const E = (cx, cy, rx, ry = rx, n = 26, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const RR = (x, y, w, h, r = 3) => [...[[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]].flatMap(([cx, cy, a]) => [0, 1, 2, 3].map(k => { const q = (a + k * 30) * Math.PI / 180; return [cx + Math.cos(q) * r, cy + Math.sin(q) * r]; }))];
const strip = (x1, y1, x2, y2, w) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]; };
// recorte a tijera: subdivide las aristas y las corre apenas (semilla por pieza → idéntico en todos los frames)
function cutD(pts, seed, j = .6, step = 8) {
  const r = mkr(seed), o = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) { const q = k / n, w = (k ? 1 : .6) * j * 2; o.push([a[0] + (b[0] - a[0]) * q + (r() - .5) * w, a[1] + (b[1] - a[1]) * q + (r() - .5) * w]); }
  });
  return 'M' + o.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// color: mezcla hex
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const dark = (c, t = .18) => { const [r, , b] = hx(c); return mix(c, b > r ? '#1E1640' : '#5A2A18', t); }, light = (c, t = .22) => mix(c, '#FFF1D2', t);

// ── piezas ──
const DEFS = new Map(), CLIPS = new Set();
// piece(id, puntos, color, {sh:[[poligono,color]…], cd:color de canto|false, dx,dy, j, sil:false, gr:false})
function piece(id, pts, fill, o = {}) {
  DEFS.set(id, cutD(pts, hash(id), o.j ?? .55, o.step ?? 8));
  const p = { id, fill, cd: o.cd === false ? null : (o.cd || dark(fill, .3)), dx: o.dx ?? 1.3, dy: o.dy ?? 2, sh: o.sh || [], sil: o.sil !== false, gr: o.gr !== false };
  return (m, ctx) => {
    ctx.used.add(id);
    if (m === 's') return p.sil ? (p.cd ? `<use href="#${id}" x="${p.dx}" y="${p.dy}"/>` : '') + `<use href="#${id}"/>` : '';
    let s = p.cd ? `<use href="#${id}" x="${p.dx}" y="${p.dy}" fill="${p.cd}"/>` : '';
    s += `<use href="#${id}" fill="${p.fill}"/>`;
    if (p.sh.length) { ctx.clips.add(id); s += p.sh.map(([poly, c]) => `<path d="M${poly.map(q => q.join(' ')).join('L')}Z" fill="${c}" clip-path="url(#${id}c)"/>`).join(''); }
    if (p.gr) s += `<use href="#${id}" fill="url(#ngr)"/>`;
    return s;
  };
}
// detalle chico sin canto ni borde (ojos, mejillas, boca…): sólo en la pasada de color
const det = fn => (m, ctx) => m === 's' ? '' : fn(ctx);
const g = (tf, ...ch) => (m, ctx) => `<g transform="${tf}">${ch.map(c => c(m, ctx)).join('')}</g>`;
const grp = (...ch) => (m, ctx) => ch.map(c => c(m, ctx)).join('');
const tr = (x, y) => `translate(${f1(x)} ${f1(y)})`;
const rot = (a, x = 0, y = 0) => `rotate(${f1(a)} ${x} ${y})`;
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

// paleta (los hex base son los de NILO original, para que recolorNilo siga funcionando en lo principal)
const C = { coat: '#3E5BA9', scarf: '#E8452C', cap: '#A9794D', skin: '#F6D2B0', boot: '#8A5A3B', pants: '#2B2440', gold: '#EFC76A', glass: '#BFE3F5', strap: '#C98F55', hand: '#E2B987', yel: '#F2B937' };

// ───────── cola de la bufanda (2 tramos articulados, detrás del cuerpo) ─────────
const tail1 = piece('tail1', P('M-2 -4 C4 -6.2 9 -2.4 15 -4 L15.5 4.2 C9 6 4 2.4 -2 4.2Z'), C.scarf, { sh: [[[[-3, 1.8], [18, -1.2], [18, 9], [-3, 9]], dark(C.scarf, .16)]], j: .5 });
const tail2 = piece('tail2', P('M-1 -4 C5 -5.8 10 -2.4 15 -4.2 L20 -5.6 L16.6 0 L20 5.4 L15 4.4 C10 6 5 2.6 -1 4Z'), C.scarf, { sh: [[[[-2, 1.6], [22, -1], [22, 9], [-2, 9]], dark(C.scarf, .16)], [[[6.2, -9], [8.8, -9], [8.8, 9], [6.2, 9]], dark(C.scarf, .26)]], j: .5 });

// ───────── piernas ─────────
const legL = piece('legL', RR(44.2, 74, 12, 27, 5), C.pants, { sh: [[[[44, 74], [48.6, 74], [48.6, 102], [44, 102]], light(C.pants, .12)]], cd: dark(C.pants, .35) });
const legR = piece('legR', RR(63.8, 74, 12, 27, 5), C.pants, { sh: [[[[63.8, 74], [68.4, 74], [68.4, 102], [63.8, 102]], light(C.pants, .12)]], cd: dark(C.pants, .35) });
const bootP = (id, x) => grp(
  piece(id, P(`M${x} 109.6 L${x} 103 Q${x} 96.6 ${x + 6.4} 96.6 L${x + 11} 96.6 Q${x + 18} 96.6 ${x + 18} 103.6 L${x + 18} 109.6Z`), C.boot, { sh: [[[[x + 10, 95], [x + 19, 95], [x + 19, 111], [x + 10, 111]], dark(C.boot, .16)]], dx: 1, dy: 1.6 }),
  piece(id + 's', P(`M${x - .6} 107.6 L${x + 18.6} 107.6 L${x + 18.2} 111.2 L${x - .2} 111.2Z`), '#E9C08A', { cd: dark('#E9C08A', .3), dx: .5, dy: .9, j: .3, gr: false }));

// ───────── torso ─────────
const coat = piece('coat', P('M40 56.4 Q60 52 80 56.4 L83.4 82 Q83.4 85 81.4 86 Q60 90.6 38.6 86 Q36.6 85 36.6 82Z'), C.coat, {
  sh: [[[[60, 52], [90, 52], [90, 92], [64, 92]], dark(C.coat, .12)], [[[30, 52], [46, 52], [38, 92], [30, 92]], light(C.coat, .1)]], dx: 1.4, dy: 2.2, j: .5 });
const hem = piece('hem', P('M36.9 79.6 Q60 85 83.1 79.6 L83.4 82 Q83.4 85 81.4 86 Q60 90.6 38.6 86 Q36.6 85 36.6 82Z'), dark(C.coat, .22), { cd: false, sil: false, j: .35 });
const placket = piece('placket', R(58.2, 62, 3.8, 25), dark(C.coat, .26), { cd: false, sil: false, j: .25, gr: false });
const btn = (y) => piece('btn' + y, E(60.1, y, 1.9, 1.9, 10), C.yel, { cd: dark(C.yel, .3), dx: .4, dy: .7, sil: false, j: .12, gr: false });
const pocket = (id, x) => piece(id, RR(x, 72, 11, 7.4, 2.4), light(C.coat, .14), { cd: dark(C.coat, .3), dx: .6, dy: 1.2, sil: false, j: .3, gr: false, sh: [[[[x, 77], [x + 12, 76], [x + 12, 80], [x, 80]], dark(C.coat, .06)]] });
const strapL = piece('strapL', strip(47.4, 55, 48.4, 80, 4.8), C.strap, { cd: dark(C.strap, .3), dx: .7, dy: 1.2, sil: false, j: .3, gr: false, sh: [[[[48, 52], [51, 52], [51, 82], [48, 82]], dark(C.strap, .14)]] });
const strapR = piece('strapR', strip(72.6, 55, 71.6, 80, 4.8), C.strap, { cd: dark(C.strap, .3), dx: .7, dy: 1.2, sil: false, j: .3, gr: false, sh: [[[[73, 52], [76, 52], [76, 82], [73, 82]], dark(C.strap, .14)]] });
const buckle = (id, x, y) => piece(id, RR(x, y, 5.8, 4.8, 1.2), C.yel, { cd: dark(C.yel, .32), dx: .5, dy: .8, sil: false, j: .2, gr: false });

// ───────── brazos (coordenadas locales: el origen es la articulación, apuntan hacia abajo) ─────────
const armPieces = (k) => ({
  up: piece('up' + k, RR(-5.2, -5.2, 10.4, 17, 5.2), C.coat, { sh: [[[[1.6, -6], [6, -6], [6, 13], [1.6, 13]], dark(C.coat, .14)]], dx: 1.1, dy: 1.8, j: .45 }),
  fore: grp(
    piece('fo' + k, RR(-4.8, -4.8, 9.6, 14.6, 4.8), C.coat, { sh: [[[[1.4, -6], [6, -6], [6, 11], [1.4, 11]], dark(C.coat, .14)]], dx: 1.1, dy: 1.8, j: .4 }),
    piece('cuff' + k, RR(-5.2, 5.2, 10.4, 4.2, 1.8), light(C.coat, .3), { cd: dark(C.coat, .2), dx: .6, dy: 1, j: .3, gr: false, sil: false }),
    piece('hd' + k, E(0, 12.6, 5.9, 5.9, 18), C.hand, { sh: [[[[1.2, 5], [8, 5], [8, 19], [-2, 19]], dark(C.hand, .1)]], dx: 1, dy: 1.6, j: .3 }),
    piece('th' + k, E(k ? -5 : 5, 11.4, 2, 2.5, 10), C.hand, { dx: .6, dy: 1, j: .2, gr: false }))
});
const armL = armPieces(0), armR = armPieces(1);
// brazo: hombro (x,y), ángulo del brazo, ángulo del antebrazo (relativo), largo del brazo
const arm = (A, sx, sy, a, b) => g(`${tr(sx, sy)} ${rot(a)}`, A.up, g(`${tr(0, 10.6)} ${rot(b)}`, A.fore));

// ───────── bufanda del cuello ─────────
const wrapB = piece('wrapB', P('M39.6 54 Q60 57.4 80.4 54 L81.4 64.6 Q60 70.6 38.6 64.6Z'), dark(C.scarf, .2), { dx: 1.2, dy: 1.8, j: .45 });
const wrapF = piece('wrapF', P('M39.4 57.4 Q60 63.8 80.6 57.4 L81 63.6 Q60 70.4 39 63.6Z'), C.scarf, {
  sh: [[[[61, 52], [90, 52], [90, 76], [57, 76]], dark(C.scarf, .1)]], dx: 1.1, dy: 1.7, j: .4 });
const pleat = (id, pts) => piece(id, pts, light(C.scarf, .1), { dx: .8, dy: 1.3, sil: false, j: .3, gr: false, sh: [[[[0, 60], [200, 60], [200, 120], [0, 120]], dark(C.scarf, .0)]].slice(0, 0) });
const pleat1 = pleat('pl1', P('M41 58.4 Q47 61.6 52.6 62.2 L50.6 67.4 Q45 66.6 41.2 63.6Z'));
const pleat2 = pleat('pl2', P('M66 62.2 Q73 61.4 79 58.6 L79.2 63.6 Q74 67 66.6 67.4Z'));
const endF = piece('endF', P('M-5.2 0 L5.2 0 L5.8 17.5 L2.2 15 L-.6 19.4 L-5.2 16Z'), C.scarf, { sh: [[[[0, -1], [8, -1], [8, 24], [-1, 24]], dark(C.scarf, .14)]], dx: 1.1, dy: 1.8, j: .4 });
const endStripe = piece('endSt', R(-8, 8.4, 16, 2), dark(C.scarf, .26), { cd: false, sil: false, gr: false, j: .15 });

// ───────── cabeza ─────────
const flap = (id, x, d) => grp(
  piece(id, P(`M${x} 40 Q${x} 35.6 ${x + 5.3} 35.6 Q${x + 10.6} 35.6 ${x + 10.6} 40 L${x + 10.6} 54 Q${x + 10.6} 58.6 ${x + 5.3} 58.6 Q${x} 58.6 ${x} 54Z`), C.cap, { sh: [[[[x + (d > 0 ? 3 : 7), 34], [x + 13, 34], [x + 13, 62], [x + (d > 0 ? 3 : 7), 62]], dark(C.cap, .13)]], dx: 1, dy: 1.6, j: .45 }),
  piece(id + 'f', P(`M${x} 52.4 Q${x + 2.6} 50.4 ${x + 5.3} 52.4 Q${x + 8} 50.4 ${x + 10.6} 52.4 L${x + 10.6} 54 Q${x + 10.6} 58.6 ${x + 5.3} 58.6 Q${x} 58.6 ${x} 54Z`), '#EBD7AA', { cd: false, sil: false, j: .3, gr: false }));
const flapL = flap('flapL', 36.2, 1), flapR = flap('flapR', 73.2, -1);
const face = piece('face', E(60, 38.6, 18.5, 17.9, 34), C.skin, { sh: [[[[70, 24], [82, 24], [82, 60], [60, 60]], dark(C.skin, .07)]], dx: 1.2, dy: 1.9, j: .5 });
const crv = (a, c, b) => qud(a, c, b, 10);
const dome = piece('dome', [...P('M39.2 43 C37.6 27 47 19.4 60 19.4 C73 19.4 82.4 27 80.8 43'), ...qud([80.8, 43], [60, 30.6], [39.2, 43], 10)], C.cap, {
  sh: [[[[22, 33.5], ...crv([34, 33.5], [60, 20.5], [86, 33.5]), [98, 33.5], [98, 38.2], ...crv([86, 38.2], [60, 25.2], [34, 38.2]), [22, 38.2]], '#3A2F55'],
       [[[66, 14], [90, 14], [90, 50], [74, 50]], dark(C.cap, .12)]], dx: 1.2, dy: 1.9, j: .5 });
const lens = (id, cx, cy) => grp(
  piece(id + 'r', E(cx, cy, 8.5, 8.5, 22), C.gold, { sh: [[[[cx + 1, cy - 10], [cx + 10, cy - 10], [cx + 10, cy + 10], [cx - 5, cy + 10]], dark(C.gold, .1)]], dx: 1, dy: 1.6, j: .3 }),
  piece(id + 'w', E(cx - .5, cy - .5, 5.9, 5.9, 18), dark('#9DB9C6', .08), { cd: false, sil: false, j: .2, gr: false }),
  piece(id + 'l', E(cx, cy, 5.4, 5.4, 18), C.glass, { cd: false, sil: false, j: .2, gr: false, sh: [[[[cx - 6, cy + 1.4], [cx + 6, cy - 3.2], [cx + 6, cy + 6], [cx - 6, cy + 6]], dark(C.glass, .1)]] }));
const bridge = piece('bridge', RR(55.4, 24.4, 9.2, 4.4, 1.6), C.gold, { dx: .6, dy: 1, sil: false, j: .2, gr: false });

// ───────── cara: ojos / boca (detalles planos, sin brillos) ─────────
const eye = (x, y, st) => st === 2 ? `<path d="M${x - 4} ${y + 1.8} Q${x} ${y + 4.8} ${x + 4} ${y + 1.8} Q${x} ${y + 3.3} ${x - 4} ${y + 1.8}Z" fill="${INK}"/>`
  : st === 1 ? `<ellipse cx="${x}" cy="${y + 1.8}" rx="4.1" ry="2.5" fill="${INK}"/>`
  : `<ellipse cx="${x}" cy="${y}" rx="4.1" ry="5.1" fill="${INK}"/><ellipse cx="${x + 1.4}" cy="${y - 1.9}" rx="1.4" ry="1.7" fill="#FFF8EA"/>`;
const feats = (o) => det(() => {
  let s = `<ellipse cx="45.2" cy="49.8" rx="3.9" ry="2.4" fill="#EE9A8E"/><ellipse cx="74.8" cy="49.8" rx="3.9" ry="2.4" fill="#EE9A8E"/>`;
  s += eye(52, 44, o.blink) + eye(68, 44, o.blink);
  s += o.mouth === 'open'
    ? `<path d="M55.8 49.8 Q60 50.8 64.2 49.8 Q63.8 54.8 60 55 Q56.2 54.8 55.8 49.8Z" fill="${INK}"/><path d="M57.8 53.4 Q60 52 62.2 53.4 Q61 55 60 55 Q59 55 57.8 53.4Z" fill="#E97F73"/>`
    : `<path d="M55.4 49.6 Q60 55 64.6 49.6 Q60 52.2 55.4 49.6Z" fill="${INK}"/>`;
  return s;
});

// ───────── escena ─────────
// o: br (respiración 0..1), sway (°), look (-1..1), tilt (°), blink (0/1/2), t1 t2 te (°, bufanda), aL/bL/aR/bR (brazos), up (brazo derecho sobre la cabeza), gy (antiparras), mouth
function scene(o) {
  const ty = -o.br * 1.0, hy = -o.br * 1.25 + (o.hop || 0), look = o.look || 0;
  const tailG = g(`${tr(71, 61 + ty)} ${rot(-6 + o.t1)}`, tail1, g(`${tr(14.6, 0)} ${rot(2 + o.t2)}`, tail2));
  const legs = grp(legL, legR, bootP('bootL', 42.4), bootP('bootR', 61.6));
  const torso = g(tr(0, ty), coat, hem, placket, btn(67), btn(75), pocket('pkL', 42), pocket('pkR', 67), strapL, strapR, buckle('bkL', 45.4, 66), buckle('bkR', 68.8, 66));
  const aL = g(tr(0, ty * .8 + (o.armLag || 0)), arm(armL, 40.8, 60.6, o.aL, o.bL));
  const aR = g(tr(0, ty * .8 + (o.armLag || 0)), arm(armR, 79.2, 60.6, o.aR, o.bR));
  const head = g(`${tr(look * 1.3 + (o.hx || 0), hy - (o.lookY || 0) * .6)} ${rot((o.tilt || 0) + look * 2.2, 60, 58)}`,
    flapL, flapR, face,
    g(tr(look * 2.1, -(o.lookY || 0) * 1.5), feats(o)),
    dome,
    g(tr(0, o.gy || 0), bridge, lens('gl', 50.4, 27.4), lens('gr', 69.6, 27.4)));
  const wrapBk = g(tr(0, ty), wrapB), wrap = g(tr(0, ty), wrapF, pleat1, pleat2);
  const endg = g(`${tr(50, 63 + ty)} ${rot(o.te)}`, endF, endStripe);
  const sw = (n) => g(rot(o.sway, 60, 108), ...n);
  return sw([tailG, legs, torso, wrapBk, ...(o.up ? [head, aL, aR] : [aL, aR, head]), wrap, endg]);
}
const GR = (() => { const r = mkr(5); let s = ''; for (let i = 0; i < 9; i++) s += `<circle cx="${f1(r() * 24)}" cy="${f1(r() * 24)}" r="${f1(.4 + r() * .4)}" fill="${i % 3 ? '#6A3F16' : '#FFFFFF'}" opacity="${i % 3 ? .09 : .12}"/>`; return s; })();
const cache = new Map(); let FID = 0;
function frame(o) {
  const key = JSON.stringify(o); if (cache.has(key)) return cache.get(key);
  const ctx = { used: new Set(), clips: new Set() }, tree = scene(o);
  const sil = tree('s', ctx), col = tree('c', ctx);
  const defs = [...ctx.used].map(id => `<path id="${id}" d="${DEFS.get(id)}"/>`).join('') + [...ctx.clips].map(id => `<clipPath id="${id}c"><use href="#${id}"/></clipPath>`).join('');
  let svg = `<svg viewBox="0 0 120 120"><defs><pattern id="ngr" width="24" height="24" patternUnits="userSpaceOnUse">${GR}</pattern>${defs}</defs><g fill="${CREMA}" stroke="${CREMA}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${sil}</g>${col}</svg>`;
  const k = ++FID; svg = svg.replace(/(id="|href="#|url\(#)/g, `$1n${k}_`);
  cache.set(key, svg); return svg;
}

// ───────── animación ─────────
const REST = { aL: 12, bL: 5, aR: -12, bR: -5 };
const lerp = (a, b, t) => a + (b - a) * t;
const kf = (pts, f) => { for (let i = 0; i < pts.length - 1; i++) { const [f0, v0] = pts[i], [f1_, v1] = pts[i + 1]; if (f >= f0 && f <= f1_) { const t = (f - f0) / (f1_ - f0 || 1); return lerp(v0, v1, t * t * (3 - 2 * t)); } } return pts[pts.length - 1][1]; };
const q = (v, s = .1) => Math.round(v / s) * s;
const N = 27, TAU = Math.PI * 2;
// BASE: respiración muy sutil (torso ~0,8 px), bufanda que se mece y un vaivén mínimo. 27 cuadros a ~9 fps ≈ 3 s, loop limpio.
const baseOpts = ph => { const a = (ph % N) / N * TAU; return { br: q((.5 - .5 * Math.cos(a)) * .8, .2), sway: q(.5 * Math.sin(a), .1), t1: q(2.6 * Math.sin(a + .6), .5), t2: q(6 * Math.sin(2 * a + 1.5), .5), te: q(1.6 * Math.sin(a - .5), .5),
  aL: q(REST.aL + .5 * Math.sin(a + .4), .5), bL: REST.bL, aR: REST.aR, bR: REST.bR, mouth: 'smile', armLag: q(.3 * Math.sin(a - .6), .1), blink: 0, look: 0, lookY: 0, tilt: 0, up: false, gy: 0 }; };
// at(fase, {lx: -1..1 (de a .25), ly: 0..1 (de a .5), blink: 0|1|2}): cabeza girada / parpadeo sobre la MISMA fase de respiración (sin saltos)
const at = (ph, o = {}) => frame({ ...baseOpts(ph), look: q(o.lx || 0, .25), lookY: q(o.ly || 0, .5), blink: o.blink || 0 });
export const idleBase = Array.from({ length: N }, (_, i) => at(i));
// idle compatible (tienda / selección / álbum): el loop base con un parpadeo
export const idle = idleBase.map((f, i) => i === 20 || i === 22 ? at(i, { blink: 1 }) : i === 21 ? at(i, { blink: 2 }) : f);
// Clips de acción: arrancan en la fase de respiración en que se disparan (frame(k, fase))
const FIX = 20;
const fixHat = (k, ph) => { const raise = kf([[0, 0], [4, 1], [14, 1], [18, 0], [19, 0]], k), o = baseOpts(ph + k);
  return frame({ ...o, tilt: q(-1.2 * raise, .1), aL: q(lerp(o.aL, 10, raise), .5), aR: q(lerp(REST.aR, -158, raise), .5), bR: q(lerp(REST.bR, -38, raise), .5), up: raise > .2, gy: k >= 7 && k <= 9 ? -1 : 0, blink: k === 12 ? 1 : 0 }); };
const LOOK = 24;
const lookAround = (k, ph) => frame({ ...baseOpts(ph + k), look: q(kf([[0, 0], [2, -.75], [3, -1], [8, -1], [10, 0], [11, 0], [13, .75], [14, 1], [19, 1], [22, 0], [23, 0]], k), .25), blink: k === 11 ? 2 : 0 });
export const clips = { fixHat: { len: FIX, frame: fixHat }, lookAround: { len: LOOK, frame: lookAround } };
// wave: 6 cuadros @ ~10 fps, loop de saludo (brazo derecho en alto, antebrazo oscilando, boca abierta, rebotecito)
export const wave = Array.from({ length: 6 }, (_, f) => {
  const ph = f / 6 * TAU;
  return frame({
    br: [0, .5, 1, .5, 0, .5][f] * .8, sway: q(1.2 * Math.sin(ph), .1), look: .5, tilt: 2.4, blink: f === 4 ? 1 : 0, hop: f % 3 === 2 ? -.8 : 0,
    t1: q(4 * Math.sin(ph), .5), t2: q(10 * Math.sin(ph + 1.2), .5), te: q(2.4 * Math.sin(ph - .4), .5),
    aL: 11, bL: 5, aR: -118, bR: q(-52 + 20 * Math.cos(ph), .5), up: true, gy: 0, mouth: 'open'
  });
});
// ───────── vista de espaldas (corrida) ─────────
const rGT = (id, cx) => grp(
  piece(id + 'g', E(cx, 22.6, 6.9, 6.9, 18), C.gold, { sh: [[[[cx + 1, 14], [cx + 9, 14], [cx + 9, 30], [cx - 4, 30]], dark(C.gold, .1)]], dx: 1, dy: 1.5, j: .3 }),
  piece(id + 'l', E(cx, 21.8, 3.2, 3.2, 12), C.glass, { cd: false, sil: false, j: .15, gr: false }));
const rgL = rGT('rgl', 50.4), rgR = rGT('rgr', 69.6);
const bandPts = [[18, 40.4], ...crv([30, 40.4], [60, 46.6], [90, 40.4]), [102, 40.4], [102, 46], ...crv([90, 46], [60, 52.2], [30, 46]), [18, 46]];
const rdome = piece('rdome', E(60, 38.6, 19, 19.4, 38), C.cap, {
  // la correa de las antiparras va al final: rodea el casco de lado a lado, continua; el lado derecho en su tono de sombra
  sh: [[[[68, 14], [92, 14], [92, 62], [73, 62]], dark(C.cap, .12)], [[[58.8, 12], [61.4, 12], [61.4, 41], [58.8, 41]], dark(C.cap, .3)], [bandPts, '#3A2F55'], [bandPts.filter(p => p[0] > 66), '#2E2548']], dx: 1.2, dy: 1.9, j: .5 });
const rbuck = piece('rbuck', RR(56.4, 40.6, 7.2, 7.6, 1.8), C.yel, { cd: dark(C.yel, .32), dx: .5, dy: .9, sil: false, j: .2, gr: false });
const rbuck2 = piece('rbuck2', RR(59, 43, 2.4, 3.4, 1), dark(C.yel, .45), { cd: false, sil: false, j: .1, gr: false });
const rwrap = piece('rwrap', P('M38.6 55.4 Q60 60.4 81.4 55.4 L82.4 63 Q60 69.6 37.6 63Z'), C.scarf, { sh: [[[[61, 50], [90, 50], [90, 78], [58, 76]], dark(C.scarf, .1)], [[[36, 61], [84, 61], [84, 76], [36, 76]], dark(C.scarf, .08)]], dx: 1.1, dy: 1.7, j: .4 });
// mochila: cuerpo, tapa con hebilla, correas y bolsa de dormir
const pack = piece('pack', RR(44.4, 57, 31.2, 26, 8), C.strap, { sh: [[[[62, 55], [80, 55], [80, 86], [62, 86]], dark(C.strap, .12)]], dx: 1.2, dy: 1.8, j: .45 });
const packFlap = piece('pkf', P('M44.4 65 Q44.4 57 52.4 57 L67.6 57 Q75.6 57 75.6 65 L75.6 68 Q60 74 44.4 68Z'), light(C.strap, .14), { cd: dark(C.strap, .3), dx: .7, dy: 1.3, j: .4, gr: false, sh: [[[[62, 54], [80, 54], [80, 78], [58, 78]], dark(C.strap, .04)]] });
const packBuck = piece('pkb', RR(56.6, 65, 6.8, 8.6, 2), C.yel, { cd: dark(C.yel, .32), dx: .5, dy: .8, sil: false, j: .2, gr: false });
const packStr = (id, x) => piece(id, R(x, 70, 3.8, 14), dark(C.strap, .32), { cd: false, sil: false, j: .25, gr: false });
const roll = piece('roll', RR(40.4, 80.6, 39.2, 9.6, 4.8), '#5DB84F', { sh: [[[[38, 85.6], [82, 85.6], [82, 92], [38, 92]], '#3A8A30']], dx: 1.1, dy: 1.7, j: .4 });
const rollS = (id, x) => piece(id, R(x, 79.6, 3.8, 11.4), dark(C.strap, .12), { cd: false, sil: false, j: .2, gr: false });
// piernas (origen = cadera, apuntan hacia abajo)
const rLeg = k => piece('rleg' + k, RR(-6, -4, 12, 23, 5), C.pants, { sh: [[[[-6, -5], [-2, -5], [-2, 20], [-6, 20]], light(C.pants, .12)]], cd: dark(C.pants, .35), dx: 1.1, dy: 1.7 });
const rBoot = k => grp(
  piece('rbt' + k, P('M-9 25.6 L-9 19.2 Q-9 12.6 -2.6 12.6 L2.6 12.6 Q9 12.6 9 19.2 L9 25.6Z'), C.boot, { sh: [[[[1, 11], [10, 11], [10, 27], [1, 27]], dark(C.boot, .16)]], dx: 1, dy: 1.6 }),
  piece('rbs' + k, P('M-9.6 23.6 L9.6 23.6 L9.2 27.2 L-9.2 27.2Z'), '#E9C08A', { cd: dark('#E9C08A', .3), dx: .5, dy: .9, j: .3, gr: false }));
const rSole = k => grp(
  piece('rsb' + k, E(0, 20, 8.4, 9.2, 22), C.boot, { dx: 1, dy: 1.5, j: .3 }),
  piece('rsl' + k, E(0, 20, 6.8, 7.6, 20), '#E9C08A', { cd: false, sil: false, j: .25, gr: false, sh: [[R(-8, 14.2, 16, 1.6), '#9E6B3C'], [R(-8, 17.6, 16, 1.6), '#9E6B3C'], [R(-8, 21, 16, 1.6), '#9E6B3C'], [R(-8, 24.4, 16, 1.6), '#9E6B3C']] }));
const rL = [rLeg(0), rBoot(0), rSole(0)], rR = [rLeg(1), rBoot(1), rSole(1)];
const rTB1 = piece('rtb1', P('M-2 -3.4 C4 -5.4 9 -2 14 -3.4 L14.4 3.6 C9 5.2 4 2 -2 3.6Z'), dark(C.scarf, .2), { j: .45 });
const rTB2 = piece('rtb2', P('M-1 -3.4 C5 -5 9 -2 13 -3.6 L17 -4.6 L14 0 L17 4.6 L13 3.8 C9 5.2 5 2.2 -1 3.4Z'), dark(C.scarf, .2), { j: .45 });
const rleg = (parts, hx, y, a, sole) => g(`${tr(hx, y)} ${rot(a)}`, parts[0], sole ? parts[2] : parts[1]);
// ciclo de 8 cuadros (contacto, bajada, paso, subida) de espaldas: cada pierna con su elevación y avance; los brazos van flexionados (~90°) y alternan con las piernas
const LEGF = [1, .6, 0, -.5, -1, -.6, 0, .6], LEGL = [0, 0, .1, .35, .55, 1, .9, .25];
// pierna: avance (fw) y elevación (lf) por cuadro; la que sube dobla y muestra la suela; la apoyada baja y se abre un poco
const legPose = (parts, hx, f, bob, out) => { const fw = LEGF[f], lf = LEGL[f]; return rleg(parts, hx + out * -1.2 * lf + out * Math.max(0, fw) * .6, 83.6 + bob * .6 - lf * 9 + Math.max(0, fw) * 1.4, out * (1 + 8 * lf + 5 * Math.max(0, -fw) + 3 * Math.max(0, fw)), lf > .5); };
// brazos de ESPALDAS (referencia sprite 8 direcciones): pegados al torso y casi ocultos; el que va atrás asoma apenas el codo/antebrazo junto al cuerpo. u: 0 = adelante, 1 = atrás
const armRun = (A, side, sx, y, u) => g(tr(0, y), arm(A, sx, 60.6, side * (3 + 13 * u), -side * (34 - 28 * u)));
function runScene(o) {
  const f = o.f, bob = -o.b * 3.5, by = bob - 3, hy = by * .85 + 1.6, c = Math.cos(f / 8 * TAU);
  const tailU = g(`${tr(75, 60 + by)} ${rot(-12 + o.t1)}`, tail1, g(`${tr(14.6, 0)} ${rot(2 + o.t2)}`, tail2));
  const tailD = g(`${tr(74, 63 + by)} ${rot(7 + o.t3)}`, rTB1, g(`${tr(13.6, 0)} ${rot(3 + o.t2 * .6)}`, rTB2));
  const legA = legPose(rL, 50.6, f, bob, 1), legB = legPose(rR, 69.4, (f + 4) % 8, bob, -1);
  const body = g(`${tr(0, by)} ${rot(o.roll, 60, 84)}`, coat, hem, pack, packFlap, packBuck, packStr('ps1', 49.4), packStr('ps2', 66.8), roll, rollS('rs1', 49.4), rollS('rs2', 66.8));
  const uL = .5 + .5 * c, uR = .5 - .5 * c, aL = armRun(armL, 1, 40.8 + o.roll * .4, by, uL), aR = armRun(armR, -1, 79.2 + o.roll * .4, by, uR);
  const head = g(`${tr(0, hy)} ${rot(o.tilt, 60, 58)}`, flapL, flapR, rgL, rgR, rdome, rbuck, rbuck2);
  const wrap = g(tr(0, by), rwrap);
  return g(rot(o.sway, 60, 108), tailD, tailU, legA, legB, aL, aR, body, wrap, head);
}
function runFrame(o) {
  const key = 'run' + JSON.stringify(o); if (cache.has(key)) return cache.get(key);
  const ctx = { used: new Set(), clips: new Set() }, tree = runScene(o);
  const sil = tree('s', ctx), col = tree('c', ctx);
  const defs = [...ctx.used].map(id => `<path id="${id}" d="${DEFS.get(id)}"/>`).join('') + [...ctx.clips].map(id => `<clipPath id="${id}c"><use href="#${id}"/></clipPath>`).join('');
  let svg = `<svg viewBox="0 0 120 120"><defs><pattern id="ngr" width="24" height="24" patternUnits="userSpaceOnUse">${GR}</pattern>${defs}</defs><g fill="${CREMA}" stroke="${CREMA}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${sil}</g>${col}</svg>`;
  const k = ++FID; svg = svg.replace(/(id="|href="#|url\(#)/g, `$1n${k}_`);
  cache.set(key, svg); return svg;
}
// run: 8 cuadros @ 16 fps (0,5 s por ciclo). Brazos flexionados alternados con las piernas, rebote leve, bufanda hacia atrás.
export const run = Array.from({ length: 8 }, (_, f) => {
  const ph = f / 8 * TAU, e = t => t * t * (3 - 2 * t);
  return runFrame({ f, b: [.15, 0, .55, 1, .15, 0, .55, 1][f], roll: q(-2.2 * Math.cos(ph), .1), sway: q(.4 * Math.sin(ph), .1), tilt: q(1 * Math.cos(ph), .1),
    t1: q(6 * Math.sin(ph + .5), .5), t2: q(9 * Math.sin(2 * ph + 1), .5), t3: q(7 * Math.sin(ph + 2.4), .5) });
});
export const runFps = 16;
export const NILO2 = { idle, idleBase, at, clips, wave, run, runFps };
