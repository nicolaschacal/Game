// Monumentos del fondo en estilo papel (cartulina recortada con borde crema, capas con canto, facetas de luz planas, grano barato).
// Mismo viewBox 120×120 y apoyo en el suelo (y≈110) que los de destinos.js, que los usa pisando su versión anterior (L.<id>).
import { P as parse, E, RR, R, strip, L, LS, disc, paperAll, seed } from './runner-papel.js';

const arcPts = (cx, w, top, bot, n = 10) => [[cx - w / 2, bot], [cx - w / 2, top + w / 2], ...Array.from({ length: n - 1 }, (_, i) => { const a = Math.PI + (i + 1) / n * Math.PI; return [cx + Math.cos(a) * w / 2, top + w / 2 + Math.sin(a) * w / 2]; }), [cx + w / 2, top + w / 2], [cx + w / 2, bot]];
// bloque con cara clara a la izquierda y sombra a la derecha (luz plana de papel)
const box = (x, y, w, h, body, lite, shade, under, o = {}) => L(R(x, y, w, h), body, under, { dx: 1.2, dy: 1.6, j: .4, ...o }) + L(R(x, y, w * .34, h), lite, null, { j: .25 }) + L(R(x + w * .72, y, w * .28, h), shade, null, { j: .25 });
const dots = (list, r = 1.5) => list.map(([x, y, c]) => disc(x, y, r, c, null, { n: 8, j: .1 })).join('');

// ── Wat Arun (Bangkok): prang central y cuatro menores sobre una base ──
const prang = (cx, top, hw, c) => {
  const bot = 104, h = bot - top, y1 = top + h * .5, y2 = top + h * .22;
  const tier = (yb, yt, wb, wt) => [[cx - wb, yb], [cx - wt, yt], [cx + wt, yt], [cx + wb, yb]];
  const body = tier(bot, y1, hw, hw * .78), mid = tier(y1, y2, hw * .74, hw * .5);
  const crown = [[cx - hw * .5, y2], [cx - hw * .42, y2 - h * .06], [cx - hw * .22, top + h * .06], [cx, top], [cx + hw * .22, top + h * .06], [cx + hw * .42, y2 - h * .06], [cx + hw * .5, y2]];
  const half = (pts, side) => pts.filter(([x]) => side < 0 ? x <= cx + .01 : x >= cx - .01);
  return L(strip(cx, top + 2, cx, top - 8, 1.6), c.metal, null, { j: .1 })
    + L(body, c.body, c.canto, { dx: 1.2, dy: 1.6, j: .4 }) + L(tier(bot, y1, hw, hw * .78).map(([x, y]) => [x < cx ? x : cx, y]), c.lite, null, { j: .25 })
    + L(mid, c.body, c.canto, { dx: 1, dy: 1.3, j: .4 }) + L(tier(y1, y2, hw * .74, hw * .5).map(([x, y]) => [x < cx ? x : cx, y]), c.lite, null, { j: .25 })
    + L(crown, c.body, c.canto, { dx: 1, dy: 1.2, j: .4 }) + L(crown.map(([x, y]) => [Math.min(x, cx), y]), c.lite, null, { j: .2 })
    + L(R(cx - hw * .8, y1 - 2, hw * 1.6, 3.6), c.band, null, { j: .2 }) + L(R(cx - hw * .56, y2 - 1.5, hw * 1.12, 3), c.band, null, { j: .2 })
    + dots([[cx - hw * .4, bot - 8, c.d1], [cx + hw * .3, bot - 12, c.d2], [cx, bot - h * .3, c.d1], [cx - hw * .18, y1 - h * .12, c.d2], [cx + hw * .2, y1 - h * .1, c.d1]], Math.max(1.1, hw * .1));
};
export const watarun = (() => {
  seed(3100);
  const c = { body: '#EADFC4', lite: '#FBF5E4', canto: '#9A7048', band: '#B8754A', metal: '#8A6A44', d1: '#D6453A', d2: '#2F9C94' };
  return paperAll(
    box(2, 100, 116, 10, '#CBB790', '#E4D5AE', '#A18B62', '#7A6644', { dy: 1.2 })
    + [[22, 62, 9], [98, 62, 9], [40, 46, 10], [80, 46, 10]].map(([x, t, w]) => prang(x, t, w, c)).join('')
    + prang(60, 14, 15, { ...c, body: '#F1E7CE' }));
})();

