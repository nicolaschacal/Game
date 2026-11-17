// Adornos de costado de la pista en estilo papel (cartulina recortada, capas con canto, grano barato, borde crema de recorte,
// facetas de luz SIN brillos). Se organizan POR BIOMA: cada destino elige un bioma (campo `biome` en destinos.js) y recibe su
// paleta de adornos reutilizables. Lienzo 120×120, base en y≈110, igual que el arte anterior (misma escala/perspectiva).
//
// Contrato con scene3d.js: cada destino entrega 3 adornos que se reparten en el camino (índice i % 3):
//   slot 0 → tamaño 1.7 (árbol / construcción grande)   slot 1 → tamaño 1.15 (adorno chico)   slot 2 → tamaño 1.9 (farol/luminaria)
// Los faroles llevan una "cabeza de luz" amarilla cálida (#FFD46B / #FFE48A) que es el único amarillo del dibujo: scene3d la usa
// como máscara de emisión de noche (dotMask). Los nombres que empiezan con "farol" se marcan como lámpara.
import { P as parse, E, RR, R, strip, sh, bumps, arc, L, LS, disc, paperAll, seed } from './runner-papel.js';

// ── helpers de forma ──
const lump = (cx, cy, rx, ry, n = 20, ph = 0, k = .09) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, m = 1 + k * Math.sin(a * 3 + ph) + k * .6 * Math.sin(a * 5 + ph * 2); return [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m]; });
const sect = (cx, cy, rx, ry, k0, k1, a0, a1, n = 7) => { const o = [], i = []; for (let q = 0; q <= n; q++) { const a = (a0 + (a1 - a0) * q / n) * Math.PI / 180; o.push([cx + Math.cos(a) * rx * k1, cy + Math.sin(a) * ry * k1]); i.push([cx + Math.cos(a) * rx * k0, cy + Math.sin(a) * ry * k0]); } return [...o, ...i.reverse()]; };
const Pt = (d, fill, under, o) => L(parse(d), fill, under, o);
// luz de la cabeza del farol: único amarillo del dibujo
const HEAD = '#FFD46B', HEAD2 = '#FFE79A', HEADU = '#C98A1E';
const head = (pts, o = {}) => L(pts, HEAD, HEADU, { dx: .8, dy: 1.2, j: .3, ...o });
const headIn = pts => L(pts, HEAD2, null, { j: .2 });

// ── árboles y plantas ──
const copaArbol = (c, c2, c3, trunk = '#8A5F38', trunkD = '#5E3E22', cy = 50) =>
  L(strip(60, 110, 60, cy + 22, 10), trunk, trunkD, { dx: 1, dy: 0, j: .3 }) + L(strip(62, 110, 62, cy + 24, 4), trunkD, null, { j: .2 })
  + L(lump(60, cy, 34, 30, 22, 1), c, c3, { dx: 1.6, dy: 2.4, j: .8 }) + L(lump(48, cy - 12, 15, 13, 14, 2), c2, null, { j: .5 })
  + L(sect(60, cy, 34, 30, .55, .92, 15, 105), c3, null, { j: .5 }) + L(lump(74, cy + 2, 9, 8, 10, 3), c2, null, { j: .3 });
const conifera = (c, c2, c3, snow = false) => {
  const tiers = [[8, 44, 24], [28, 68, 30], [50, 90, 36]];
  return L(strip(60, 110, 60, 78, 10), '#8A5F38', '#5E3E22', { dx: 1, dy: 0, j: .3 })
    + tiers.map(([t, b, w]) => L([[60, t], [60 + w, b], [60 - w, b]], c, c3, { dx: 1.3, dy: 2, j: .7 })
      + L([[60, t], [60 - w * .02, b], [60 - w, b]], c2, null, { j: .5 })
      + (snow ? L([[60, t], [60 + w * .45, t + (b - t) * .45], [60 + w * .15, t + (b - t) * .38], [60 - w * .12, t + (b - t) * .5], [60 - w * .45, t + (b - t) * .45]], '#FBFDFE', '#BFD3E0', { dx: .6, dy: 1.2, j: .4 }) : '')).join('');
};
const arbustoP = (c, c2, c3, dots = []) => L(lump(60, 90, 48, 22, 22, 0, .1), c, c3, { dx: 1.5, dy: 2.2, j: .8 }) + L(sect(60, 92, 48, 22, .3, .9, 190, 270), c2, null, { j: .5 })
  + L(sect(60, 92, 48, 22, .55, .95, 20, 90), c3, null, { j: .5 }) + dots.map(([x, y, r, col]) => disc(x, y, r, col, null, { n: 10, j: .15 })).join('');
const piedra = (c, c2, c3) => { const b = parse('M14 110 L24 74 L46 56 L74 62 L100 84 L106 110Z'); return L(b, c, c3, { dx: 1.6, dy: 1.6, j: .9 }) + L(parse('M26 76 L46 58 L54 82 L38 96Z'), c2, c3, { dx: 1, dy: 1.4 }) + L(parse('M60 66 L74 64 L96 86 L70 80Z'), c3, null, { j: .5 }); };
const palmera = (leaf, leaf2, trunk = '#B98D5A') => {
  const fr = (a, l) => { const r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), x = 64, y = 40, ex = x + c * l, ey = y + s * l, nx = -s * 7, ny = c * 7; return [[x, y], [x + c * l * .5 + nx, y + s * l * .5 + ny], [ex, ey], [x + c * l * .5 - nx, y + s * l * .5 - ny]]; };
  const fronds = [[-170, 44], [-140, 46], [-110, 36], [-70, 36], [-40, 46], [-10, 44], [20, 36], [160, 36]];
  return L(parse('M56 110 L55 80 L58 56 L63 40 L71 42 L67 60 L66 82 L68 110Z'), trunk, '#7A5632', { dx: 1.2, dy: 1, j: .4 })
    + LS(fronds.map(([a, l]) => fr(a, l)), leaf, '#2F5E2F', { dx: 1, dy: 1.6, j: .5 })
    + fronds.filter((_, i) => i % 2 === 0).map(([a, l]) => L(fr(a, l * .75).slice(0, 3), leaf2, null, { j: .3 })).join('')
    + disc(62, 44, 4, '#7A5632', null, { n: 8, j: .15 }) + disc(70, 46, 3.4, '#7A5632', null, { n: 8, j: .15 });
};
const bambuC = (c, c2) => [[34, 18, 10, 92], [56, 6, 11, 104], [79, 26, 9, 84]].map(([x, y, w, h]) => L(RR(x, y, w, h, 3), c, '#4F7A2E', { dx: 1.2, dy: 1.4, j: .3 }) + L(R(x + w * .55, y + 2, w * .4, h - 4), c2, null, { j: .2 }) + [30, 56, 82].map(k => L(R(x - .5, y + k * h / 110, w + 1, 2.4), '#4F7A2E', null, { j: .15 })).join('')).join('')
  + L(parse('M44 40 L66 28 L58 44Z M70 56 L96 42 L80 62Z M44 66 L26 56 L44 78Z'), '#6FAE4A', '#3F6B2A', { dx: .8, dy: 1, j: .3 });
