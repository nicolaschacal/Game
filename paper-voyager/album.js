// Álbum de selfies: polaroids papercut del viajero en cada destino, miniaturas de la tienda de fotografía,
// panel ÁLBUM a pantalla completa (por región, con tapa, souvenirs y adornos) y la animación de la cámara en la partida.
// Contrato: ver PLAN-viajes.md (ctx). Todo el arte es SVG con borde crema grueso; el CSS se inyecta una sola vez.
import { DESTINOS } from './destinos.js';
import { t as tt } from './i18n.js';
import * as VV from './viaje.js';
import { PLANE } from './runner-art.js';

const CREAM = '#FFF4DC', INK = '#1B1730';
let UID = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const HAND = "'Segoe Print','Bradley Hand','Chalkboard SE','Marker Felt','Comic Sans MS',cursive";
const LIL = "'Lilita One',sans-serif";

// ── Filtros: matrices de color en SVG (andan igual en todos los navegadores); si llega un CSS filter crudo se usa tal cual ──
const FILTERS = {
  'x-natural': null,
  'x-sepia': { css: 'sepia(.85) saturate(1.15)', m: '0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0' },
  'x-atardecer': { css: 'sepia(.3) saturate(1.5) hue-rotate(-12deg)', m: '1.12 0.12 0 0 0.05  0 0.92 0.06 0 0.01  0 0.04 0.66 0 0  0 0 0 1 0' },
  'x-byn': { css: 'grayscale(1) contrast(1.1)', m: '0.36 0.6 0.12 0 -0.03  0.36 0.6 0.12 0 -0.03  0.36 0.6 0.12 0 -0.03  0 0 0 1 0' },
};
function filterBits(u, f) {
  if (!f) return { def: '', attr: '', style: '' };
  const spec = FILTERS[f];
  if (spec === null) return { def: '', attr: '', style: '' };
  if (spec) return { def: `<filter id="${u}f" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${spec.m}"/></filter>`, attr: ` filter="url(#${u}f)"`, style: '' };
  return { def: '', attr: '', style: ` style="filter:${esc(f)}"` }; // CSS crudo
}