// ── Torres Petronas (Kuala Lumpur): dos torres escalonadas con puente ──
const torre = (cx, c) => {
  const tiers = [[110, 70, 14], [70, 52, 12], [52, 38, 10], [38, 26, 7.8], [26, 14, 5.4]];
  let s = '';
  tiers.forEach(([yb, yt, hw]) => { s += L(R(cx - hw, yt, hw * 2, yb - yt), c.body, c.canto, { dx: 1.2, dy: 1.4, j: .3 }) + L(R(cx - hw, yt, hw * .7, yb - yt), c.lite, null, { j: .2 }) + L(R(cx + hw * .45, yt, hw * .55, yb - yt), c.shade, null, { j: .2 }); });
  const bands = []; for (let y = 104; y > 20; y -= 6) bands.push(strip(cx - 12, y, cx + 12, y, 1));
  return s + LS(tiers.flatMap(([yb, yt, hw]) => { const o = []; for (let y = yb - 5; y > yt + 2; y -= 6) o.push(R(cx - hw + 1.5, y, hw * 2 - 3, 1.3)); return o; }), c.line, null, { j: .1 })
    + L([[cx - 4, 14], [cx - 2, 8], [cx, 2], [cx + 2, 8], [cx + 4, 14]], c.metal, null, { j: .15 });
};
export const petronas = (() => {
  seed(3200);
  const c = { body: '#8EA6C2', lite: '#C2D4E6', shade: '#5C7596', canto: '#3F5878', line: '#E6EEF6', metal: '#D5DCE5' };
  return paperAll(
    box(6, 74, 16, 36, '#6F819C', '#96A8C0', '#4F6280', '#33445C') + box(98, 66, 14, 44, '#6F819C', '#96A8C0', '#4F6280', '#33445C')
    + L(R(22, 96, 76, 14), '#6F819C', '#33445C', { dx: 1, dy: 1.4 })
    + torre(42, c) + torre(78, c)
    + L(R(50, 56, 20, 6), '#B7C5D8', '#4F6280', { dx: .6, dy: 1.2, j: .25 }) + LS([strip(52, 62, 60, 68, 2), strip(68, 62, 60, 68, 2)], '#8EA6C2', null, { j: .1 }));
})();

// ── Taj Mahal (Agra): cúpula bulbosa, iwán, cuatro minaretes y chhatris ──
const minarete = x => L(R(x - 3.4, 46, 6.8, 50), '#F6EFE2', '#9C8CBA', { dx: 1, dy: 1.2, j: .3 }) + L(R(x + .6, 46, 2.8, 50), '#CDBFE0', null, { j: .2 }) + L(R(x - 4.6, 66, 9.2, 3), '#E4D8C8', null, { j: .15 }) + L(R(x - 4.6, 52, 9.2, 3), '#E4D8C8', null, { j: .15 })
  + L(R(x - 4.8, 42, 9.6, 5), '#EDE2D2', '#9C8CBA', { dx: .6, dy: 1, j: .25 }) + L(parse(`M${x - 3.8} 42 Q${x} 30 ${x + 3.8} 42Z`), '#F6EFE2', '#9C8CBA', { dx: .6, dy: 1, j: .2 });
export const taj = (() => {
  seed(3300);
  const dome = parse('M44 60 C36 54 36 42 44 34 C50 28 56 24 60 16 C64 24 70 28 76 34 C84 42 84 54 76 60Z');
  return paperAll(
    L(R(8, 96, 104, 14), '#EADFCF', '#A8987E', { dx: 1, dy: 1.4, j: .4 })
    + minarete(14) + minarete(106)
    + L(R(30, 60, 60, 38), '#F6EFE2', '#9C8CBA', { dx: 1.4, dy: 1.8, j: .4 }) + L(R(30, 60, 20, 38), '#FFFFFF', null, { j: .2 }) + L(R(72, 60, 18, 38), '#D4C7E4', null, { j: .2 })
    + L(parse('M54 98 L54 76 Q60 64 66 76 L66 98Z'), '#6E5C9E', '#4A3C78', { dx: -.8, dy: 1, j: .25 })
    + LS([arcPts(40, 9, 74, 94, 8), arcPts(80, 9, 74, 94, 8)], '#8E7CBA', null, { j: .2 })
    + LS([E(38, 56, 7, 7, 14), E(82, 56, 7, 7, 14)], '#F6EFE2', '#9C8CBA', { dx: .8, dy: 1.2, j: .25 }) + L(R(34, 58, 8, 4), '#EDE2D2', null, { j: .15 })
    + L(R(46, 56, 28, 6), '#EDE2D2', '#9C8CBA', { dx: .8, dy: 1.2, j: .25 })
    + L(dome, '#FBF7EE', '#9C8CBA', { dx: 1.4, dy: 1.6, j: .35 }) + L(parse('M44 60 C36 54 36 42 44 34 C50 28 56 24 60 16 L60 60Z'), '#FFFFFF', null, { j: .25 }) + L(parse('M60 16 C64 24 70 28 76 34 C84 42 84 54 76 60 L66 60 C74 48 68 30 60 16Z'), '#D4C7E4', null, { j: .25 })
    + L(strip(60, 16, 60, 4, 2), '#D9A92E', null, { j: .12 }) + disc(60, 9, 2.2, '#D9A92E', null, { n: 8, j: .1 }));
})();