const cactus = () => { const b = parse('M52 110 L52 30 Q52 18 60 18 Q68 18 68 30 L68 110Z'); return L(parse('M52 74 L38 74 Q30 74 30 64 L30 50 Q30 44 35 44 Q40 44 40 50 L40 62 L52 62Z'), '#5E9A4C', '#35682E', { dx: 1, dy: 1.4, j: .4 }) + L(parse('M68 62 L80 62 L80 44 Q80 38 85 38 Q90 38 90 44 L90 58 Q90 68 80 68 L68 68Z'), '#5E9A4C', '#35682E', { dx: 1, dy: 1.4, j: .4 }) + L(b, '#5E9A4C', '#35682E', { dx: 1.4, dy: 1.4, j: .4 }) + L(R(52, 22, 6, 88), '#78B862', null, { j: .3 }) + L(R(63, 26, 5, 84), '#4B8340', null, { j: .3 }) + disc(60, 20, 3.4, '#F29BB8', null, { n: 8, j: .12 }); };
const duna = () => L(parse('M10 110 Q40 62 64 84 Q84 60 110 110Z'), '#DDBF7E', '#B89850', { dx: 1.2, dy: 1.8, j: .8 }) + L(parse('M40 92 Q54 78 64 84 Q56 92 50 108 L22 108Z'), '#EBD49C', null, { j: .5 }) + L(parse('M64 84 Q84 60 110 110 L84 108 Q80 92 64 84Z'), '#CDA95F', null, { j: .5 });
// ── objetos de ciudad ──
const rotulo = (x, y, w, h, c, c2) => L(RR(x, y, w, h, 3), c, c2, { dx: .8, dy: 1.2, j: .3 });
const toldoP = (c1, c2) => LS([R(30, 52, 5, 58), R(85, 52, 5, 58)], '#6B4A2E', '#3E2A18', { j: .3 }) + L(parse('M18 60 L28 30 L92 30 L102 60Z'), c1, '#8E2A18', { dx: 1, dy: 1.6, j: .5 })
  + LS([parse('M36 30 L50 30 L46 60 L32 60Z'), parse('M64 30 L78 30 L80 60 L66 60Z')], c2, null, { j: .3 }) + L(R(36, 72, 48, 6), '#E2B987', '#A9794D', { dx: .5, dy: 1, j: .3 }) + disc(48, 66, 5, '#E8452C', null, { n: 9, j: .12 }) + disc(64, 66, 5, '#F2B937', null, { n: 9, j: .12 }) + disc(78, 66, 4.5, '#5DB84F', null, { n: 9, j: .12 });
const kiosco = (c, c2) => L(R(28, 56, 64, 54), c, '#173A2B', { dx: 1.2, dy: 1.6, j: .4 }) + L(parse('M18 60 L28 36 L92 36 L102 60Z'), c2, '#173A2B', { dx: 1, dy: 1.4, j: .4 }) + L(R(36, 66, 48, 20), '#FFF0D2', '#BFA876', { dx: .6, dy: 1, j: .3 }) + L(R(40, 70, 14, 12), '#F29BB8', null, { j: .2 }) + L(R(60, 70, 18, 12), '#8EC7D8', null, { j: .2 }) + L(R(30, 92, 60, 4), '#F2EBDD', null, { j: .2 });
const coche = c => disc(34, 98, 10, '#34333B', '#1E1D24', { dx: .6, dy: 1, n: 14 }) + disc(88, 98, 10, '#34333B', '#1E1D24', { dx: .6, dy: 1, n: 14 })
  + L(parse('M8 96 L10 80 L36 76 L46 60 L76 60 L86 76 L108 78 L112 96Z'), c, '#1F6E69', { dx: 1.2, dy: 1.6, j: .5 }) + L(parse('M44 64 L74 64 L82 76 L40 76Z'), '#8EC7D8', null, { j: .3 }) + L(parse('M44 64 L56 64 L50 76 L40 76Z'), '#B9E0EC', null, { j: .2 }) + L(R(10, 86, 100, 5), '#2C8C86', null, { j: .3 });

// ── faroles: cada uno con su cabeza de luz clara ──
const baseP = (x, w = 22, c = '#3E3A44', cu = '#1E1D24') => L(R(x - w / 2, 104, w, 6), c, cu, { dx: .6, dy: 1, j: .3 });
const A = {};
A.farola = () => baseP(60) + L(strip(60, 106, 60, 38, 6), '#3E3A44', '#1E1D24', { dx: 1, dy: 0, j: .3 }) + L(R(54, 86, 12, 6), '#4F4A58', null, { j: .2 })
  + L(parse('M44 34 L76 34 L72 26 L48 26Z'), '#3E3A44', '#1E1D24', { dx: .8, dy: 1, j: .3 }) + head(parse('M46 34 L74 34 L70 12 L50 12Z')) + headIn(parse('M50 31 L60 31 L58 15 L52 15Z'))
  + L(parse('M44 12 L60 0 L76 12Z'), '#3E3A44', '#1E1D24', { dx: .8, dy: 1, j: .3 }) + disc(60, 2, 3, '#3E3A44', null, { n: 8, j: .1 });
