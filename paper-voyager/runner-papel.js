// Objetos de la pista en "estilo papel": piezas de cartulina recortada a tijera (bordes levemente irregulares),
// capas apiladas con un canto más oscuro desplazado, grano de cartulina barato (patrón de motitas) y SIN brillos,
// reflejos ni contornos de tinta. Misma paleta y lenguaje que el bloque gpapel de index.html.
// Lienzo 120×120 como siempre; mismos nombres y encuadre que el arte anterior.
const INK = '#2B2236';
let SD = 11;                                              // semilla corrida: el recorte es estable entre cargas
const mk = s => { let a = s >>> 0 || 1; return () => (a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296; };
const f1 = n => +n.toFixed(1);
// ── geometría: todo se reduce a listas de puntos ──
const cub = (a, b, c, d, n = 7) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; });
const qud = (a, b, c, n = 6) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]; });
// path absoluto (M L C Q Z) -> puntos
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
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// tira de papel entre dos puntos (grosor w)
const strip = (x1, y1, x2, y2, w) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; return [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]; };
const sh = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
// bordes de espuma / nube: hilera de bultos sobre una base plana
const bumps = (x0, y0, n, w, h, base = 5) => [[x0, y0 + h + base], [x0, y0 + h], ...Array.from({ length: n }, (_, i) => E(x0 + w * i + w / 2, y0 + h, w / 2, h, 8, Math.PI).slice(1, 8)).flat(), [x0 + n * w, y0 + h], [x0 + n * w, y0 + h + base]];
// ── recorte a tijera: subdivide las aristas y las desplaza apenas ──
function cutD(pts, j = .7, step = 9) {
  const r = mk(SD += 7), o = [];
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) { const q = k / n; o.push([a[0] + (b[0] - a[0]) * q + (r() - .5) * 2 * j * (k ? 1 : .6), a[1] + (b[1] - a[1]) * q + (r() - .5) * 2 * j * (k ? 1 : .6)]); }
  });
  return 'M' + o.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// capa de papel: opcionalmente con su canto (misma forma, más oscura y corrida hacia abajo-derecha)