// ── Piezas de arte: recorte papercut ──
const cutS = (shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
const star4 = (x, y, r, fill) => `<path d="M${x} ${y - r} L${x + r * .28} ${y - r * .28} L${x + r} ${y} L${x + r * .28} ${y + r * .28} L${x} ${y + r} L${x - r * .28} ${y + r * .28} L${x - r} ${y} L${x - r * .28} ${y - r * .28}Z" fill="${fill}"/>`;
// Anida un SVG de 120×120 (monumento, souvenir…) dentro de otro
const nest = (svg, x, y, size) => svg.replace(/<svg[^>]*>/, `<svg viewBox="0 0 120 120" x="${x}" y="${y}" width="${size}" height="${size}" overflow="visible">`);
// Recorta el busto (cabeza y torso) del viajero
const HERO_BOX = '20 6 84 84';
function heroNode(svg, x, y, size, rot = 0, flip = false) {
  const inner = (svg || FALLBACK_HERO).replace(/<svg[^>]*>/, `<svg viewBox="${HERO_BOX}" x="${x}" y="${y}" width="${size}" height="${size}">`);
  const cx = x + size / 2, cy = y + size / 2;
  return `<g transform="rotate(${rot} ${cx} ${cy})${flip ? ` translate(${cx * 2} 0) scale(-1 1)` : ''}">${inner}</g>`;
}
const FALLBACK_HERO = `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round"><path d="M40 62 Q60 56 80 62 L86 90 L34 90Z" fill="#3E5BA9"/><circle cx="60" cy="38" r="18" fill="#F6D2B0"/></g><path d="M40 62 Q60 56 80 62 L86 90 L34 90Z" fill="#3E5BA9"/><circle cx="60" cy="38" r="18" fill="#F6D2B0"/><ellipse cx="53" cy="40" rx="3" ry="4" fill="#1A1220"/><ellipse cx="67" cy="40" rx="3" ry="4" fill="#1A1220"/></svg>`;

// ── Escena dentro de la foto (68×68): una hora del día distinta por toma ──
// toma 0 Llegada = mañana, de frente · 1 Paseo = atardecer, de costado y espejado · 2 Recuerdo = noche con farolitos, primer plano
const SHOT_CFG = [
  { sky: ['#8FD0F0', null], art: { size: 52, cx: 42 }, gy: 47, hero: { size: 54, cx: 24, rot: -3, flip: false } },
  { sky: ['#6A55A8', '#F2735A', '#FFC77A'], art: { size: 46, cx: 21 }, gy: 50, hero: { size: 50, cx: 47, rot: -8, flip: true } },
  { sky: ['#14143A', '#3A2F6B'], art: { size: 50, cx: 35 }, gy: 44, hero: { size: 66, cx: 34, rot: 5, flip: false } },
];
function stops(cols) { return cols.map((c, k) => `<stop offset="${cols.length < 2 ? 0 : k / (cols.length - 1)}" stop-color="${c}"/>`).join(''); }
function sceneFor(u, d, shot, hero) {
  const c = SHOT_CFG[shot] || SHOT_CFG[0], fog = d.look?.fog || '#DDEBF5', gy = c.gy;
  const sky = c.sky.map(x => x || fog), hill = d.hillColor || '#8DBF5E', grd = d.ground || '#A8C98A';
  const ax = c.art.cx - c.art.size / 2, ay = gy - c.art.size * 110 / 120;
  let s = `<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1">${stops(sky)}</linearGradient></defs><rect width="68" height="68" fill="url(#${u}s)"/>`;
  if (shot === 0) {
    s += `<circle cx="56" cy="14" r="10" fill="#FFF1B8" opacity=".6"/><circle cx="56" cy="14" r="5.5" fill="#FFD45E"/>`
      + `<g fill="#fff" opacity=".92"><path d="M4 16 q2-5 7-3 q3-4 8 0 q5 0 4 4Z"/><path d="M30 8 q2-4 6-2 q3-3 6 0 q4 0 3 3Z"/></g>`;
  } else if (shot === 1) {
    s += `<circle cx="44" cy="${gy - 6}" r="17" fill="#FFE29A" opacity=".35"/><circle cx="44" cy="${gy - 6}" r="11" fill="#FFD36B"/>`
      + `<path d="M8 12 q3-3 6 0 q3-3 6 0 M26 20 q2-2.4 4.5 0 q2.4-2.4 4.5 0 M52 9 q2-2.4 4.5 0 q2.4-2.4 4.5 0" stroke="#3B2A5C" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  } else {
    s += `<g fill="${CREAM}">${[[8, 22], [16, 34], [27, 17], [47, 31], [60, 40], [41, 12], [22, 46]].map(([x, y], k) => k % 2 ? `<circle cx="${x}" cy="${y}" r=".8"/>` : star4(x, y, 1.9, CREAM)).join('')}</g>`
      + `<circle cx="57" cy="24" r="5" fill="${CREAM}"/><circle cx="59.6" cy="22.4" r="4.4" fill="#262058"/>`;
  }
  s += `<path d="M-4 ${gy} Q8 ${gy - 12} 24 ${gy - 5} T52 ${gy - 6} T74 ${gy - 2} V${gy + 4} H-4Z" fill="${hill}" opacity=".85"/>`;
  s += nest(d.art, ax, ay, c.art.size);
  s += `<rect x="-2" y="${gy}" width="72" height="${70 - gy}" fill="${grd}"/><path d="M-2 ${gy} Q34 ${gy - 3} 70 ${gy}" stroke="${hill}" stroke-width="2" fill="none"/>`;
  if (shot === 1) s += `<g fill="${CREAM}" opacity=".7"><circle cx="30" cy="63" r="1.3"/><circle cx="25" cy="58" r="1.2"/><circle cx="21" cy="54" r="1.1"/><circle cx="18" cy="51" r="1"/></g><rect width="68" height="68" fill="#FF7A3C" opacity=".1"/>`;
  if (shot === 2) {
    s += `<rect width="68" height="68" fill="#161448" opacity=".42"/>`;
    const P = [[6, 6], [20, 10], [34, 8], [48, 11], [62, 7]], col = ['#FF8A4A', '#F2B937', '#E8452C', '#F2B937', '#FF8A4A'];
    s += `<defs><radialGradient id="${u}g"><stop offset="0" stop-color="#FFD27A" stop-opacity=".75"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>`
      + `<path d="M-2 4 L${P.map(p => p.join(' ')).join(' L')} L70 4" stroke="${CREAM}" stroke-width=".9" fill="none" stroke-linejoin="round" opacity=".85"/>`
      + P.map(([x, y], k) => `<circle cx="${x}" cy="${y + 6}" r="8" fill="url(#${u}g)"/><path d="M${x} ${y} V${y + 2.2}" stroke="${CREAM}" stroke-width=".8"/><rect x="${x - 2.2}" y="${y + 2}" width="4.4" height="1.2" rx=".5" fill="#3A2A2A"/><ellipse cx="${x}" cy="${y + 6}" rx="3.4" ry="3.7" fill="${col[k]}" stroke="${CREAM}" stroke-width=".9"/><rect x="${x - 1.6}" y="${y + 9.4}" width="3.2" height="1" rx=".5" fill="#3A2A2A"/>`).join('');
  }
  const h = c.hero;
  s += heroNode(hero, h.cx - h.size / 2, 68 - h.size * .8, h.size, h.rot, h.flip);
  if (shot === 2) s += star4(12, 52, 3.4, '#FFD45E') + star4(58, 56, 2.6, CREAM) + `<path d="M54 36 q-3-3.4-.4-5.4 q2.4-1.6 3.8 1 q2.6-2 4.4.6 q1.6 2.6-1 4.6 L57.6 40Z" fill="#E8452C" opacity=".95" transform="translate(-1 -2)"/>`;
  if (shot === 1) s += star4(8, 40, 2.6, '#FFF1B8');
  if (shot === 0) s += star4(60, 44, 2.8, '#fff') + star4(7, 31, 2, '#FFF1B8');
  return s;
}

// ── Marcos de la polaroid (tarjeta 80×100 en un lienzo 120×116; ventana de la foto 68×68) ──
const WX = 26, WY = 14, WS = 68, CX0 = 20, CY0 = 8, CW = 80, CH = 100;
const TAPE = ['#E8452C', '#5DB84F', '#F2B937'];
function frameParts(u, frame, shot) {
  const R = `x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="4"`;
  switch (frame) {
    case 'f-kraft': return { ink: '#4A2E16', body: `<rect ${R} fill="#C9A06A"/><path d="M26 90 l4 .6 M70 94 l5 0 M44 98 l3 -.5 M84 88 l3 .8 M32 103 l5 0 M60 90 l3 .5 M88 100 l3 0" stroke="#A47C48" stroke-width="1.1" stroke-linecap="round"/><rect x="22.6" y="10.6" width="74.8" height="94.8" rx="2.6" fill="none" stroke="#8A5E34" stroke-width=".8" stroke-dasharray="2.4 1.8"/>`, win: `<rect x="${WX - .8}" y="${WY - .8}" width="${WS + 1.6}" height="${WS + 1.6}" rx="2" fill="none" stroke="#7A5230" stroke-width="1.6"/>`, over: '' };
    case 'f-washi': return { ink: '#3A3550', body: `<rect ${R} fill="#FFFDF6"/><path d="M20 100 H100 V104 Q100 108 96 108 H24 Q20 108 20 104Z" fill="#E6D8B8"/>`, win: '', over: tape(u + 'a', 24, 12, -38, '#F28C8C') + tape(u + 'b', 96, 12, 38, '#6FC1C1') };
    case 'f-sello': {
      let holes = ''; for (let x = CX0 + 4; x <= CX0 + CW - 3; x += 6.4) holes += `<circle cx="${x}" cy="${CY0}" r="2.2"/><circle cx="${x}" cy="${CY0 + CH}" r="2.2"/>`;
      for (let y = CY0 + 4; y <= CY0 + CH - 3; y += 6.25) holes += `<circle cx="${CX0}" cy="${y}" r="2.2"/><circle cx="${CX0 + CW}" cy="${y}" r="2.2"/>`;
      return { ink: '#8E2A17', def: `<mask id="${u}k"><rect x="0" y="0" width="120" height="116" fill="#fff"/><g fill="#000">${holes}</g></mask>`, body: `<g mask="url(#${u}k)"><rect x="${CX0 - 1}" y="${CY0 - 1}" width="${CW + 2}" height="${CH + 2}" fill="#FFF8E6"/></g><rect x="22.5" y="10.5" width="75" height="95" rx="1" fill="none" stroke="#C8452C" stroke-width=".7" opacity=".7"/>`, win: '', over: `<g opacity=".72" stroke="#C8452C" fill="none" stroke-width="1"><circle cx="85" cy="25" r="7"/><path d="M60 21 q3-2 6 0 t6 0 M60 26 q3-2 6 0 t6 0 M60 31 q3-2 6 0 t6 0" stroke-linecap="round"/></g>`, noOutline: true, outlinePath: true };
    }
    case 'f-oro': return { ink: '#5A3A08', def: `<linearGradient id="${u}o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE08A"/><stop offset=".5" stop-color="#E5AE2E"/><stop offset="1" stop-color="#C58A14"/></linearGradient>`, body: `<rect ${R} fill="url(#${u}o)"/><rect x="22.4" y="10.4" width="75.2" height="95.2" rx="2.6" fill="none" stroke="${CREAM}" stroke-width=".9" opacity=".9"/>${[[24, 12], [96, 12], [24, 104], [96, 104]].map(([x, y]) => star4(x, y, 3.2, CREAM)).join('')}`, win: `<rect x="${WX - 1.2}" y="${WY - 1.2}" width="${WS + 2.4}" height="${WS + 2.4}" rx="2" fill="none" stroke="#8A5A12" stroke-width="1.8"/>`, over: '' };
    default: return { ink: '#3A3550', body: `<rect ${R} fill="#FFFDF6"/><path d="M20 100 H100 V104 Q100 108 96 108 H24 Q20 108 20 104Z" fill="#E6D8B8"/>`, win: '', over: `<rect x="46" y="2.5" width="28" height="11" rx="1.5" fill="${TAPE[shot] || TAPE[0]}" opacity=".92" transform="rotate(-4 60 8)"/>` };
  }
}
function tape(id, x, y, rot, col) {
  return `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 13}" y="${y - 4.5}" width="26" height="9" fill="${col}" opacity=".9"/><path d="M${x - 13} ${y - 1.5} h26 M${x - 13} ${y + 1.5} h26" stroke="#fff" stroke-width=".9" opacity=".55"/><path d="M${x - 13} ${y - 4.5} l-1.4 1.1 l1.4 1.1 l-1.4 1.1 l1.4 1.1 l-1.4 1.1 l1.4 1.1 l-1.4 1.1 l1.4 1.1Z M${x + 13} ${y - 4.5} l1.4 1.1 l-1.4 1.1 l1.4 1.1 l-1.4 1.1 l1.4 1.1 l-1.4 1.1 l1.4 1.1 l-1.4 1.1Z" fill="${col}" opacity=".9"/></g>`;
}
const fit = (txt, max, base) => Math.min(base, max / (Math.max(1, txt.length) * .5));

// Polaroid completa. o: { frame, scene(u), title, sub, shot, filter, rot, ghost }
function polaroid(u, o) {
  const fr = frameParts(u, o.frame || 'f-clasico', o.shot || 0), fb = filterBits(u, o.filter);
  const rot = o.rot ?? 0;
  const outline = fr.outlinePath ? `<rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="4" fill="${CREAM}" stroke="${CREAM}" stroke-width="6" stroke-linejoin="round"/>` : `<rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="4" fill="${CREAM}" stroke="${CREAM}" stroke-width="7" stroke-linejoin="round"/>`;
  let body, win, tcol = fr.ink;
  if (o.ghost) {
    body = `<rect x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="4" fill="#E4D6B2" stroke="#B3A37F" stroke-width="1.2" stroke-dasharray="3.2 2.4"/>`;
    win = `<rect x="${WX}" y="${WY}" width="${WS}" height="${WS}" rx="2" fill="#D3C49E"/><path d="M${WX + 4} ${WY + WS - 6} L${WX + 20} ${WY + 38} L${WX + 32} ${WY + 50} L${WX + 46} ${WY + 32} L${WX + WS - 4} ${WY + WS - 6}Z" fill="#C4B58E"/><circle cx="${WX + 52}" cy="${WY + 14}" r="6" fill="#C4B58E"/><text x="60" y="58" text-anchor="middle" font-family="${LIL}" font-size="38" fill="#9C8D68">?</text>`;
    tcol = '#8C7E5C';
  } else {
    body = fr.body;
    win = `<defs><clipPath id="${u}c"><rect x="${WX}" y="${WY}" width="${WS}" height="${WS}" rx="2"/></clipPath></defs><g clip-path="url(#${u}c)"><g transform="translate(${WX} ${WY})"${fb.attr}${fb.style}>${o.scene(u)}</g></g><rect x="${WX}" y="${WY}" width="${WS}" height="${WS}" rx="2" fill="none" stroke="#1A1220" stroke-opacity=".14" stroke-width="2"/>${fr.win || ''}`;
  }
  const t1 = esc(o.title || ''), t2 = esc(o.sub || '');
  const cap = o.noCaption ? '' : `<text x="60" y="${o.ghost ? 92 : 91.4}" text-anchor="middle" font-family="${HAND}" font-style="italic" font-weight="700" font-size="${fit(o.title || '', 68, 7.4)}" fill="${tcol}" transform="rotate(-1.2 60 91)">${t1}</text><text x="60" y="${o.ghost ? 98.2 : 97.4}" text-anchor="middle" font-family="${HAND}" font-style="italic" font-size="${fit(o.sub || '', 70, 4.9)}" fill="${tcol}" opacity=".85" transform="rotate(-1.2 60 97)">${t2}</text>`
    + (o.squiggle ? `<path d="M34 92 q4-3 8 0 t8 0 t8 0 t8 0 t8 0" stroke="${tcol}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".5"/><path d="M42 100 q3-2 6 0 t6 0 t6 0 t6 0" stroke="${tcol}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".35"/>` : '');
  return `<defs>${fr.def || ''}${fb.def}</defs><g transform="rotate(${rot} 60 58)">${outline}${body}${win}${cap}${fr.over || ''}</g>`;
}
const svgWrap = (vb, cls, inner, label) => `<svg class="${cls}" viewBox="${vb}" role="img" aria-label="${esc(label || '')}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const SHOT_ROT = [-2.4, 2.1, -1.4];

// ── API: selfie ──
export function selfieHTML(i, shot = 0, look = {}) {
  const d = DESTINOS[i]; if (!d) return '';
  const u = 'pv' + (++UID), sh = VV.SHOTS[shot]?.name || '';
  const hero = Array.isArray(look.hero) ? look.hero[0] : look.hero;
  return svgWrap('0 0 120 116', 'pvsf', polaroid(u, { frame: look.frame, filter: look.filter, shot, rot: look.rot ?? SHOT_ROT[shot] ?? 0, title: d.place, sub: `${sh} · ${d.country}`, scene: uu => sceneFor(uu, d, shot, hero) }), tt('album.selfieAria', { place: d.place, shot: sh }));
}
// Casillero vacío: silueta de papel con "?" y el nombre del destino
function slotHTML(i, shot, look = {}) {
  const d = DESTINOS[i], u = 'pv' + (++UID);
  return svgWrap('0 0 120 116', 'pvsf ghost', polaroid(u, { ghost: true, shot, rot: SHOT_ROT[shot] ?? 0, title: d.place, sub: VV.SHOTS[shot]?.name || '' }), tt('album.missingAria', { place: d.place, shot: VV.SHOTS[shot]?.name }));
}

// ── Escena de muestra para marcos y filtros (colorida, para que el filtro se note) ──
const miniScene = u => `<defs><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC4EE"/><stop offset="1" stop-color="#FDEBC4"/></linearGradient></defs><rect width="68" height="68" fill="url(#${u}m)"/><circle cx="50" cy="17" r="8" fill="#FF9F43"/><path d="M0 46 L16 26 L28 40 L42 22 L68 48 V68 H0Z" fill="#8FCBA6"/><path d="M0 54 Q34 42 68 54 V68 H0Z" fill="#6FB551"/><path d="M12 56 V47 H25 V56Z" fill="#F5E7C8"/><path d="M10 48 L18.5 40 L27 48Z" fill="#E8452C"/><rect x="16" y="50" width="5" height="6" fill="#7A5334"/><circle cx="30" cy="15" r="5" fill="#E8452C"/><path d="M30 20 V26" stroke="#7A5334" stroke-width="1"/><circle cx="52" cy="50" r="5" fill="#3E7F3E"/><rect x="51" y="54" width="2" height="5" fill="#7A5334"/>`;

// ── Tapas del álbum (lienzo 120×160) ──
function coverInner(id, u, o = {}) {
  let body, plate = '#FFF4DC', ptxt = INK, sub = '#8A6A44';
  const R = `x="6" y="4" width="108" height="152" rx="7"`;
  switch (id) {
    case 'a-cuero':
      body = `<rect ${R} fill="#7A4A2B"/><rect x="6" y="4" width="14" height="152" rx="7" fill="#5E3519"/><rect x="11" y="9" width="98" height="142" rx="4" fill="none" stroke="#E7B952" stroke-width="1.2" stroke-dasharray="3.4 2.4"/><path d="M30 20 q10-4 20 0 M80 140 q10 4 20 0" stroke="#5E3519" stroke-width="2" fill="none" opacity=".6"/>`
        + `<rect x="96" y="70" width="22" height="16" rx="3" fill="#5E3519" stroke="${CREAM}" stroke-width="2"/><rect x="104" y="73" width="8" height="10" rx="2" fill="#E7B952"/>`;
      plate = '#E7B952'; ptxt = '#4A2810'; sub = '#E7B952'; break;
    case 'a-mapa':
      body = `<rect ${R} fill="#E9D6A6"/><rect x="6" y="4" width="14" height="152" rx="7" fill="#C9B07A"/><path d="M30 120 q-8-14 4-22 q10-4 14 6 q10-6 18 2 q10-8 20 0 q8 6 4 18 q-14 6-30 2 q-14 6-30-6Z" fill="#B9CFA0"/><path d="M60 30 q10-6 20 2 q8 10-2 16 q-12 2-18-6Z" fill="#B9CFA0"/><path d="M26 70 q18-10 36 0 t36 -4" stroke="#C9B07A" stroke-width="1.6" fill="none"/><path d="M22 148 L40 138 L58 142 L78 130 L98 134" stroke="#C8452C" stroke-width="1.6" fill="none" stroke-dasharray="3 2.6" stroke-linecap="round"/>`
        + `<g transform="translate(94 22)"><circle r="9" fill="${CREAM}" stroke="#8A6A44" stroke-width="1.2"/><path d="M0 -8 L2 0 L0 8 L-2 0Z" fill="#C8452C"/><path d="M-8 0 L0 -2 L8 0 L0 2Z" fill="#8A6A44"/></g>`;
      sub = '#7A5A34'; break;
    case 'a-noche':
      body = `<rect ${R} fill="#3B2A78"/><rect x="6" y="4" width="14" height="152" rx="7" fill="#2A1C58"/><circle cx="92" cy="126" r="16" fill="#FFF4DC"/><circle cx="99" cy="120" r="14" fill="#3B2A78"/>${[[34, 74, 3], [60, 84, 2.4], [96, 66, 3.2], [40, 130, 2.4], [74, 140, 2.8], [28, 100, 2]].map(([x, y, r]) => star4(x, y, r * 1.6, '#FFD45E')).join('')}<g fill="${CREAM}">${[[50, 70], [84, 80], [66, 120], [30, 144], [100, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1"/>`).join('')}</g>`;
      plate = '#2A1C58'; ptxt = '#FFD45E'; sub = '#C9BEEF'; break;
    default: // cartón
      body = `<rect ${R} fill="#C79A62"/><rect x="6" y="4" width="14" height="152" rx="7" fill="#A97A44"/><path d="M30 76 l5 .8 M70 84 l6 0 M50 112 l4 -.6 M98 100 l4 .8 M36 134 l6 0 M82 142 l4 0 M62 70 l3 .6 M104 60 l3 0" stroke="#A47C48" stroke-width="1.3" stroke-linecap="round"/><path d="M6 4 H30 L6 28Z M114 156 H90 L114 132Z" fill="#8E6538"/><rect x="96" y="4" width="6" height="152" fill="#3A2F2A" opacity=".85"/>`;
      sub = '#8A6A44';
  }
  const out = `<rect ${R} fill="${CREAM}" stroke="${CREAM}" stroke-width="7" stroke-linejoin="round"/>` + body
    + `<path d="M6 150 Q6 156 13 156 H107 Q114 156 114 150 V144 Q60 152 6 144Z" fill="#000" opacity=".16"/>`;
  let s = out;
  if (o.deco) s += o.deco.map((d, k) => decoPlace(d, k)).join('');
  if (o.title !== false) {
    s += `<rect x="28" y="16" width="76" height="40" rx="4" fill="${plate}" stroke="${CREAM}" stroke-width="2"/><rect x="31" y="19" width="70" height="34" rx="2" fill="none" stroke="${ptxt}" stroke-width=".9" opacity=".6"/>`
      + `<text x="66" y="42" text-anchor="middle" font-family="${LIL}" font-size="16.5" fill="${ptxt}" letter-spacing="1">${tt('album.word')}</text><text x="66" y="50.5" text-anchor="middle" font-family="${LIL}" font-size="6.2" fill="${sub}" letter-spacing="2">${tt('album.cover.sub')}</text>`
      + `<path d="${plane(66, 24.5, .36)}" fill="${ptxt}"/>`;
  }
  if (o.count != null) {
    s += `<rect x="30" y="60" width="72" height="14" rx="7" fill="${INK}" stroke="${CREAM}" stroke-width="1.6"/><text x="66" y="70.3" text-anchor="middle" font-family="${LIL}" font-size="8.4" fill="${CREAM}">${o.count} / ${o.total} selfies</text>`;
  }
  if (o.souvenirs?.length) {
    const n = o.souvenirs.length, w = 26, gap = (96 - n * w) / Math.max(1, n + 1);
    s += `<path d="M26 148 H104" stroke="#000" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`
      + o.souvenirs.map((id2, k) => nest(souvenirSVG(id2), 24 + gap * (k + 1) + w * k - 2, 119, w + 4)).join('');
  }
  return s;
}
// Avioncito (PLANE de runner-art, centrado en 0,0) como path trasladado y escalado
function plane(x, y, k) { return PLANE.replace(/([-\d.]+)\s+([-\d.]+)/g, (_, a, b) => `${(+a * k + x).toFixed(2)} ${(+b * k + y).toFixed(2)}`); }
// Adornos sobre la tapa (cada uno en su rincón)
const DECO_SLOTS = [[2, 74, .5, -7], [58, 68, .52, 5], [28, 88, .42, 2]];
const DECO_ORDER = ['d-sellos', 'd-pasajes', 'd-stickers'];
function decoPlace(id, k) {
  const [x, y, s, r] = DECO_SLOTS[DECO_ORDER.indexOf(id)] || DECO_SLOTS[k % 3];
  return `<g transform="translate(${x} ${y}) rotate(${r} 60 60) scale(${s})">${decoInner(id)}</g>`;
}
function coverSVG(id, o = {}) {
  const u = 'pv' + (++UID);
  return svgWrap('-4 0 128 162', 'pvcv', coverInner(id, u, o), tt('album.coverAria'));
}

// ── Adornos (lienzo 120×120) ──
function decoInner(id) {
  const C = `stroke="${CREAM}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;
  if (id === 'd-sellos') {
    const stamp = (x, y, r, col, rot, glyph) => `<g transform="translate(${x} ${y}) rotate(${rot})" opacity=".95"><circle r="${r}" fill="${CREAM}" opacity=".0"/><circle r="${r}" fill="none" stroke="${col}" stroke-width="3.2"/><circle r="${r - 6}" fill="none" stroke="${col}" stroke-width="1.4"/>${glyph}</g>`;
    return `<g ${C} fill="none"><circle cx="38" cy="40" r="26"/><circle cx="82" cy="78" r="24"/></g><circle cx="38" cy="40" r="26" fill="#FFF8E6"/><circle cx="82" cy="78" r="24" fill="#FFF8E6"/>`
      + stamp(38, 40, 24, '#C8452C', -10, `<path d="${plane(0, 0, 1.25)}" fill="#C8452C"/>`)
      + stamp(82, 78, 22, '#3E5BA9', 8, `${star4(0, 0, 11, '#3E5BA9')}<path d="M-14 15 q3-3 7 0 t7 0 t7 0 t7 0" stroke="#3E5BA9" stroke-width="1.6" fill="none" stroke-linecap="round" transform="translate(0 -1)"/>`)
      + `<path d="M12 96 q5-4 10 0 t10 0 t10 0 M12 104 q5-4 10 0 t10 0 t10 0" stroke="#3E5BA9" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  if (id === 'd-pasajes') {
    const tk = (x, y, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-38" y="-17" width="76" height="34" rx="3" fill="${CREAM}" stroke="${CREAM}" stroke-width="6" stroke-linejoin="round"/><rect x="-38" y="-17" width="76" height="34" rx="3" fill="#FFFDF6"/><rect x="-38" y="-17" width="76" height="8" fill="${col}"/><path d="M14 -17 V17" stroke="#B8A987" stroke-width="1.2" stroke-dasharray="2.4 2"/><path d="${plane(-26, 3, .9)}" fill="${col}"/><path d="M-14 -2 h22 M-14 4 h16 M-14 10 h20" stroke="#7B7A8C" stroke-width="2" stroke-linecap="round"/><g fill="${INK}"><rect x="19" y="-4" width="1.6" height="16"/><rect x="22" y="-4" width="3" height="16"/><rect x="27" y="-4" width="1.6" height="16"/><rect x="30" y="-4" width="2.4" height="16"/></g><circle cx="-38" cy="0" r="3.4" fill="#F1E3C2"/><circle cx="38" cy="0" r="3.4" fill="#F1E3C2"/></g>`;
    return tk(54, 38, -9, '#3E5BA9') + tk(66, 82, 6, '#E8452C');
  }
  // stickers
  const sticker = (shape, fill, x, y, rot, extra = '') => `<g transform="translate(${x} ${y}) rotate(${rot})"><g ${C} fill="${CREAM}" stroke-width="9">${shape}</g><g fill="${fill}">${shape}</g>${extra}</g>`;
  const heart = `<path d="M0 22 C-26 4 -22 -20 -8 -18 Q0 -17 0 -8 Q0 -17 8 -18 C22 -20 26 4 0 22Z"/>`;
  const st = `<path d="M0 -26 L8 -9 L27 -7 L13 6 L17 25 L0 15 L-17 25 L-13 6 L-27 -7 L-8 -9Z"/>`;
  return sticker(st, '#F2B937', 36, 40, -12, `<path d="M0 -26 L8 -9 L0 15 L-17 25 L-13 6 L-27 -7 L-8 -9Z" fill="#D69A1D" opacity=".4"/>`)
    + sticker(heart, '#E8452C', 84, 44, 10, `<path d="M-14 -10 q4-6 9-4" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/>`)
    + sticker(`<circle r="22"/>`, '#3E5BA9', 62, 90, 6, `<path d="${plane(0, 0, 1.4)}" fill="#fff"/><path d="M-16 14 q16 8 32 0" stroke="#F2B937" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
}

// ── Souvenirs (lienzo 120×120) ──
function souvenirSVG(id) {
  switch (String(id).replace(/#\d+$/, '')) {
    case 's-am': { // mate de calabaza con bombilla
      const bomb = `<path d="M62 62 L84 12 L90 15 L68 65Z" fill="#C9CED6"/><circle cx="87" cy="12.5" r="5.2" fill="#D8DCE2"/>`;
      return cutS(`<path d="M32 56 C22 82 34 108 60 110 C86 108 98 82 88 56Z" fill="#B9823F"/>` + bomb,
        `<ellipse cx="60" cy="56" rx="29" ry="9" fill="#5E3E22"/><ellipse cx="60" cy="56" rx="22.5" ry="5.8" fill="#7BA84A"/><path d="M32 66 Q60 78 88 66 L89 72 Q60 84 31 72Z" fill="#D8DCE2"/><path d="M70 62 C82 70 86 90 76 108 C90 104 100 84 88 58Z" fill="#8A5A2E" opacity=".45"/><path d="M40 84 q4 8 12 10" stroke="#8A5A2E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>` + bomb.replace('#C9CED6', '#C9CED6'));
    }
    case 's-eu': // torre en miniatura sobre su base
      return cutS(`<rect x="28" y="100" width="64" height="10" rx="3" fill="#C9B48A"/><rect x="58.5" y="6" width="3" height="14" fill="#7A5A3C"/><path d="M60 14 L65 42 L72 62 L88 100 L77 100 Q60 80 43 100 L32 100 L48 62 L55 42Z" fill="#8A6A4A"/>`,
        `<rect x="49" y="58" width="22" height="5" rx="1.5" fill="#B99A72"/><rect x="54" y="38" width="12" height="4" rx="1" fill="#B99A72"/><path d="M53 63 L47 82 M67 63 L73 82 M55 22 L65 38 M65 22 L55 38" stroke="#6A4C32" stroke-width="2" stroke-linecap="round"/><path d="M60 14 L65 42 L72 62 L88 100 L82 100 L66 62Z" fill="#6A4C32" opacity=".45"/><path d="M34 105 H86" stroke="#A8935F" stroke-width="2"/>`);
    case 's-af': // máscara tallada
      return cutS(`<path d="M60 8 C84 10 94 30 90 56 C88 84 74 106 60 112 C46 106 32 84 30 56 C26 30 36 10 60 8Z" fill="#A6652E"/>`,
        `<path d="M60 8 C84 10 94 30 90 56 C88 84 74 106 60 112 C72 94 76 62 74 40 C72 22 68 14 60 8Z" fill="#7C4A1E" opacity=".55"/><path d="M38 40 Q48 34 54 42 Q48 48 38 40Z M82 40 Q72 34 66 42 Q72 48 82 40Z" fill="${CREAM}"/><circle cx="47" cy="41" r="2.6" fill="${INK}"/><circle cx="73" cy="41" r="2.6" fill="${INK}"/><path d="M60 40 L56 66 Q60 70 64 66Z" fill="#7C4A1E"/><rect x="48" y="80" width="24" height="12" rx="3" fill="#3A2210"/><path d="M52 80 V92 M56 80 V92 M60 80 V92 M64 80 V92 M68 80 V92" stroke="${CREAM}" stroke-width="1.6"/><path d="M42 20 L48 28 L54 20 L60 28 L66 20 L72 28 L78 20" stroke="#E07A2B" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M36 58 l4 4 l4-4 M76 58 l4 4 l4-4" stroke="#E07A2B" stroke-width="2.4" fill="none"/>`);
    case 's-as': // farolito de papel
      return cutS(`<rect x="52" y="6" width="16" height="9" rx="2" fill="#3A2A2A"/><path d="M60 14 C100 14 108 44 100 66 C96 90 80 100 60 100 C40 100 24 90 20 66 C12 44 20 14 60 14Z" fill="#E8452C"/><rect x="48" y="98" width="24" height="9" rx="2" fill="#3A2A2A"/><path d="M58 106 V118 M62 106 V116" stroke="#F2B937" stroke-width="4" stroke-linecap="round"/>`,
        `<path d="M60 14 C40 30 36 80 60 100 C84 80 80 30 60 14Z" fill="#F4684F" opacity=".7"/><path d="M60 14 C26 30 26 84 60 100 M60 14 C94 30 94 84 60 100 M22 40 Q60 48 98 40 M20 72 Q60 82 100 72" stroke="#A92E1B" stroke-width="1.8" fill="none" opacity=".75"/>${star4(60, 56, 9, '#F2B937')}<path d="M60 14 C100 14 108 44 100 66 L90 62 C94 40 84 22 60 14Z" fill="#B93322" opacity=".4"/>`);
    case 's-oc': // boomerang pintado
      return cutS(`<path d="M10 44 Q60 18 106 84 L112 98 Q100 112 88 104 Q68 54 14 62Z" fill="#D8913E"/>`,
        `<path d="M10 44 Q60 18 106 84 L112 98 L100 90 Q62 36 12 52Z" fill="#B87426" opacity=".5"/><g fill="${CREAM}"><circle cx="24" cy="54" r="2.4"/><circle cx="38" cy="53" r="2.4"/><circle cx="52" cy="58" r="2.4"/><circle cx="64" cy="66" r="2.4"/><circle cx="75" cy="77" r="2.4"/><circle cx="85" cy="90" r="2.4"/></g><path d="M18 47 Q56 30 94 82" stroke="#E8452C" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/><path d="M12 57 Q56 44 96 98" stroke="#3E5BA9" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`);
  }
  return '';
}