A.farolEuropeo = A.farola;
A.farolModerno = () => baseP(48, 20, '#5B6270', '#363B46') + L(strip(48, 106, 48, 24, 5), '#6A7280', '#363B46', { dx: 1, dy: 0, j: .3 }) + L(parse('M44 24 Q48 8 74 8 L98 8 L98 16 L74 16 Q56 16 52 28Z'), '#6A7280', '#363B46', { dx: .8, dy: 1.2, j: .4 })
  + head(parse('M70 14 L102 14 L98 24 L74 24Z')) + headIn(parse('M74 16 L90 16 L88 21 L76 21Z'));
A.farolPapel = () => baseP(60, 18, '#6B4A2E', '#3E2A18') + L(strip(60, 106, 60, 10, 5), '#6B4A2E', '#3E2A18', { dx: 1, dy: 0, j: .3 }) + L(R(40, 40, 20, 3), '#6B4A2E', null, { j: .12 }) + L(parse('M58 10 L92 10 L92 17 L58 17Z'), '#6B4A2E', '#3E2A18', { dx: .6, dy: 1, j: .25 })
  + L(strip(86, 17, 86, 22, 2), '#6B4A2E', null, { j: .1 }) + L(R(76, 22, 20, 4), '#2B1D16', null, { j: .15 }) + head(parse('M74 26 Q72 40 76 54 L96 54 Q100 40 98 26Z')) + headIn(parse('M79 30 Q78 40 80 50 L88 50 Q88 38 86 30Z')) + L(R(78, 54, 16, 4), '#2B1D16', null, { j: .15 }) + L(strip(86, 58, 86, 68, 2), '#E8452C', null, { j: .1 });
A.farolRojo = () => baseP(60, 18, '#6B4A2E', '#3E2A18') + L(strip(60, 106, 60, 20, 6), '#6B4A2E', '#3E2A18', { dx: 1, dy: 0, j: .3 }) + L(parse('M60 24 L88 24 L88 30 L60 30Z'), '#6B4A2E', null, { j: .25 })
  + L(parse('M74 34 Q70 50 74 66 L98 66 Q102 50 98 34Z'), '#E8452C', '#9E2A1A', { dx: .9, dy: 1.3, j: .35 }) + head(parse('M79 40 Q77 50 79 61 L93 61 Q95 50 93 40Z')) + headIn(parse('M82 43 Q81 50 82 58 L88 58 Q89 50 88 43Z')) + L(R(76, 30, 20, 6), '#2B1D16', null, { j: .15 }) + L(R(76, 66, 20, 6), '#2B1D16', null, { j: .15 });
A.farolPiedra = () => L(R(50, 90, 20, 20), '#9AA1A6', '#5E656A', { dx: 1, dy: 1.4, j: .4 }) + L(R(54, 68, 12, 24), '#B8BEC0', '#5E656A', { dx: .8, dy: 1.2, j: .3 }) + L(R(40, 58, 40, 12), '#9AA1A6', '#5E656A', { dx: .8, dy: 1.2, j: .4 })
  + head(parse('M44 56 L76 56 L76 38 L44 38Z')) + headIn(parse('M48 52 L60 52 L60 42 L48 42Z')) + L(parse('M32 40 Q60 12 88 40Z'), '#7C8388', '#4E5458', { dx: .8, dy: 1.2, j: .4 }) + disc(60, 12, 4.4, '#9AA1A6', '#5E656A', { n: 10, dx: .5, dy: .8, j: .12 }).slice(0, 0);
A.farolDesierto = () => L(parse('M54 110 L56 60 L64 60 L66 110Z'), '#B5532F', '#7A2D1C', { dx: 1.2, dy: 1, j: .4 }) + L(R(46, 104, 28, 6), '#9E4526', '#6A2C18', { dx: .6, dy: 1, j: .3 }) + L(parse('M42 50 L78 50 L72 64 L48 64Z'), '#8A4524', '#5A2C16', { dx: .8, dy: 1.2, j: .4 })
  + head(parse('M60 6 Q80 30 72 46 L48 46 Q40 30 60 6Z')) + headIn(parse('M60 20 Q70 34 66 44 L54 44 Q50 34 60 20Z')) + L(parse('M60 6 Q66 18 62 28 Q56 18 60 6Z'), '#FFF3C4', null, { j: .1 }).slice(0, 0);
A.farolBosque = () => baseP(60, 22, '#6B4A2E', '#3E2A18') + L(strip(60, 106, 60, 40, 8), '#8A5F38', '#5E3E22', { dx: 1.2, dy: 0, j: .5 }) + L(strip(62, 104, 62, 44, 2.6), '#6B4A2E', null, { j: .2 })
  + L(parse('M40 40 L80 40 L74 32 L46 32Z'), '#6B4A2E', '#3E2A18', { dx: .8, dy: 1.2, j: .4 }) + head(R(46, 14, 28, 20)) + headIn(R(50, 17, 12, 14)) + L(parse('M42 16 L60 2 L78 16Z'), '#6B4A2E', '#3E2A18', { dx: .8, dy: 1.2, j: .4 }) + LS([strip(46, 14, 46, 34, 2.6), strip(74, 14, 74, 34, 2.6)], '#6B4A2E', null, { j: .12 });
A.farolTiki = () => L(strip(60, 110, 60, 40, 8), '#B98D5A', '#7A5632', { dx: 1.2, dy: 0, j: .5 }) + [50, 66, 82, 98].map(y => L(R(55, y, 10, 3), '#7A5632', null, { j: .12 })).join('')
  + L(parse('M40 30 L80 30 L74 48 L46 48Z'), '#8A5F38', '#5A3A1C', { dx: .8, dy: 1.2, j: .4 }) + head(parse('M60 -2 Q78 16 72 30 L48 30 Q42 16 60 -2Z'), { dy: 1 }) + headIn(parse('M60 8 Q68 18 65 28 L55 28 Q52 18 60 8Z'));
