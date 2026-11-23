// Álbum de selfies: polaroids papercut del viajero en cada destino, miniaturas de la tienda de fotografía,
// panel ÁLBUM a pantalla completa (por región, con tapa, souvenirs y adornos) y la animación de la cámara en la partida.
// Contrato: ver PLAN-viajes.md (ctx). Todo el arte es SVG con borde crema grueso; el CSS se inyecta una sola vez.
import { DESTINOS } from './destinos.js';
import { t as tt } from './i18n.js';
import * as VV from './viaje.js';
import { PLANE } from './runner-art.js';
import * as H from './historia.js';

const CREAM = '#FFF4DC', INK = '#1B1730';
let UID = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const HAND = "'Segoe Print','Bradley Hand','Chalkboard SE','Marker Felt','Comic Sans MS',cursive";
const LIL = "'Lilita One',sans-serif";

// ── Arte del personaje en selfies/ropa: elenco.js (heroFor) si está en el repo; si no, el arte del juego (TODO(elenco): quitar el respaldo) ──
let EL = null; import('./elenco.js').then(m => { EL = m; }).catch(() => {});
const HCACHE = {};
function heroSet(ctx, hero, skin, plain) {
  const k = hero + '/' + (skin || 'base') + (plain ? 'p' : '');
  if (HCACHE[k]) return HCACHE[k];
  let H;
  if (plain) { try { H = ctx.artFor(hero, skin || 'base').HERO; } catch (e) { H = null; } }
  try { if (!H && EL) H = EL.heroFor(hero, skin || 'base', plain ? {} : { style: 'h13' }); } catch (e) { H = null; }
  if (!H) { try { H = ctx.artFor(hero, skin || 'base').HERO; } catch (e) { H = {}; } }
  return EL ? (HCACHE[k] = H) : H;
}
function heroArt(ctx, hero, skin, shot, plain) {
  const H = heroSet(ctx, hero, skin, plain) || {};
  const svg = shot === 0 ? (H.wave?.[1] || H.wave?.[0] || H.idle?.[0]) : H.idle?.[0];
  const out = svg && uniqIds(svg);
  return out && !plain && TOPS[hero] != null ? out.replace('<svg ', `<svg data-top="${TOPS[hero]}" `) : out;
}
// Cima real de la cabeza (gorro, orejas, sombrero) de cada personaje en el cuadro de 128 (medida sobre todos sus atuendos): el encuadre de la selfie parte de ahí con margen
const TOPS = { nilo: -5, mora: -15, sipho: 5, minji: -5, tuk: -15, layla: -14, anaya: 1, cal: -4 };
// Cada uso lleva ids propios: dos atuendos del mismo personaje en una página no pisan sus defs/clipPath
function uniqIds(svg) {
  const u = 'h' + (++UID) + '_';
  return String(svg).replace(/\bid="([^"]+)"/g, (m, i) => `id="${u}${i}"`).replace(/url\(#([^)]+)\)/g, (m, i) => `url(#${u}${i})`).replace(/href="#([^"]+)"/g, (m, i) => `href="#${u}${i}"`);
}
const heroName = (ctx, id) => { try { return (ctx.V || VV).TRAVELERS.find(t => t.id === id)?.name || EL?.ELENCO?.[id]?.name || id[0].toUpperCase() + id.slice(1); } catch (e) { return id; } };

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
  // Caja cuadrada que arranca 3 unidades sobre la cabeza (data-top) y llega a la misma base que antes; overflow visible: la ventana de la foto ya recorta lo demás
  const top = +((/data-top="(-?[\d.]+)"/.exec(svg || '') || [])[1] ?? NaN), h = isNaN(top) ? 84 : 90 - (top - 3), box = isNaN(top) ? HERO_BOX : `${62 - h / 2} ${top - 3} ${h} ${h}`;
  const inner = (svg || FALLBACK_HERO).replace(/<svg[^>]*>/, `<svg viewBox="${box}" x="${x}" y="${y}" width="${size}" height="${size}" overflow="visible">`);
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
    case 's-jp': // maneki-neko con su moneda
      return cutS(`<path d="M84 66 C90 56 92 40 95 30 C98 22 108 23 107 33 C106 46 101 62 95 74Z" fill="#FFFDF6"/><path d="M28 108 C24 86 30 68 40 60 L80 60 C90 68 96 86 92 108Z" fill="#FFFDF6"/><path d="M33 36 L35 12 L52 25Z M87 36 L85 12 L68 25Z" fill="#FFFDF6"/><ellipse cx="60" cy="44" rx="30" ry="25" fill="#FFFDF6"/><ellipse cx="44" cy="88" rx="13" ry="16" fill="#F2B937"/>`,
        `<path d="M37 31 L38 17 L48 25Z M83 31 L82 17 L72 25Z" fill="#F4A0A6"/><path d="M68 22 Q80 20 86 32 Q78 36 70 30Z" fill="#F2A23A"/><path d="M78 80 Q90 84 91 104 L80 106 Q76 92 78 80Z" fill="#2B2440" opacity=".85"/><path d="M76 62 C86 70 92 88 92 108 L84 108 C84 88 82 72 76 62Z" fill="#E6DCC4" opacity=".6"/>`
        + `<path d="M45 45 q5 -5 10 0 M65 45 q5 -5 10 0" stroke="#1B1730" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M57 51 h6 l-3 3Z" fill="#E8798C"/><path d="M60 54 q-3 4 -7 2 M60 54 q3 4 7 2" stroke="#1B1730" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M38 50 h-10 M38 54 l-9 3 M82 50 h10 M82 54 l9 3" stroke="#B8AFA0" stroke-width="1.3" stroke-linecap="round"/>`
        + `<path d="M38 63 Q60 73 82 63 L82 69 Q60 79 38 69Z" fill="#E8452C"/><circle cx="60" cy="75" r="5" fill="#F2B937" stroke="#C48E2E" stroke-width="1.2"/><path d="M56 75 h8" stroke="#C48E2E" stroke-width="1.2"/><ellipse cx="101" cy="31" rx="4" ry="3.4" fill="#F4A0A6"/>`
        + `<ellipse cx="44" cy="88" rx="9" ry="12" fill="none" stroke="#C48E2E" stroke-width="1.4"/><path d="M40 82 h8 M40 88 h8 M40 94 h8" stroke="#C48E2E" stroke-width="1.6" stroke-linecap="round"/><path d="M36 80 q3 -5 7 -6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`);
    case 's-in': // elefante pintado
      return cutS(`<path d="M42 50 C46 36 92 34 100 50 C106 62 104 80 98 84 L98 106 L86 106 L86 90 L62 90 L62 106 L50 106 L50 86 C44 82 40 66 42 50Z" fill="#8E9AB4"/><path d="M46 44 C32 36 18 44 18 60 C18 72 22 82 24 92 C25 100 19 103 15 99 L12 104 C20 112 33 108 33 96 C33 88 31 80 35 74 C44 76 52 66 52 56Z" fill="#8E9AB4"/><path d="M42 46 C54 40 64 50 62 64 C60 76 48 78 42 70Z" fill="#7A87A3"/><path d="M64 40 L94 42 L96 74 L80 82 L66 74Z" fill="#E8452C"/>`,
        `<path d="M66 72 L80 80 L94 72" stroke="#F2B937" stroke-width="3" fill="none" stroke-linejoin="round"/><path d="M66 44 L94 46" stroke="#F2B937" stroke-width="3"/><path d="M80 50 L87 60 L80 70 L73 60Z" fill="#3E5BA9"/><circle cx="80" cy="60" r="2.6" fill="#F2B937"/><g fill="#5DB84F"><circle cx="70" cy="54" r="2.2"/><circle cx="90" cy="54" r="2.2"/><circle cx="70" cy="66" r="2.2"/><circle cx="90" cy="66" r="2.2"/></g><g fill="#F2B937"><circle cx="70" cy="78" r="2.2"/><circle cx="80" cy="85" r="2.6"/><circle cx="90" cy="78" r="2.2"/></g>`
        + `<path d="M22 50 l6 -7 l6 7 l-6 7Z" fill="#F2B937"/><circle cx="28" cy="50" r="2" fill="#E8452C"/><circle cx="30" cy="60" r="2.6" fill="#1B1730"/><path d="M31 76 q-6 7 -13 5" stroke="#FFFDF6" stroke-width="3.6" fill="none" stroke-linecap="round"/><g fill="#F28CB4"><circle cx="22" cy="72" r="1.8"/><circle cx="23" cy="80" r="1.8"/><circle cx="25" cy="88" r="1.8"/></g><path d="M98 52 C108 52 110 62 106 70" stroke="#7A87A3" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 104 h12 M86 104 h12" stroke="#FFFDF6" stroke-width="2.4"/><path d="M92 50 C102 60 102 80 98 86 L98 106 L92 106Z" fill="#6E7A95" opacity=".45"/>`);
    case 's-nl': // zueco con tulipanes
      return cutS(`<path d="M12 86 C12 74 24 70 34 72 L86 70 C96 70 102 76 106 84 C110 92 110 100 104 106 L22 106 C14 104 10 96 12 86Z" fill="#F2BC3E"/><ellipse cx="66" cy="74" rx="24" ry="6" fill="#9A6A1C"/><path d="M64 76 L63 30 L67 30 L68 76Z M54 76 L40 36 L44 35 L58 76Z M76 76 L88 38 L92 39 L80 76Z" fill="#3E7F3E"/><path d="M58 76 C44 68 40 54 44 46 C52 54 58 64 60 74Z" fill="#4E9A4A"/><path d="M74 76 C88 68 92 56 88 48 C80 56 74 64 72 74Z" fill="#5DB84F"/><path d="M55 16 Q55 32 65 34 Q75 32 75 16 L70 23 L65 12 L60 23Z" fill="#E8452C"/><path d="M32 22 Q32 38 42 40 Q52 38 52 22 L47 29 L42 18 L37 29Z" fill="#F28CB4"/><path d="M80 24 Q80 40 90 42 Q100 40 100 24 L95 31 L90 20 L85 31Z" fill="#F07A2A"/><path d="M40 78 Q66 86 90 78 L90 82 Q66 90 40 82Z" fill="#F2BC3E"/>`,
        `<path d="M14 100 Q60 104 106 98 L104 106 L22 106Z" fill="#D69A1D"/><path d="M65 12 L65 30 M42 18 L42 36 M90 20 L90 38" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M58 20 q2 8 6 10 M35 26 q2 8 6 10 M83 28 q2 8 6 10" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>`
        + `<g transform="translate(34 92)"><path d="M-3 6 L0 -4 L3 6Z" fill="#3E5BA9"/><path d="M0 -4 l-6 -6 M0 -4 l6 -6 M0 -4 l-6 6 M0 -4 l6 6" stroke="#3E5BA9" stroke-width="1.8" stroke-linecap="round"/></g><path d="M50 94 q4-4 8 0 q-4 6 -8 0Z M70 92 q4-4 8 0 q-4 6 -8 0Z" fill="#E8452C"/><circle cx="88" cy="92" r="2.4" fill="#3E5BA9"/>`);
    case 's-es': // abanico flamenco
      return cutS(`<rect x="55" y="88" width="10" height="24" rx="4" fill="#7A4A2B"/><path d="M60 92 L13.0 74.9 A50 50 0 0 1 107.0 74.9Z" fill="#E8452C"/>`,
        `<g fill="#1B1730"><circle cx="13.0" cy="74.9" r="3.2"/><circle cx="15.4" cy="69.3" r="3.2"/><circle cx="18.5" cy="64.0" r="3.2"/><circle cx="22.3" cy="59.2" r="3.2"/><circle cx="26.5" cy="54.8" r="3.2"/><circle cx="31.3" cy="51.0" r="3.2"/><circle cx="36.5" cy="47.9" r="3.2"/><circle cx="42.1" cy="45.3" r="3.2"/><circle cx="47.9" cy="43.5" r="3.2"/><circle cx="53.9" cy="42.4" r="3.2"/><circle cx="60.0" cy="42.0" r="3.2"/><circle cx="66.1" cy="42.4" r="3.2"/><circle cx="72.1" cy="43.5" r="3.2"/><circle cx="77.9" cy="45.3" r="3.2"/><circle cx="83.5" cy="47.9" r="3.2"/><circle cx="88.7" cy="51.0" r="3.2"/><circle cx="93.5" cy="54.8" r="3.2"/><circle cx="97.7" cy="59.2" r="3.2"/><circle cx="101.5" cy="64.0" r="3.2"/><circle cx="104.6" cy="69.3" r="3.2"/><circle cx="107.0" cy="74.9" r="3.2"/></g><path d="M60 92 L13.0 74.9 A50 50 0 0 1 107.0 74.9Z" fill="#E8452C"/><path d="M19.6 77.3 A43 43 0 0 1 100.4 77.3" stroke="#1B1730" stroke-width="3" fill="none" stroke-dasharray="2 2.4"/><path d="M60 92 L20.2 65.2 M60 92 L27.9 56.3 M60 92 L37.5 49.6 M60 92 L48.4 45.4 M60 92 L60.0 44.0 M60 92 L71.6 45.4 M60 92 L82.5 49.6 M60 92 L92.1 56.3 M60 92 L99.8 65.2" stroke="#B8341F" stroke-width="1.4"/><g fill="#FFF4DC"><circle cx="27.9" cy="75.7" r="2.6"/><circle cx="38.6" cy="81.1" r="2"/><circle cx="32.8" cy="68.4" r="2.6"/><circle cx="41.9" cy="76.3" r="2"/><circle cx="39.4" cy="62.5" r="2.6"/><circle cx="46.2" cy="72.3" r="2"/><circle cx="47.1" cy="58.4" r="2.6"/><circle cx="51.4" cy="69.6" r="2"/><circle cx="55.6" cy="56.3" r="2.6"/><circle cx="57.1" cy="68.2" r="2"/><circle cx="64.4" cy="56.3" r="2.6"/><circle cx="62.9" cy="68.2" r="2"/><circle cx="72.9" cy="58.4" r="2.6"/><circle cx="68.6" cy="69.6" r="2"/><circle cx="80.6" cy="62.5" r="2.6"/><circle cx="73.8" cy="72.3" r="2"/><circle cx="87.2" cy="68.4" r="2.6"/><circle cx="78.1" cy="76.3" r="2"/><circle cx="92.1" cy="75.7" r="2.6"/><circle cx="81.4" cy="81.1" r="2"/></g>`
        + `<g transform="translate(60 62)"><circle r="9" fill="#F28CB4"/><path d="M-5 -2 q5 -6 10 0 q-5 8 -10 0Z" fill="#D9567E"/><circle r="2.6" fill="#F2B937"/><path d="M6 6 q8 2 12 -2 q-6 -4 -12 2Z M-6 6 q-8 2 -12 -2 q6 -4 12 2Z" fill="#4E9A4A"/></g><circle cx="60" cy="92" r="3.4" fill="#F2B937" stroke="#C48E2E" stroke-width="1"/><path d="M58 112 q2 4 4 0" stroke="#E8452C" stroke-width="2" fill="none"/>`);
    case 's-ma': // tetera marroquí y su vasito
      return cutS(`<path d="M34 82 C24 76 18 62 9 54 L13 49 C23 56 30 63 38 67Z" fill="#D9A13A"/><path d="M86 64 C104 62 104 92 88 92 L88 86 C97 85 97 71 86 70Z" fill="#B9852A"/><path d="M34 100 C26 84 30 64 44 57 L76 57 C90 64 94 84 86 100Z" fill="#D9A13A"/><rect x="38" y="98" width="44" height="8" rx="3" fill="#B9852A"/><path d="M46 57 C46 45 52 39 60 37 C68 39 74 45 74 57Z" fill="#E7B952"/><path d="M60 38 L56 27 Q60 18 64 27Z" fill="#E7B952"/><path d="M8 84 L28 84 L25 110 L11 110Z" fill="#E8798C"/>`,
        `<path d="M36 72 Q60 80 84 72" stroke="#8A5A12" stroke-width="2" fill="none"/><path d="M33 90 Q60 96 87 90" stroke="#8A5A12" stroke-width="2" fill="none"/><g fill="#8A5A12"><circle cx="46" cy="82" r="1.8"/><circle cx="54" cy="84" r="1.8"/><circle cx="62" cy="84.6" r="1.8"/><circle cx="70" cy="84" r="1.8"/><circle cx="78" cy="82" r="1.8"/></g><path d="M74 60 C86 66 90 84 85 100 L78 100 C82 86 80 70 72 60Z" fill="#A9701B" opacity=".4"/><path d="M42 66 q4 -4 9 -4" stroke="#FFF1B8" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M50 50 Q60 46 70 50" stroke="#A9701B" stroke-width="1.6" fill="none"/>`
        + `<path d="M8 84 L28 84" stroke="#F2B937" stroke-width="3"/><path d="M12 94 L24 94 M13 100 L23 100" stroke="#F2B937" stroke-width="1.6" stroke-dasharray="2 2"/><path d="M14 88 L24 88 L23 92 L15 92Z" fill="#B8341F" opacity=".5"/><path d="M22 80 C30 70 36 78 28 84 C26 80 24 80 22 80Z" fill="#5DB84F"/>`);
    case 's-eg': // escarabajo de la suerte
      return cutS(`<circle cx="60" cy="14" r="9" fill="#F2B937"/><path d="M34 50 L14 40 L11 45 L31 58Z M32 70 L10 72 L10 78 L32 78Z M36 90 L18 104 L22 108 L40 96Z M86 50 L106 40 L109 45 L89 58Z M88 70 L110 72 L110 78 L88 78Z M84 90 L102 104 L98 108 L80 96Z" fill="#2B2440"/><ellipse cx="60" cy="68" rx="30" ry="38" fill="#2E9C8E"/><path d="M42 34 Q60 16 78 34 Q60 40 42 34Z" fill="#1F6E7A"/>`,
        `<path d="M60 40 V104" stroke="#1F6E7A" stroke-width="2.4"/><path d="M33 44 Q60 54 87 44 L87 50 Q60 60 33 50Z" fill="#F2B937"/><g fill="#3E5BA9"><circle cx="46" cy="70" r="4"/><circle cx="74" cy="70" r="4"/><circle cx="50" cy="88" r="3"/><circle cx="70" cy="88" r="3"/></g><g fill="none" stroke="#F2B937" stroke-width="1.6"><circle cx="46" cy="70" r="6"/><circle cx="74" cy="70" r="6"/></g><path d="M42 58 q-6 10 -2 26" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".45"/><path d="M78 40 C92 56 92 84 76 100 C86 82 86 60 72 44Z" fill="#1F6E7A" opacity=".5"/><circle cx="60" cy="14" r="5" fill="#F2C230"/><circle cx="57.6" cy="11.8" r="1.6" fill="#fff" opacity=".7"/>`);
    case 's-mx': // maracas
      return cutS(`<g transform="rotate(-26 42 70)"><rect x="38" y="64" width="9" height="46" rx="4.5" fill="#8A5A3B"/><ellipse cx="42.5" cy="44" rx="20" ry="24" fill="#E8452C"/></g><g transform="rotate(24 80 70)"><rect x="75" y="64" width="9" height="46" rx="4.5" fill="#C98F55"/><ellipse cx="79.5" cy="44" rx="20" ry="24" fill="#F2BC3E"/></g>`,
        `<g transform="rotate(-26 42 70)"><path d="M23 40 Q42.5 46 62 40 L62 48 Q42.5 54 23 48Z" fill="#4E9A4A"/><path d="M25 56 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5" stroke="#F2BC3E" stroke-width="2.6" fill="none" stroke-linejoin="round"/><g fill="#FFF4DC"><circle cx="34" cy="30" r="2.4"/><circle cx="44" cy="26" r="2.4"/><circle cx="52" cy="32" r="2.4"/></g><path d="M30 34 q2 -10 10 -12" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/><path d="M38 80 h9 M38 88 h9" stroke="#E8452C" stroke-width="2.4"/></g>`
        + `<g transform="rotate(24 80 70)"><path d="M60 40 Q79.5 46 99 40 L99 48 Q79.5 54 60 48Z" fill="#3E5BA9"/><path d="M62 56 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5" stroke="#E8452C" stroke-width="2.6" fill="none" stroke-linejoin="round"/><g fill="#E8452C"><circle cx="70" cy="30" r="2.4"/><circle cx="80" cy="26" r="2.4"/><circle cx="89" cy="32" r="2.4"/></g><path d="M67 34 q2 -10 10 -12" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/><path d="M75 80 h9 M75 88 h9" stroke="#4E9A4A" stroke-width="2.4"/></g>`);
    case 's-pe': // llama de peluche con su manta
      return cutS(`<rect x="44" y="84" width="9" height="24" rx="4" fill="#EADBB8"/><rect x="58" y="86" width="9" height="22" rx="4" fill="#EADBB8"/><rect x="76" y="86" width="9" height="22" rx="4" fill="#EADBB8"/><rect x="90" y="84" width="9" height="24" rx="4" fill="#EADBB8"/><ellipse cx="72" cy="76" rx="32" ry="17" fill="#F3E6C4"/><path d="M100 68 C110 64 112 74 104 78Z" fill="#F3E6C4"/><path d="M30 78 L28 38 C28 26 34 22 42 22 C50 23 52 30 50 38 L52 78Z" fill="#F3E6C4"/><path d="M31 26 L28 8 L37 20Z M44 22 L48 6 L50 22Z" fill="#F3E6C4"/><ellipse cx="30" cy="40" rx="11" ry="8" fill="#F3E6C4"/>`,
        `<path d="M54 60 L94 60 L96 84 L52 84Z" fill="#E8452C"/><path d="M54 66 H95 M53 78 H96" stroke="#F2BC3E" stroke-width="3"/><path d="M54 72 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" stroke="#3E5BA9" stroke-width="2" fill="none"/><g fill="#5DB84F"><circle cx="56" cy="88" r="3"/><circle cx="74" cy="88" r="3"/><circle cx="92" cy="88" r="3"/></g><g fill="#F28CB4"><circle cx="65" cy="88" r="3"/><circle cx="83" cy="88" r="3"/></g>`
        + `<circle cx="29" cy="10" r="4" fill="#E8798C"/><circle cx="48" cy="7" r="4" fill="#F2BC3E"/><path d="M32 22 C40 24 46 30 46 38" stroke="#F2BC3E" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="34" r="2.6" fill="#1B1730"/><circle cx="38.8" cy="33.2" r=".8" fill="#fff"/><ellipse cx="21" cy="40" rx="2" ry="1.4" fill="#8A6A44"/><path d="M22 45 q4 2 8 0" stroke="#8A6A44" stroke-width="1.4" fill="none" stroke-linecap="round"/><g fill="none" stroke="#E6D2A6" stroke-width="1.6" stroke-linecap="round"><path d="M36 50 q3 -2 6 0 M36 58 q3 -2 6 0 M36 66 q3 -2 6 0 M64 92 q0 0 0 0"/></g><path d="M86 62 C100 66 104 80 96 88 L92 88 C96 78 94 70 86 62Z" fill="#D9C79F" opacity=".5"/>`);
    case 's-nz': // kiwi de peluche
      return cutS(`<path d="M56 94 L54 108 L46 110 L58 110 L61 96Z M76 94 L76 108 L68 110 L80 110 L81 96Z" fill="#E9C08A"/><path d="M22 58 Q8 76 4 96 L8 97 Q15 78 27 64Z" fill="#E9C08A"/><ellipse cx="68" cy="68" rx="36" ry="30" fill="#8A5A3B"/><circle cx="34" cy="54" r="16" fill="#8A5A3B"/><path d="M90 30 C100 40 104 52 100 62 C96 52 90 44 82 40Z" fill="#5DB84F"/>`,
        `<path d="M70 40 q6 4 4 10 M84 46 q6 4 4 10 M56 44 q6 4 4 10 M64 62 q6 4 4 10 M80 66 q6 4 4 10 M94 60 q4 4 2 10 M52 70 q6 4 4 10 M70 82 q6 4 4 10" stroke="#6A4226" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M80 92 C96 88 106 74 104 62 C100 78 90 88 74 94Z" fill="#6A4226" opacity=".45"/><circle cx="30" cy="50" r="2.8" fill="#1B1730"/><circle cx="31" cy="49" r=".9" fill="#fff"/><path d="M26 58 q4 4 8 2" stroke="#E9C08A" stroke-width="1.6" fill="none"/><ellipse cx="40" cy="60" rx="4" ry="2.4" fill="#E8798C" opacity=".6"/><path d="M92 36 L88 46 M96 42 L91 50 M99 50 L93 56" stroke="#3E7F3E" stroke-width="1.6" stroke-linecap="round"/><path d="M46 46 q6 -8 14 -8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".3"/>`);
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
  V.syncAlbum?.();
  // cada selfie muestra al personaje de ese álbum con la skin que llevaba al tomarla
  const look = (shot, i) => ({ frame: V.PHOTO.frame, filter: V.PHOTO.filter, hero: heroArt(ctx, V.heroId(), V.ALBUMSKIN?.[i + '.' + shot] || 'base', shot) });
  document.querySelectorAll('.pvalb').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pva pvalb'; root.style.display = 'block';
  if (opts.preload) { root.style.animation = 'none'; root.style.opacity = '0'; root.style.pointerEvents = 'none'; }
  document.body.appendChild(root); lockScroll(root);
  let region = (V.T && V.regionOf(V.T.at)) || 'am';
  let closing = false;
  const finish = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  const close = () => { if (closing) return; closing = true; if (opts.closeAnim) opts.closeAnim(root, finish); else finish(); };

  const regCount = r => { const ds = V.destsOf(r); return { n: ds.reduce((a, d) => a + (V.ALBUM[d] || []).length, 0), t: ds.length * V.SHOTS.length }; };
  const done = () => ctx.store?.get?.(V.akey('albumDone'), []) || [];

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
            ? `<button class="pva-slot" data-i="${i}" data-s="${s.id}" aria-label="${esc(d.place)}: ${esc(s.name)}">${selfieHTML(i, s.id, look(s.id, i))}</button>`
            : `<button class="pva-slot" disabled aria-label="${esc(tt('album.missingAria', { place: d.place, shot: s.name }))}">${slotHTML(i, s.id)}</button>`).join('') + `</div></div>`;
      }).join('');
    el.querySelectorAll('.pva-slot:not(:disabled)').forEach(b => b.onclick = () => detail(+b.dataset.i, +b.dataset.s));
  }
  function detail(i, s) {
    sfx('tap');
    const d = DESTINOS[i], ov = document.createElement('div'); ov.className = 'pva-det';
    ov.innerHTML = `<button class="round close" aria-label="${tt('common.close')}">✕</button><div class="big">${selfieHTML(i, s, { ...look(s, i), rot: 0 })}</div><div class="info"><b>${esc(d.place)}</b><small>${esc(d.country)} · ${V.SHOTS[s].name}</small></div>`;
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
<div class="pva-pv"><div class="a">${coverSVG(P.cover, { title: true, deco: P.deco.filter(d => P.owned.includes(d)) })}</div><div class="b">${selfieHTML(demo[0], demo[1], { ...look(demo[1], demo[0]), rot: 2 })}</div></div>${secs}<div class="pva-note">${tt('album.cfg.note')}</div>`;
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
  let hero; try { hero = heroArt(ctx, res.hero || V.heroId?.() || 'nilo', res.skin || 'base', res.shot); } catch (e) {}
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
.pvb-t{--th:max(430px,calc(100dvh - var(--st) - var(--navH,66px) - 118px));position:relative;isolation:isolate;max-width:100%;height:var(--th);overflow:hidden;touch-action:pan-y}
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
.pvb-eqm{position:absolute;left:50%;top:1%;z-index:21;padding:2px 9px 3px;border-radius:99px;background:#76B85A;color:#fff;font:400 10.5px 'Lilita One',sans-serif;letter-spacing:.4px;box-shadow:0 2px 0 #356F2E,0 3px 6px rgba(27,23,48,.3);transform:translateX(-50%);white-space:nowrap}
.pvb-pas .bk.eq{filter:drop-shadow(0 0 0 #76B85A) drop-shadow(0 0 3px #76B85A) drop-shadow(0 2px 2px rgba(40,24,10,.32))}
.pvb-pas .pvb-tag{z-index:20;position:absolute;left:50%;bottom:0;transform:translateX(-50%) rotate(-2.5deg)}
.pvb-dec{position:absolute;pointer-events:none;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.3)) drop-shadow(0 5px 6px rgba(27,23,48,.25))}
.pvb-dia{position:absolute;left:3%;top:57%;width:31%;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent;transform:rotate(-6deg);z-index:3}
.pvb-dia .dv{filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.32)) drop-shadow(0 6px 7px rgba(27,23,48,.3))}.pvb-dia .dv svg{display:block;width:100%;height:auto;overflow:visible}
.pvb-dia:active:not(.opening) .dv{transform:translateY(2px) scale(.98)}
.pvb-dia .pvb-tag{position:absolute;left:50%;bottom:-6px;margin:0;transform:translateX(-50%) rotate(4deg)}
.pvb-sv{position:absolute;left:37%;right:2%;top:56%;bottom:1%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px}
.pvb-stage{position:relative;flex:1;width:100%;min-height:120px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:pointer}
.pvb-sc svg *{pointer-events:visiblePainted}
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
.pvp-eqr{display:flex;align-items:center;gap:8px;margin:8px 0 0 6px;font:700 10.5px Nunito;color:#6B4E26}
.pvp-eq{flex:none;border:0;cursor:pointer;font:400 13px 'Lilita One',sans-serif;padding:3px 14px 4px;border-radius:99px;background:#F2BC3E;color:#3A2410;box-shadow:0 2px 0 #A9701B}.pvp-eq.on{background:#76B85A;color:#fff;box-shadow:0 2px 0 #356F2E}
.pvp-r.eq{box-shadow:0 0 0 3px #76B85A,0 6px 10px rgba(27,23,48,.22)}
.pvp-rt{margin:12px 12px 0;padding:10px 0 4px;border-radius:16px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12;overflow:hidden}
.pvp-rth{display:flex;align-items:center;gap:8px;padding:0 12px}.pvp-rth>div{flex:1;min-width:0}.pvp-rth b{display:block;font:400 17px/1.1 'Lilita One',sans-serif}.pvp-rth small{font:900 9px Nunito;letter-spacing:.8px;color:#6B4E26}
.pvp-rth u{text-decoration:none;font:400 13px 'Lilita One',sans-serif;padding:2px 11px;border-radius:99px;background:#C9402A;color:#fff;box-shadow:0 2px 0 #8E2A17}
.pvp-car{display:flex;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding:0 14px;padding:10px 14px 12px;touch-action:pan-x pan-y;scrollbar-width:none;-webkit-overflow-scrolling:touch}.pvp-car::-webkit-scrollbar{display:none}
.pvp-rc{flex:none;width:112px;scroll-snap-align:start;padding:8px 6px 9px;border-radius:12px;background:#FFF8E6;box-shadow:0 1px 1px rgba(40,24,10,.25),0 4px 7px rgba(27,23,48,.16);text-align:center;transform:rotate(var(--r));position:relative}
.pvp-rc:before{content:"";position:absolute;left:10px;right:10px;top:0;height:4px;border-radius:0 0 4px 4px;background:var(--rc);opacity:.85}
.pvp-rc .st{width:76px;margin:0 auto 2px}.pvp-rc .st svg{display:block;width:100%;height:auto;overflow:visible}
.pvp-rc b{display:block;font:400 13.5px/1.05 'Lilita One',sans-serif;color:#3A2A12;min-height:28px;display:flex;align-items:center;justify-content:center}
.pvp-rc small{display:block;margin-top:3px;font:800 8.5px/1.25 Nunito,sans-serif;color:#6B4E26}
.pvp-rc:not(.ok){background:#EFE3C6}.pvp-rc:not(.ok):before{background:#B3A37F}.pvp-rc:not(.ok) b{color:#8C7E5C}.pvp-rc:not(.ok) small{opacity:.7}
.pvb-rop{position:absolute;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent;transform:rotate(5deg)}
.pvb-rop svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.3)) drop-shadow(0 6px 7px rgba(27,23,48,.3))}
.pvb-rop .g0{position:relative}.pvb-rop .gu{position:absolute;left:0;top:0;width:100%}.pvb-rop .gu svg{filter:drop-shadow(0 1px 1px rgba(40,24,10,.3)) drop-shadow(0 3px 4px rgba(27,23,48,.22))}
.pvb-rop:active:not(.opening) .g0 svg{transform:translateY(2px) scale(.985)}
.pvb-rop .pvb-tag{position:absolute;left:50%;bottom:-8px;margin:0;transform:translateX(-50%) rotate(-3deg)}
.pvc-flyw{position:fixed;z-index:70;pointer-events:none;perspective:1700px}
.pvc-mv,.pvc-sh{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.pvc-col,.pvc-c{position:absolute;transform-style:preserve-3d}
.pvc-c i{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.pvc-c .f{background:var(--paper,#F3E9D0);box-shadow:inset 0 0 0 1px #C9B88F77}
.pvc-c .k{background:var(--gk,#3E5BA9);transform:rotateY(180deg);box-shadow:inset 0 0 0 1px #2C3F80,inset 0 0 26px rgba(20,25,70,.3)}
.pvc-ic{position:absolute;translate:0 0 8px;filter:drop-shadow(0 3px 5px rgba(27,23,48,.35))}.pvc-ic svg{display:block;width:100%;height:100%}
.pvcloth{background-image:linear-gradient(90deg,#0000 calc(33.33% - .5px),#C9B88F66 0 calc(33.33% + .5px),#0000 0),linear-gradient(90deg,#0000 calc(66.66% - .5px),#C9B88F66 0 calc(66.66% + .5px),#0000 0),linear-gradient(180deg,#0000 calc(33.33% - .5px),#C9B88F66 0 calc(33.33% + .5px),#0000 0),linear-gradient(180deg,#0000 calc(66.66% - .5px),#C9B88F66 0 calc(66.66% + .5px),#0000 0)}
.pvc-hero{display:flex;flex-direction:column;align-items:center;margin:6px 0 0;color:#3A2A12}.pvc-hero .art{width:150px;filter:drop-shadow(0 3px 3px rgba(40,24,10,.3))}.pvc-hero svg,.pvc-sk svg{display:block;width:100%;height:auto}
.pvc-hero b{font:400 24px/1 'Lilita One',sans-serif;margin-top:4px}.pvc-hero small{font:900 10px Nunito;letter-spacing:.9px;color:#6B4E26;text-transform:uppercase}
.pvc-hint{margin:18px 22px 0;text-align:center;font:700 11.5px Nunito;color:#6B4E26}
.pvc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:12px 14px 6px}
.pvc-sk{position:relative;padding:8px 8px 10px;border-radius:16px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
.pvc-sk .art{width:78%}.pvc-sk b{font:400 16px/1.05 'Lilita One',sans-serif}.pvc-sk.on{box-shadow:0 0 0 3px #76B85A,0 6px 10px rgba(27,23,48,.22)}
.pvc-sk.lock .art{filter:grayscale(1) opacity(.55)}.pvc-sk.lock b{opacity:.7}
.pvc-pr{font:400 14px 'Lilita One',sans-serif;color:#A9701B}
.pvc-b{border:0;cursor:pointer;font:400 13px 'Lilita One',sans-serif;padding:3px 16px 4px;border-radius:99px;background:#F2BC3E;color:#3A2410;box-shadow:0 2px 0 #A9701B}.pvc-b.on{background:#76B85A;color:#fff;box-shadow:0 2px 0 #356F2E}.pvc-b.shop{background:#EADBB8;color:#6B4E26;box-shadow:0 2px 0 #B3A37F}
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
  V.syncAlbum?.(); // el álbum de la mochila es el del personaje actual
  const root = document.createElement('div'); root.className = 'panel pva pvbag'; root.style.display = 'block'; document.body.appendChild(root); lockScroll(root);
  let idx = 0;
  const eq0 = V.passEq ? V.passEq() : null; // si cambia el pasaporte equipado, el destino se regenera al cerrar para aplicar las aduanas
  const close = () => { root.remove(); sfx('tap'); if ((V.passEq ? V.passEq() : null) !== eq0) { try { sessionStorage.removeItem('pv.auto'); } catch (e) {} setTimeout(() => location.reload(), 120); } };
  function draw() {
    const P = V.PHOTO, pass = V.T.passports || [], nReg = V.REGION_ORDER.length;
    const sv = V.SOUVENIRS.filter(s => P.owned.includes(s.id));
    if (idx >= sv.length) idx = 0;
    const cover = coverSVG(P.cover, { count: V.selfieCount(), total: V.selfieTotal(), deco: P.deco.filter(d => P.owned.includes(d)) });
    const m = pass.length, span = m < 2 ? 0 : Math.min(48, 16 * (m - 1));
    const eq = V.passEq ? V.passEq() : null, ordered = eq ? [...pass.filter(r => r !== eq), eq] : pass; // el pasaporte equipado va al frente
    const fan = ordered.map((r, k) => { const a = m < 2 ? 4 : -span / 2 + span * k / (m - 1); return `<div class="bk${r === eq ? ' eq' : ''}" data-r="${r}" style="transform:translateX(-50%) rotate(${a.toFixed(1)}deg);z-index:${k + 1}">${passportSVG(V, r)}</div>`; }).join('');
    const stage = sv.length
      ? `<div class="pvb-stage" data-st>${sv.map((s, k) => `<div class="pvb-sc" data-k="${k}">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div>`).join('')}</div><div class="pvb-sn"><span class="nm" data-nm></span><small data-ct></small><button class="pvb-all" data-all>${tt('bag.all')}</button></div>`
      : `<button class="pvb-empty" data-shop style="font-family:inherit">${LOCK.replace('class="lk"', '')}<b>${tt('bag.empty')}</b>${tt('bag.emptySub')}<u>${tt('bag.toShop')}</u></button>`;
    root.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('bag.sub')}</small><h2>${tt('nav.bag')}</h2></div>
<div class="pvb-t">
 <button class="pvb-alb" data-alb aria-label="${tt('bag.openAlbum')}"><div class="pg"></div><div class="cv">${cover}</div><span class="pvb-tag">${tt('album.word')} · <b>${V.selfieCount()}</b>/${V.selfieTotal()}</span></button>
 <div class="pvb-dec" style="left:9%;top:53%;width:34%;transform:rotate(-4deg)">${pencilSVG()}</div>
 <button class="pvb-dia" data-dia aria-label="Abrir el diario">${diaryNow()}</button>
 <button class="pvb-rop" data-rop aria-label="${tt('bag.openCloth')}" style="right:6%;top:36%;width:30%">${clothPile(ctx)}<span class="pvb-tag">${tt('bag.cloth')}</span></button>
 <button class="pvb-pas" data-pas aria-label="${tt('bag.openPassports')}">${fan}${eq ? `<span class="pvb-eqm">✓ ${tt('pass.equipped')} · ${esc(V.REGIONS[eq].name)}</span>` : ''}<span class="pvb-tag">${tt('pass.plural')} · <b>${m}</b>/${nReg}</span></button>
 <div class="pvb-sv">${stage}${sv.length ? '' : ''}</div>
</div>`;
    const q = s => root.querySelector(s);
    q('[data-x]').onclick = close;
    q('[data-alb]').onclick = e => flyOpen(e.currentTarget);
    q('[data-rop]').onclick = e => flyCloth(e.currentTarget);
    q('[data-pas]').onclick = e => flyPass(e.currentTarget);
    q('[data-dia]').onclick = e => flyDiary(e.currentTarget);
    q('[data-shop]')?.addEventListener('click', () => { close(); openShopTab(ctx, 'objetos'); });
    if (sv.length) souvenirs(sv);
    warmCloth();
  }
  // Hornea en un rato libre el arte de los atuendos del personaje: la página Ropa abre sin trabarse al principio de la animación
  let warmed = '';
  function warmCloth() {
    const hero = V.heroId?.() || 'nilo'; if (warmed === hero) return; warmed = hero;
    const ric = window.requestIdleCallback || (f => setTimeout(f, 200));
    ric(() => { try { wardrobe(ctx, hero).forEach(k => heroArt(ctx, hero, k.id, 1, true)); } catch (e) {} });
  }
  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  // ── Apertura/cierre del libro: viaja al centro, la tapa gira sobre el lomo (rotateY 0→-180°, con reverso) y la página interior crece hasta cubrir la pantalla y se funde en el álbum ya armado ──
  // Geometría de cada libro: lomo (hx = margen lateral del dibujo), márgenes de la página interior, giro sobre la mesa y colores
  const ALB = { hx: .078, top: .025, bot: .037, ang: -5 };
  const passGeo = el => { const r = el.dataset.r, R = V.REGIONS[r] || {}, m = /rotate\((-?[\d.]+)deg\)/.exec(el.style.transform || ''); return { hx: .05, top: .037, bot: .037, ang: m ? +m[1] : 0, page: '#F6EEDB', back: R.dark, line: R.color }; };
  function bookFly(cv, R, G = ALB) {
    const HX = G.hx, s = cv.getBoundingClientRect(), w = cv.offsetWidth, h = cv.offsetHeight, vw = R.width, vh = R.height, mx = R.left + vw / 2, my = R.top + vh / 2;
    const cx = s.left + s.width / 2, cy = s.top + s.height / 2, a = w * (.5 - HX), th = G.ang * Math.PI / 180;
    const S = Math.max(vw / (w * (1 - 2 * HX)), vh / (h * (1 - G.top - G.bot))) * 1.03, s1 = Math.min(vw * .6 / w, vh * .56 / h), Ox = cx - a;
    const fly = document.createElement('div'); fly.className = 'pvb-fly';
    fly.style.cssText = `left:${cx - w / 2 - R.left}px;top:${cy - h / 2 - R.top}px;width:${w}px;height:${h}px;transform-origin:${HX * 100}% 50%`;
    const ins = `left:${HX * 100}%;right:${HX * 100}%;top:${G.top * 100}%;bottom:${G.bot * 100}%`;
    fly.innerHTML = `<div class="pg" style="${ins}${G.page ? `;background-color:${G.page}` : ''}"></div><div class="cv3" style="transform-origin:${HX * 100}% 50%"><div class="front">${cv.innerHTML}</div><div class="back" style="${ins}${G.back ? `;background:${G.back};box-shadow:inset 0 0 0 3px ${G.line || G.back},inset 14px 0 18px -8px rgba(0,0,0,.3)` : ''}"></div></div>`;
    fly.querySelector('.pg').style.backgroundSize = (160 / S).toFixed(2) + 'px';
    const wrap = document.createElement('div'); wrap.className = 'pvb-flyw'; wrap.style.cssText = `left:${R.left}px;top:${R.top}px;width:${vw}px;height:${vh}px`; wrap.appendChild(fly); document.body.appendChild(wrap);
    const move = [
      { offset: 0, transform: `translate(${(a * (1 - Math.cos(th))).toFixed(2)}px,${(-a * Math.sin(th)).toFixed(2)}px) rotate(${G.ang}deg) scale(1)`, easing: 'cubic-bezier(.3,.7,.3,1)' },
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
    const { fly, move, turn, inner } = bookFly(b.querySelector('.cv'), album.getBoundingClientRect()); b.style.visibility = 'hidden';
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
    const { fly, move, turn, inner } = bookFly(b.querySelector('.cv'), album.getBoundingClientRect()), F = 110, D = 520, o = { duration: D, delay: F, direction: 'reverse', fill: 'both' };
    fly.style.opacity = '0';
    fly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, fill: 'forwards' });
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    setTimeout(() => { finish(); const nb = root.querySelector('[data-alb]'); if (nb) nb.style.visibility = 'hidden'; fly.style.opacity = '1'; }, F);
    setTimeout(() => { fly.remove(); const nb = root.querySelector('[data-alb]'); if (nb) nb.style.visibility = ''; }, F + D + 30);
  }
  // ── Diario del viajero: ficha + postales de su historia. La libreta viaja al centro y se abre como el álbum ──
  function diaryNow() {
    const hero = V.heroId?.() || 'nilo', P = H.progress(hero), n = P ? P.got.length : 0;
    return `<div class="dv">${H.diarySVG(hero, n, P ? P.unseen : 0)}</div><span class="pvb-tag">DIARIO${P ? ` · <b>${Math.min(n, P.total)}</b>/${P.total}` : ''}</span>`;
  }
  const DIA = { hx: .073, top: .114, bot: .043, ang: -6, page: '#EFE3C6', back: '#6A4226', line: '#8A5A3B' };
  async function flyDiary(b) {
    if (b.classList.contains('opening')) return; sfx('tap');
    const hero = V.heroId?.() || 'nilo', cv = b.querySelector('.dv');
    if (!cv || !b.animate || reduced()) { H.openDiary(ctx, hero, () => draw()); return; }
    b.classList.add('opening');
    const page = H.openDiary(ctx, hero, () => draw(), { preload: true, closeAnim: diaryClose });
    const done = () => { b.classList.remove('opening'); cv.style.visibility = ''; };
    try { await document.fonts?.ready; } catch (e) {}
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const { fly, move, turn, inner } = bookFly(cv, page.getBoundingClientRect(), DIA); cv.style.visibility = 'hidden';
    const D = 820, o = { duration: D, fill: 'both' };
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    const up = page.animate([{ opacity: 0 }, { opacity: 0, offset: .72 }, { opacity: 1 }], { duration: D, fill: 'both' });
    const out = fly.animate([{ opacity: 1 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: D, fill: 'both' });
    const cleanup = () => { page.style.opacity = ''; page.style.pointerEvents = ''; page.style.animation = 'none'; fly.remove(); done(); };
    Promise.all([up.finished, out.finished]).then(() => { up.cancel(); cleanup(); }, cleanup);
  }
  function diaryClose(page, finish) {
    const cv = root.querySelector('[data-dia] .dv');
    if (!cv || !cv.animate || reduced()) { finish(); return; }
    const { fly, move, turn, inner } = bookFly(cv, page.getBoundingClientRect(), DIA), F = 110, D = 500, o = { duration: D, delay: F, direction: 'reverse', fill: 'both' };
    fly.style.opacity = '0';
    fly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, fill: 'forwards' });
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    setTimeout(() => { finish(); const nb = root.querySelector('[data-dia] .dv'); if (nb) nb.style.visibility = 'hidden'; fly.style.opacity = '1'; }, F);
    setTimeout(() => { fly.remove(); const nb = root.querySelector('[data-dia] .dv'); if (nb) nb.style.visibility = ''; }, F + D + 30);
  }
  // ── Pasaporte: la libreta de adelante del abanico viaja al centro y se abre igual que el álbum ──
  const topPass = () => [...root.querySelectorAll('.pvb-pas .bk')].pop() || null;
  async function flyPass(b) {
    if (b.classList.contains('opening')) return;
    const bk = topPass(); sfx('tap');
    if (!bk || !b.animate || reduced()) { openPassport(ctx, () => draw()); return; }
    b.classList.add('opening');
    const page = openPassport(ctx, () => draw(), { preload: true, closeAnim: passClose });
    const done = () => { b.classList.remove('opening'); bk.style.visibility = ''; };
    try { await document.fonts?.ready; } catch (e) {}
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const { fly, move, turn, inner } = bookFly(bk, page.getBoundingClientRect(), passGeo(bk)); bk.style.visibility = 'hidden';
    const D = 820, o = { duration: D, fill: 'both' };
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    const up = page.animate([{ opacity: 0 }, { opacity: 0, offset: .72 }, { opacity: 1 }], { duration: D, fill: 'both' });
    const out = fly.animate([{ opacity: 1 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: D, fill: 'both' });
    const cleanup = () => { page.style.opacity = ''; page.style.pointerEvents = ''; page.style.animation = 'none'; fly.remove(); done(); };
    Promise.all([up.finished, out.finished]).then(() => { up.cancel(); cleanup(); }, cleanup);
  }
  function passClose(page, finish) {
    const bk = topPass();
    if (!bk || !bk.animate || reduced()) { finish(); return; }
    const { fly, move, turn, inner } = bookFly(bk, page.getBoundingClientRect(), passGeo(bk)), F = 110, D = 500, o = { duration: D, delay: F, direction: 'reverse', fill: 'both' };
    fly.style.opacity = '0';
    fly.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, fill: 'forwards' });
    inner.animate(move, o); inner.querySelector('.cv3').animate(turn, o);
    setTimeout(() => { finish(); const nb = topPass(); if (nb) nb.style.visibility = 'hidden'; fly.style.opacity = '1'; }, F);
    setTimeout(() => { fly.remove(); const nb = topPass(); if (nb) nb.style.visibility = ''; }, F + D + 30);
  }
  // ── Ropa: la prenda viaja al centro y se desdobla en pasos hasta la página; al cerrar, la animación inversa ──
  async function flyCloth(b) {
    if (b.classList.contains('opening')) return; b.classList.add('opening'); sfx('tap');
    const page = openCloth(ctx, () => draw(), { preload: true, closeAnim: clothClose });
    const done = () => { b.classList.remove('opening'); b.querySelectorAll('.g0').forEach(x => x.style.visibility = ''); };
    if (!b.animate || reduced()) { page.style.animation = 'none'; page.style.opacity = ''; page.style.pointerEvents = ''; done(); return; }
    await new Promise(r => requestAnimationFrame(r));
    const g0 = b.querySelector('.g0') || b, cs = clothSheet(page.getBoundingClientRect(), g0, clothCol(ctx)); document.body.appendChild(cs.wrap); g0.style.visibility = 'hidden';
    const D = 1150, o = { duration: D, fill: 'both' }; cs.play(o);
    const up = page.animate([{ opacity: 0 }, { opacity: 0, offset: .78 }, { opacity: 1 }], { duration: D, fill: 'both' });
    const out = cs.wrap.animate([{ opacity: 1 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: D, fill: 'both' });
    const cleanup = () => { page.style.opacity = ''; page.style.pointerEvents = ''; page.style.animation = 'none'; cs.wrap.remove(); done(); };
    Promise.all([up.finished, out.finished]).then(() => { up.cancel(); cleanup(); }, cleanup);
  }
  function clothClose(page, finish) {
    const b = root.querySelector('[data-rop] .g0');
    if (!b || !b.animate || reduced()) { finish(); return; }
    const cs = clothSheet(page.getBoundingClientRect(), b, clothCol(ctx)), F = 110, D = 850, o = { duration: D, delay: F, direction: 'reverse', fill: 'both' };
    cs.wrap.style.opacity = '0'; document.body.appendChild(cs.wrap);
    cs.wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, fill: 'forwards' });
    cs.play(o);
    setTimeout(() => { finish(); const nb = root.querySelector('[data-rop] .g0'); if (nb) nb.style.visibility = 'hidden'; cs.wrap.style.opacity = '1'; }, F);
    setTimeout(() => { cs.wrap.remove(); const nb = root.querySelector('[data-rop] .g0'); if (nb) nb.style.visibility = ''; }, F + D + 30);
  }
  // Carrusel de souvenirs: uno al frente sobre una pila en abanico; toque o deslizar para rotar
  function souvenirs(sv) {
    const n = sv.length, st = root.querySelector('[data-st]'), els = [...st.querySelectorAll('.pvb-sc')];
    const nm = root.querySelector('[data-nm]'), ct = root.querySelector('[data-ct]');
    const hash = k => { let h = (k + 1) * 2654435761 % 4294967296; h ^= h >>> 13; h = h * 1597334677 % 4294967296; return h; };
    // Filas de souvenirs derechos (±4°): separados si son pocos, cada vez más superpuestos si son muchos; el destacado va adelante y más grande
    const place = () => {
      const W = st.clientWidth || 300, H = st.clientHeight || 160, rows = n <= 3 ? 1 : 2, c = Math.ceil(n / rows); // como mucho dos filas: se apilan más en vez de sumar una tercera
      const sz = Math.min(W * .3, (H / rows) * .92, 92), edge = sz * .62;
      els.forEach((el, k) => {
        const r = Math.floor(k / c), i = k % c, cnt = Math.min(c, n - r * c);
        const step = cnt < 2 ? 0 : Math.min(sz * 1.12, (W - 2 * edge) / (cnt - 1)), x0r = W / 2 - step * (cnt - 1) / 2;
        const y = H * .6 + (r - (rows - 1) / 2) * sz * .74; // filas juntas, una sobre otra: se ven apiladas
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
    st.addEventListener('pointerup', e => {
      if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 28) return go(dx < 0 ? 1 : -1);
      const hit = e.target.closest?.('.pvb-sc'); if (!hit) return; // sólo cuenta el dibujo tocado (no la caja transparente)
      const k = +hit.dataset.k;
      if (k === idx) { sfx('tap'); souvenirBig(sv[k]); return; }
      idx = k; sfx('tap'); place();
    });
    st.addEventListener('pointercancel', () => { x0 = null; });
    root.querySelector('[data-all]').onclick = () => { sfx('tap'); souvenirGrid(sv); };
  }
  function souvenirBig(s, par = root) {
    const R = V.REGIONS[s.region], ov = document.createElement('div'); ov.className = 'pva-det';
    ov.innerHTML = `<button class="round close" aria-label="${tt('common.close')}">✕</button><div class="big pvs-big">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div><div class="info"><b>${esc(s.name)}</b><small>${esc(s.country || (R ? R.name : ''))}</small></div>`;
    ov.onclick = e => { if (e.target === ov || e.target.closest('.round')) { ov.remove(); sfx('tap'); } };
    par.appendChild(ov);
  }
  // Vista ordenada de todos los souvenirs; al tocar uno se ve grande
  function souvenirGrid(sv) {
    const g = document.createElement('div'); g.className = 'panel pva pvsouv'; g.style.display = 'block'; lockScroll(g);
    g.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${tt('bag.inBag', { n: sv.length })}</small><h2>${tt('bag.souvenirs')}</h2></div><div class="pvs-g">${sv.map((s, k) => `<button class="pvs-i" data-k="${k}" style="--r:${(((k * 7) % 9) - 4) * .9}deg"><div class="th">${svgWrap('0 0 120 120', '', souvenirInner(s.id), s.name)}</div><small>${esc(s.country || '')}</small><b>${esc(s.name)}</b></button>`).join('')}</div>`;
    document.body.appendChild(g);
    g.querySelector('[data-x]').onclick = () => { g.remove(); sfx('tap'); };
    g.querySelectorAll('.pvs-i').forEach(b => b.onclick = () => { sfx('tap'); souvenirBig(sv[+b.dataset.k], g); });
  }
  draw();
  return root;
}

// ── Ropa: prenda de papel doblada en la mochila → se desdobla por pasos hasta la página "Ropa" (skins del personaje actual) ──
// Colores de cada prenda (sacados del arte de cada viajero): [tela, cuello/acento, botones]
const CLOTH = {
  nilo: { base: ['#3E5BA9', '#E8452C', '#F2B937'], nieve: ['#E9EEF3', '#F07A2A', '#F07A2A'], marinero: ['#F4F1EA', '#24305E', '#EFC76A'] },
  mora: { base: ['#4E9A4A', '#E8B425', '#F2B937'], lluvia: ['#D8473B', '#F2C230', '#F2B937'], montana: ['#3A7CA5', '#E8B425', '#F2B937'] },
  sipho: { base: ['#D9952B', '#E8E2D0', '#6B4A2E'], tormenta: ['#2F5D7C', '#B8402E', '#6B4A2E'] },
  minji: { base: ['#8C6BD1', '#6FD3BE', '#6FD3BE'], escenario: ['#2B2836', '#E8452C', '#E8452C'] },
  tuk: { base: ['#2F8C8A', '#F07A2A', '#F2C230'], invierno: ['#3E5BA9', '#C2463A', '#F2C230'] },
  layla: { base: ['#5E7A4A', '#C9A15A', '#F2B937'], wadirum: ['#C9733E', '#F2B937', '#FFF4DC'] },
  cal: { base: ['#3F6E9E', '#E0663A', '#F3E6C4'], nevada: ['#8E3B46', '#2F4A6E', '#F3E6C4'] },
  anaya: { base: ['#D9507E', '#F2A32A', '#F2C230'] },
};
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(c => f(c).toString(16).padStart(2, '0')).join(''); };
const clothOf = (hero, skin = 'base') => (CLOTH[hero] || CLOTH.nilo)[skin] || (CLOTH[hero] || CLOTH.nilo).base || CLOTH.nilo.base;
const clothCol = ctx => { const h = ctx.V?.heroId?.() || VV.heroId?.() || 'nilo'; return clothOf(h, equippedSkin(ctx, h)); }; // la prenda que vuela es la de arriba de la pila (la puesta)
function garmentSVG(col = CLOTH.nilo.base) {
  const [B, A, K] = col, light = parseInt(B.slice(1, 3), 16) + parseInt(B.slice(3, 5), 16) + parseInt(B.slice(5, 7), 16) > 600;
  const D = shade(B, light ? -.12 : -.16), L = shade(B, light ? -.04 : .14), ln = light ? '#8C8CA0' : '#1B1730';
  return `<svg viewBox="0 0 120 112" aria-hidden="true"><g stroke="${CREAM}" stroke-width="5" stroke-linejoin="round"><rect x="12" y="14" width="96" height="86" rx="6" fill="${B}"/></g><rect x="12" y="14" width="96" height="86" rx="6" fill="${B}"/>`
    + `<path d="M12 20Q12 14 18 14H44V100H18Q12 100 12 94Z" fill="${L}"/><path d="M76 14H102Q108 14 108 20V94Q108 100 102 100H76Z" fill="${D}"/>`
    + `<path d="M44 14H76L60 42Z" fill="${CREAM}"/><path d="M52 14L60 30L68 14" fill="${A}"/><path d="M44 14L60 42L76 14" fill="none" stroke="#D9C9A2" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="M44 14V100M76 14V100" stroke="${ln}" stroke-opacity=".28" stroke-width="1.4" stroke-dasharray="4 3"/><path d="M12 76H108" stroke="${ln}" stroke-opacity=".3" stroke-width="1.6"/><path d="M12 77.5H108" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/>`
    + `<circle cx="60" cy="58" r="3.6" fill="${K}" stroke="${shade(K, -.2)}" stroke-width="1"/><circle cx="60" cy="70" r="3.6" fill="${K}" stroke="${shade(K, -.2)}" stroke-width="1"/><path d="M20 90H34M86 90H100" stroke="${light ? A : '#fff'}" stroke-opacity=".4" stroke-width="1.4" stroke-dasharray="3 2.4"/></svg>`;
}
// Pila de ropa en la mochila: arriba el atuendo PUESTO del viajero elegido (como el pasaporte equipado) y debajo, medio desordenados, los otros que tiene
const PILE = [[0, 0, 0], [-16, -16, -12], [15, -28, 10], [-6, -40, -5]];
function clothPile(ctx) {
  const V = ctx.V || VV, hero = V.heroId?.() || 'nilo', cur = equippedSkin(ctx, hero), list = wardrobe(ctx, hero).filter(k => k.owned && k.id !== cur);
  const under = list.slice(0, PILE.length - 1).reverse().map((k, j, arr) => { const [x, y, r] = PILE[arr.length - j]; return `<div class="gu" style="transform:translate(${x}%,${y}%) rotate(${r}deg)">${garmentSVG(clothOf(hero, k.id))}</div>`; }).join('');
  return under + `<div class="g0">${garmentSVG(clothOf(hero, cur))}</div>`;
}
// Atuendos del personaje: base + los suyos (SKINS[i].skins); comprados = ctx.ownedV 'personaje:atuendo'; puesto = ctx.wornOf / ctx.setWear (pv.wear, del integrador)
function wardrobe(ctx, hero) {
  const out = [{ id: 'base', name: tt('cloth.base'), price: 0, owned: true }], k = (ctx.SKINS || []).find(x => x.id === hero);
  (k?.skins || []).forEach(w => out.push({ id: w.id, name: w.name, price: w.price, owned: (ctx.ownedV || []).includes(hero + ':' + w.id) }));
  return out;
}
const equippedSkin = (ctx, hero) => { try { return ctx.wornOf?.(hero) || 'base'; } catch (e) { return 'base'; } };
function equipSkin(ctx, hero, id) {
  if (ctx.setWear) { ctx.setWear(hero, id); return; }
  const w = ctx.store?.get?.('wear', {}) || {}; if (id === 'base') delete w[hero]; else w[hero] = id; ctx.store?.set?.('wear', w); // respaldo: misma clave pv.wear
}

export function openCloth(ctx, onClose, opts = {}) {
  bagCss();
  const V = ctx.V || VV, sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  V.syncAlbum?.();
  const hero = V.heroId?.() || 'nilo', nm = heroName(ctx, hero);
  document.querySelectorAll('.pvcloth').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pva pvcloth'; root.style.display = 'block';
  if (opts.preload) { root.style.animation = 'none'; root.style.opacity = '0'; root.style.pointerEvents = 'none'; }
  document.body.appendChild(root); lockScroll(root);
  let closing = false;
  const finish = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  const close = () => { if (closing) return; closing = true; if (opts.closeAnim) opts.closeAnim(root, finish); else finish(); };
  function draw() {
    const list = wardrobe(ctx, hero), cur = equippedSkin(ctx, hero), keep = root.scrollTop;
    const art = id => { try { return heroArt(ctx, hero, id, 1, true) || ''; } catch (e) { return ''; } };
    root.innerHTML = `<div class="head"><button class="round close" data-x aria-label="${tt('common.close')}">✕</button><small>${esc(tt('cloth.sub', { name: nm }))}</small><h2>${tt('cloth.title')}</h2></div>`
      + `<div class="pvc-hint">${esc(tt('cloth.hint', { name: nm }))}</div>`
      + `<div class="pvc-grid">${list.map(k => {
        const on = k.id === cur;
        return `<div class="pvc-sk${on ? ' on' : ''}${k.owned ? '' : ' lock'}" data-id="${esc(k.id)}"><div class="art">${art(k.id)}</div><b>${esc(k.name)}</b>`
          + (k.owned ? `<button class="pvc-b${on ? ' on' : ''}" data-eq="${esc(k.id)}"${on ? ' disabled' : ''}>${on ? tt('cloth.equipped') : tt('cloth.equip')}</button>` : `<span class="pvc-pr">◉ ${k.price}</span><button class="pvc-b shop" data-shop>${tt('nav.shop')}</button>`) + `</div>`;
      }).join('')}</div>`;
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { sfx('tap'); equipSkin(ctx, hero, b.dataset.eq); draw(); });
    root.querySelectorAll('[data-shop]').forEach(b => b.onclick = () => { sfx('tap'); document.querySelectorAll('.pvbag').forEach(e => e.remove()); root.remove(); openShopTab(ctx, 'viajeros'); });
    root.scrollTop = keep;
  }
  draw();
  return root;
}
// Hoja de 3×3 pliegues: el paquete (centro) se abre en pasos: derecha, izquierda, abajo, arriba. Devuelve la capa y play(opts) que anima todo.
function clothSheet(R, b, gcol = CLOTH.nilo.base) {
  const W = R.width, H = R.height, cw = W / 3, ch = H / 3, ib = b.getBoundingClientRect(), dx = ib.left + ib.width / 2 - (R.left + W / 2), dy = ib.top + ib.height / 2 - (R.top + H / 2);
  const mk = (cls, css, par) => { const e = document.createElement('div'); e.className = cls; e.style.cssText = css; par && par.appendChild(e); return e; };
  const wrap = mk('pvc-flyw', `left:${R.left}px;top:${R.top}px;width:${W}px;height:${H}px;--gk:${gcol[0]}`), mv = mk('pvc-mv', '', wrap), sh = mk('pvc-sh', '', mv), steps = [];
  const cell = (par, x, y, o, st) => { const c = mk('pvc-c', `left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;transform-origin:${o}`, par); c.innerHTML = '<i class="f"></i><i class="k"></i>'; if (st) steps.push({ el: c, ...st }); return c; };
  const col = (x, o, st) => { const c = mk('pvc-col', `left:${x}px;top:0;width:${cw}px;height:${H}px;transform-origin:${o}`, sh); if (st) steps.push({ el: c, ...st }); return c; };
  const SR = { ax: 'rotateY', from: -180, z: 2, s: .2, e: .42 }, SL = { ax: 'rotateY', from: 180, z: 2, s: .33, e: .55 }, SB = { ax: 'rotateX', from: 180, z: 1, s: .48, e: .68 }, ST = { ax: 'rotateX', from: -180, z: 1, s: .6, e: .8 };
  [[0, '100% 50%', SL], [cw, '50% 50%', null], [2 * cw, '0% 50%', SR]].forEach(([x, o, st]) => {
    const c = col(x, o, st);
    cell(c, 0, ch, '50% 50%', null);
    cell(c, 0, 0, '50% 100%', ST); cell(c, 0, 2 * ch, '50% 0%', SB);
  });
  const ic = mk('pvc-ic', `left:${W / 2 - ib.width / 2}px;top:${H / 2 - ib.height / 2}px;width:${ib.width}px;height:${ib.height}px`, mv); ic.innerHTML = garmentSVG(gcol);
  const sx0 = ib.width / cw, sy0 = ib.height / ch;
  const ez = 'cubic-bezier(.45,.05,.25,1)';
  return {
    wrap, mv, sh, ic,
    play(o) {
      const A = [];
      // arranca rápido (ease-out) hacia el centro: antes parecía que tardaba en reaccionar
      A.push(mv.animate([{ offset: 0, transform: `translate(${dx}px,${dy}px) scale(${sx0},${sy0})`, easing: 'cubic-bezier(.15,.85,.3,1)' }, { offset: .16, transform: 'translate(0,0) scale(1.6,1.25)' }, { offset: .2, transform: 'translate(0,0) scale(1.6,1.25)', easing: ez }, { offset: .8, transform: 'translate(0,0) scale(1,1)' }, { offset: 1, transform: 'translate(0,0) scale(1,1)' }], o));
      A.push(ic.animate([{ offset: 0, opacity: 1, transform: `scale(${1 / sx0},${1 / sy0})` }, { offset: .1, opacity: 1 }, { offset: .21, opacity: 0, transform: `scale(${1 / sx0},${1 / sy0})` }, { offset: 1, opacity: 0 }], o));
      steps.forEach(s => { const T = a => `translateZ(${s.z}px) ${s.ax}(${a}deg)`; A.push(s.el.animate([{ offset: 0, transform: T(s.from) }, { offset: s.s, transform: T(s.from), easing: ez }, { offset: s.e, transform: T(0) }, { offset: 1, transform: T(0) }], o)); });
      return A;
    },
  };
}

// ── Página del pasaporte: regiones, sellos de destinos visitados, viajes y lo que falta ──
// Los pasaportes se compran una vez para todos, pero los sellos son de cada viajero (como las selfies)
export function openPassport(ctx, onClose, opts = {}) {
  bagCss();
  const V = ctx.V || VV, sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  V.syncAlbum?.();
  document.querySelectorAll('.pvpass').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pva pvpass'; root.style.display = 'block';
  if (opts.preload) { root.style.animation = 'none'; root.style.opacity = '0'; root.style.pointerEvents = 'none'; }
  document.body.appendChild(root); lockScroll(root);
  let closing = false;
  const finish = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  const close = () => { if (closing) return; closing = true; if (opts.closeAnim) opts.closeAnim(root, finish); else finish(); };
  const T = V.T, vis = (V.heroStamps ? V.heroStamps() : T.visits) || {}, have = r => (T.passports || []).includes(r);
  const visited = Object.keys(vis).filter(k => vis[k] > 0).length, trips = Object.values(vis).reduce((a, n) => a + (n || 0), 0);
  const hero = V.heroId?.() || 'nilo', nm = heroName(ctx, hero);
  const order = [...V.REGION_ORDER.filter(have), ...V.REGION_ORDER.filter(r => !have(r))];
  const stamp = (d, i, R, k) => {
    const rot = ((i * 37) % 21) - 10, n = vis[i] || 0;
    if (!n) return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" fill="none" stroke="#B3A37F" stroke-width="2" stroke-dasharray="3.4 3"/><text x="30" y="38" text-anchor="middle" font-family="${LIL}" font-size="22" fill="#B3A37F" opacity=".7">?</text></svg>`;
    return `<svg viewBox="0 0 60 60" aria-label="${esc(d.place)}"><g transform="rotate(${rot} 30 30)"><circle cx="30" cy="30" r="27" fill="#FFF8E6"/><circle cx="30" cy="30" r="27" fill="none" stroke="${R.dark}" stroke-width="2.6"/><circle cx="30" cy="30" r="23" fill="none" stroke="${R.color}" stroke-width="1.2"/>${nest(d.art, 12, 9, 36)}<path d="M8 49 q5-3 10 0 t10 0 t10 0 t10 0" stroke="${R.dark}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>${n > 1 ? `<circle cx="48" cy="12" r="8" fill="${R.dark}"/><text x="48" y="15.6" text-anchor="middle" font-family="${LIL}" font-size="10" fill="#fff">×${n}</text>` : ''}</g></svg>`;
  };
  const eq = () => (V.passEq ? V.passEq() : null), done = V.heroRoutes ? V.heroRoutes() : (V.routesDone ? V.routesDone() : []);
  // Sellos de rutas especiales: carrusel de tarjetas (sello grande, nombre y ciudades). El sello toma el color de la región de la ruta.
  const routeCard = (r, k) => {
    const ok = done.includes(r.id), R = V.REGIONS[(V.routeRegions ? V.routeRegions(r) : [])[0]] || { color: '#C9402A', dark: '#8E2A17' }, ink = ok ? R.dark : '#B3A37F', rot = ((r.cities[0] * 13) % 17) - 8;
    const svg = `<svg viewBox="0 0 80 80" aria-hidden="true"><g transform="rotate(${rot} 40 40)">${ok
      ? `<circle cx="40" cy="40" r="36" fill="#FFF8E6"/><circle cx="40" cy="40" r="35" fill="none" stroke="${ink}" stroke-width="3.2"/><circle cx="40" cy="40" r="29" fill="none" stroke="${R.color}" stroke-width="1.4"/><path d="M13 40 a27 27 0 0 1 54 0" fill="none" stroke="${R.color}" stroke-width="1" stroke-dasharray="1.5 3"/><path d="${plane(40, 33, 1.6)}" fill="${ink}"/><text x="40" y="58" text-anchor="middle" font-family="${LIL}" font-size="8" fill="${ink}" letter-spacing="1">${r.cities.length} × ✓</text>`
      : `<circle cx="40" cy="40" r="34" fill="none" stroke="${ink}" stroke-width="2.6" stroke-dasharray="4 3.4"/><text x="40" y="50" text-anchor="middle" font-family="${LIL}" font-size="28" fill="${ink}" opacity=".7">?</text>`}</g></svg>`;
    return `<div class="pvp-rc${ok ? ' ok' : ''}" style="--rc:${R.color};--rd:${R.dark};--r:${(((k * 5) % 7) - 3) * .8}deg"><div class="st">${svg}</div><b>${esc(tt(r.name))}</b><small>${r.cities.map(i => esc(DESTINOS[i]?.place || '')).join(' · ')}</small></div>`;
  };
  const rts = V.ROUTES ? [...V.ROUTES.filter(r => done.includes(r.id)), ...V.ROUTES.filter(r => !done.includes(r.id))] : [];
  const routesHTML = rts.length ? `<div class="pvp-rt"><div class="pvp-rth"><div><b>${tt('route.stamps')}</b><small>${tt('route.stampsSub')}</small></div><u>${rts.filter(r => done.includes(r.id)).length}/${rts.length}</u></div><div class="pvp-car">${rts.map(routeCard).join('')}</div></div>` : '';
  root.innerHTML = `<div class="head"><button class="round close" data-x>✕</button><small>${esc(tt('pass.subHero', { name: nm.toUpperCase() }))}</small><h2>${tt('pass.plural')}</h2></div>
<div class="pvp-st"><div><b>${trips}</b><small>${tt('pass.trips')}</small></div><div><b>${visited}</b><small>${tt('pass.dests', { n: DESTINOS.length })}</small></div><div><b>${(T.passports || []).length}/${V.REGION_ORDER.length}</b><small>${tt('pass.plural')}</small></div></div>${routesHTML}`
    + order.map(r => {
      const R = V.REGIONS[r], ds = V.destsOf(r), ok = have(r), v = ds.filter(i => vis[i] > 0).length;
      return `<div class="pvp-r${eq() === r ? ' eq' : ''}" style="--rc:${R.color}"><div class="pvp-rh"><div class="bk">${passportSVG(V, r)}</div><div><b>${esc(R.pass)}</b><small>${esc(R.name.toUpperCase())} · ${tt('pass.destCount', { n: ds.length })}</small></div>${ok ? `<u>${v}/${ds.length}</u>` : `<u class="pr">◉ ${V.passPrice(r)}</u>`}</div>`
        + (ok ? `<div class="pvp-eqr"><button class="pvp-eq${eq() === r ? ' on' : ''}" data-eq="${r}">${eq() === r ? '✓ ' + tt('pass.equipped') : tt('pass.equip')}</button><span>${tt('pass.equipHint')}</span></div><div class="pvp-sg">${ds.map(i => `<div class="${vis[i] ? '' : 'nv'}">${stamp(DESTINOS[i], i, R)}<span>${esc(DESTINOS[i].place)}</span></div>`).join('')}</div>`
          : `<div class="pvp-go"><span>${tt('pass.missing', { n: ds.length, region: esc(R.name) })}</span><button class="btn sm" data-buy>${tt('nav.shop')}</button></div>`) + `</div>`;
    }).join('');
  root.querySelector('[data-x]').onclick = close;
  const paintEq = () => root.querySelectorAll('.pvp-r').forEach(el => { const b = el.querySelector('[data-eq]'); if (!b) return; const on = eq() === b.dataset.eq; el.classList.toggle('eq', on); b.classList.toggle('on', on); b.textContent = on ? '✓ ' + tt('pass.equipped') : tt('pass.equip'); });
  root.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { sfx('tap'); V.setPassEq(eq() === b.dataset.eq ? null : b.dataset.eq); paintEq(); });
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { sfx('tap'); document.querySelectorAll('.pvbag').forEach(e => e.remove()); root.remove(); openShopTab(ctx, 'pasaportes'); });
  return root;
}