// ── API: miniatura de un ítem de la tienda ──
export function photoPreview(id) {
  const it = VV.photoItem?.(id) || VV.PHOTO_ITEMS.find(p => p.id === id);
  if (!it) return svgWrap('0 0 120 120', 'pvpv', souvenirInner(id), id);
  const u = 'pv' + (++UID);
  if (it.kind === 'frame') return svgWrap('0 -2 120 120', 'pvpv', polaroid(u, { frame: id, shot: 0, rot: -3, scene: miniScene, squiggle: true }), it.name);
  if (it.kind === 'filter') return svgWrap('0 -2 120 120', 'pvpv', polaroid(u, { frame: 'f-clasico', filter: id, shot: 1, rot: 3, scene: miniScene, squiggle: true }), it.name);
  if (it.kind === 'cover') return svgWrap('-20 0 160 162', 'pvpv', coverInner(id, u, { title: true }), it.name);
  if (it.kind === 'deco') return svgWrap('0 0 120 120', 'pvpv', decoInner(id), it.name);
  return '';
}
function souvenirInner(id) { const s = souvenirSVG(id); return s ? s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') : ''; }

// ── CSS (se inyecta una vez) ──
function css() {
  if (document.getElementById('pvAlbumCss')) return;
  const st = document.createElement('style'); st.id = 'pvAlbumCss';
  st.textContent = `
.pvsf,.pvcv,.pvpv{display:block;width:100%;height:auto;overflow:visible}
.pvpv{width:100%;height:100%}
.pva{display:block;animation:panelIn .28s cubic-bezier(.2,1,.3,1);overflow-x:hidden;overscroll-behavior-x:none;touch-action:pan-y;max-width:100vw;box-sizing:border-box}
.pva-cfg,.pva-det{overflow-x:hidden;overscroll-behavior-x:none;max-width:100vw;box-sizing:border-box}
.pva .tabs{touch-action:pan-x pan-y}
.pva .head h2{font-size:30px}
body.gpapel .pva .head:before,body.gpapel .pva .head:after{left:0!important;right:0!important;transform:none!important}
html.pvlock,html.pvlock body{overflow:hidden!important;overscroll-behavior:none}
.pva{position:fixed;top:0;left:0;right:0;bottom:var(--navH,0px);width:100%;padding-bottom:30px}
.pva-cfg,.pva-det{top:0;left:0;right:0;bottom:var(--navH,0px)}
.pva-cfg{padding-bottom:30px}
.pva .head small{bottom:50px}
.pva-top{padding:16px 14px 4px;display:flex;flex-direction:column;align-items:center;gap:12px}
.pva-cover{width:min(58vw,230px);filter:drop-shadow(0 7px 0 rgba(27,23,48,.35));transform:rotate(-1.5deg)}
.pva-top .btn{width:min(86vw,300px);height:52px;font-size:21px}
.pva .tabs{padding:10px 12px 4px;overflow-x:auto;scrollbar-width:none}.pva .tabs::-webkit-scrollbar{display:none}
.pva .tabs button{flex:1 1 0;min-width:0;padding:0 2px;position:relative;font-size:12.5px;line-height:1.05;background:#EADBB8;color:#6c6450}
.pva .tabs button small{display:block;font:900 8px Nunito;letter-spacing:.6px;opacity:.85}
.pva .tabs button.on{background:var(--rc);color:#fff;text-shadow:0 2px 0 var(--rd);box-shadow:0 3px 0 var(--ink)}
.pva .tabs button.done:after{content:"★";position:absolute;right:-4px;top:-8px;font-size:15px;color:var(--gold);text-shadow:0 0 0 var(--ink),1px 1px 0 var(--ink),-1px 1px 0 var(--ink),1px -1px 0 var(--ink),-1px -1px 0 var(--ink)}
.pva-rh{margin:12px 14px 4px;padding:8px 12px;border-radius:14px;background:var(--rc);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink);color:#fff;display:flex;align-items:center;gap:8px;text-shadow:0 2px 0 var(--rd)}
.pva-rh b{font:400 20px 'Lilita One',sans-serif;letter-spacing:.5px}.pva-rh span{margin-left:auto;font:900 11px Nunito;letter-spacing:.8px;text-shadow:none}
.pva-rh u{text-decoration:none;font:900 9px Nunito;background:var(--gold);color:var(--ink);border:2px solid var(--ink);border-radius:99px;padding:1px 7px;text-shadow:none}
.pva-dest{margin:10px 10px 0;padding:8px 6px 4px;border-radius:16px;background:rgba(255,255,255,.35);border:2.5px solid rgba(27,23,48,.14)}
.pva-dn{display:flex;align-items:baseline;gap:8px;padding:0 6px 2px}
.pva-dn b{font:400 17px 'Lilita One',sans-serif;color:var(--ink)}.pva-dn small{font:900 9px Nunito;letter-spacing:1.2px;color:var(--mute);text-transform:uppercase}
.pva-dn i{margin-left:auto;font:400 13px 'Lilita One',sans-serif;font-style:normal;color:var(--ink);background:var(--cream);border:2px solid var(--ink);border-radius:99px;padding:0 8px}.pva-dn i.ok{background:var(--green);color:#fff}
.pva-row{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.pva-slot{display:block;padding:0;border:0;background:none;width:100%;-webkit-tap-highlight-color:transparent}
.pva-slot:not(:disabled):active{transform:scale(.95)}
.pva-slot .pvsf{filter:drop-shadow(0 3px 0 rgba(27,23,48,.28))}
.pva-slot:disabled .pvsf{filter:none}
.pva-det{position:fixed;inset:0;z-index:40;background:rgba(27,23,48,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;touch-action:none;animation:pvaFade .2s}
@keyframes pvaFade{0%{opacity:0}}
.pva-det .big{width:min(90vw,calc(60vh*1.03));animation:pvaPop .4s cubic-bezier(.2,1.4,.4,1);filter:drop-shadow(0 12px 0 rgba(0,0,0,.35));position:relative}
@keyframes pvaPop{0%{transform:scale(.6) rotate(-10deg);opacity:0}}
.pva-det .info{text-align:center;color:var(--cream)}
.pva-det .info b{display:block;font:400 28px 'Lilita One',sans-serif;text-shadow:0 3px 0 var(--ink)}
.pva-det .info small{font:900 12px Nunito;letter-spacing:1.6px;color:#E7D9B6;text-transform:uppercase}
.pva-det .round{right:14px;top:calc(var(--st) + 14px)}
.pva-cfg{position:fixed;inset:0;z-index:38;background:var(--paper);color:var(--ink);overflow-y:auto;touch-action:pan-y;padding-bottom:calc(var(--sb) + 30px);animation:panelIn .25s cubic-bezier(.2,1,.3,1)}
.pva-pv{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 14px 4px}
.pva-pv .a{width:34%}.pva-pv .b{width:56%}
.pva-sec{margin:14px 14px 0;font:400 20px 'Lilita One',sans-serif;display:flex;align-items:baseline;gap:8px}.pva-sec small{font:900 10px Nunito;letter-spacing:.8px;color:var(--mute)}
.pva-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:8px 14px 0}
.pva-it{position:relative;padding:6px 4px 8px;border-radius:16px;border:3px solid var(--ink);background:var(--cream);box-shadow:0 5px 0 var(--ink);text-align:center;color:var(--ink);font-family:Nunito,sans-serif;-webkit-tap-highlight-color:transparent}
.pva-it:active{transform:translateY(3px);box-shadow:0 2px 0 var(--ink)}
.pva-it .th{height:84px;display:flex;align-items:center;justify-content:center}.pva-it .th svg{width:84px;height:84px}
.pva-it b{display:block;font:400 12.5px/1.05 'Lilita One',sans-serif;margin:2px 0 4px;min-height:26px;display:flex;align-items:center;justify-content:center}
.pva-it em{display:inline-block;font:900 8.5px Nunito;font-style:normal;letter-spacing:.7px;padding:2px 7px;border-radius:99px;border:2px solid var(--ink);background:#EADBB8}
.pva-it.on{background:#FFF9E8;box-shadow:0 5px 0 var(--ink),0 0 0 4px var(--green)}
.pva-it.on em{background:var(--green);color:#fff}
.pva-it.lock{background:#E2D5B6}.pva-it.lock .th svg{opacity:.5;filter:saturate(.6)}.pva-it.lock em{background:var(--gold)}
.pva-it .lk{position:absolute;left:50%;top:26px;width:34px;height:34px;margin-left:-17px}
.pva-note{padding:6px 18px 0;font:700 11px Nunito;color:var(--mute)}
/* Animación de la cámara en la partida */
.pvrv-flash{position:fixed;inset:0;z-index:60;background:#fff;pointer-events:none;opacity:0;animation:pvrvFlash .5s ease-out}
@keyframes pvrvFlash{0%{opacity:.95}100%{opacity:0}}
.pvrv{position:fixed;left:0;right:0;top:calc(var(--st) + 74px);z-index:61;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;animation:pvrvLife 1.8s cubic-bezier(.3,1.2,.5,1) forwards}
.pvrv.long{animation-name:pvrvLifeL;animation-duration:2.7s}
@keyframes pvrvLife{0%{transform:translateY(-150%) rotate(-10deg);opacity:0}14%{transform:translateY(0) rotate(0);opacity:1}80%{transform:none;opacity:1}100%{transform:translateY(-40%);opacity:0}}
@keyframes pvrvLifeL{0%{transform:translateY(-150%);opacity:0}10%{transform:none;opacity:1}86%{transform:none;opacity:1}100%{transform:translateY(-40%);opacity:0}}
.pvrv .row{display:flex;align-items:center;gap:10px}
.pvrv .pol{width:118px;transform:rotate(-5deg);filter:drop-shadow(0 6px 0 rgba(27,23,48,.45));animation:pvrvDev 1.1s .2s both}
@keyframes pvrvDev{0%{filter:brightness(.1) blur(3px) drop-shadow(0 6px 0 rgba(27,23,48,.45))}100%{filter:brightness(1) blur(0) drop-shadow(0 6px 0 rgba(27,23,48,.45))}}
.pvrv .tx{display:flex;flex-direction:column;align-items:flex-start;gap:4px;animation:pvrvTx .5s .35s cubic-bezier(.2,1.6,.4,1) both}
@keyframes pvrvTx{0%{transform:scale(.3);opacity:0}}
.pvrv .tt{font:400 22px/1 'Lilita One',sans-serif;color:var(--gold);text-shadow:0 3px 0 var(--ink),2px 0 0 var(--ink),-2px 0 0 var(--ink),0 -2px 0 var(--ink),2px 2px 0 var(--ink),-2px 2px 0 var(--ink);letter-spacing:.5px}
.pvrv.dup .tt{color:var(--cream);font-size:20px}
.pvrv .cc{font:400 18px 'Lilita One',sans-serif;color:var(--ink);background:var(--gold);border:2.5px solid var(--ink);border-radius:99px;padding:1px 12px;box-shadow:0 3px 0 var(--ink)}
.pvrv .rg{margin-top:2px;padding:6px 16px;border-radius:16px;border:3px solid var(--ink);background:var(--rc);color:#fff;font:400 17px 'Lilita One',sans-serif;text-shadow:0 2px 0 var(--rd);box-shadow:0 4px 0 var(--ink);animation:pvrvTx .5s .9s cubic-bezier(.2,1.6,.4,1) both;text-align:center;letter-spacing:.4px}
.pvrv .sp{position:absolute;width:14px;height:14px;pointer-events:none;animation:pvrvSp .9s .3s ease-out both}
@keyframes pvrvSp{0%{transform:scale(0) rotate(0);opacity:1}60%{opacity:1}100%{transform:scale(1.6) rotate(90deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.pvrv,.pvrv *{animation-duration:.01s!important;animation-delay:0s!important}.pvrv{animation:none!important;opacity:1}}
`;
  document.head.appendChild(st);
}

// ── Panel ÁLBUM ──
const LOCK = `<svg viewBox="0 0 40 40" class="lk"><g stroke="${CREAM}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M12 18 V13 a8 8 0 0 1 16 0 V18" fill="none"/><rect x="7" y="17" width="26" height="19" rx="4" fill="#3A3558"/></g><path d="M12 18 V13 a8 8 0 0 1 16 0 V18" fill="none" stroke="#B8B3D6" stroke-width="3.4" stroke-linecap="round"/><rect x="7" y="17" width="26" height="19" rx="4" fill="#3A3558"/><circle cx="20" cy="25.5" r="3" fill="#F2B937"/><rect x="18.8" y="26" width="2.4" height="5.5" rx="1" fill="#F2B937"/></svg>`;
const KINDS = [['frame', tt('album.kind.frame'), 'frame'], ['cover', tt('album.kind.cover'), 'cover'], ['filter', tt('album.kind.filter'), 'filter'], ['deco', tt('album.kind.deco'), 'deco']];

export function openAlbum(ctx, onClose, opts = {}) {
  css();
  const V = ctx.V || VV, $ = (s, el = root) => el.querySelector(s);
  const sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  const heroCache = {};
  const heroFor = shot => {
    let H = heroCache[ctx.skinId];
    if (!H) { try { H = heroCache[ctx.skinId] = ctx.artFor(ctx.skinId).HERO; } catch (e) { H = heroCache[ctx.skinId] = {}; } }
    return shot === 0 ? (H.wave?.[1] || H.wave?.[0] || H.idle?.[0]) : H.idle?.[0];
  };
  const look = shot => ({ frame: V.PHOTO.frame, filter: V.PHOTO.filter, hero: heroFor(shot) });
  document.querySelectorAll('.pvalb').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pva pvalb'; root.style.display = 'block';
  if (opts.preload) { root.style.animation = 'none'; root.style.opacity = '0'; root.style.pointerEvents = 'none'; }
  document.body.appendChild(root); lockScroll(root);
  let region = (V.T && V.regionOf(V.T.at)) || 'am';
  let closing = false;
  const finish = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  const close = () => { if (closing) return; closing = true; if (opts.closeAnim) opts.closeAnim(root, finish); else finish(); };

  const regCount = r => { const ds = V.destsOf(r); return { n: ds.reduce((a, d) => a + (V.ALBUM[d] || []).length, 0), t: ds.length * V.SHOTS.length }; };
  const done = () => ctx.store?.get?.('albumDone', []) || [];

  function draw() {
    const R = V.REGIONS, P = V.PHOTO, keep = root.scrollTop;
    root.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('album.count', { n: V.selfieCount(), total: V.selfieTotal() })}</small><h2>${tt('album.word')}</h2></div>
<div class="pva-top"><button class="btn sm" data-cfg>${tt('album.customize')}</button></div>
<div class="tabs">${V.REGION_ORDER.map(r => { const c = regCount(r); return `<button data-r="${r}" class="${r === region ? 'on' : ''}${done().includes(r) ? ' done' : ''}" style="--rc:${R[r].color};--rd:${R[r].dark}">${R[r].name.toUpperCase()}<small>${c.n}/${c.t}</small></button>`; }).join('')}</div>
<div id="pvaList"></div>`;
    $('[data-x]').onclick = close;
    $('[data-cfg]').onclick = () => { sfx('tap'); openCfg(); };
    root.querySelectorAll('.tabs [data-r]').forEach(b => b.onclick = () => { region = b.dataset.r; sfx('tap'); root.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); list(); });
    list(); root.scrollTop = keep;
  }
  // Sólo se arma la región abierta (hasta 16 destinos × 3 fotos), no las 135
  function list() {
    const r = region, R = V.REGIONS[r], c = regCount(r), el = $('#pvaList');
    el.style.cssText = `--rc:${R.color};--rd:${R.dark}`;
    el.innerHTML = `<div class="pva-rh"><b>${R.name.toUpperCase()}</b>${done().includes(r) ? `<u>★ ${tt('album.complete')}</u>` : ''}<span>${tt('album.selfies', { n: c.n, total: c.t })}</span></div>`
      + V.destsOf(r).map(i => {
        const d = DESTINOS[i], got = V.ALBUM[i] || [];
        return `<div class="pva-dest"><div class="pva-dn"><b>${esc(d.place)}</b><small>${esc(d.country)}</small><i class="${got.length === 3 ? 'ok' : ''}">${got.length}/3</i></div><div class="pva-row">`
          + V.SHOTS.map(s => got.includes(s.id)
            ? `<button class="pva-slot" data-i="${i}" data-s="${s.id}" aria-label="${esc(d.place)}: ${esc(s.name)}">${selfieHTML(i, s.id, look(s.id))}</button>`
            : `<button class="pva-slot" disabled aria-label="${esc(tt('album.missingAria', { place: d.place, shot: s.name }))}">${slotHTML(i, s.id)}</button>`).join('') + `</div></div>`;
      }).join('');
    el.querySelectorAll('.pva-slot:not(:disabled)').forEach(b => b.onclick = () => detail(+b.dataset.i, +b.dataset.s));
  }
  function detail(i, s) {
    sfx('tap');
    const d = DESTINOS[i], ov = document.createElement('div'); ov.className = 'pva-det';
    ov.innerHTML = `<button class="round close" aria-label="${tt('common.close')}">✕</button><div class="big">${selfieHTML(i, s, { ...look(s), rot: 0 })}</div><div class="info"><b>${esc(d.place)}</b><small>${esc(d.country)} · ${V.SHOTS[s].name}</small></div>`;
    const off = () => { ov.remove(); sfx('tap'); };
    ov.onclick = e => { if (e.target === ov || e.target.closest('.round')) off(); };
    root.appendChild(ov);
  }
  function openCfg() {
    const cfg = document.createElement('div'); cfg.className = 'pva-cfg';
    const P = V.PHOTO, demo = (() => { for (const i of Object.keys(V.ALBUM)) if (V.ALBUM[i]?.length) return [+i, V.ALBUM[i][0]]; return [V.T?.at ?? 0, 0]; })();
    const paint = () => {
      const keep = cfg.scrollTop;
      const secs = KINDS.map(([kind, title]) => {
        const items = V.PHOTO_ITEMS.filter(p => p.kind === kind);
        const note = kind === 'deco' ? `<small>${tt('album.decoMany')}</small>` : '';
        return `<div class="pva-sec">${title}${note}</div><div class="pva-grid">` + items.map(p => {
          const own = P.owned.includes(p.id), on = kind === 'deco' ? P.deco.includes(p.id) : P[kind] === p.id;
          return `<button class="pva-it ${on ? 'on' : ''} ${own ? '' : 'lock'}" data-id="${p.id}" data-k="${kind}" aria-label="${esc(p.name)}${own ? '' : ' (' + tt('album.inShop') + ')'}"><div class="th">${photoPreview(p.id)}</div>${own ? '' : LOCK}<b>${esc(p.name)}</b><em>${own ? (on ? (kind === 'deco' ? tt('album.active') : tt('album.placed')) : (kind === 'deco' ? tt('album.activate') : tt('album.place'))) : tt('album.inShop.up')}</em></button>`;
        }).join('') + `</div>`;
      }).join('');
      cfg.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('album.cfg.sub')}</small><h2>${tt('album.cfg.title')}</h2></div>
<div class="pva-pv"><div class="a">${coverSVG(P.cover, { title: true, deco: P.deco.filter(d => P.owned.includes(d)) })}</div><div class="b">${selfieHTML(demo[0], demo[1], { ...look(demo[1]), rot: 2 })}</div></div>${secs}<div class="pva-note">${tt('album.cfg.note')}</div>`;
      cfg.querySelector('[data-x]').onclick = () => { cfg.remove(); sfx('tap'); draw(); };
      cfg.querySelectorAll('.pva-it').forEach(b => b.onclick = () => {
        const id = b.dataset.id, k = b.dataset.k;
        if (!P.owned.includes(id)) { sfx('nope'); try { ctx.toast?.(tt('album.cfg.toast')); } catch (e) {} return; }
        if (k === 'deco') { const n = P.deco.indexOf(id); if (n >= 0) P.deco.splice(n, 1); else P.deco.push(id); } else P[k] = id;
        V.savePhoto(); sfx('tap'); paint();
      });
      cfg.scrollTop = keep;
    };
    paint(); root.appendChild(cfg);
  }
  draw();
  return root;
}