A.farolNieve = () => baseP(60) + L(strip(60, 106, 60, 40, 6), '#3E3A44', '#1E1D24', { dx: 1, dy: 0, j: .3 }) + L(parse('M44 40 L76 40 L72 32 L48 32Z'), '#3E3A44', '#1E1D24', { dx: .8, dy: 1, j: .3 })
  + head(parse('M46 32 L74 32 L70 12 L50 12Z')) + headIn(parse('M50 29 L60 29 L58 15 L52 15Z')) + L(parse('M42 14 L60 0 L78 14Z'), '#3E3A44', '#1E1D24', { dx: .8, dy: 1, j: .3 }) + L(parse('M44 13 L60 3 L76 13 L70 16 L60 12 L50 16Z'), '#FBFDFE', '#BFD3E0', { dx: .5, dy: 1, j: .3 }) + L(parse('M50 106 Q56 96 64 100 L72 106Z'), '#FBFDFE', '#BFD3E0', { dx: .5, dy: 1, j: .3 });
A.farolMediterraneo = () => baseP(60, 22, '#8A6A4A', '#5A4430') + L(strip(60, 106, 60, 22, 7), '#F2EBDD', '#B8A888', { dx: 1.2, dy: 0, j: .4 }) + L(R(52, 80, 16, 5), '#D8CCB0', null, { j: .2 })
  + L(parse('M54 22 L66 22 L62 14 L58 14Z'), '#3E3A44', '#1E1D24', { dx: .6, dy: 1, j: .2 }) + L(parse('M58 18 L94 18 L94 24 L58 24Z'), '#3E3A44', '#1E1D24', { dx: .6, dy: 1, j: .25 }) + L(strip(88, 24, 88, 30, 2.6), '#3E3A44', null, { j: .1 })
  + head(parse('M78 32 Q76 44 82 56 L94 56 Q100 44 98 32Z')) + headIn(parse('M82 36 Q81 44 84 53 L90 53 Q92 44 91 36Z')) + L(R(78, 28, 20, 5), '#3E3A44', null, { j: .12 }) + L(R(80, 56, 16, 4), '#3E3A44', null, { j: .12 });
A.farolSelva = () => L(strip(60, 110, 60, 16, 8), '#6B4A2E', '#3E2A18', { dx: 1.2, dy: 0, j: .5 }) + L(parse('M60 20 Q88 14 92 36'), '#4F7A2E', null, { j: 0 }).slice(0, 0) + L(strip(60, 22, 92, 22, 4), '#6B4A2E', '#3E2A18', { dx: .5, dy: 1, j: .25 })
  + L(strip(92, 22, 92, 34, 2), '#4F7A2E', null, { j: .1 }) + head(parse('M80 34 L104 34 L100 60 L84 60Z')) + headIn(parse('M85 38 L94 38 L92 56 L87 56Z')) + L(R(80, 30, 24, 5), '#3F7A4E', '#245540', { dx: .5, dy: 1, j: .2 })
  + L(parse('M40 70 Q30 56 44 50 Q50 64 56 70Z M64 82 Q80 70 92 78 Q80 90 64 90Z'), '#5DA35A', '#2F6B3A', { dx: .8, dy: 1.2, j: .4 });
A.farolMontana = A.farolPiedra;