// ── Burj Khalifa (Dubái): tres alas en Y y aguja escalonada, lo más alto del dibujo ──
export const burj = (() => {
  seed(3400);
  const tiers = [[110, 84, 12.5], [84, 66, 10.5], [66, 52, 8.8], [52, 40, 7.2], [40, 29, 5.8], [29, 19, 4.4], [19, 10, 3]];
  const c = { body: '#5F8EC4', lite: '#A6CDEE', shade: '#35588C', canto: '#233E6A' };
  let t = ''; tiers.forEach(([yb, yt, hw], i) => { const ox = (i % 2 ? 1 : -1) * .8; t += L(R(60 - hw + ox, yt, hw * 2, yb - yt), c.body, c.canto, { dx: 1.2, dy: 1.2, j: .25 }) + L(R(60 - hw + ox, yt, hw * .7, yb - yt), c.lite, null, { j: .15 }) + L(R(60 + hw * .45 + ox, yt, hw * .55, yb - yt), c.shade, null, { j: .15 }); });
  return paperAll(
    box(8, 74, 16, 36, '#C9AA72', '#E4CC98', '#9C8050', '#7A6238') + box(24, 88, 11, 22, '#B8996A', '#D8C08E', '#8C7248', '#6A5430') + box(86, 80, 12, 30, '#B8996A', '#D8C08E', '#8C7248', '#6A5430') + box(98, 64, 14, 46, '#C9AA72', '#E4CC98', '#9C8050', '#7A6238')
    + L(parse('M60 88 L36 108 L44 110 L60 98 L76 110 L84 108Z'), '#47709F', '#233E6A', { dx: 1, dy: 1.2, j: .3 })
    + t + LS(tiers.flatMap(([yb, yt, hw]) => { const o = []; for (let y = yb - 5; y > yt + 2; y -= 5) o.push(R(60 - hw + 1.5, y, hw * 2 - 3, 1)); return o; }), '#D6E8F8', null, { j: .1 })
    + L([[58.4, 10], [59.4, 1], [60.6, 1], [61.6, 10]], '#D5DCE5', '#8E9BAA', { dx: .5, dy: .8, j: .1 }));
})();

// ── Puerta de Alcalá (Madrid): cinco vanos, columnas y ático con escultura ──
export const alcala = (() => {
  seed(3500);
  const stone = '#D9CFB8', lite = '#F1EAD8', shade = '#A89E86', dark = '#3C4A63';
  const vanos = [[60, 18, 54], [36, 13, 66], [84, 13, 66], [17, 10.5, 74], [103, 10.5, 74]];
  return paperAll(
    L(R(44, 30, 32, 14), stone, shade, { dx: 1, dy: 1.4, j: .3 }) + L(R(44, 30, 11, 14), lite, null, { j: .2 }) + L(parse('M40 30 L60 14 L80 30Z'), '#CDBFA0', shade, { dx: 1, dy: 1.4, j: .3 }) + L(parse('M60 14 L80 30 L66 30Z'), '#A8997A', null, { j: .2 })
    + LS([E(51, 26, 3.4, 3.4, 8), E(69, 26, 3.4, 3.4, 8)], '#8C7A5A', null, { j: .1 }) + L(R(56, 18, 8, 12), '#B5A582', null, { j: .15 }) + disc(60, 12, 3, '#8C7A5A', null, { n: 8, j: .1 })
    + L(R(8, 46, 104, 64), stone, shade, { dx: 1.4, dy: 1.6, j: .5 }) + L(R(8, 46, 30, 64), lite, null, { j: .3 }) + L(R(88, 46, 24, 64), '#C3B89E', null, { j: .3 })
    + L(R(4, 40, 112, 8), '#E6DDC6', shade, { dx: 1, dy: 1.4, j: .3 }) + L(R(6, 50, 108, 3), shade, null, { j: .15 })
    + vanos.map(([x, w, top]) => L(arcPts(x, w + 6, top - 3, 110, 10), '#EFE7D2', shade, { dx: .6, dy: 1, j: .25 }) + L(arcPts(x, w, top, 110, 10), dark, null, { j: .2 }) + L(arcPts(x - 1, w * .55, top + 5, 110, 8), '#56668A', null, { j: .15 })).join('')
    + LS([R(46, 54, 3.6, 56), R(70.4, 54, 3.6, 56), R(22.6, 70, 3, 40), R(94.4, 70, 3, 40)].map(r => r), '#EDE5D0', '#A89E86', { dx: .6, dy: 1, j: .2 })
    + L(R(0, 106, 120, 4), '#B8AC90', null, { j: .3 }));
})();
export const MON = { watarun, petronas, taj, burj, alcala };
