// Arte de Paper Voyager, con las reglas de recorte del juego: formas planas de papel, borde crema,
// sombra inferior más oscura, ojos grandes con brillo y la paleta del juego. Lienzo 120×120, base en y≈110.
import { t as tt } from './i18n.js';
import { heroFor, thumbFor } from './elenco.js'; // elenco H13 (cuerpo del Nilo + cabeza chibi); los cuadros se hornean al pedirlos
import { paperBoat, paperBalloon, paperTrain } from './runner-papel.js';
const CREAM = '#FFF4DC', INK = '#1A1220';
export { ROCK, STUMP, REEF, FIN, BARREL, COIN, PEARL, PEAK, CLOUD, STORM, STAR, BARRIER, CRATE, GEM, CART, DOUBLE, SHIELD, CHEST, ANCHOR, BALLAST, NEEDLEKEY, COMPASS } from './runner-papel.js';
// Recorte: la silueta se dibuja primero con borde crema y encima las mismas formas sin borde + detalles.
const cut = (shapes, details = '', under = '') => `<svg viewBox="0 0 120 120">${under}<g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
const limb = (x, y, w, h, deg, fill, ox = x + w / 2, oy = y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}" transform="rotate(${deg} ${ox} ${oy})"/>`;

// ── Kami, el viajero de papel ───────────────────────────────────────────────
const BASE = { hat: '#EFC76A', hatD: '#C99A3C', coat: '#3E5BA9', coatD: '#2D4585', scarf: '#E8452C', scarfD: '#B93322', skin: '#F6D2B0', leg: '#2B2440', sole: '#D9A066', hair: '#2B1D16' };
let C = { ...BASE }, HEAD = 'kasa';
const kasa = dy => `<path d="M60 ${9 + dy} L101 ${42 + dy} Q60 ${55 + dy} 19 ${42 + dy}Z" fill="${C.hat}"/>`;
const kasaLines = dy => `<path d="M60 ${9 + dy} L46 ${47 + dy} M60 ${9 + dy} L74 ${47 + dy} M60 ${9 + dy} L32 ${43 + dy} M60 ${9 + dy} L88 ${43 + dy}" stroke="${C.hatD}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/><path d="M19 ${42 + dy} Q60 ${55 + dy} 101 ${42 + dy} Q60 ${61 + dy} 19 ${42 + dy}Z" fill="${C.hatD}"/>`;
// Cabeza según el personaje: sombrero de paja, capucha de zorro o capucha ninja. front = pose de frente.
const dome = (dy, front) => front ? `<path d="M43 ${52 + dy} A17 17 0 0 1 77 ${52 + dy} Q60 ${45 + dy} 43 ${52 + dy}Z" fill="${C.hat}"/>` : `<circle cx="60" cy="${50 + dy}" r="16.5" fill="${C.hat}"/>`;
const hat = (dy, front) => HEAD === 'fox' ? `<path d="M45 ${40 + dy} L40 ${17 + dy} L58 ${33 + dy}Z M75 ${40 + dy} L80 ${17 + dy} L62 ${33 + dy}Z" fill="${C.hat}"/>` + dome(dy, front)
  : HEAD === 'ninja' ? `<path d="M75 ${45 + dy} l18 -8 l3 7 l-12 3 l10 6 l-4 5 l-15 -9Z" fill="${C.hatD}"/>` + dome(dy, front)
  : kasa(dy);
const hatLines = (dy, front) => HEAD === 'fox' ? `<path d="M46 ${35 + dy} L43.5 ${24 + dy} L52 ${32 + dy}Z M74 ${35 + dy} L76.5 ${24 + dy} L68 ${32 + dy}Z" fill="${C.hatD}"/>` + (front ? '' : `<circle cx="60" cy="${40 + dy}" r="3" fill="${C.scarf}"/>`)
  : HEAD === 'ninja' ? `<path d="M43.6 ${45 + dy} Q60 ${40 + dy} 76.4 ${45 + dy} L76.6 ${51 + dy} Q60 ${46 + dy} 43.4 ${51 + dy}Z" fill="${C.hatD}"/>`
  : kasaLines(dy);