// ── árboles y objetos por nombre (las claves antiguas se conservan para no romper nada) ──
A.cerezo = () => copaArbol('#F7B7C8', '#FFD9E2', '#E58BA5', '#8A5F38', '#5E3E22');
A.jacaranda = () => copaArbol('#9B7BD4', '#BBA2EA', '#7658B0');
A.olivo = () => copaArbol('#9DB08A', '#C2D0B0', '#7C9068', '#8A7A5E', '#5A4E3A');
A.castano = () => copaArbol('#6FAE4A', '#9AD16C', '#4A8A3A');
A.arbolOtono = () => copaArbol('#E39A3A', '#F5BE62', '#B96A22');
A.arbolUrbano = () => L(strip(60, 110, 60, 64, 6), '#6B4A2E', '#3E2A18', { dx: 1, dy: 0, j: .3 }) + L(lump(60, 42, 20, 34, 18, 2, .06), '#5DB84F', '#2F6B3A', { dx: 1.4, dy: 2, j: .6 }) + L(sect(60, 42, 20, 34, .5, .9, 190, 290), '#86D66F', null, { j: .4 }) + L(R(44, 100, 32, 10), '#8D919B', '#5E626C', { dx: .8, dy: 1.2, j: .3 });
A.pino = () => conifera('#3E7D45', '#5DA35A', '#27563A');
A.pinoNevado = () => conifera('#3F7F6A', '#5FA68E', '#2A5A4A', true);
A.pinoParasol = () => L(strip(61, 110, 60, 52, 8), '#8A5F38', '#5E3E22', { dx: 1, dy: 0, j: .4 }) + L(lump(60, 38, 48, 18, 20, 1, .08), '#3F7A4E', '#245540', { dx: 1.5, dy: 2.4, j: .7 }) + L(sect(60, 38, 48, 18, .4, .9, 190, 280), '#5DA35A', null, { j: .4 }) + L(sect(60, 40, 48, 18, .55, .95, 10, 80), '#2F6B3E', null, { j: .4 });
A.cipres = () => L(strip(60, 110, 60, 96, 8), '#6B4A2E', '#3E2A18', { dx: 1, dy: 0, j: .3 }) + L(parse('M60 6 C78 40 80 84 70 102 L50 102 C40 84 42 40 60 6Z'), '#3F7A4E', '#245540', { dx: 1.4, dy: 2, j: .7 }) + L(parse('M60 6 C44 40 44 84 52 100 L50 102 C40 84 42 40 60 6Z'), '#5DA35A', null, { j: .5 }) + L(parse('M60 6 C74 40 76 84 68 100 L70 102 C80 84 78 40 60 6Z'), '#2F6B3E', null, { j: .5 });
A.palmera = () => palmera('#5E9A3C', '#86C25A');
A.palmeraTropical = () => palmera('#3FA55E', '#7BD08A', '#C49A64');
A.acacia = () => L(parse('M56 110 L58 62 L46 48 L50 45 L60 56 L72 44 L76 47 L64 62 L66 110Z'), '#6B4A2E', '#3E2A18', { dx: 1, dy: 1, j: .4 }) + L(lump(60, 38, 54, 16, 22, 1, .08), '#5E8A3C', '#365A22', { dx: 1.5, dy: 2.4, j: .8 }) + L(sect(60, 38, 54, 16, .4, .9, 190, 280), '#86B456', null, { j: .4 }) + L(sect(60, 40, 54, 16, .5, .95, 10, 80), '#3E6A2A', null, { j: .4 });
A.baobab = () => L(parse('M46 110 Q40 70 50 34 L70 34 Q80 70 74 110Z'), '#B98A62', '#7A5638', { dx: 1.4, dy: 1.2, j: .6 }) + L(parse('M60 34 L70 34 Q80 70 74 110 L62 110Q68 70 60 34Z'), '#9E7050', null, { j: .5 }) + L(strip(56, 36, 42, 16, 5), '#B98A62', '#7A5638', { dx: .8, dy: 1, j: .3 }) + L(strip(64, 36, 76, 14, 5), '#B98A62', '#7A5638', { dx: .8, dy: 1, j: .3 }) + disc(40, 12, 8, '#6FA85A', '#3E6A2A', { n: 12, dx: 1, dy: 1.4 }) + disc(78, 10, 9, '#6FA85A', '#3E6A2A', { n: 12, dx: 1, dy: 1.4 });
A.arbusto = () => arbustoP('#5DA35A', '#86D66F', '#3C7A3E', [[40, 80, 3, '#FFF4DC'], [66, 74, 3, '#F29BB8']]);
A.arbustoTropical = () => arbustoP('#3FA55E', '#7BD08A', '#27783E', [[38, 84, 5, '#E8452C'], [70, 78, 5, '#F2B937'], [86, 90, 4, '#E8452C']]);
A.arbustoNieve = () => arbustoP('#4F8A6A', '#6FAE8C', '#376A4E').replace(/$/, '') + L(parse('M18 84 Q40 70 60 76 Q84 66 102 84 Q80 82 60 90 Q36 84 18 90Z'), '#FBFDFE', '#BFD3E0', { dx: .6, dy: 1.2, j: .5 });
A.mata = () => L(parse('M18 110 L28 72 L38 100 L48 56 L56 98 L62 46 L70 98 L78 62 L84 102 L96 76 L102 110Z'), '#6FA84A', '#3E6A2A', { dx: 1.2, dy: 1.6, j: .5 }) + L(parse('M48 56 L56 98 L52 110 L44 110Z M78 62 L84 102 L80 110 L74 110Z'), '#8FC25A', null, { j: .3 });
A.helecho = () => { const fr = (a, l) => { const r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), nx = -s * 6, ny = c * 6; return [[60, 108], [60 + c * l * .5 + nx, 108 + s * l * .5 + ny], [60 + c * l, 108 + s * l], [60 + c * l * .5 - nx, 108 + s * l * .5 - ny]]; };
  return LS([[-160, 56], [-125, 74], [-90, 86], [-55, 74], [-20, 56]].map(([a, l]) => fr(a, l)), '#3FA55E', '#1F6A3A', { dx: 1, dy: 1.4, j: .5 }) + L(fr(-125, 52), '#7BD08A', null, { j: .3 }) + L(fr(-55, 52), '#2F8A4C', null, { j: .3 }) + L(fr(-90, 62), '#5CC079', null, { j: .3 }); };