// ── Animación de la cámara en la partida (no bloquea: pointer-events:none, se va sola) ──
export function selfieReveal(ctx, i, res) {
  css();
  const V = ctx.V || VV;
  let hero; try { const H = ctx.artFor(ctx.skinId).HERO; hero = res.shot === 0 ? (H.wave?.[1] || H.wave?.[0] || H.idle?.[0]) : H.idle?.[0]; } catch (e) {}
  const long = !!res.region, R = res.region && V.REGIONS[res.region];
  const fl = document.createElement('div'); fl.className = 'pvrv-flash';
  const el = document.createElement('div'); el.className = 'pvrv' + (res.nuevo ? '' : ' dup') + (long ? ' long' : '');
  if (R) el.style.cssText = `--rc:${R.color};--rd:${R.dark}`;
  const sparks = [[-6, 4], [112, 0], [10, 86], [104, 80]].map(([x, y], k) => `<span class="sp" style="left:calc(50% - 150px + ${x * 1.3}px);top:${y}px;animation-delay:${.3 + k * .1}s">${svgWrap('0 0 20 20', '', star4(10, 10, 9.5, k % 2 ? '#fff' : '#FFD45E'), '')}</span>`).join('');
  el.innerHTML = `<div class="row"><div class="pol">${selfieHTML(i, res.shot, { frame: V.PHOTO?.frame, filter: V.PHOTO?.filter, hero, rot: 0 })}</div><div class="tx"><div class="tt">${res.nuevo ? tt('toast.selfieNew') : tt('album.dup', { n: res.coins })}</div>${res.nuevo ? `<div class="cc">+◉${res.coins}</div>` : ''}</div></div>`
    + (R ? `<div class="rg">${tt('album.regionDone', { region: esc(R.name.toUpperCase()) })}<br>+◉300 +♥</div>` : '') + sparks;
  document.body.append(fl, el);
  try { ctx.SFX?.[res.nuevo ? 'prize' : 'tap']?.(); ctx.buzz?.([20, 30, 20]); if (R) { setTimeout(() => { ctx.confetti?.(); ctx.SFX?.win?.(); }, 700); } } catch (e) {}
  setTimeout(() => { fl.remove(); el.remove(); }, long ? 2800 : 1900);
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCHILA: el contenido volcado sobre una mesa de papel. Es el menú de álbum, pasaportes y souvenirs.
// ═══════════════════════════════════════════════════════════════════════════
const BAG_CSS = `
.pvb-t{--th:max(430px,calc(100dvh - var(--st) - var(--navH,66px) - 118px));position:relative;max-width:100%;height:var(--th);overflow:hidden;touch-action:pan-y}
.pvb-alb{position:absolute;left:4%;top:2%;width:min(54%,calc(var(--th) * .395));transform:rotate(-5deg);transform-origin:50% 50%;perspective:900px;border:0;background:none;padding:0;display:block;-webkit-tap-highlight-color:transparent}
.pvb-alb .pg{position:absolute;left:3%;right:3%;top:3%;bottom:3%;border-radius:2px 8px 8px 2px;background:#FBF4E0;box-shadow:inset 0 0 0 1px #E3D3AE;transform:translateX(3px)}
.pvb-alb .pg:before{content:"";position:absolute;inset:14% 12% 14% 20%;background:repeating-linear-gradient(180deg,#0000 0 11px,#C9B88F55 11px 12px)}
.pvb-alb .cv{position:relative;transform-origin:5% 50%;filter:drop-shadow(0 2px 2px rgba(40,24,10,.3)) drop-shadow(0 8px 9px rgba(27,23,48,.35))}
.pvb-alb:active:not(.opening) .cv{transform:translateY(2px) scale(.985)}
.pvb-flyw{position:fixed;z-index:70;pointer-events:none;overflow:hidden;will-change:opacity}
.pvb-fly{position:absolute;pointer-events:none;transform-origin:7.8% 50%;perspective:1600px;will-change:transform,opacity}
.pvb-fly .pg{position:absolute;left:7.8%;right:7.8%;top:2.5%;bottom:3.7%;background-color:#E7D5AE;background-image:var(--nz);background-blend-mode:multiply;border-radius:2px 8px 8px 2px}
.pvb-fly .cv3{position:absolute;inset:0;transform-origin:7.8% 50%;transform-style:preserve-3d;will-change:transform}
.pvb-fly .front,.pvb-fly .back{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.pvb-fly .front{inset:0}
.pvb-fly .back{left:7.8%;right:7.8%;top:2.5%;bottom:3.7%;transform:rotateY(180deg);background:#D9C28F;border-radius:8px 2px 2px 8px;box-shadow:inset 0 0 0 3px #C2A56C,inset 14px 0 18px -8px rgba(60,35,10,.3)}
.pvb-fly svg{display:block;width:100%;height:auto}
.pvb-tag{display:inline-block;margin:-8px 0 0;padding:3px 10px 4px;background:#F6EBD0;color:#6B4E26;font:900 10px Nunito,sans-serif;letter-spacing:.9px;border-radius:3px;box-shadow:0 1px 1px rgba(40,24,10,.3),0 3px 6px rgba(27,23,48,.22);position:relative;white-space:nowrap}
.pvb-tag b{color:#C9402A;font:400 12px 'Lilita One',sans-serif;letter-spacing:.3px;margin-left:3px}
.pvb-alb .pvb-tag{transform:rotate(3deg);left:12%}
.pvb-pas{position:absolute;right:7%;top:2%;width:42%;height:32%;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent}
.pvb-pas .bk{position:absolute;left:50%;bottom:16%;width:56%;transform-origin:50% 112%;transition:transform .3s cubic-bezier(.3,1.4,.5,1);filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.32)) drop-shadow(0 5px 6px rgba(27,23,48,.3))}
.pvb-pas .bk svg,.pvb-sc svg,.pvb-dec svg{display:block;width:100%;height:auto;overflow:visible}
.pvb-pas:active .bk{filter:brightness(.96) drop-shadow(0 1px 1px rgba(40,24,10,.3))}
.pvb-pas .pvb-tag{z-index:20;position:absolute;left:50%;bottom:0;transform:translateX(-50%) rotate(-2.5deg)}
.pvb-dec{position:absolute;pointer-events:none;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.3)) drop-shadow(0 5px 6px rgba(27,23,48,.25))}
.pvb-sv{position:absolute;left:6%;right:6%;top:57%;bottom:1%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px}
.pvb-stage{position:relative;flex:1;width:100%;min-height:120px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:pointer}
.pvb-sc{position:absolute;left:0;top:0;transition:transform .45s cubic-bezier(.3,1.35,.5,1),opacity .3s;pointer-events:none;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.32)) drop-shadow(0 6px 7px rgba(27,23,48,.3))}
.pvb-sn{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 8px;min-height:30px}
.pvb-all{border:0;padding:4px 11px 5px;font:400 12px 'Lilita One',sans-serif;letter-spacing:.6px;color:#3A2410;background:#F2BC3E;border-radius:99px;box-shadow:0 2px 0 #A9701B,0 4px 6px rgba(27,23,48,.2)}.pvb-all:active{transform:translateY(2px);box-shadow:0 0 0 #A9701B}
.pvs-g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 10px;padding:16px 14px 8px}
.pvs-i{border:0;background:#F7ECD3;border-radius:14px;padding:8px 4px 7px;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 9px rgba(27,23,48,.2);transform:rotate(var(--r));text-align:center;color:#3A2A12;min-width:0}.pvs-i:active{transform:rotate(var(--r)) translateY(2px)}
.pvs-i .th{width:78%;margin:0 auto}.pvs-i svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.3))}
.pvs-i small{display:block;margin-top:3px;font:900 8.5px Nunito;letter-spacing:1px;color:#8A6A44;text-transform:uppercase}
.pvs-i b{display:block;margin-top:0;font:400 12.5px/1.1 'Lilita One',sans-serif;min-height:27px;display:flex;align-items:center;justify-content:center}
.pvs-big{width:min(70vw,280px)!important;filter:drop-shadow(0 10px 12px rgba(0,0,0,.4))}.pvs-big svg{display:block;width:100%;height:auto}
.pvb-sn .nm{padding:4px 14px 5px;background:#F6EBD0;color:#3A2A12;font:400 16px 'Lilita One',sans-serif;letter-spacing:.4px;box-shadow:0 1px 1px rgba(40,24,10,.3),0 3px 6px rgba(27,23,48,.22);clip-path:polygon(9px 0,100% 0,100% 100%,9px 100%,0 50%);padding-left:20px;transform:rotate(-1.5deg)}
.pvb-sn small{font:900 10px Nunito,sans-serif;letter-spacing:.9px;color:#6B4E26}
.pvb-dots{display:flex;gap:5px}.pvb-dots i{width:6px;height:6px;border-radius:50%;background:#B39463;opacity:.55}.pvb-dots i.on{background:#C9402A;opacity:1}
.pvb-empty{flex:1;width:100%;border:2.5px dashed #A98A5A;border-radius:18px;background:#F6EBD088;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#6B4E26;font:900 12px Nunito,sans-serif;letter-spacing:.6px;text-align:center;padding:10px;transform:rotate(-1.2deg)}
.pvb-empty svg{width:56px;height:56px;opacity:.45}.pvb-empty b{font:400 17px 'Lilita One',sans-serif;color:#4A3416;letter-spacing:.3px}
.pvb-empty u{text-decoration:none;display:inline-block;margin-top:2px;padding:3px 12px;border-radius:99px;background:#F2BC3E;color:#3A2410;font:400 13px 'Lilita One',sans-serif;box-shadow:0 2px 0 #A9701B}
/* pasaportes */
.pvp-st{display:flex;gap:8px;padding:14px 14px 4px}
.pvp-st div{flex:1;text-align:center;padding:7px 4px 6px;background:#F7ECD3;border-radius:12px;box-shadow:0 1px 1px rgba(40,24,10,.28),0 4px 7px rgba(27,23,48,.2);color:#3A2A12}
.pvp-st b{display:block;font:400 25px/1 'Lilita One',sans-serif;color:#C9402A}.pvp-st small{font:900 9px Nunito;letter-spacing:.9px;color:#6B4E26}
.pvp-r{margin:12px 12px 0;padding:10px 10px 10px;border-radius:16px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12;position:relative}
.pvp-r:before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:6px;border-radius:0 4px 4px 0;background:var(--rc)}
.pvp-rh{display:flex;align-items:center;gap:10px;padding-left:6px}
.pvp-rh .bk{width:46px;flex:none;filter:drop-shadow(0 2px 2px rgba(40,24,10,.3));transform:rotate(-4deg)}.pvp-rh .bk svg{display:block;width:100%;height:auto}
.pvp-rh b{display:block;font:400 19px/1.05 'Lilita One',sans-serif}.pvp-rh small{font:900 10px Nunito;letter-spacing:.8px;color:#6B4E26}
.pvp-rh u{margin-left:auto;text-decoration:none;font:400 13px 'Lilita One',sans-serif;padding:2px 11px;border-radius:99px;background:#76B85A;color:#fff;box-shadow:0 2px 0 #356F2E}
.pvp-rh u.pr{background:#F2BC3E;color:#3A2410;box-shadow:0 2px 0 #A9701B}
.pvp-sg{display:grid;grid-template-columns:repeat(5,1fr);gap:4px 2px;margin-top:8px}
.pvp-sg div{text-align:center;min-width:0}.pvp-sg svg{display:block;width:100%;height:auto;overflow:visible}
.pvp-sg span{display:block;font:900 7.5px Nunito;color:#6B4E26;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:-2px}.pvp-sg .nv span{opacity:.55}
.pvp-go{margin-top:10px;display:flex;align-items:center;gap:10px;padding-left:6px;font:700 11.5px Nunito;color:#6B4E26}.pvp-go .btn{width:auto;flex:none;padding:0 16px;height:44px;font-size:16px}
`;
let LOCKS = 0;
function lockScroll(root) {
  LOCKS++; document.documentElement.classList.add('pvlock');
  const mo = new MutationObserver(() => { if (!root.isConnected) { mo.disconnect(); if (--LOCKS <= 0) { LOCKS = 0; document.documentElement.classList.remove('pvlock'); } } });
  mo.observe(document.body, { childList: true });
}
function bagCss() { css(); if (document.getElementById('pvBagCss')) return; const st = document.createElement('style'); st.id = 'pvBagCss'; st.textContent = BAG_CSS; document.head.appendChild(st); }

// Libreta de pasaporte (lienzo 100×134), del color de la región
function passportSVG(V, r) {
  const R = V.REGIONS[r], u = 'pv' + (++UID);
  const body = `<rect x="5" y="5" width="90" height="124" rx="6" fill="${R.color}"/>`;
  return `<svg viewBox="0 0 100 134" aria-hidden="true"><rect x="5" y="5" width="90" height="124" rx="6" fill="${CREAM}" stroke="${CREAM}" stroke-width="7" stroke-linejoin="round"/>${body}<rect x="5" y="5" width="11" height="124" rx="5" fill="${R.dark}"/><path d="M5 117 Q5 129 17 129 H83 Q95 129 95 117 V111 Q50 120 5 111Z" fill="#000" opacity=".15"/>`
    + `<rect x="22" y="12" width="66" height="110" rx="3" fill="none" stroke="${R.light}" stroke-width="1.2" stroke-dasharray="3 2.4" opacity=".85"/>`
    + `<circle cx="55" cy="46" r="18" fill="none" stroke="${R.light}" stroke-width="2.6"/><ellipse cx="55" cy="46" rx="7.5" ry="18" fill="none" stroke="${R.light}" stroke-width="1.5"/><path d="M37 46 H73 M41 35 H69 M41 57 H69" stroke="${R.light}" stroke-width="1.4"/><path d="${plane(55, 46, 1.15)}" fill="${CREAM}" stroke="${R.dark}" stroke-width=".8"/>`
    + `<text x="55" y="86" text-anchor="middle" font-family="${LIL}" font-size="11" fill="${CREAM}" letter-spacing="1.2">${tt('passport.word')}</text><text x="55" y="99" text-anchor="middle" font-family="${LIL}" font-size="8" fill="${R.light}" letter-spacing="2">${esc(R.name.toUpperCase())}</text><rect x="38" y="108" width="34" height="5" rx="2.5" fill="#F2B937"/></svg>`;
}
function pencilSVG() {
  return `<svg viewBox="0 0 160 22"><g stroke="${CREAM}" stroke-width="5" stroke-linejoin="round"><path d="M10 3 H128 L152 11 L128 19 H10Z" fill="#F2BC3E"/></g><path d="M10 3 H128 L152 11 L128 19 H10Z" fill="#F2BC3E"/><path d="M10 11 H128" stroke="#D99A1F" stroke-width="2"/><path d="M128 3 L152 11 L128 19Z" fill="#F0D2A0"/><path d="M144 8 L152 11 L144 14Z" fill="#3A3558"/><rect x="2" y="3" width="14" height="16" rx="3" fill="#E9798C"/><rect x="16" y="3" width="6" height="16" fill="#B8BEC8"/></svg>`;
}
function openShopTab(ctx, tab) {
  const sh = document.getElementById('shop'); if (sh) sh.style.display = 'block';
  import('./tienda.js').then(m => m.openShop(ctx, tab)).catch(e => console.warn(e));
}

export function openBag(ctx) {
  bagCss();
  const V = ctx.V || VV, sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  document.querySelectorAll('.pvbag').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pva pvbag'; root.style.display = 'block'; document.body.appendChild(root); lockScroll(root);
  let idx = 0;
  const close = () => { root.remove(); sfx('tap'); };
  function draw() {
    const P = V.PHOTO, pass = V.T.passports || [], nReg = V.REGION_ORDER.length;
    const sv = V.SOUVENIRS.filter(s => P.owned.includes(s.id));
    if (idx >= sv.length) idx = 0;
    const cover = coverSVG(P.cover, { count: V.selfieCount(), total: V.selfieTotal(), deco: P.deco.filter(d => P.owned.includes(d)) });
    const m = pass.length, span = m < 2 ? 0 : Math.min(48, 16 * (m - 1));
    const fan = pass.map((r, k) => { const a = m < 2 ? 4 : -span / 2 + span * k / (m - 1); return `<div class="bk" style="transform:translateX(-50%) rotate(${a.toFixed(1)}deg);z-index:${k + 1}">${passportSVG(V, r)}</div>`; }).join('');
    const stage = sv.length
      ? `<div class="pvb-stage" data-st>${sv.map((s, k) => `<div class="pvb-sc" data-k="${k}">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div>`).join('')}</div><div class="pvb-sn"><span class="nm" data-nm></span><small data-ct></small><button class="pvb-all" data-all>${tt('bag.all')}</button></div>`
      : `<button class="pvb-empty" data-shop style="font-family:inherit">${LOCK.replace('class="lk"', '')}<b>${tt('bag.empty')}</b>${tt('bag.emptySub')}<u>${tt('bag.toShop')}</u></button>`;
    root.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('bag.sub')}</small><h2>${tt('nav.bag')}</h2></div>
<div class="pvb-t">
 <button class="pvb-alb" data-alb aria-label="${tt('bag.openAlbum')}"><div class="pg"></div><div class="cv">${cover}</div><span class="pvb-tag">${tt('album.word')} · <b>${V.selfieCount()}</b>/${V.selfieTotal()}</span></button>
 <div class="pvb-dec" style="right:5%;top:53%;width:34%;transform:rotate(-8deg)">${pencilSVG()}</div>
 <div class="pvb-dec" style="right:4%;top:37%;width:24%;transform:rotate(9deg)">${svgWrap('8 14 112 92', '', decoInner('d-pasajes'), '')}</div>
 <button class="pvb-pas" data-pas aria-label="${tt('bag.openPassports')}">${fan}<span class="pvb-tag">${tt('pass.plural')} · <b>${m}</b>/${nReg}</span></button>
 <div class="pvb-sv">${stage}${sv.length ? '' : ''}</div>
</div>`;
    const q = s => root.querySelector(s);
    q('[data-x]').onclick = close;
    q('[data-alb]').onclick = e => flyOpen(e.currentTarget);
    q('[data-pas]').onclick = () => { sfx('tap'); openPassport(ctx, () => draw()); };
    q('[data-shop]')?.addEventListener('click', () => { close(); openShopTab(ctx, 'objetos'); });
    if (sv.length) souvenirs(sv);
  }
  // ── Apertura/cierre del libro: viaja al centro, la tapa gira sobre el lomo (rotateY 0→-180°, con reverso) y la página interior crece hasta cubrir la pantalla y se funde en el álbum ya armado ──
  const HX = .078; // el lomo está al 7.8 % del ancho del dibujo de la tapa
  function bookFly(b, R) {
    const cv = b.querySelector('.cv'), s = cv.getBoundingClientRect(), w = cv.offsetWidth, h = cv.offsetHeight, vw = R.width, vh = R.height, mx = R.left + vw / 2, my = R.top + vh / 2;
    const cx = s.left + s.width / 2, cy = s.top + s.height / 2, a = w * (.5 - HX), th = -5 * Math.PI / 180;
    const S = Math.max(vw / (w * (1 - 2 * HX)), vh / (h * .94)) * 1.03, s1 = Math.min(vw * .6 / w, vh * .56 / h), Ox = cx - a;
    const fly = document.createElement('div'); fly.className = 'pvb-fly';
    fly.style.cssText = `left:${cx - w / 2 - R.left}px;top:${cy - h / 2 - R.top}px;width:${w}px;height:${h}px`;
    fly.innerHTML = `<div class="pg"></div><div class="cv3"><div class="front">${cv.innerHTML}</div><div class="back"></div></div>`;
    fly.querySelector('.pg').style.backgroundSize = (160 / S).toFixed(2) + 'px';
    const wrap = document.createElement('div'); wrap.className = 'pvb-flyw'; wrap.style.cssText = `left:${R.left}px;top:${R.top}px;width:${vw}px;height:${vh}px`; wrap.appendChild(fly); document.body.appendChild(wrap);
    const move = [
      { offset: 0, transform: `translate(${(a * (1 - Math.cos(th))).toFixed(2)}px,${(-a * Math.sin(th)).toFixed(2)}px) rotate(-5deg) scale(1)`, easing: 'cubic-bezier(.3,.7,.3,1)' },
      { offset: .3, transform: `translate(${(mx - Ox - s1 * a).toFixed(2)}px,${(my - cy).toFixed(2)}px) rotate(0deg) scale(${s1.toFixed(4)})`, easing: 'cubic-bezier(.55,0,.2,1)' },
      { offset: 1, transform: `translate(${(R.left - Ox).toFixed(2)}px,${(my - cy).toFixed(2)}px) rotate(0deg) scale(${S.toFixed(4)})` }];
    const turn = [{ offset: 0, transform: 'rotateY(0deg)' }, { offset: .22, transform: 'rotateY(0deg)', easing: 'cubic-bezier(.45,.05,.25,1)' }, { offset: .8, transform: 'rotateY(-180deg)' }, { offset: 1, transform: 'rotateY(-180deg)' }];
    return { fly: wrap, move, turn, inner: fly };
  }
  async function flyOpen(b) {
    if (b.classList.contains('opening')) return; b.classList.add('opening'); sfx('tap');
    const album = openAlbum(ctx, () => draw(), { preload: true, closeAnim: flyClose });
    const done = () => { b.classList.remove('opening'); b.style.visibility = ''; };
    if (!b.animate || matchMedia('(prefers-reduced-motion:reduce)').matches) { album.style.animation = 'none'; album.style.opacity = ''; album.style.pointerEvents = ''; done(); return; }
    try { await document.fonts?.ready; } catch (e) {}
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); // el álbum ya está pintado (opacity 0) antes de tocar la tapa
    const { fly, move, turn, inner } = bookFly(b, album.getBoundingClientRect()); b.style.visibility = 'hidden';
    const D = 900, o = { duration: D, fill: 'both' };
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    // el álbum real aparece debajo de la página (papel con papel) y recién después se retira la página
    const up = album.animate([{ opacity: 0 }, { opacity: 0, offset: .72 }, { opacity: 1 }], { duration: D, fill: 'both' });
    const out = fly.animate([{ opacity: 1 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: D, fill: 'both' });
    const cleanup = () => { album.style.opacity = ''; album.style.pointerEvents = ''; album.style.animation = 'none'; fly.remove(); done(); };
    Promise.all([up.finished, out.finished]).then(() => { up.cancel(); cleanup(); }, cleanup);
  }
  // Cierre: la animación inversa, más corta
  function flyClose(album, finish) {
    const b = root.querySelector('[data-alb]');
    if (!b || !b.animate || matchMedia('(prefers-reduced-motion:reduce)').matches) { finish(); return; }
    const { fly, move, turn, inner } = bookFly(b, album.getBoundingClientRect()), F = 110, D = 520, o = { duration: D, delay: F, direction: 'reverse', fill: 'both' };
    fly.style.opacity = '0';
    fly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, fill: 'forwards' });
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    setTimeout(() => { finish(); const nb = root.querySelector('[data-alb]'); if (nb) nb.style.visibility = 'hidden'; fly.style.opacity = '1'; }, F);
    setTimeout(() => { fly.remove(); const nb = root.querySelector('[data-alb]'); if (nb) nb.style.visibility = ''; }, F + D + 30);
  }
  // Carrusel de souvenirs: uno al frente sobre una pila en abanico; toque o deslizar para rotar
  function souvenirs(sv) {
    const n = sv.length, st = root.querySelector('[data-st]'), els = [...st.querySelectorAll('.pvb-sc')];
    const nm = root.querySelector('[data-nm]'), ct = root.querySelector('[data-ct]');
    const hash = k => { let h = (k + 1) * 2654435761 % 4294967296; h ^= h >>> 13; h = h * 1597334677 % 4294967296; return h; };
    // Filas de souvenirs derechos (±4°): separados si son pocos, cada vez más superpuestos si son muchos; el destacado va adelante y más grande
    const place = () => {
      const W = st.clientWidth || 300, H = st.clientHeight || 160, rows = n <= 4 ? 1 : n <= 10 ? 2 : 3, c = Math.ceil(n / rows);
      const sz = Math.min(W * .3, (H / rows) * 1.08, 118), edge = sz * .68;
      els.forEach((el, k) => {
        const r = Math.floor(k / c), i = k % c, cnt = Math.min(c, n - r * c);
        const step = cnt < 2 ? 0 : Math.min(sz * 1.12, (W - 2 * edge) / (cnt - 1)), x0r = W / 2 - step * (cnt - 1) / 2;
        const y = rows === 1 ? H * .5 : edge * .8 + (H - edge * 1.6) * (rows < 2 ? 0 : r / (rows - 1));
        const f = k === idx, rot = ((((hash(k) >> 5) % 1000) / 1000) - .5) * 8;
        el.style.width = sz + 'px';
        el.style.cssText += `;width:${sz}px;transform:translate(${(x0r + step * i - sz / 2).toFixed(1)}px,${(y - sz / 2 - (f ? 8 : 0)).toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${f ? 1.22 : 1});z-index:${f ? n + 5 : r * c + i + 1};opacity:1`;
      });
      nm.textContent = sv[idx].name; ct.textContent = n > 1 ? `${idx + 1}/${n}` : '';
    };
    place();
    let x0 = null;
    const go = d => { if (n < 2) { st.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'none' }], { duration: 320 }); return; } idx = (idx + d + n) % n; sfx('tap'); place(); };
    st.addEventListener('pointerdown', e => { x0 = e.clientX; });
    st.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; go(Math.abs(dx) > 28 ? (dx < 0 ? 1 : -1) : 1); });
    st.addEventListener('pointercancel', () => { x0 = null; });
    root.querySelector('[data-all]').onclick = () => { sfx('tap'); souvenirGrid(sv); };
  }
  // Vista ordenada de todos los souvenirs; al tocar uno se ve grande
  function souvenirGrid(sv) {
    const g = document.createElement('div'); g.className = 'panel pva pvsouv'; g.style.display = 'block'; lockScroll(g);
    g.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('bag.inBag', { n: sv.length })}</small><h2>${tt('bag.souvenirs')}</h2></div><div class="pvs-g">${sv.map((s, k) => `<button class="pvs-i" data-k="${k}" style="--r:${(((k * 7) % 9) - 4) * .9}deg"><div class="th">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div><small>${esc(s.country || '')}</small><b>${esc(s.name)}</b></button>`).join('')}</div>`;
    document.body.appendChild(g);
    g.querySelector('[data-x]').onclick = () => { g.remove(); sfx('tap'); };
    g.querySelectorAll('.pvs-i').forEach(b => b.onclick = () => {
      sfx('tap'); const s = sv[+b.dataset.k], R = V.REGIONS[s.region], ov = document.createElement('div'); ov.className = 'pva-det';
      ov.innerHTML = `<button class="round close" aria-label="${tt('common.close')}">✕</button><div class="big pvs-big">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div><div class="info"><b>${esc(s.name)}</b><small>${esc(s.country || (R ? R.name : ''))}</small></div>`;
      ov.onclick = e => { if (e.target === ov || e.target.closest('.round')) { ov.remove(); sfx('tap'); } };
      g.appendChild(ov);
    });
  }
  draw();
  return root;
}

// ── Página del pasaporte: regiones, sellos de destinos visitados, viajes y lo que falta ──
export function openPassport(ctx, onClose) {
  bagCss();
  const V = ctx.V || VV, sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  const root = document.createElement('div'); root.className = 'panel pva pvpass'; root.style.display = 'block'; document.body.appendChild(root); lockScroll(root);
  const T = V.T, vis = T.visits || {}, have = r => (T.passports || []).includes(r);
  const visited = Object.keys(vis).filter(k => vis[k] > 0).length;
  const order = [...V.REGION_ORDER.filter(have), ...V.REGION_ORDER.filter(r => !have(r))];
  const stamp = (d, i, R, k) => {
    const rot = ((i * 37) % 21) - 10, n = vis[i] || 0;
    if (!n) return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" fill="none" stroke="#B3A37F" stroke-width="2" stroke-dasharray="3.4 3"/><text x="30" y="38" text-anchor="middle" font-family="${LIL}" font-size="22" fill="#B3A37F" opacity=".7">?</text></svg>`;
    return `<svg viewBox="0 0 60 60" aria-label="${esc(d.place)}"><g transform="rotate(${rot} 30 30)"><circle cx="30" cy="30" r="27" fill="#FFF8E6"/><circle cx="30" cy="30" r="27" fill="none" stroke="${R.dark}" stroke-width="2.6"/><circle cx="30" cy="30" r="23" fill="none" stroke="${R.color}" stroke-width="1.2"/>${nest(d.art, 12, 9, 36)}<path d="M8 49 q5-3 10 0 t10 0 t10 0 t10 0" stroke="${R.dark}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>${n > 1 ? `<circle cx="48" cy="12" r="8" fill="${R.dark}"/><text x="48" y="15.6" text-anchor="middle" font-family="${LIL}" font-size="10" fill="#fff">×${n}</text>` : ''}</g></svg>`;
  };
  root.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('pass.sub')}</small><h2>${tt('pass.plural')}</h2></div>
<div class="pvp-st"><div><b>${T.trips || 0}</b><small>${tt('pass.trips')}</small></div><div><b>${visited}</b><small>${tt('pass.dests', { n: DESTINOS.length })}</small></div><div><b>${(T.passports || []).length}/${V.REGION_ORDER.length}</b><small>${tt('pass.plural')}</small></div></div>`
    + order.map(r => {
      const R = V.REGIONS[r], ds = V.destsOf(r), ok = have(r), v = ds.filter(i => vis[i] > 0).length;
      return `<div class="pvp-r" style="--rc:${R.color}"><div class="pvp-rh"><div class="bk">${passportSVG(V, r)}</div><div><b>${esc(R.pass)}</b><small>${esc(R.name.toUpperCase())} · ${tt('pass.destCount', { n: ds.length })}</small></div>${ok ? `<u>${v}/${ds.length}</u>` : `<u class="pr">◉ ${V.passPrice(r)}</u>`}</div>`
        + (ok ? `<div class="pvp-sg">${ds.map(i => `<div class="${vis[i] ? '' : 'nv'}">${stamp(DESTINOS[i], i, R)}<span>${esc(DESTINOS[i].place)}</span></div>`).join('')}</div>`
          : `<div class="pvp-go"><span>${tt('pass.missing', { n: ds.length, region: esc(R.name) })}</span><button class="btn sm" data-buy>${tt('nav.shop')}</button></div>`) + `</div>`;
    }).join('');
  root.querySelector('[data-x]').onclick = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { sfx('tap'); document.querySelectorAll('.pvbag').forEach(e => e.remove()); root.remove(); openShopTab(ctx, 'pasaportes'); });
  return root;
}