// Cabecita del personaje asomando en barco, globo y tren
// Nilo a bordo: gorra de cuero con anteojos de bronce, la misma cabecita de papel que en tierra
const niloRider = (cx, cy, k = 1) => `<circle cx="${cx}" cy="${cy + 2 * k}" r="${10 * k}" fill="#F6D2B0" stroke="${CREAM}" stroke-width="3"/>`
  + `<path d="M${cx - 10 * k} ${cy - 1 * k} Q${cx} ${cy - 13 * k} ${cx + 10 * k} ${cy - 1 * k}Z" fill="#A9794D" stroke="${CREAM}" stroke-width="2" stroke-linejoin="round"/>`
  + `<rect x="${cx - 10 * k}" y="${cy - 2.5 * k}" width="${20 * k}" height="${3 * k}" fill="#8E5C35"/>`
  + `<circle cx="${cx - 4 * k}" cy="${cy + 3 * k}" r="${3.2 * k}" fill="#BFE3F5" stroke="#EFC76A" stroke-width="1.6"/><circle cx="${cx + 4 * k}" cy="${cy + 3 * k}" r="${3.2 * k}" fill="#BFE3F5" stroke="#EFC76A" stroke-width="1.6"/>`;
// Cabecita a bordo de los demás personajes: cara, pelo y su prenda de cabeza (piel, pelo, prenda, estilo)
const RIDERS = { mora: ['#F6D2B0', '#3A2A22', '#D2382B', 'beret'], sipho: ['#8A5636', '#EDE7DA', '#4B4F66', 'cap'], minji: ['#F2CFAE', '#1E1A2A', '#52C7C2', 'phones'], tuk: ['#FFFFFF', '#2B2236', '#2E8E94', 'puffin'],
  layla: ['#D9A27A', '#4A2E20', '#4A2E20', 'bun'], cal: ['#7A4A2E', '#1E1612', '#1E1612', 'curly'], anaya: ['#B9784E', '#1E1612', '#F2B937', 'braids'] };