A.monstera = () => LS([parse('M60 110 L58 70 L60 40 L64 70Z').concat([]), parse('M60 40 Q36 40 30 62 Q38 70 54 64 Q40 72 36 80 Q52 84 62 70Z'), parse('M62 36 Q86 34 94 56 Q86 66 70 60 Q86 68 88 78 Q70 82 60 66Z')], '#2F8A4C', '#175A30', { dx: 1, dy: 1.4, j: .5 }) + L(parse('M60 40 Q36 40 30 62 Q38 62 52 56Z'), '#5CC079', null, { j: .3 }) + L(parse('M62 36 Q86 34 94 56 Q84 52 70 48Z'), '#5CC079', null, { j: .3 });
A.liana = () => L(strip(48, 110, 48, 8, 12), '#6B4A2E', '#3E2A18', { dx: 1.4, dy: 0, j: .6 }) + L(strip(84, 110, 82, 24, 10), '#7A5632', '#4A3320', { dx: 1.4, dy: 0, j: .6 }) + L(parse('M20 26 Q40 4 66 12 Q90 6 104 30 Q80 24 60 34 Q38 24 20 26Z'), '#3FA55E', '#1F6A3A', { dx: 1.2, dy: 2, j: .7 }) + L(parse('M20 26 Q34 10 52 12 Q40 24 32 32Z'), '#7BD08A', null, { j: .3 }) + L(strip(62, 30, 58, 70, 2.6), '#4F7A2E', null, { j: .15 }) + L(strip(92, 28, 96, 60, 2.6), '#4F7A2E', null, { j: .15 });
// rocas
A.rocaArena = () => piedra('#C9A566', '#E2C68E', '#A8854A');
A.rocaGris = () => piedra('#8B9098', '#B4B9C0', '#666B73');
A.rocaLava = () => piedra('#5B5560', '#7C7682', '#3E3A44');
A.rocaHelada = () => piedra('#9FB2C2', '#E8F1F7', '#7A90A2');
A.rocaJardin = () => piedra('#9AA1A6', '#C0C6C8', '#6E767C') + L(parse('M14 110 L106 110 L102 104 L18 104Z'), '#6FAE4A', '#3E6A2A', { dx: .6, dy: 1, j: .4 });
A.monticulo = () => L(parse('M12 110 Q30 70 56 80 Q80 62 108 110Z'), '#FBFDFE', '#BFD3E0', { dx: 1.2, dy: 1.8, j: .8 }) + L(parse('M40 90 Q54 80 62 84 L46 104Z'), '#E8F1F7', null, { j: .4 }) + L(parse('M62 84 Q84 66 108 110 L84 108Z'), '#D3E0EA', null, { j: .5 });
A.duna = duna;
A.cactus = cactus;
A.anfora = () => LS([parse('M38 52 Q28 56 32 68 L36 66 Q34 60 40 56Z'), parse('M82 52 Q92 56 88 68 L84 66 Q86 60 80 56Z')], '#B5532F', '#7A2D1C', { dx: .8, dy: 1, j: .3 }) + L(parse('M50 30 L70 30 L68 44 Q90 62 76 96 Q70 110 60 110 Q50 110 44 96 Q30 62 52 44Z'), '#C96A3C', '#7A2D1C', { dx: 1.4, dy: 1.4, j: .5 }) + L(parse('M60 44 Q90 62 76 96 Q70 110 60 110Z'), '#B5532F', null, { j: .4 }) + L(parse('M52 44 Q36 62 44 96 Q48 104 54 104 Q46 80 56 48Z'), '#E08A58', null, { j: .3 }) + L(R(46, 66, 28, 5), '#F2B9A0', '#A9674A', { dx: .4, dy: .8, j: .25 }).replace(/\s*$/, '') + L(R(50, 26, 20, 6), '#B5532F', null, { j: .2 });
A.columna = () => L(R(38, 100, 44, 10), '#E3D8C0', '#A8987A', { dx: .8, dy: 1.2, j: .35 }) + L(parse('M44 100 L44 44 L52 36 L58 46 L66 32 L76 42 L76 100Z'), '#F1E6CF', '#B8A888', { dx: 1.3, dy: 1, j: .6 }) + L(parse('M60 100 L60 46 L66 34 L76 42 L76 100Z'), '#D9C8A6', null, { j: .4 }) + LS([strip(52, 52, 52, 98, 2.4), strip(66, 52, 66, 98, 2.4)], '#D9C8A6', null, { j: .12 });
A.estrella = () => L(parse('M60 40 L70 66 L98 68 L76 86 L84 112 L60 96 L36 112 L44 86 L22 68 L50 66Z'), '#F29B6A', '#B8603A', { dx: 1.2, dy: 1.4, j: .4 }) + L(parse('M60 40 L70 66 L60 78 L50 66Z'), '#FFBF94', null, { j: .3 }) + disc(60, 78, 5, '#FFD3B0', null, { n: 10, j: .15 });
A.sombrilla = () => L(strip(60, 110, 60, 40, 6), '#8A5F38', '#5E3E22', { dx: 1, dy: 0, j: .3 }) + L(parse('M12 52 Q60 -4 108 52 Q84 44 60 52 Q36 44 12 52Z'), '#E8452C', '#9E2A1A', { dx: 1.2, dy: 1.8, j: .6 }) + L(parse('M36 40 Q60 8 84 40 Q72 38 60 46 Q48 38 36 40Z'), '#FFF4DC', '#C9B189', { dx: .5, dy: 1.2, j: .4 }) + L(parse('M12 52 Q28 24 50 14 Q30 34 28 50Z'), '#F26A52', null, { j: .3 });
A.velero = () => L(strip(60, 88, 60, 14, 5), '#704332', '#46271C', { dx: 1, dy: 0, j: .3 }) + L(parse('M64 18 L98 80 L64 80Z'), '#FFF8EE', '#C9B189', { dx: 1, dy: 1.4, j: .4 }) + L(parse('M56 30 L56 80 L28 80Z'), '#E8452C', '#9E2A1A', { dx: 1, dy: 1.4, j: .4 }) + L(parse('M14 86 L106 86 L94 106 L26 106Z'), '#B94D36', '#7A2D20', { dx: 1, dy: 1.4, j: .5 }) + L(parse('M14 86 L106 86 L104 91 L16 91Z'), '#F5E7C8', null, { j: .3 });
A.loto = () => L(parse('M8 104 Q60 88 112 104 Q60 116 8 104Z'), '#5DA35A', '#2F6B3A', { dx: 1, dy: 1.6, j: .6 }) + L(parse('M60 100 Q30 92 24 62 Q44 66 60 100Z'), '#F29BB8', '#B85F82', { dx: .8, dy: 1.2, j: .4 }) + L(parse('M60 100 Q90 92 96 62 Q76 66 60 100Z'), '#E58BA5', '#B85F82', { dx: .8, dy: 1.2, j: .4 }) + L(parse('M60 100 Q44 76 54 46 Q70 76 60 100Z'), '#FFD3DE', '#D97A9C', { dx: .8, dy: 1.2, j: .4 });
A.chhatri = () => L(R(30, 100, 60, 10), '#E1D8EC', '#A89CC0', { dx: .8, dy: 1.2, j: .35 }) + LS([R(36, 58, 7, 42), R(77, 58, 7, 42)], '#FFF8EE', '#B8A888', { dx: .8, dy: 1, j: .3 }) + L(parse('M26 58 L60 34 L94 58Z'), '#F4D6C4', '#B8846A', { dx: 1, dy: 1.6, j: .5 }) + L(parse('M60 34 L94 58 L74 58 L60 44Z'), '#E0B8A2', null, { j: .4 }) + disc(60, 30, 4.4, '#F2B937', '#B8741A', { n: 10, dx: .5, dy: .8, j: .12 }) + L(parse('M43 100 L43 76 Q60 62 77 76 L77 100Z'), '#C9BEDD', null, { j: .3 });
A.llama = () => L(parse('M34 72 Q34 54 54 52 L86 52 Q100 54 100 68 L100 86 L34 86Z'), '#E3D5B8', '#A8987A', { dx: 1.2, dy: 1.4, j: .5 }) + LS([R(36, 84, 8, 26), R(50, 84, 8, 26), R(70, 84, 8, 26), R(86, 84, 8, 26)], '#E3D5B8', '#A8987A', { dx: .8, dy: 1, j: .3 }) + L(parse('M32 72 L26 38 Q26 28 36 28 L44 30 L42 40 L44 72Z'), '#E3D5B8', '#A8987A', { dx: 1, dy: 1.2, j: .4 }) + L(parse('M34 28 L32 18 L38 24Z M42 28 L44 16 L46 28Z'), '#CDBC9C', null, { j: .2 }) + disc(33, 36, 2.2, '#2B1D16', null, { n: 8, j: .1 }) + L(R(60, 54, 26, 12), '#E8452C', '#9E2A1A', { dx: .5, dy: .8, j: .25 });
A.terraza = () => L(parse('M10 110 L10 92 L42 92 L42 76 L78 76 L78 60 L110 60 L110 110Z'), '#CDB89A', '#8F7B5A', { dx: 1.2, dy: 1.6, j: .7 }) + LS([parse('M10 92 L42 92 L42 97 L10 97Z'), parse('M42 76 L78 76 L78 81 L42 81Z'), parse('M78 60 L110 60 L110 65 L78 65Z')], '#6FA85A', '#3E6A2A', { dx: .4, dy: .8, j: .3 });
A.moaiChico = () => LS([R(39, 46, 7, 30), R(74, 46, 7, 30)], '#7D828A', '#4E5258', { dx: .8, dy: 1, j: .3 }) + L(parse('M44 110 L46 42 Q46 30 60 30 Q74 30 74 42 L76 110Z'), '#8A9098', '#4E5258', { dx: 1.3, dy: 1.4, j: .5 }) + L(parse('M60 30 Q74 30 74 42 L76 110 L62 110Z'), '#6E747C', null, { j: .4 }) + L(R(48, 56, 24, 6), '#6E747C', null, { j: .2 }) + L(parse('M54 60 L66 60 L63 80 L57 80Z'), '#767C84', null, { j: .2 });
A.bambu = () => bambuC('#7DB04A', '#A6D46E');
A.bambuAlto = A.bambu;
A.muneco = () => disc(60, 88, 24, '#FBFDFE', '#BFD3E0', { dx: 1.2, dy: 1.8 }) + disc(60, 54, 17, '#FBFDFE', '#BFD3E0', { dx: 1.2, dy: 1.8 }) + L(sect(60, 88, 24, 24, .5, .95, 20, 100), '#D3E0EA', null, { j: .4 }) + disc(54, 50, 2, '#2B1D16', null, { n: 8, j: .1 }) + disc(66, 50, 2, '#2B1D16', null, { n: 8, j: .1 }) + L(parse('M60 54 L74 58 L60 60Z'), '#F28C28', null, { j: .12 }) + L(R(44, 64, 32, 6), '#E8452C', '#9E2A1A', { dx: .5, dy: .8, j: .25 }) + L(R(48, 28, 24, 6), '#34333B', null, { j: .15 }) + L(R(52, 14, 16, 16), '#34333B', '#1E1D24', { dx: .6, dy: .8, j: .2 }) + disc(60, 80, 2.4, '#2B1D16', null, { n: 8, j: .1 }) + disc(60, 92, 2.4, '#2B1D16', null, { n: 8, j: .1 });
// objetos urbanos
A.taxi = () => coche('#F2B937').replace(/#1F6E69/g, '#B8741A').replace(/#2C8C86/g, '#D99A25');
A.auto = () => coche('#3FB8B0');
A.hidrante = () => L(R(34, 68, 52, 14), '#D2362B', '#8E2018', { dx: .8, dy: 1.2, j: .35 }) + L(parse('M44 110 L44 58 Q44 38 60 38 Q76 38 76 58 L76 110Z'), '#E8452C', '#8E2018', { dx: 1.2, dy: 1.4, j: .5 }) + L(parse('M60 38 Q76 38 76 58 L76 110 L62 110Z'), '#C2352A', null, { j: .4 }) + L(R(38, 102, 44, 8), '#B93322', null, { j: .3 }) + L(R(52, 30, 16, 8), '#B93322', null, { j: .25 });
A.cabina = () => L(parse('M38 26 Q60 12 82 26 L82 110 L38 110Z'), '#D2362B', '#8E2018', { dx: 1.3, dy: 1.4, j: .5 }) + L(parse('M60 16 Q76 20 82 26 L82 110 L62 110Z'), '#B93322', null, { j: .4 }) + L(R(42, 30, 36, 8), '#FFF4DC', null, { j: .2 }) + LS([R(44, 44, 9, 12), R(56, 44, 9, 12), R(68, 44, 9, 12), R(44, 60, 9, 12), R(56, 60, 9, 12), R(68, 60, 9, 12)], '#8EC7D8', null, { j: .15 });
A.buzon = () => L(parse('M42 110 L42 46 Q42 34 60 34 Q78 34 78 46 L78 110Z'), '#D2362B', '#8E2018', { dx: 1.3, dy: 1.4, j: .5 }) + L(parse('M60 34 Q78 34 78 46 L78 110 L62 110Z'), '#B93322', null, { j: .4 }) + L(parse('M38 46 Q60 22 82 46Z'), '#B93322', '#7A1A12', { dx: .8, dy: 1.2, j: .4 }) + L(R(48, 56, 24, 5), '#2B1D16', null, { j: .15 }) + L(R(44, 88, 32, 6), '#8E2018', null, { j: .2 });
A.neon = () => L(R(56, 88, 8, 22), '#3E3A44', '#1E1D24', { dx: .8, dy: 1, j: .3 }) + L(RR(42, 12, 36, 80, 6), '#2B2440', '#14102A', { dx: 1.2, dy: 1.6, j: .4 }) + L(R(48, 18, 24, 15), '#F29BB8', null, { j: .2 }) + L(R(48, 38, 24, 15), '#7FD0E8', null, { j: .2 }) + L(R(48, 58, 24, 15), '#B49BF2', null, { j: .2 }) + L(R(48, 78, 24, 8), '#8FCB6A', null, { j: .2 });
A.expendedora = () => L(RR(34, 30, 52, 80, 6), '#4E86C6', '#2A4F82', { dx: 1.3, dy: 1.6, j: .4 }) + L(R(40, 36, 40, 38), '#FFF4DC', '#B8A888', { dx: .6, dy: 1, j: .3 }) + [[44, 40, '#E8452C'], [56, 40, '#F2B937'], [68, 40, '#5DB84F'], [44, 56, '#F29BB8'], [56, 56, '#8EC7D8'], [68, 56, '#E8452C']].map(([x, y, c]) => L(R(x, y, 8, 12), c, null, { j: .12 })).join('') + L(R(44, 82, 32, 14), '#2B2440', null, { j: .2 }) + L(parse('M34 36 L34 110 L44 110 L44 36Z'), '#6FA0DA', null, { j: .3 });
A.toldo = () => toldoP('#E8452C', '#FFF0D2');
A.morris = () => L(R(42, 42, 36, 68), '#2F6B4F', '#173A2B', { dx: 1.2, dy: 1.4, j: .4 }) + L(parse('M38 44 Q60 14 82 44Z'), '#245540', '#173A2B', { dx: .8, dy: 1.2, j: .4 }) + disc(60, 20, 5, '#245540', null, { n: 9, j: .12 }) + L(R(47, 52, 26, 30), '#FFF0D2', '#BFA876', { dx: .6, dy: 1, j: .3 }) + L(R(50, 56, 8, 22), '#E8452C', null, { j: .15 }) + L(R(61, 56, 8, 22), '#3E5BA9', null, { j: .15 }) + L(R(42, 100, 36, 6), '#1F4A38', null, { j: .2 });
A.quiosco = () => kiosco('#2F6B4F', '#245540');
A.puesto = () => toldoP('#3E5BA9', '#FFF0D2');
A.pagodita = () => L(R(40, 80, 40, 30), '#B5432F', '#6E2A1C', { dx: 1.2, dy: 1.4, j: .4 }) + [[78, 70], [58, 50], [38, 32]].map(([y, w], i) => L(parse(`M${60 - w * .8} ${y} L60 ${y - 14} L${60 + w * .8} ${y}Z`), '#3E4A6E', '#232B45', { dx: .8, dy: 1.2, j: .4 })).join('') + L(R(52, 90, 16, 20), '#6B4A2E', null, { j: .2 });
// Centro de la cabeza de luz de cada farol en coordenadas del viewBox 120×120 (x, y) y radio relativo del halo; lo usa scene3d.js de noche
export const LUZ = { farola: { x: 60, y: 23, r: 1 }, farolEuropeo: { x: 60, y: 23, r: 1 }, farolModerno: { x: 86, y: 19, r: 1 }, farolPapel: { x: 86, y: 40, r: 1 }, farolRojo: { x: 86, y: 50, r: 1 }, farolPiedra: { x: 60, y: 47, r: 1 }, farolDesierto: { x: 60, y: 28, r: 1.1 },
  farolBosque: { x: 60, y: 24, r: 1 }, farolTiki: { x: 60, y: 16, r: 1.1 }, farolNieve: { x: 60, y: 22, r: 1 }, farolMediterraneo: { x: 88, y: 44, r: 1 }, farolSelva: { x: 92, y: 47, r: 1 }, farolMontana: { x: 60, y: 47, r: 1 } };
export const LAMPARAS = new Set(Object.keys(A).filter(k => /^farol/.test(k)));
// Se construyen en orden fijo con semilla propia: el recorte no cambia si se agregan adornos
const names = Object.keys(A);
export const ADORNOS = Object.fromEntries(names.map((k, i) => { seed(2000 + i * 37); return [k, paperAll(A[k]())]; }));
// Alias de nombres antiguos de destinos (por si un destino nuevo los usa)
Object.assign(ADORNOS, { farolRojo: ADORNOS.farolRojo, farolPiedra: ADORNOS.farolPiedra });

// ── Biomas: paleta reutilizable. [slot0 grandes, slot1 chicos, slot2 faroles] ──
export const BIOMAS = {
  europa: { nombre: 'Ciudad europea', slots: [['castano', 'arbolOtono'], ['arbusto', 'rocaGris'], ['farolEuropeo']] },
  mediterraneo: { nombre: 'Mediterráneo', slots: [['olivo', 'cipres', 'pinoParasol'], ['anfora', 'columna', 'arbusto'], ['farolMediterraneo']] },
  moderna: { nombre: 'Ciudad moderna', slots: [['arbolUrbano', 'neon'], ['expendedora', 'arbusto'], ['farolModerno']] },
  oriente: { nombre: 'Oriente (templos y jardines)', slots: [['cerezo', 'pino', 'bambu'], ['rocaJardin', 'arbusto', 'loto'], ['farolPapel']] },
  desierto: { nombre: 'Desierto', slots: [['palmera', 'cactus'], ['rocaArena', 'anfora', 'duna'], ['farolDesierto']] },
  sabana: { nombre: 'Sabana', slots: [['acacia', 'baobab'], ['mata', 'rocaArena'], ['farolDesierto']] },
  tropical: { nombre: 'Tropical y playa', slots: [['palmeraTropical', 'sombrilla'], ['arbustoTropical', 'estrella', 'velero'], ['farolTiki']] },
  selva: { nombre: 'Selva', slots: [['liana', 'palmeraTropical'], ['helecho', 'monstera'], ['farolSelva']] },
  montana: { nombre: 'Montaña y altiplano', slots: [['pino', 'cerezo'], ['rocaGris', 'llama', 'mata'], ['farolMontana']] },
  nieve: { nombre: 'Nieve', slots: [['pinoNevado'], ['monticulo', 'rocaHelada', 'arbustoNieve', 'muneco'], ['farolNieve']] },
};
// Elige los 3 adornos de un destino: un candidato por slot (según `pick`, estable por destino) y extras opcionales
// (un nombre que empiece con "farol" reemplaza el farol; cualquier otro reemplaza el adorno chico).
export function adornosDe(biome, pick = 0, extras = []) {
  const b = BIOMAS[biome] || BIOMAS.europa, s = b.slots.map((c, i) => c[(pick + i) % c.length]);
  extras.forEach(x => { if (/^farol/.test(x)) s[2] = x; else s[1] = x; });
  return s;
}