const L = (pts, fill, under, o = {}) => {
  const j = o.j ?? .7, u = under ? `<path d="${cutD(sh(pts, o.dx ?? 1.5, o.dy ?? 2.2), j)}" fill="${under}"/>` : '';
  return u + `<path d="${cutD(pts, j)}" fill="${fill}"/>`;
};
// varias formas del mismo color: primero todos los cantos y después todos los cuerpos (se lee como una sola pieza)
const LS = (list, fill, under, o = {}) => (under ? list.map(p => `<path d="${cutD(sh(p, o.dx ?? 1.5, o.dy ?? 2.2), o.j ?? .7)}" fill="${under}"/>`).join('') : '') + list.map(p => `<path d="${cutD(p, o.j ?? .7)}" fill="${fill}"/>`).join('');
const disc = (cx, cy, r, fill, under, o = {}) => L(E(cx, cy, r, o.ry ?? r, o.n ?? 24), fill, under, { j: o.j ?? Math.min(.6, r * .05), ...o });
// ── grano de cartulina barato: un patrón de motitas (sin filtros) recortado a la silueta principal ──
const speck = (() => { const r = mk(5); let s = ''; for (let i = 0; i < 18; i++) s += `<circle cx="${f1(r() * 24)}" cy="${f1(r() * 24)}" r="${f1(.45 + r() * .5)}" fill="${i % 3 ? '#6A3F16' : '#FFFFFF'}" opacity="${i % 3 ? .13 : .16}"/>`; return s; })();
let UID = 0;
const paper = (layers, grainOf = []) => {
  const id = 'pp' + (++UID);
  const clip = grainOf.length ? `<clipPath id="${id}c">${grainOf.map(p => `<path d="${cutD(p, .4)}"/>`).join('')}</clipPath>` : '';
  const g = grainOf.length ? `<rect width="120" height="120" fill="url(#${id})" clip-path="url(#${id}c)"/>` : '';
  return `<svg viewBox="0 0 120 120"><defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse">${speck}</pattern>${clip}</defs>${layers}${g}</svg>`;
};
// ojitos de papel (sin brillo)
const eyes = (xs, y, rx = 4.2, ry = 5.4) => xs.map(x => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${INK}"/>`).join('');
const cheeks = (xs, y) => xs.map(x => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="#EE9A8E"/>`).join('');
const smile = (x, y, w = 10) => L(P(`M${x} ${y} Q${x + w / 2} ${y + 5} ${x + w} ${y} Q${x + w / 2} ${y + 2.4} ${x} ${y}Z`), INK, null, { j: .15 });
const nails = (list, c = '#5E3E22', r = 2.3) => list.map(([x, y]) => disc(x, y, r, c, null, { n: 8, j: .15 })).join('');

// ── Moneda mon: disco recortado, aro en relieve y agujero cuadrado ──
const coinBody = E(60, 64, 30, 29.4, 28);
export const COIN = paper(
  L(coinBody, '#F2B937', '#B8741A', { dx: 1.8, dy: 2.6, j: .5 })
  + L(E(59.4, 63.4, 22.5, 22, 24), '#E3A62C', '#FBD36A', { dx: -.9, dy: -1, j: .4 })        // aro: capa más oscura con borde de luz de papel
  + L(E(60.2, 64.2, 20.2, 19.8, 24), '#F6C447', null, { j: .4 })                            // cara
  + L(R(49.6, 53.6, 20, 20), '#8A4F1A', '#E8B04A', { dx: 1.4, dy: 1.6, j: .35 })            // agujero cuadrado: hueco oscuro
  + L(R(52.4, 56.6, 14.6, 14.2), '#B9771F', null, { j: .3 }),                               // fondo del hueco (capa de abajo)
  [coinBody]);
export const PEARL = (() => {
  const lip = P('M18 82 Q60 112 102 82 Q98 104 60 108 Q22 104 18 82Z'), top = P('M16 80 C20 44 44 26 60 26 C76 26 100 44 104 80 Q60 96 16 80Z');
  const ribs = [[60, 30, 60, 64], [41, 36, 50, 68], [79, 36, 70, 68], [27, 54, 41, 73], [93, 54, 79, 73]].map(([a, b, c, d]) => strip(a, b, c, d, 3.4));
  return paper(L(lip, '#F29BB8', '#B85F82', { j: .6 }) + L(top, '#FFC4D6', '#D97A9C', { j: .7 })
    + LS(ribs, '#F4A9C0', null, { j: .3 })
    + disc(60, 78, 17.5, '#FDFBFF', '#B9B0D6', { dx: 1.6, dy: 2.2 }) + disc(58.5, 76.5, 10.5, '#EFE9F8', null, { j: .3 }),
    [top, lip]);
})();
export const STAR = (() => { const s = P('M60 14 L73 44 L106 48 L81 70 L88 102 L60 86 L32 102 L39 70 L14 48 L47 44Z');
  return paper(L(s, '#F2B937', '#B8741A') + L(P('M60 86 L88 102 L81 70 L106 48 L84 60 L76 82Z'), '#D99A25', null) + L(P('M60 14 L73 44 L60 52 L47 44Z'), '#F8CC55', null, { j: .3 }), [s]); })();

// ── Obstáculos de tierra ──
export const ROCK = (() => {
  const b = P('M14 108 L20 66 L42 38 L72 44 L98 72 L104 108Z');
  return paper(L(b, '#858B91', '#575E66', { dx: 1.6, dy: 1.6, j: .9, })
    + L(P('M16 108 L18 97 L60 102 L102 97 L104 108Z'), '#656C74', null, { j: .5 })
    + L(P('M24 70 L42 44 L53 72 L37 89Z'), '#A9B0B4', '#6E757C', { dx: 1.2, dy: 1.6 })
    + L(P('M60 52 L73 55 L91 78 L68 72Z'), '#6F767E', '#4F565E', { dx: 1.2, dy: 1.4 }), [b]);
})();
export const STUMP = (() => {
  const trunk = P('M26 108 L29 100 L30 90 L30 62 L60 56 L90 62 L90 90 L91 100 L96 108 Q60 116 26 108Z'), top = E(60, 62, 30, 11, 30);
  return paper(L(trunk, '#C98F55', '#8A5A2E', { dx: 1.2, dy: 1.6 })
    + L(P('M74 66 L90 62 L90 90 L91 100 L96 108 L84 111 L74 112Z'), '#AE7843', null, { j: .5 })
    + LS([strip(40, 74, 40, 96, 2.8), strip(52, 78, 52, 106, 2.8), strip(63, 77, 63, 92, 2.8), strip(81, 76, 81, 100, 2.4)], '#A9743F', null, { j: .25 })
    + L(P('M26 108 L29 101 L30 95 Q60 104 90 95 L91 101 L96 108 Q60 116 26 108Z'), '#9A6637', null, { j: .5 })
    + L(sh(top, 0, 2.6), '#8A5A2E', null, { j: .5 })
    + L(top, '#E9BC82', null, { j: .6 })
    + L(E(59.4, 62, 22, 7.8, 24), '#D6A267', '#F2CD9B', { dx: -.7, dy: -.8, j: .4 })
    + L(E(58.8, 62, 14.5, 5, 20), '#E9BC82', null, { j: .3 })
    + L(E(58.2, 62, 7.2, 2.5, 14), '#C28B52', null, { j: .2 }), [trunk, top]);
})();

// ── Obstáculos de mar ──
const foam = () => LS([bumps(9, 98, 2, 16, 8, 4), bumps(77, 98, 2, 16, 8, 4)], '#FBFDFE', '#B9D2DD', { dx: .8, dy: 1.4, j: .45 });
export const REEF = (() => {
  const b = P('M16 106 L24 70 L44 46 L70 52 L94 76 L102 106Z');
  return paper(L(b, '#6F7F8C', '#46535E', { dx: 1.6, dy: 1.6, j: .9 })
    + L(P('M27 75 L44 51 L54 76 L38 89Z'), '#A1B3BE', '#5E6E7A', { dx: 1.2, dy: 1.6 })
    + L(P('M61 59 L72 61 L88 82 L66 76Z'), '#5A6976', '#3E4A55', { dx: 1.2, dy: 1.4 })
    + disc(34, 94, 4.4, '#E8452C', '#A82A18', { n: 12 }) + disc(84, 91, 3.4, '#F2B937', '#B8741A', { n: 12 }) + foam(), [b]);
})();
export const FIN = (() => {
  const b = P('M28 106 C36 70 56 38 82 22 C76 52 84 82 98 106Z');
  return paper(L(b, '#5F7A8C', '#3A5160', { dx: 1.6, dy: 1.2 })
    + L(P('M60 106 C62 80 68 50 82 22 C76 52 84 82 98 106Z'), '#48606F', null, { j: .5 })
    + L(P('M40 84 Q46 87 52 84 L52 86.4 Q46 89.6 40 86.4Z'), '#3A5160', null, { j: .15 }) + foam(), [b]);
})();
export const BARREL = (() => {
  const b = P('M30 104 C24 86 24 70 30 54 L45 50 L60 49 L75 50 L90 54 C96 70 96 86 90 104 Q60 112 30 104Z'), lid = E(60, 54, 30, 9, 28);
  return paper(L(b, '#A9794D', '#6E4A2A', { dx: 1.2, dy: 1.6 })
    + LS([strip(40, 58, 38, 104, 2.4), strip(80, 58, 82, 104, 2.4)], '#94663C', null, { j: .25 })
    + L(P('M26.5 70 L45 75 L60 76 L75 75 L93.5 70 L94 78 L75 83 L60 84 L45 83 L26 78Z'), '#4A4658', '#2B2838', { dx: .6, dy: 1.4, j: .4 })
    + L(P('M28 90 L45 95 L60 96 L75 95 L92 90 L90 98 L75 103 L60 104 L45 103 L30 98Z'), '#4A4658', '#2B2838', { dx: .6, dy: 1.4, j: .4 })
    + L(sh(lid, 0, 2.4), '#A9794D', null, { j: .4 }) + L(lid, '#E2B987', null, { j: .5 })
    + L(E(59.4, 54, 19, 5.2, 20), '#CFA06A', '#F0D2A8', { dx: -.6, dy: -.7, j: .3 }) + foam(), [b, lid]);
})();

// ── Obstáculos de cielo ──
const puff = () => { const ds = [[20, 99, 10], [38, 95, 12.5], [60, 94, 13], [82, 96, 11.5], [100, 100, 9]], base = R(10, 100, 100, 8);
  return LS([...ds.map(([x, y, r]) => E(x, y, r, r, 14)), base], '#FBFAF6', '#BFD0DC', { dx: .8, dy: 1.6, j: .5 }); };
export const PEAK = (() => {
  const b = P('M22 100 L50 24 L60 12 L74 30 L100 100Z');
  return paper(L(b, '#7C8794', '#525C68', { dx: 1.6, dy: 1.4 })
    + L(P('M60 12 L74 30 L100 98 L73 98 L62 56Z'), '#66707C', null, { j: .5 })
    + L(P('M40 52 L50 24 L60 12 L74 30 L82 52 L70 44 L62 56 L52 44Z'), '#F6F8FA', '#A9B6C3', { dx: .9, dy: 1.6 })
    + L(P('M60 12 L74 30 L82 52 L70 44 L62 56 L60 40Z'), '#D3DBE4', null, { j: .3 }) + puff(), [b]);
})();
export const CLOUD = (() => {
  const b = P('M14 92 C2 92 2 72 18 70 C16 50 40 44 50 56 C58 36 90 40 90 62 C108 60 114 84 100 92Z');
  return paper(L(b, '#FBFAF6', '#B9CCDA', { dx: 1.2, dy: 1.8, j: .6 })
    + L(P('M14 92 C6 92 4 84 8 78 L60 86 L108 76 C110 84 106 92 100 92Z'), '#D3E3EE', null, { j: .5 })
    + eyes([46, 68], 72, 3.2, 4.2) + cheeks([38, 76], 79) + smile(53, 79, 8), [b]);
})();
export const STORM = (() => {
  const b = P('M14 78 C2 78 2 58 18 56 C16 36 40 30 50 42 C58 22 90 26 90 48 C108 46 114 70 100 78Z');
  return paper(L(b, '#6B7285', '#42485A', { dx: 1.2, dy: 1.8, j: .6 })
    + L(P('M14 78 C6 78 4 70 8 64 L60 72 L108 62 C110 70 106 78 100 78Z'), '#535A6E', null, { j: .5 })
    + L(P('M58 74 L44 94 L56 94 L48 114 L74 88 L62 88 L70 74Z'), '#F2B937', '#B8741A', { dx: 1.4, dy: 1.8, j: .4 })
    + L(strip(36, 53, 49, 57, 3.2), INK, null, { j: .1 }) + L(strip(82, 53, 69, 57, 3.2), INK, null, { j: .1 }) + eyes([47, 71], 62, 3.2, 3.8), [b]);
})();

// ── Obstáculos de vía ──
export const BARRIER = (() => {
  const bar1 = RR(10, 44, 100, 22, 5), bar2 = RR(10, 76, 100, 14, 5);
  return paper(LS([R(22, 50, 10, 60), R(88, 50, 10, 60)], '#704332', '#46271C', { dx: 1.2, dy: 1.2, j: .4 })
    + LS([bar1, bar2], '#F6E7C6', '#C2A678', { dx: 1, dy: 1.8, j: .5 })
    + LS([P('M22 44 L38 44 L26 66 L10 66Z'), P('M54 44 L70 44 L58 66 L42 66Z'), P('M86 44 L102 44 L90 66 L74 66Z'), P('M30 76 L44 76 L36 90 L22 90Z'), P('M66 76 L80 76 L72 90 L58 90Z')], '#E8452C', null, { j: .3 })
    + disc(60, 34, 8.5, '#F2B937', '#B8741A', { dx: 1.2, dy: 1.6 }) + disc(59.4, 33.4, 4.6, '#F8CC55', null, { n: 12, j: .2 }), [bar1, bar2]);
})();
export const CRATE = (() => {
  const front = RR(22, 46, 66, 62, 2), topf = P('M22 46 L34 34 L100 34 L88 46Z'), side = P('M88 46 L100 34 L100 96 L88 108Z');
  return paper(L(side, '#9E6B3C', '#6E4A2A', { dx: 1, dy: 1.6 })
    + L(topf, '#E9BC82', '#B98A55', { dx: .4, dy: -.2, j: .5 })
    + L(front, '#C98F55', '#7A4F28', { dx: 1.2, dy: 1.6, j: .5 })
    + LS([strip(24, 66, 86, 66, 2), strip(24, 87, 86, 87, 2)], '#B07C45', null, { j: .25 })
    + LS([R(25, 49, 60, 6), R(25, 99, 60, 6), R(25, 49, 6, 56), R(79, 49, 6, 56)], '#A9743F', '#7A4F28', { dx: .5, dy: 1, j: .3 })
    + L(strip(30, 100, 80, 54, 7), '#A9743F', '#7A4F28', { dx: .6, dy: 1.2, j: .3 })
    + nails([[30, 54], [80, 54], [30, 100], [80, 100]]), [front, topf, side]);
})();
export const CART = (() => {
  const body = P('M18 50 L102 50 L92 92 L28 92Z');
  return paper(
    L(P('M34 50 L36 40 L44 36 L52 42 L58 33 L68 34 L72 40 L78 38 L86 50Z'), '#34333B', '#1E1D24', { dx: 1, dy: 1.4, j: .6 })
    + disc(46, 38, 3.2, '#5E5D66', null, { n: 9, j: .2 }) + disc(66, 34, 3.8, '#5E5D66', null, { n: 9, j: .2 })
    + disc(38, 98, 12, '#34333B', '#1E1D24', { dx: .8, dy: 1.4 }) + disc(82, 98, 12, '#34333B', '#1E1D24', { dx: .8, dy: 1.4 })
    + L(body, '#4E6E8E', '#2F465C', { dx: 1.2, dy: 1.6, j: .5 })
    + L(P('M26 84 L94 84 L92 92 L28 92Z'), '#3A546E', null, { j: .4 })
    + L(P('M14 46 L106 46 L104 56 L16 56Z'), '#7FA0BE', '#4F6E8C', { dx: .6, dy: 1.4, j: .4 })
    + disc(38, 98, 5, '#C9CED6', '#8E95A0', { n: 10, dx: .6, dy: .8, j: .15 }) + disc(82, 98, 5, '#C9CED6', '#8E95A0', { n: 10, dx: .6, dy: .8, j: .15 })
    + eyes([48, 72], 68, 4.4, 5.6) + cheeks([39, 76], 76) + smile(55, 76, 10), [body]);
})();

// ── Cámara polaroid (GEM) ──
export const GEM = (() => {
  const front = RR(20, 53, 71, 52, 10), topf = P('M22 55 L33 44 L100 44 L89 55Z'), side = P('M89 55 L100 44 L100 92 L89 103Z'), photo = RR(36, 94, 38, 21, 2);
  return paper(
    L(photo, '#FFFFFF', '#BFB5A0', { dx: 1, dy: 1.4, j: .4 })
    + L(side, '#C2AE88', '#8E7B58', { dx: .8, dy: 1.2, j: .5 })
    + L(topf, '#F7F0DF', '#BCAA84', { dx: .3, dy: -.2, j: .4 })
    + L(RR(42, 40, 26, 15, 5), '#EADFC6', '#B8A67F', { dx: .8, dy: 1.2, j: .35 })
    + L(front, '#EADFC6', '#A8926A', { dx: 1.3, dy: 1.8, j: .5 })
    + L(P('M20 88 L91 88 L91 94 Q91 105 80 105 L31 105 Q20 105 20 94Z'), '#2C2545', null, { j: .4 })
    + L(P('M91 88 L100 79 L100 92 L91 101Z'), '#1B1730', null, { j: .3 })
    + L(R(20, 83, 70, 5), '#E8452C', null, { j: .25 })
    + L(R(40, 105, 30, 7), '#BFE3F5', null, { j: .25 }) + L(R(40, 110, 30, 2.6), '#8FCB6A', null, { j: .2 })
    + L(strip(33, 104, 77, 104, 4), '#1B1730', null, { j: .2 })
    + L(RR(47, 43, 16, 8, 2.5), '#2C2545', null, { j: .25 }) + L(R(49.5, 45, 6, 4), '#BFE3F5', null, { j: .15 })
    + disc(55, 69, 15.5, '#FFF4DC', '#A8926A', { dx: 1, dy: 1.4, j: .35 }) + disc(55, 69, 11, '#2C2545', null, { j: .3 }) + disc(55.6, 69.6, 6.6, '#3E5BA9', '#1F2F66', { dx: -.8, dy: -.8, j: .2 }) + disc(57, 71, 2.6, '#26356F', null, { n: 10, j: .1 })
    + L(RR(26, 59, 11, 8, 2.5), '#2C2545', null, { j: .2 }) + disc(80, 62, 4.2, '#E8452C', '#A82A18', { n: 12, dx: .6, dy: .9, j: .15 })
    + L(strip(95, 58, 95, 80, 2.6), '#A8926A', null, { j: .15 }), [front, topf, side]);
})();

// ── Power-ups de la pista ──
export const DOUBLE = (() => {
  const b = P('M68 12 L30 66 L56 66 L46 108 L90 48 L63 48Z');
  return paper(L(b, '#F2B937', '#B8741A', { dx: 1.6, dy: 2, j: .5 })
    + L(P('M68 12 L30 66 L56 66 L63 48 L62 36Z'), '#F9CF5F', null, { j: .3 })
    + L(P('M63 48 L90 48 L66 80Z'), '#D99A25', null, { j: .3 }), [b]);
})();
export const SHIELD = (() => {
  const b = P('M60 16 L96 28 L94 60 Q90 90 60 106 Q30 90 26 60 L24 28Z'), inner = P('M60 34 L78 40 L77 60 Q74 78 60 88 Q46 78 43 60 L42 40Z');
  return paper(L(b, '#3E5BA9', '#1F3068', { dx: 1.6, dy: 2, j: .6 })
    + L(P('M60 16 L96 28 L94 60 Q90 90 60 106Z'), '#2C4585', null, { j: .5 })
    + L(inner, '#7FA0E0', '#2C4585', { dx: 1, dy: 1.4, j: .4 })
    + L(P('M60 34 L60 88 Q46 78 43 60 L42 40Z'), '#9DB6EA', null, { j: .3 }), [b]);
})();
export const CHEST = (() => {
  const front = R(20, 60, 68, 48), side = P('M88 60 L102 48 L102 96 L88 108Z'), lidF = P('M18 62 L18 42 Q18 36 24 36 L84 36 Q90 36 90 42 L90 62Z'),
    lidT = P('M24 36 L38 24 L98 24 L84 36Z'), lidS = P('M90 62 L90 42 Q90 36 84 36 L98 24 L100 24 Q104 30 104 50Z');
  const star = (x, y, s) => L(P(`M${x} ${y - s} L${x + s * .26} ${y - s * .26} L${x + s} ${y} L${x + s * .26} ${y + s * .26} L${x} ${y + s} L${x - s * .26} ${y + s * .26} L${x - s} ${y} L${x - s * .26} ${y - s * .26}Z`), '#F2B937', '#B8741A', { dx: .6, dy: .8, j: .15 });
  return paper(
    L(side, '#9E6B3C', '#6A4524', { dx: 1, dy: 1.5, j: .5 })
    + L(front, '#C98F55', '#7A4F28', { dx: 1.2, dy: 1.6, j: .5 })
    + L(lidS, '#9E6B3C', null, { j: .4 })
    + L(lidF, '#C98F55', '#7A4F28', { dx: .6, dy: 1.2, j: .5 })
    + L(lidT, '#E9BC82', '#B98A55', { dx: .3, dy: -.3, j: .5 })
    + LS([R(23, 65, 62, 4), R(23, 101, 62, 4), R(23, 65, 4, 40), R(81, 65, 4, 40)], '#A9743F', null, { j: .3 })
    + L(P('M88 59 L102 47 L102 53 L88 65Z'), '#4A2F18', null, { j: .2 })
    + LS([R(30, 36, 9, 72), R(69, 36, 9, 72)], '#F2B937', '#B8741A', { dx: .8, dy: 1.2, j: .35 })
    + LS([P('M30 36 L44 24 L53 24 L39 36Z'), P('M69 36 L83 24 L92 24 L78 36Z')], '#F9CF5F', null, { j: .25 })
    + LS([R(30, 100, 9, 8), R(69, 100, 9, 8)], '#C98A1E', null, { j: .2 })
    + L(R(18, 59, 72, 6), '#5E3E22', null, { j: .25 })
    + L(RR(45, 54, 18, 24, 4), '#F2B937', '#B8741A', { dx: 1, dy: 1.4, j: .3 }) + disc(54, 64, 3.2, '#5E3E22', null, { n: 9, j: .1 }) + L(RR(52.4, 64, 3.2, 8, 1.2), '#5E3E22', null, { j: .1 })
    + nails([[34.5, 44], [73.5, 44], [34.5, 92], [73.5, 92]], '#5E3E22', 1.9)
    + star(108, 17, 8) + star(12, 30, 6), [front, lidF, lidT, side]);
})();