const castRider = (id, cx, cy, k) => {
  const [sk, hair, top, st] = RIDERS[id] || RIDERS.mora, eye = `<circle cx="${cx - 3.6 * k}" cy="${cy + 3 * k}" r="${1.3 * k}" fill="#2B2236"/><circle cx="${cx + 3.6 * k}" cy="${cy + 3 * k}" r="${1.3 * k}" fill="#2B2236"/>`;
  const cap = f => `<path d="M${cx - 10 * k} ${cy - 1 * k} Q${cx} ${cy - 13 * k} ${cx + 10 * k} ${cy - 1 * k}Z" fill="${f}" stroke="${CREAM}" stroke-width="2" stroke-linejoin="round"/>`;
  const face = `<circle cx="${cx}" cy="${cy + 2 * k}" r="${10 * k}" fill="${sk}" stroke="${CREAM}" stroke-width="3"/>`;
  const beak = `<path d="M${cx - 3 * k} ${cy + 5 * k} L${cx + 3 * k} ${cy + 5 * k} L${cx} ${cy + 9 * k}Z" fill="#F29A2E"/>`;
  if (st === 'beret') return face + cap(hair) + `<ellipse cx="${cx - 2 * k}" cy="${cy - 8 * k}" rx="${9 * k}" ry="${3.6 * k}" fill="${top}" stroke="${CREAM}" stroke-width="2"/>` + eye;
  if (st === 'cap') return face + cap(top) + `<path d="M${cx - 6 * k} ${cy + 8 * k} Q${cx} ${cy + 14 * k} ${cx + 6 * k} ${cy + 8 * k} Q${cx} ${cy + 10 * k} ${cx - 6 * k} ${cy + 8 * k}Z" fill="${hair}"/>` + eye;
  if (st === 'phones') return face + cap(hair) + `<path d="M${cx - 10 * k} ${cy + 2 * k} A${10 * k} ${11 * k} 0 0 1 ${cx + 10 * k} ${cy + 2 * k}" fill="none" stroke="${top}" stroke-width="${2.2 * k}" stroke-linecap="round"/><circle cx="${cx - 10 * k}" cy="${cy + 3 * k}" r="${2.8 * k}" fill="${top}"/><circle cx="${cx + 10 * k}" cy="${cy + 3 * k}" r="${2.8 * k}" fill="${top}"/>` + eye;
  if (st === 'puffin') return `<circle cx="${cx}" cy="${cy + 2 * k}" r="${10 * k}" fill="#2B2236" stroke="${CREAM}" stroke-width="3"/><ellipse cx="${cx}" cy="${cy + 3 * k}" rx="${8 * k}" ry="${7 * k}" fill="#FFFFFF"/>` + cap(top) + eye + beak;
  if (st === 'bun') return `<circle cx="${cx + 2 * k}" cy="${cy - 11 * k}" r="${4.2 * k}" fill="${hair}" stroke="${CREAM}" stroke-width="2"/>` + face + cap(hair) + eye;
  if (st === 'curly') return `<circle cx="${cx - 7 * k}" cy="${cy - 5 * k}" r="${4.4 * k}" fill="${hair}"/><circle cx="${cx + 7 * k}" cy="${cy - 5 * k}" r="${4.4 * k}" fill="${hair}"/><circle cx="${cx}" cy="${cy - 8 * k}" r="${5 * k}" fill="${hair}"/>` + face + cap(hair) + eye;
  return face + `<path d="M${cx - 11 * k} ${cy + 4 * k} L${cx - 11 * k} ${cy + 14 * k} M${cx + 11 * k} ${cy + 4 * k} L${cx + 11 * k} ${cy + 14 * k}" stroke="${hair}" stroke-width="${3.2 * k}" stroke-linecap="round"/>` + cap(hair) + `<circle cx="${cx - 8 * k}" cy="${cy - 5 * k}" r="${2 * k}" fill="${top}"/>` + eye;
};
const rider = (cx, cy, k = 1) => HEAD === 'h:nilo' || HEAD === 'nilo' ? niloRider(cx, cy, k) : HEAD.startsWith('h:') ? castRider(HEAD.slice(2), cx, cy, k) : HEAD === 'kasa'
  ? `<path d="M${cx} ${cy - 8 * k} L${cx + 15 * k} ${cy + 6 * k} Q${cx} ${cy + 12 * k} ${cx - 15 * k} ${cy + 6 * k}Z" fill="${C.hat}" stroke="${CREAM}" stroke-width="3" stroke-linejoin="round"/><path d="M${cx - 15 * k} ${cy + 6 * k} Q${cx} ${cy + 12 * k} ${cx + 15 * k} ${cy + 6 * k} Q${cx} ${cy + 15 * k} ${cx - 15 * k} ${cy + 6 * k}Z" fill="${C.hatD}"/>`
  : (HEAD === 'fox' ? `<path d="M${cx - 9 * k} ${cy - 2 * k} L${cx - 12 * k} ${cy - 16 * k} L${cx - 1 * k} ${cy - 7 * k}Z M${cx + 9 * k} ${cy - 2 * k} L${cx + 12 * k} ${cy - 16 * k} L${cx + 1 * k} ${cy - 7 * k}Z" fill="${C.hat}" stroke="${CREAM}" stroke-width="3" stroke-linejoin="round"/>` : '')
    + `<circle cx="${cx}" cy="${cy + 2 * k}" r="${10 * k}" fill="${C.hat}" stroke="${CREAM}" stroke-width="3"/>` + (HEAD === 'ninja' ? `<rect x="${cx - 10 * k}" y="${cy - 3 * k}" width="${20 * k}" height="${5 * k}" fill="${C.hatD}"/>` : '');
