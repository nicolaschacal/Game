// Íconos de papel recortado (sin emojis): cada pieza tiene borde crema cortado con su canto, el color de la pieza,
// una mitad «doblada» un poco más clara y detalles. Usar: ico('corazon', 28). El grano lo pone el CSS (.pvi).
const RIM = '#F7ECD3', RIM_C = '#A88A5C';
// pieza: d = silueta, c = color, l = mitad clara (path opcional), x = detalles encima
const P = {
  corazon: {
    d: 'M16 27.5C9 22.6 3 17.8 3 10.9 3 6.9 6.1 4 9.8 4c2.6 0 4.8 1.4 6.2 3.6C17.4 5.4 19.6 4 22.2 4 25.9 4 29 6.9 29 10.9c0 6.9-6 11.7-13 16.6z',
    c: '#C8382A', l: 'M16 7.6C14.6 5.4 12.4 4 9.8 4 6.1 4 3 6.9 3 10.9c0 6.9 6 11.7 13 16.6z', lc: '#E4513A',
    x: '<path d="M7.2 9.6c.4-1.6 1.6-2.6 3.1-2.8" stroke="#FFF4DC" stroke-width="2" stroke-linecap="round" fill="none" opacity=".75"/>',
  },
  vacio: { // corazón apagado
    d: 'M16 27.5C9 22.6 3 17.8 3 10.9 3 6.9 6.1 4 9.8 4c2.6 0 4.8 1.4 6.2 3.6C17.4 5.4 19.6 4 22.2 4 25.9 4 29 6.9 29 10.9c0 6.9-6 11.7-13 16.6z',
    c: '#C9BC9E', l: 'M16 7.6C14.6 5.4 12.4 4 9.8 4 6.1 4 3 6.9 3 10.9c0 6.9 6 11.7 13 16.6z', lc: '#D8CDB2',
  },
  revivir: { // corazón con cruz
    d: 'M16 27.5C9 22.6 3 17.8 3 10.9 3 6.9 6.1 4 9.8 4c2.6 0 4.8 1.4 6.2 3.6C17.4 5.4 19.6 4 22.2 4 25.9 4 29 6.9 29 10.9c0 6.9-6 11.7-13 16.6z',
    c: '#C8382A', l: 'M16 7.6C14.6 5.4 12.4 4 9.8 4 6.1 4 3 6.9 3 10.9c0 6.9 6 11.7 13 16.6z', lc: '#E4513A',
    x: '<path d="M16 9.5v10M11 14.5h10" stroke="#FFF4DC" stroke-width="3.4" stroke-linecap="round"/>',
  },
  moneda: {
    d: 'M16 3.5a12.5 12.5 0 1 1 0 25 12.5 12.5 0 0 1 0-25z', c: '#D9961E', l: 'M16 3.5a12.5 12.5 0 0 0 0 25z', lc: '#F2BC3E',
    x: '<circle cx="16" cy="16" r="8" fill="none" stroke="#A86B12" stroke-width="1.6" opacity=".7"/><rect x="13" y="13" width="6" height="6" rx="1" fill="#8C5A12"/>',
  },
  cofre: {
    d: 'M5 14q0-8 11-8t11 8v12.5H5z', c: '#A65E22', l: 'M5 14q0-8 11-8v20.5H5z', lc: '#C47634',
    x: '<path d="M5 14.5h22" stroke="#6E3A12" stroke-width="1.8"/><path d="M5 11h22v5H5z" fill="#F2BC3E" opacity=".95"/><rect x="13.2" y="13" width="5.6" height="7" rx="1.2" fill="#F2BC3E" stroke="#8C5A12" stroke-width="1.2"/><circle cx="16" cy="16.6" r="1.1" fill="#6E3A12"/>',
  },
  sinads: {
    d: 'M16 3.5a12.5 12.5 0 1 1 0 25 12.5 12.5 0 0 1 0-25z', c: '#C8382A', l: 'M16 3.5a12.5 12.5 0 0 0 0 25z', lc: '#E4513A',
    x: '<circle cx="16" cy="16" r="8.6" fill="#FFF4DC"/><rect x="10" y="11.6" width="12" height="8.8" rx="1.8" fill="#34437F"/><path d="M14.6 13.6l3.6 2.4-3.6 2.4z" fill="#FFF4DC"/><path d="M9.9 9.9l12.2 12.2" stroke="#C8382A" stroke-width="3" stroke-linecap="round"/>',
  },
  mochila: {
    d: 'M9 8.5q0-4.5 7-4.5t7 4.5q4 1 4 5.5V26q0 2-2 2H7q-2 0-2-2V14q0-4.5 4-5.5z', c: '#2E3F80', l: 'M9 8.5q0-4.5 7-4.5V28H7q-2 0-2-2V14q0-4.5 4-5.5z', lc: '#3E5BA9',
    x: '<path d="M12 7.5q0-1.8 4-1.8t4 1.8" stroke="#1C2352" stroke-width="1.8" fill="none"/><path d="M6 13.5q10 3 20 0v4q-10 3-20 0z" fill="#F2BC3E"/><rect x="10" y="20" width="12" height="5.5" rx="1.5" fill="#1C2352" opacity=".55"/><rect x="14.6" y="15.2" width="2.8" height="3.4" rx=".8" fill="#8C5A12"/>',
  },
  avion: { // avión de papel: ala de arriba clara, ala de abajo en sombra y la quilla doblada
    d: 'M2.5 15.5L29.5 4 23 28 17.2 22.6 12.6 28.2 12.8 19.8z', o: '-0.7 -0.3', c: '#D3C39E', l: 'M2.5 15.5L29.5 4 12.8 19.8z', lc: '#FFF8E8',
    x: '<path d="M12.8 19.8L17.2 22.6 12.6 28.2z" fill="#A8977A"/>',
  },
  luna: {
    d: 'M20.5 4.2A12 12 0 1 0 27.8 21 9.6 9.6 0 1 1 20.5 4.2z', c: '#D9961E', l: 'M20.5 4.2A12 12 0 0 0 16 27.6 9.6 9.6 0 0 1 20.5 4.2z', lc: '#F2BC3E',
  },
  sol: { // 12 rayos parejos
    d: 'M16.00 2.40L18.69 5.95L22.80 4.22L23.35 8.65L27.78 9.20L26.05 13.31L29.60 16.00L26.05 18.69L27.78 22.80L23.35 23.35L22.80 27.78L18.69 26.05L16.00 29.60L13.31 26.05L9.20 27.78L8.65 23.35L4.22 22.80L5.95 18.69L2.40 16.00L5.95 13.31L4.22 9.20L8.65 8.65L9.20 4.22L13.31 5.95z', c: '#E0A12A',
    x: '<circle cx="16" cy="16" r="7.4" fill="#F2BC3E"/><path d="M16 8.6a7.4 7.4 0 0 0 0 14.8z" fill="#FFD866"/>',
  },
  play: { d: 'M9 5.5L26 16 9 26.5z', c: '#2E3F80', l: 'M9 5.5L26 16H9z', lc: '#3E5BA9' },
  check: { d: 'M4.5 16.5l4-4 5 5L24 7l4 4-14.5 14.5z', c: '#3F8F36', l: 'M4.5 16.5l4-4 5 5L24 7l2 2-12.5 12.5z', lc: '#5DB84F' },
  libro: {
    d: 'M3.5 7.5q6-2.5 12.5 1.2Q22.5 5 28.5 7.5V26q-6-2.5-12.5 1.2Q9.5 23.5 3.5 26z', c: '#2E3F80', l: 'M3.5 7.5q6-2.5 12.5 1.2v18.5Q9.5 23.5 3.5 26z', lc: '#3E5BA9',
    x: '<path d="M7 11.5q4-1 7 .8M7 15.5q4-1 7 .8M18 12.3q3-1.8 7-.8M18 16.3q3-1.8 7-.8" stroke="#FFF4DC" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".8"/>',
  },
  candado: {
    d: 'M10 13.5V10a6 6 0 0 1 12 0v3.5h1.5q2 0 2 2V26q0 2-2 2h-15q-2 0-2-2V15.5q0-2 2-2zm3.5 0h5V10a2.5 2.5 0 0 0-5 0z', c: '#8C7A5C', l: 'M10 13.5V10a6 6 0 0 1 6-6v3.5a2.5 2.5 0 0 0-2.5 2.5v3.5H16V28H8.5q-2 0-2-2V15.5q0-2 2-2z', lc: '#A8977A',
    x: '<circle cx="16" cy="19.6" r="2" fill="#3B3226"/><path d="M16 20.5v3.4" stroke="#3B3226" stroke-width="2" stroke-linecap="round"/>',
  },
  copo: {
    d: 'M16 2.5l2.2 5.2 5.4-1.8-1.8 5.4 5.2 2.2-3.9 2.5 3.9 2.5-5.2 2.2 1.8 5.4-5.4-1.8L16 29.5l-2.2-5.2-5.4 1.8 1.8-5.4-5.2-2.2 3.9-2.5-3.9-2.5 5.2-2.2-1.8-5.4 5.4 1.8z', c: '#3E9CC8', l: 'M16 2.5l-2.2 5.2-5.4-1.8 1.8 5.4-5.2 2.2 3.9 2.5-3.9 2.5 5.2 2.2-1.8 5.4 5.4-1.8L16 29.5z', lc: '#6CC3E6',
    x: '<path d="M16 9v14M10 12.5l12 7M22 12.5l-12 7" stroke="#FFF4DC" stroke-width="1.8" stroke-linecap="round"/>',
  },
  estrella: {
    d: 'M16 3l3.9 8 8.8 1.2-6.4 6.1 1.6 8.7L16 22.8 8.1 27l1.6-8.7-6.4-6.1 8.8-1.2z', c: '#D9961E', l: 'M16 3v19.8L8.1 27l1.6-8.7-6.4-6.1 8.8-1.2z', lc: '#F2BC3E',
  },
};
export function ico(name, size = 24, cls = '') {
  const p = P[name]; if (!p) return '';
  // El grano va en un <g> adentro del SVG: en Safari un filter CSS sobre el <svg> raíz lo corre de lugar.
  return `<svg class="pvi${cls ? ' ' + cls : ''}" viewBox="0 0 32 32" width="${size}" height="${size}" style="width:${typeof size === 'number' ? size + 'px' : size}!important;height:${typeof size === 'number' ? size + 'px' : size}!important;position:static!important;transform:none!important;margin:0!important;max-width:none!important" aria-hidden="true"><g ${p.o ? ` transform="translate(${p.o})"` : ''}>` +
    `<path d="${p.d}" transform="translate(0 1.4)" fill="${RIM_C}" stroke="${RIM_C}" stroke-width="4.2" stroke-linejoin="round"/>` +
    `<path d="${p.d}" fill="${RIM}" stroke="${RIM}" stroke-width="4.2" stroke-linejoin="round"/>` +
    `<path d="${p.d}" fill="${p.c}"/>` + (p.l ? `<path d="${p.l}" fill="${p.lc}"/>` : '') + (p.x || '') + '</g></svg>';
}
// Para insertar en botones/etiquetas: ícono + texto alineados
export const icoTxt = (name, txt, size = 18) => `<span class="pvit">${ico(name, size)}<span>${txt}</span></span>`;
export const ICO_CSS = `.pvi{display:inline-block;vertical-align:middle;flex:none;overflow:visible;margin:0}.pvit{display:inline-flex;align-items:center;gap:5px;vertical-align:middle}.pvg{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.12em;margin:0 .06em;line-height:0}.pvg .pvi{display:block}`;