const coat = dy => `<path d="M42 ${62 + dy} Q60 ${57 + dy} 78 ${62 + dy} L85 ${90 + dy} Q60 ${96 + dy} 35 ${90 + dy}Z" fill="${C.coat}"/>`;
const coatShade = dy => `<path d="M36.5 ${84 + dy} Q60 ${90 + dy} 83.5 ${84 + dy} L85 ${90 + dy} Q60 ${96 + dy} 35 ${90 + dy}Z" fill="${C.coatD}"/>`;
// Pose de carrera vista de espaldas (cámara detrás, como en un runner). p = -1 | 0 | 1 (pierna que empuja)
function runPose(p, flap) {
  const dy = p === 0 ? -4 : 0, sw = p * 38;
  const legDown = x => `<rect x="${x}" y="${88 + dy}" width="11" height="${20 - dy}" rx="5.5" fill="${C.leg}"/><ellipse cx="${x + 5.5}" cy="108" rx="8" ry="4" fill="${C.sole}"/>`;
  const legUp = x => `<rect x="${x}" y="${88 + dy}" width="11" height="11" rx="5.5" fill="${C.leg}"/><ellipse cx="${x + 5.5}" cy="${99 + dy}" rx="8" ry="6.5" fill="${C.sole}"/>`;
  const legMid = x => `<rect x="${x}" y="${88 + dy}" width="11" height="15" rx="5.5" fill="${C.leg}"/><ellipse cx="${x + 5.5}" cy="${104 + dy}" rx="8" ry="5" fill="${C.sole}"/>`;
  const legs = p < 0 ? legDown(46) + legUp(63) : p > 0 ? legUp(46) + legDown(63) : legMid(46) + legMid(63);
  const arms = limb(34, 64 + dy, 10, 22, 14 + sw, C.coat, 40, 66 + dy) + limb(76, 64 + dy, 10, 22, -14 + sw, C.coat, 80, 66 + dy);
  const f = flap ? [38, 50, 44, 60, 52] : [46, 40, 52, 50, 58];
  const scarf = `<path d="M64 ${56 + dy} C78 ${f[0] + dy} 90 ${f[1] + 12 + dy} 106 ${f[2] + dy} L108 ${f[2] + 11 + dy} C92 ${f[3] + 8 + dy} 80 ${f[4] + dy} 66 ${65 + dy}Z" fill="${C.scarf}"/>`;
  const shapes = scarf + legs + arms + coat(dy) + `<circle cx="60" cy="${50 + dy}" r="15" fill="${C.hair}"/>` + hat(dy);
  const details = coatShade(dy) + `<circle cx="60" cy="${75 + dy}" r="8.5" fill="${CREAM}"/><circle cx="60" cy="${75 + dy}" r="4" fill="${C.scarf}"/>`
    + `<path d="M47 ${60 + dy} Q60 ${66 + dy} 73 ${60 + dy} L73 ${66 + dy} Q60 ${72 + dy} 47 ${66 + dy}Z" fill="${C.scarf}"/>` + hatLines(dy);
  return cut(shapes, details);
}
// Pose de frente (antes de salir y al festejar): se le ve la cara
function frontPose() {
  const shapes = `<path d="M70 62 C84 58 92 70 100 64 L102 74 C92 80 84 70 72 72Z" fill="${C.scarf}"/>`
    + `<rect x="46" y="88" width="11" height="18" rx="5.5" fill="${C.leg}"/><rect x="63" y="88" width="11" height="18" rx="5.5" fill="${C.leg}"/><ellipse cx="50" cy="107" rx="8.5" ry="4.5" fill="${C.sole}"/><ellipse cx="70" cy="107" rx="8.5" ry="4.5" fill="${C.sole}"/>`
    + limb(33, 64, 10, 21, 16, C.coat, 40, 66) + limb(77, 64, 10, 21, -16, C.coat, 80, 66) + coat(0)
    + `<circle cx="60" cy="50" r="16" fill="${C.skin}"/>` + hat(-2, true);
  const details = coatShade(0) + `<path d="M52 61 L60 76 L68 61" fill="${CREAM}"/><path d="M45 62 Q60 70 75 62 L75 68 Q60 76 45 68Z" fill="${C.scarf}"/>`
    + `<ellipse cx="52" cy="55" rx="3.6" ry="4.8" fill="${INK}"/><ellipse cx="68" cy="55" rx="3.6" ry="4.8" fill="${INK}"/><circle cx="53.2" cy="53" r="1.5" fill="#FFF"/><circle cx="69.2" cy="53" r="1.5" fill="#FFF"/>`
    + `<ellipse cx="45.5" cy="60" rx="3.6" ry="2.2" fill="#F28C8C" opacity=".75"/><ellipse cx="74.5" cy="60" rx="3.6" ry="2.2" fill="#F28C8C" opacity=".75"/><path d="M56.5 60.5 Q60 64 63.5 60.5" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    + hatLines(-2, true);
  return cut(shapes, details);
}
const heroSet = () => ({ idle: [frontPose()], run: [runPose(-1, 0), runPose(0, 1), runPose(1, 0), runPose(0, 1)] });
export const HERO = heroSet();

// ── Barco de papel (visto desde popa) ───────────────────────────────────────
const boatPose = (k, sailing) => paperBoat(k, sailing, rider(84, 68));
const boatSet = () => ({ idle: [boatPose(0, false)], run: [boatPose(0, true), boatPose(1, true)] });
export const BOAT = boatSet();

// ── Obstáculos y premios ────────────────────────────────────────────────────
const foam = `<path d="M10 106 q8 -9 16 0 q8 -9 16 0 M78 106 q8 -9 16 0 q8 -9 16 0" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>`;
// Moneda mon (con agujero cuadrado) y perla en su concha
// ── Meta: aeropuerto ─────────────────────────────────────────────────────────
// Pictograma de avión (el de los carteles de aeropuerto), centrado en 0,0
export const PLANE = 'M0 -11 C2.2 -11 2.6 -7 2.6 -4.5 L2.6 -1.5 L11 4 L11 6.8 L2.6 4.2 L2.1 8 L5.2 10.4 L5.2 12.2 L0 11 L-5.2 12.2 L-5.2 10.4 L-2.1 8 L-2.6 4.2 L-11 6.8 L-11 4 L-2.6 -1.5 L-2.6 -4.5 C-2.6 -7 -2.2 -11 0 -11Z';
// Terminal con techo curvo, puerta central por donde se entra, torre de control y cartel redondo con el avión
export const AIRPORT = cut(
  `<rect x="96" y="6" width="3" height="12" fill="#34333B"/><path d="M82 34 L112 34 L108 16 L86 16Z" fill="#8EC7D8"/><rect x="90" y="34" width="14" height="40" fill="#F6EEDD"/>`
  + `<path d="M4 76 Q52 44 112 70 L112 110 L4 110Z" fill="#F6EEDD"/>`,
  `<path d="M4 76 Q52 44 112 70 L112 80 Q52 56 4 86Z" fill="#4E6E8E"/><path d="M84 16 L110 16 L111 21 L83 21Z" fill="#34333B"/><path d="M82 34 L112 34 L111 29 L83 29Z" fill="#4E6E8E"/><path d="M92 21 L92 29 M102 21 L102 29" stroke="${CREAM}" stroke-width="2"/><circle cx="97.5" cy="6" r="3" fill="#E8452C"/>`
  + `<g fill="#8EC7D8"><rect x="10" y="90" width="10" height="13" rx="2"/><rect x="24" y="88" width="10" height="15" rx="2"/><rect x="86" y="88" width="10" height="15" rx="2"/><rect x="100" y="90" width="8" height="13" rx="2"/></g>`
  + `<path d="M42 110 L42 86 Q60 74 78 86 L78 110Z" fill="#2B2440"/><path d="M60 80 L60 110" stroke="#4E6E8E" stroke-width="2.5"/>`
  + `<circle cx="60" cy="66" r="13" fill="#F2B937" stroke="${CREAM}" stroke-width="3"/><path d="${PLANE}" transform="translate(60 66) rotate(45) scale(.82)" fill="#2B2440"/>`
  + `<path d="M4 104 L42 104 L42 110 L4 110Z M78 104 L112 104 L112 110 L78 110Z" fill="#D9CDB4"/>`);
// Avión de papel visto desde atrás: despega hacia el horizonte en el festejo de la meta
export const JET = cut(
  `<path d="M60 56 L4 66 L4 74 L60 72 L116 74 L116 66Z" fill="#FFF8EE"/><path d="M56 50 L60 14 L64 50Z" fill="#E8452C"/><path d="M60 44 L36 48 L36 53 L60 52 L84 53 L84 48Z" fill="#FFF8EE"/>`
  + `<circle cx="60" cy="64" r="17" fill="#FFF8EE"/><circle cx="32" cy="76" r="9" fill="#4E6E8E"/><circle cx="88" cy="76" r="9" fill="#4E6E8E"/>`,
  `<path d="M4 71 L43 69.6 L43 72.6 L4 74Z M116 71 L77 69.6 L77 72.6 L116 74Z" fill="#D9D3EC"/><path d="M43.6 68 Q60 76 76.4 68 A17 17 0 0 1 43.6 68Z" fill="#D9D3EC"/><path d="M60 14 L64 50 L60 50Z" fill="#B93322"/>`
  + `<path d="M44 60 Q60 54 76 60 L76.6 65 Q60 59 43.4 65Z" fill="#E8452C"/><circle cx="32" cy="76" r="5.5" fill="#F2B937"/><circle cx="88" cy="76" r="5.5" fill="#F2B937"/><circle cx="32" cy="76" r="2.6" fill="${CREAM}"/><circle cx="88" cy="76" r="2.6" fill="${CREAM}"/>`);
// ── Cielo: globo de papel, picos entre nubes, nubes y estrella ───────────────
const balloonPose = (k, flying) => paperBalloon(k, flying, rider(60, 88, .85));
const balloonSet = () => ({ idle: [balloonPose(0, false)], run: [balloonPose(0, true), balloonPose(1, true)] });
export const BALLOON = balloonSet();
const puff = (y, c = '#FFFFFF') => `<path d="M8 ${y} q-2 -12 10 -12 q4 -12 18 -6 q8 -10 20 -2 q12 -8 22 2 q14 -4 16 8 q12 0 10 10 q-48 8 -96 0Z" fill="${c}"/>`;

// ── Tren de papel (visto desde atrás) y obstáculos de vía ───────────────────
const trainPose = (k, moving) => paperTrain(k, moving, rider(60, 72, .75));
const trainSet = () => ({ idle: [trainPose(0, false)], run: [trainPose(0, true), trainPose(1, true)] });
export const TRAIN = trainSet();
// caja de madera: una sola, en tres cuartos, con tablas, marco y travesaño

// ── Elenco H13: Nilo, Mora, Sipho, Minji, Tuk, Layla, Cal y Anaya ──
// El arte (heroFor/thumbFor) sale de elenco.js y se cachea por personaje+atuendo. Cada personaje tiene atuendos (skins) en venta aparte: id 'nieve', 'lluvia'…
// SKINS = los personajes (id, name, tag, price, skins[{id,name,price,story}]). story = traje de historia: no se compra, se gana con la postal secreta (reward.skin en historia.js). El atuendo que lleva puesto cada uno lo guarda index.html (pv.wear).
const CAST = [
  ['nilo', 'Nilo', 0, [['nieve', 600], ['marinero', 800], ['opa', 0, 1]]], ['mora', 'Mora', 1500, [['lluvia', 700], ['montana', 800], ['remitente', 0, 1]]], ['sipho', 'Sipho', 1800, [['tormenta', 800], ['faro', 0, 1]]],
  ['minji', 'Minji', 2000, [['escenario', 900], ['duo', 0, 1]]], ['tuk', 'Tuk', 2000, [['invierno', 700], ['honor', 0, 1]]], ['layla', 'Layla', 2200, [['wadirum', 800], ['l18', 0, 1]]],
  ['cal', 'Cal', 2200, [['nevada', 700], ['cumbres', 0, 1]]], ['anaya', 'Anaya', 2500, [['color', 0, 1]]],
];
export const SKINS = CAST.map(([id, name, price, sk]) => ({ id, name, tag: tt('cast.' + id + '.tag'), price, head: 'h:' + id, c: {}, skins: sk.map(([s, p, h]) => ({ id: s, name: tt('cast.skin.' + s), price: p, story: !!h })) }));
// Precios que pagó el jugador por los viajeros y variantes anteriores (para el reembolso único de la migración)
export const LEGACY_PRICES = { ren: 1200, sakura: 150, kitsu: 400, shinobi: 800, oro: 2000 };
export const thumbOf = (id, skin = 'base') => { try { return thumbFor(SKINS.some(k => k.id === id) ? id : 'nilo', skin); } catch (e) { return ''; } };
// Arte completo para un personaje con su atuendo: sus poses y los tres vehículos con su cabecita a bordo (cacheado)
const ART = new Map(), VEH = new Map();
export function artFor(id, skin = 'base') {
  const ch = SKINS.find(k => k.id === id) || SKINS[0];
  if (skin !== 'base' && !ch.skins.some(s => s.id === skin)) skin = 'base';
  const key = ch.id + '|' + skin; if (ART.has(key)) return ART.get(key);
  if (!VEH.has(ch.id)) { C = { ...BASE, ...ch.c }; HEAD = ch.head; VEH.set(ch.id, { BOAT: boatSet(), BALLOON: balloonSet(), TRAIN: trainSet() }); C = { ...BASE }; HEAD = 'kasa'; }
  const out = { HERO: heroFor(ch.id, skin), ...VEH.get(ch.id) };
  ART.set(key, out); return out;
}

// Vagoneta suelta: un carrito de mina con vida propia que cruza de una vía a otra (obstáculo vivo del tramo de tren)

// ── Monumentos de cada destino (van al fondo del escenario y en la tarjeta del mapa) ──
export const LANDMARKS = {
  // Toscana: torre inclinada y cipreses
  pisa: cut(`<path d="M18 110 C16 80 20 54 24 40 C28 54 32 80 30 110Z M98 110 C96 84 100 62 104 50 C108 62 112 84 110 110Z" fill="#3F7A4E"/><g transform="rotate(7 60 110)"><rect x="44" y="22" width="32" height="88" rx="3" fill="#F6EEDD"/><rect x="48" y="12" width="24" height="12" rx="2" fill="#F6EEDD"/></g>`,
    `<g transform="rotate(7 60 110)"><path d="M44 36 h32 M44 50 h32 M44 64 h32 M44 78 h32 M44 92 h32" stroke="#CDBFA4" stroke-width="2.5"/><g fill="#B9A988"><rect x="49" y="40" width="4" height="7" rx="2"/><rect x="58" y="40" width="4" height="7" rx="2"/><rect x="67" y="40" width="4" height="7" rx="2"/><rect x="49" y="68" width="4" height="7" rx="2"/><rect x="58" y="68" width="4" height="7" rx="2"/><rect x="67" y="68" width="4" height="7" rx="2"/></g><rect x="62" y="22" width="14" height="88" fill="#E3D6BC" opacity=".6"/></g>`),
  // Merzouga: kasbah de barro y palmera
  kasbah: cut(`<path d="M22 110 L22 54 L30 54 L30 48 L38 48 L38 54 L46 54 L46 38 L54 38 L54 32 L62 32 L62 38 L70 38 L70 54 L80 54 L80 48 L88 48 L88 54 L96 54 L96 110Z" fill="#C98A5A"/><path d="M104 110 C102 84 102 62 106 50 L110 50 C108 66 108 88 110 110Z" fill="#8A5F38"/><path d="M108 50 Q92 40 84 48 Q96 46 106 54Z M108 50 Q124 38 118 32 Q114 44 110 54Z M108 50 Q100 30 90 30 Q102 38 106 52Z" fill="#4FA85A"/>`,
    `<g fill="#7A4A2A"><rect x="54" y="48" width="8" height="12" rx="4"/><rect x="31" y="66" width="7" height="10" rx="3"/><rect x="84" y="66" width="7" height="10" rx="3"/><path d="M52 110 L52 90 Q58 82 64 90 L64 110Z"/></g><rect x="70" y="54" width="26" height="56" fill="#A86E44" opacity=".45"/>`),
  // Río de Janeiro: Corcovado con el Cristo y el Pan de Azúcar
  cristo: cut(`<path d="M8 110 C20 84 30 56 48 44 C58 38 66 46 74 62 C82 78 96 96 112 110Z" fill="#5E8F5A"/><path d="M84 110 C90 92 98 80 106 80 C114 80 118 96 120 110Z" fill="#6E9A64"/><path d="M51 44 L51 22 L42 22 L42 18 L51 18 L51 12 L57 12 L57 18 L66 18 L66 22 L57 22 L57 44Z" fill="#F6F2EA"/><circle cx="54" cy="9" r="4" fill="#F6F2EA"/>`,
    `<path d="M58 46 C64 54 70 66 74 62 C68 74 60 90 52 110 L40 110 C46 90 52 70 58 46Z" fill="#4A7848" opacity=".5"/><rect x="54" y="18" width="3" height="26" fill="#D9D3C6"/>`),
  // Ushuaia: faro rojo y blanco sobre la roca, montañas nevadas
  faro: cut(`<path d="M4 110 L30 52 L44 70 L60 40 L82 76 L94 60 L118 110Z" fill="#8FA6B8"/><path d="M40 110 Q60 96 84 110Z" fill="#5E656D"/><path d="M52 98 L55 34 L67 34 L70 98Z" fill="#F6F2EA"/><rect x="51" y="24" width="20" height="12" rx="2" fill="#2B2440"/><path d="M50 24 L61 14 L72 24Z" fill="#E8452C"/>`,
    `<path d="M30 52 L38 62 L32 66 L26 60Z M60 40 L70 56 L62 54 L54 52Z M94 60 L100 70 L92 68Z" fill="#FFFFFF"/><path d="M54 50 L68 50 L68.6 62 L53.4 62Z M53 74 L69 74 L69.6 86 L52.4 86Z" fill="#E8452C"/><rect x="56" y="27" width="10" height="6" fill="#FFD46B"/>`),
  // Banff: montañas Rocosas y lago turquesa
  banff: cut(`<path d="M2 92 L26 40 L40 58 L60 22 L84 62 L98 46 L118 92Z" fill="#7C8794"/><path d="M6 110 Q60 86 114 110Z" fill="#3FB8C4"/><path d="M16 96 L22 70 L28 96Z M98 98 L104 72 L110 98Z" fill="#2E6B45"/>`,
    `<path d="M60 22 L72 42 L64 40 L58 46 L52 38Z M26 40 L32 52 L24 50Z M98 46 L104 56 L96 54Z" fill="#FFFFFF"/><path d="M30 104 Q60 96 90 104" stroke="#BFF1F5" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  // Islandia: iglesia escalonada de Reikiavik y volcán humeante al fondo
  iglesia: cut(`<path d="M70 110 L86 70 L98 70 L114 110Z" fill="#6E5A58"/><path d="M46 110 L46 18 L54 6 L62 18 L62 110Z M38 110 L38 46 L46 46 L46 110Z M30 110 L30 62 L38 62 L38 110Z M22 110 L22 76 L30 76 L30 110Z M62 110 L62 46 L70 46 L70 110Z M70 110 L70 62 L78 62 L78 110Z M78 110 L78 76 L86 76 L86 110Z" fill="#CFCBC5"/><circle cx="92" cy="60" r="7" fill="#D9D3EC"/><circle cx="100" cy="48" r="9" fill="#D9D3EC"/>`,
    `<g fill="#A29E97"><rect x="50" y="40" width="8" height="12" rx="4"/><rect x="50" y="90" width="8" height="20" rx="4"/></g><path d="M54 18 L62 18 L62 110 L56 110Z" fill="#B0ACA5" opacity=".6"/>`),
  // Kioto: pagoda de cinco pisos
  pagoda: cut(`<rect x="57" y="4" width="6" height="22" fill="#4A3F45"/><path d="M34 34 Q60 22 86 34 L80 38 L40 38Z M30 52 Q60 38 90 52 L84 56 L36 56Z M26 70 Q60 54 94 70 L88 74 L32 74Z M22 88 Q60 70 98 88 L92 92 L28 92Z" fill="#3E3A44"/><path d="M44 38 h32 v14 h-32Z M42 56 h36 v14 h-36Z M40 74 h40 v14 h-40Z M38 92 h44 v18 h-44Z" fill="#B9452F"/>`,
    `<g fill="#FFD46B"><rect x="56" y="42" width="8" height="8" rx="2"/><rect x="56" y="60" width="8" height="8" rx="2"/><rect x="56" y="78" width="8" height="8" rx="2"/><rect x="54" y="96" width="12" height="14" rx="2"/></g><path d="M66 38 h10 v72 h-10Z" fill="#8E3424" opacity=".45"/>`),
  // Hội An: puente cubierto y farolitos
  hoian: cut(`<path d="M8 22 Q60 44 112 22" stroke="#6B4A2E" stroke-width="2" fill="none"/><path d="M14 104 Q60 70 106 104 L106 110 L14 110Z" fill="#E9C46A"/><path d="M10 78 Q60 56 110 78 L104 84 L16 84Z" fill="#8E3424"/><rect x="24" y="84" width="72" height="12" fill="#E9C46A"/><g><ellipse cx="30" cy="34" rx="7" ry="9" fill="#E8452C"/><ellipse cx="60" cy="42" rx="7" ry="9" fill="#F2B937"/><ellipse cx="90" cy="34" rx="7" ry="9" fill="#E8452C"/></g>`,
    `<path d="M20 110 Q60 82 100 110" fill="#7FB7CF"/><g fill="#8A5F38"><rect x="32" y="86" width="5" height="8"/><rect x="58" y="86" width="5" height="8"/><rect x="84" y="86" width="5" height="8"/></g><g fill="#FFF3C4" opacity=".7"><ellipse cx="28" cy="31" rx="2" ry="3"/><ellipse cx="58" cy="39" rx="2" ry="3"/><ellipse cx="88" cy="31" rx="2" ry="3"/></g>`),
};

// ── Power-ups de la pista: mismo oficio que moneda, gema y caja (formas planas, tres tonos, sin texto) ──
// Doble: dos monedas apiladas (duplica lo que juntás)
// Cofre: caja de madera con tapa curva, herrajes dorados y cerradura (como la caja, pero con tapa)