// ── Símbolos viejos en los textos (◉ ★ ✓ ♥ ❄ ▶ ✈) → íconos de papel ──
// Un observador reemplaza esos caracteres en cualquier texto que aparezca en pantalla (toasts, mapa, récords, etc.).
const G_BOX = 'display:inline-block!important;width:1.12em!important;height:1.12em!important;min-width:0!important;max-width:none!important;vertical-align:-.14em!important;margin:0 .08em!important;padding:0!important;position:static!important;inset:auto!important;transform:none!important;line-height:0!important;flex:none!important;background:none!important;border:0!important;box-shadow:none!important;filter:none!important;animation:none!important;opacity:1!important';
const G_SVG = 'display:block!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;position:static!important;inset:auto!important;margin:0!important;padding:0!important;transform:none!important;filter:none!important;animation:none!important';
const GLYPH = { '◉': 'moneda', '★': 'estrella', '✓': 'check', '♥': 'corazon', '❄': 'copo', '▶': 'play', '✈': 'avion' };
const RX = /[◉★✓♥❄▶✈]/;
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'TITLE', 'OPTION']);
function fixText(n) {
  const t = n.nodeValue; if (!t || !RX.test(t)) return;
  const p = n.parentNode; if (!p || SKIP.has(p.nodeName) || p.closest?.('svg,[data-noglyph]')) return;
  const f = document.createDocumentFragment();
  for (const part of t.split(/([◉★✓♥❄▶✈])/)) {
    if (!part) continue;
    if (GLYPH[part]) {
      // Etiqueta propia + estilos en línea con !important: así ningún CSS del juego (svg absolutos, anchos al 100%, etc.) la agranda ni la mueve
      const s = document.createElement('pv-g'); s.setAttribute('aria-hidden', 'true'); s.style.cssText = G_BOX; s.innerHTML = ico(GLYPH[part], 16);
      s.firstChild.style.cssText = G_SVG; f.appendChild(s);
    }
    else f.appendChild(document.createTextNode(part.replace(/^ (?=$)/, ' ')));
  }
  p.replaceChild(f, n);
}
function walk(el) {
  if (el.nodeType === 3) return fixText(el);
  if (el.nodeType !== 1 || SKIP.has(el.nodeName) || el.nodeName === 'svg') return;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const list = [];
  while (w.nextNode()) if (RX.test(w.currentNode.nodeValue)) list.push(w.currentNode);
  list.forEach(fixText);
}
export function autoGlyphs(root = document.body) {
  walk(root);
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fixText(m.target); else m.addedNodes.forEach(walk); } })
    .observe(root, { childList: true, subtree: true, characterData: true });
}
