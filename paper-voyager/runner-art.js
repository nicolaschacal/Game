// Arte del Tile Runner, con las reglas de recorte de KANJŪ: formas planas de papel, borde crema,
// sombra inferior más oscura, ojos grandes con brillo y la paleta del juego. Lienzo 120×120, base en y≈110.
const CREAM = '#FFF4DC', INK = '#1A1220';
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
const rider = (cx, cy, k = 1) => HEAD === 'kasa'
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
function boatPose(k, sailing) {
  const b = k ? 3 : 0; // la vela se hincha
  const shapes = `<rect x="57.5" y="10" width="5" height="68" rx="2.5" fill="#704332"/>`
    + `<path d="M62 ${12} L${82 + b} ${17 + b} L62 23Z" fill="#E8452C"/>`
    + `<path d="M60 22 C${88 + b} 26 ${96 + b} 50 ${90 + b} 70 L${30 - b} 70 C${24 - b} 50 ${32 - b} 26 60 22Z" fill="#FFF0D2"/>`
    + `<path d="M12 76 Q60 68 108 76 L97 100 Q60 108 23 100Z" fill="#B94D36"/>`;
  const details = `<path d="M${30 - b} 70 C${28 - b} 62 ${28 - b} 56 ${29 - b} 50 C50 56 70 56 ${91 + b} 50 C${92 + b} 58 ${92 + b} 64 ${90 + b} 70Z" fill="#EAD3A6"/>`
    + `<circle cx="60" cy="42" r="9" fill="#E8452C"/><path d="M60 22 V70" stroke="#704332" stroke-width="2.5" opacity=".35"/>`
    + rider(84, 68)
    + `<path d="M12 76 Q60 68 108 76 L105.5 82 Q60 74 14.5 82Z" fill="#F5E7C8"/><path d="M19 92 Q60 101 101 92 L97 100 Q60 108 23 100Z" fill="#8E3526"/>`
    + `<circle cx="40" cy="89" r="3" fill="#F2B937"/><circle cx="60" cy="91" r="3" fill="#F2B937"/><circle cx="80" cy="89" r="3" fill="#F2B937"/>`
    + (sailing ? `<path d="M${6 + b * 2} 106 q7 -9 14 0 q7 -9 14 0 M${72 - b * 2} 108 q7 -9 14 0 q7 -9 14 0 M${38 + b} 112 q7 -7 14 0 q7 -7 14 0" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>`
               : `<path d="M16 106 q8 -6 16 0 M88 106 q8 -6 16 0" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`);
  return cut(shapes, details);
}
const boatSet = () => ({ idle: [boatPose(0, false)], run: [boatPose(0, true), boatPose(1, true)] });
export const BOAT = boatSet();

// ── Obstáculos y premios ────────────────────────────────────────────────────
const foam = `<path d="M10 106 q8 -9 16 0 q8 -9 16 0 M78 106 q8 -9 16 0 q8 -9 16 0" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>`;
export const ROCK = cut(`<path d="M14 108 L20 66 L42 38 L72 44 L98 72 L104 108Z" fill="#858B91"/>`,
  `<path d="M22 70 L42 42 L54 72 L36 90Z" fill="#B8BEC0"/><path d="M60 50 L74 54 L92 78 L68 72Z" fill="#626A72"/><path d="M14 108 L16 96 Q60 104 102 96 L104 108Z" fill="#5E656D"/>`);
export const STUMP = cut(`<path d="M30 108 L34 62 Q60 52 86 62 L90 108Z" fill="#A9794D"/><path d="M86 70 C100 62 104 50 100 42 C92 46 88 54 84 62Z" fill="#5DB84F"/>`,
  `<ellipse cx="60" cy="63" rx="26" ry="9" fill="#E2B987"/><ellipse cx="60" cy="63" rx="15" ry="5" fill="none" stroke="#A9794D" stroke-width="2.5"/><path d="M30 108 L31.5 94 Q60 102 88.5 94 L90 108Z" fill="#7D5636"/>`);
export const REEF = cut(`<path d="M16 106 L24 70 L44 46 L70 52 L94 76 L102 106Z" fill="#6F7F8C"/>`,
  `<path d="M26 74 L44 50 L54 76 L38 90Z" fill="#A9BAC4"/><path d="M60 58 L72 60 L88 82 L66 76Z" fill="#52606C"/><circle cx="34" cy="94" r="4" fill="#E8452C"/><circle cx="84" cy="92" r="3" fill="#F2B937"/>${foam}`);
export const FIN = cut(`<path d="M28 106 C36 70 56 38 82 22 C76 52 84 82 98 106Z" fill="#5F7A8C"/>`,
  `<path d="M60 106 C62 80 68 50 82 22 C76 52 84 82 98 106Z" fill="#48606F"/><path d="M40 84 q6 3 12 0" stroke="#48606F" stroke-width="3" fill="none" stroke-linecap="round"/>${foam}`);
export const BARREL = cut(`<path d="M30 104 C24 86 24 70 30 54 Q60 44 90 54 C96 70 96 86 90 104 Q60 112 30 104Z" fill="#A9794D"/>`,
  `<path d="M27 70 Q60 80 93 70 L93.5 78 Q60 88 26.5 78Z M28 90 Q60 100 92 90 L90 98 Q60 108 30 98Z" fill="#4A4658"/><ellipse cx="60" cy="54" rx="30" ry="9" fill="#E2B987"/><ellipse cx="60" cy="54" rx="19" ry="5" fill="none" stroke="#A9794D" stroke-width="2.5"/>${foam}`);
// Moneda mon (con agujero cuadrado) y perla en su concha
export const COIN = cut(`<circle cx="60" cy="64" r="30" fill="#F2B937"/>`,
  `<path d="M60 94 A30 30 0 0 1 32 74 Q60 90 88 74 A30 30 0 0 1 60 94Z" fill="#C98A1E"/><circle cx="60" cy="64" r="22" fill="none" stroke="#B87922" stroke-width="3.5"/><rect x="51" y="55" width="18" height="18" rx="3" fill="#8A551E"/><path d="M40 50 Q46 40 56 37" stroke="#FFF3C4" stroke-width="5" fill="none" stroke-linecap="round"/>`);
export const PEARL = cut(`<path d="M18 82 Q60 112 102 82 Q98 104 60 108 Q22 104 18 82Z" fill="#F29BB8"/><path d="M16 80 C20 44 44 26 60 26 C76 26 100 44 104 80 Q60 96 16 80Z" fill="#FFC4D6"/><circle cx="60" cy="78" r="17" fill="#FFFFFF"/>`,
  `<path d="M60 28 L60 62 M40 34 L50 66 M80 34 L70 66 M26 52 L40 72 M94 52 L80 72" stroke="#F29BB8" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="78" r="17" fill="#FDFBFF"/><path d="M60 95 A17 17 0 0 1 44 84 Q60 92 76 84 A17 17 0 0 1 60 95Z" fill="#D9D3EC"/><circle cx="54" cy="72" r="4.5" fill="#FFF"/>`);
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
function balloonPose(k, flying) {
  const shapes = `<path d="M60 6 C92 6 104 30 100 50 C97 66 82 76 72 84 L48 84 C38 76 23 66 20 50 C16 30 28 6 60 6Z" fill="#E8452C"/>`
    + `<path d="M46 98 L74 98 L71 114 Q60 117 49 114Z" fill="#A9794D"/>` + rider(60, 88, .85);
  const details = `<path d="M60 6 C74 22 76 62 68 84 L52 84 C44 62 46 22 60 6Z" fill="#FFF0D2"/><path d="M60 6 C36 14 26 50 40 76 C30 68 22 60 20 50 C16 30 28 6 60 6Z" fill="#B93322" opacity=".55"/>`
    + `<path d="M22 40 Q60 52 98 40 L99 48 Q60 60 21 48Z" fill="#F2B937"/><path d="M48 84 L72 84 L70 90 L50 90Z" fill="#704332"/>`
    + `<path d="M50 90 L48 99 M70 90 L72 99" stroke="#704332" stroke-width="2.2" stroke-linecap="round"/>`
    + `<path d="M46 98 L74 98 L73.2 103 Q60 106 46.8 103Z" fill="#E2B987"/><path d="M49 114 L48 109 Q60 112 72 109 L71 114 Q60 117 49 114Z" fill="#6B4A2E"/>`
    + (flying ? `<path d="M60 ${k ? 71 : 74} q${k ? 5 : 4} 7 0 12 q-${k ? 5 : 4} -5 0 -12Z" fill="#F2B937"/>` : '');
  return cut(shapes, details);
}
const balloonSet = () => ({ idle: [balloonPose(0, false)], run: [balloonPose(0, true), balloonPose(1, true)] });
export const BALLOON = balloonSet();
const puff = (y, c = '#FFFFFF') => `<path d="M8 ${y} q-2 -12 10 -12 q4 -12 18 -6 q8 -10 20 -2 q12 -8 22 2 q14 -4 16 8 q12 0 10 10 q-48 8 -96 0Z" fill="${c}"/>`;
export const PEAK = cut(`<path d="M22 100 L50 24 L60 12 L74 30 L100 100Z" fill="#7C8794"/>`,
  `<path d="M40 52 L50 24 L60 12 L74 30 L82 52 L70 44 L62 56 L52 44Z" fill="#FFFFFF"/><path d="M60 12 L74 30 L100 100 L72 100 L62 56Z" fill="#5C6672" opacity=".7"/>${puff(108)}`);
export const CLOUD = cut(`<path d="M14 92 C2 92 2 72 18 70 C16 50 40 44 50 56 C58 36 90 40 90 62 C108 60 114 84 100 92Z" fill="#FFFFFF"/>`,
  `<path d="M14 92 C6 92 4 84 8 78 Q60 90 108 76 C110 84 106 92 100 92Z" fill="#CFE3F2"/><ellipse cx="46" cy="72" rx="3" ry="4" fill="${INK}"/><ellipse cx="68" cy="72" rx="3" ry="4" fill="${INK}"/><path d="M53 80 Q57 83 61 80" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="79" rx="3.5" ry="2" fill="#F28C8C" opacity=".7"/><ellipse cx="76" cy="79" rx="3.5" ry="2" fill="#F28C8C" opacity=".7"/>`);
export const STORM = cut(`<path d="M14 78 C2 78 2 58 18 56 C16 36 40 30 50 42 C58 22 90 26 90 48 C108 46 114 70 100 78Z" fill="#6B7285"/><path d="M58 74 L44 94 L56 94 L48 114 L74 88 L62 88 L70 74Z" fill="#F2B937"/>`,
  `<path d="M14 78 C6 78 4 70 8 64 Q60 76 108 62 C110 70 106 78 100 78Z" fill="#4A5062"/><path d="M40 54 l10 4 M78 54 l-10 4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><ellipse cx="47" cy="62" rx="3" ry="3.5" fill="${INK}"/><ellipse cx="71" cy="62" rx="3" ry="3.5" fill="${INK}"/>`);
export const STAR = cut(`<path d="M60 14 L73 44 L106 48 L81 70 L88 102 L60 86 L32 102 L39 70 L14 48 L47 44Z" fill="#F2B937"/>`,
  `<path d="M60 86 L88 102 L81 70 L106 48 L84 60 L76 82Z" fill="#C98A1E" opacity=".8"/><path d="M48 46 Q52 36 60 30" stroke="#FFF3C4" stroke-width="5" fill="none" stroke-linecap="round"/>`);

// ── Tren de papel (visto desde atrás) y obstáculos de vía ───────────────────
function trainPose(k, moving) {
  // ancho como el barco y el globo, pero ruedas y techo quedan dentro del tile (de x 17 a 103)
  const shapes = (moving ? `<circle cx="${k ? 66 : 58}" cy="${k ? 8 : 12}" r="${k ? 8 : 6}" fill="#FFFFFF"/>` : '')
    + `<path d="M50 40 L52 21 L48 15 L72 15 L68 21 L70 40Z" fill="#34333B"/>`
    + `<rect x="19" y="84" width="15" height="24" rx="5" fill="#34333B"/><rect x="86" y="84" width="15" height="24" rx="5" fill="#34333B"/>`
    + `<rect x="23" y="40" width="74" height="58" rx="8" fill="#E8452C"/><path d="M17 45 Q60 28 103 45 L101 53 L19 53Z" fill="#FFF0D2"/>`
    + `<rect x="20" y="92" width="80" height="12" rx="4" fill="#704332"/>`;
  const details = `<path d="M19 49 L101 49 L101 53 L19 53Z" fill="#EAD3A6"/><rect x="38" y="58" width="44" height="23" rx="6" fill="#8EC7D8"/>` + rider(60, 72, .75)
    + `<rect x="38" y="58" width="44" height="23" rx="6" fill="none" stroke="#FFF0D2" stroke-width="4"/><rect x="23" y="84" width="74" height="5" fill="#F2B937"/><path d="M23 90 L97 90 L97 92 Q60 97 23 92Z" fill="#B93322"/>`
    + `<circle cx="35" cy="98" r="4.5" fill="#F2B937"/><circle cx="85" cy="98" r="4.5" fill="#F2B937"/><circle cx="60" cy="98" r="3.2" fill="#FFF0D2"/>`
    + `<rect x="19" y="${k ? 92 : 98}" width="15" height="4" fill="#5E5D66"/><rect x="86" y="${k ? 98 : 92}" width="15" height="4" fill="#5E5D66"/>`;
  return cut(shapes, details);
}
const trainSet = () => ({ idle: [trainPose(0, false)], run: [trainPose(0, true), trainPose(1, true)] });
export const TRAIN = trainSet();
export const BARRIER = cut(`<rect x="22" y="50" width="10" height="60" rx="3" fill="#704332"/><rect x="88" y="50" width="10" height="60" rx="3" fill="#704332"/><rect x="10" y="44" width="100" height="22" rx="5" fill="#FFF0D2"/><rect x="10" y="76" width="100" height="14" rx="5" fill="#FFF0D2"/>`,
  `<path d="M22 44 L38 44 L26 66 L10 66Z M54 44 L70 44 L58 66 L42 66Z M86 44 L102 44 L90 66 L74 66Z" fill="#E8452C"/><path d="M30 76 L44 76 L36 90 L22 90Z M66 76 L80 76 L72 90 L58 90Z" fill="#E8452C"/><circle cx="60" cy="34" r="8" fill="#F2B937" stroke="${CREAM}" stroke-width="3"/>`);
// caja de madera: una sola, en tres cuartos, con tablas, marco y travesaño
export const CRATE = cut(`<path d="M22 46 L34 34 L100 34 L88 46Z" fill="#E9BC82"/><path d="M88 46 L100 34 L100 96 L88 108Z" fill="#9E6B3C"/><rect x="22" y="46" width="66" height="62" rx="3" fill="#C98F55"/>`,
  `<path d="M24 66 L86 66 M24 87 L86 87" stroke="#A9743F" stroke-width="2.5"/><rect x="25" y="49" width="60" height="56" rx="2" fill="none" stroke="#8A5A2E" stroke-width="6"/><path d="M28 102 L82 52" stroke="#8A5A2E" stroke-width="7" stroke-linecap="round"/>`
  + `<path d="M40 40 L94 40" stroke="#D3A266" stroke-width="2.5"/><path d="M94 52 L94 98" stroke="#87592F" stroke-width="2.5"/><g fill="#5E3E22"><circle cx="30" cy="54" r="2.2"/><circle cx="80" cy="54" r="2.2"/><circle cx="30" cy="100" r="2.2"/><circle cx="80" cy="100" r="2.2"/></g>`);
export const GEM = cut(`<path d="M60 18 L96 52 L60 104 L24 52Z" fill="#3FBF8F"/>`,
  `<path d="M60 18 L96 52 L60 62Z" fill="#7FE0B8"/><path d="M60 62 L96 52 L60 104Z" fill="#2A8F69"/><path d="M60 18 L24 52 L60 62Z" fill="#59CFA2"/><path d="M40 44 L52 32" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>`);

// ── Personajes (skins) ──────────────────────────────────────────────────────
export const SKINS = [
  { id: 'kami', name: 'Kami', tag: 'El viajero', price: 0, head: 'kasa', c: {} },
  { id: 'sakura', name: 'Sakura', tag: 'Flor de cerezo', price: 150, head: 'kasa', c: { hat: '#F7B7C8', hatD: '#E58BA5', coat: '#D9567E', coatD: '#B23F63', scarf: '#FFF4DC' } },
  { id: 'kitsu', name: 'Kitsu', tag: 'Zorrita blanca', price: 400, head: 'fox', c: { hat: '#FFF8EE', hatD: '#F29BB8', hair: '#FFF8EE', coat: '#E8452C', coatD: '#B93322', scarf: '#F2B937' } },
  { id: 'shinobi', name: 'Shinobi', tag: 'Sombra veloz', price: 800, head: 'ninja', c: { hat: '#2B2440', hatD: '#E8452C', hair: '#2B2440', coat: '#3A3558', coatD: '#262240', scarf: '#7B5CC4', leg: '#1A1728' } },
  { id: 'oro', name: 'Kami de Oro', tag: 'Leyenda', price: 2000, head: 'kasa', c: { hat: '#FFD86B', hatD: '#D9A021', coat: '#F2B937', coatD: '#C98A1E', scarf: '#FFF4DC', leg: '#8A551E' } },
];
// Arte completo para un personaje: sus poses y los tres vehículos con su cabecita a bordo
export function artFor(id) {
  const skin = SKINS.find(k => k.id === id) || SKINS[0];
  C = { ...BASE, ...skin.c }; HEAD = skin.head;
  const out = { HERO: heroSet(), BOAT: boatSet(), BALLOON: balloonSet(), TRAIN: trainSet() };
  C = { ...BASE }; HEAD = 'kasa';
  return out;
}

// Vagoneta suelta: un carrito de mina con vida propia que cruza de una vía a otra (obstáculo vivo del tramo de tren)
export const CART = cut(`<path d="M18 50 L102 50 L92 92 L28 92Z" fill="#4E6E8E"/><path d="M34 50 q6 -16 18 -8 q8 -14 20 -2 q12 -6 14 10Z" fill="#34333B"/><circle cx="38" cy="98" r="12" fill="#34333B"/><circle cx="82" cy="98" r="12" fill="#34333B"/>`,
  `<path d="M14 46 L106 46 L104 56 L16 56Z" fill="#7FA0BE" stroke="${CREAM}" stroke-width="0"/><path d="M26 84 L94 84 L92 92 L28 92Z" fill="#3A546E"/><circle cx="38" cy="98" r="5" fill="#C9CED6"/><circle cx="82" cy="98" r="5" fill="#C9CED6"/>`
  + `<ellipse cx="48" cy="68" rx="4.6" ry="6" fill="${INK}"/><ellipse cx="72" cy="68" rx="4.6" ry="6" fill="${INK}"/><circle cx="49.6" cy="65.6" r="1.8" fill="#FFF"/><circle cx="73.6" cy="65.6" r="1.8" fill="#FFF"/><ellipse cx="39" cy="76" rx="4" ry="2.4" fill="#F28C8C" opacity=".75"/><ellipse cx="81" cy="76" rx="4" ry="2.4" fill="#F28C8C" opacity=".75"/><path d="M55 76 Q60 80 65 76" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="46" cy="38" r="3" fill="#5E5D66"/><circle cx="66" cy="34" r="3.5" fill="#5E5D66"/>`);

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
  iglesia: cut(`<path d="M70 110 L86 70 L98 70 L114 110Z" fill="#6E5A58"/><path d="M46 110 L46 18 L54 6 L62 18 L62 110Z M38 110 L38 46 L46 46 L46 110Z M30 110 L30 62 L38 62 L38 110Z M22 110 L22 76 L30 76 L30 110Z M62 110 L62 46 L70 46 L70 110Z M70 110 L70 62 L78 62 L78 110Z M78 110 L78 76 L86 76 L86 110Z" fill="#E4E2DE"/><circle cx="92" cy="60" r="7" fill="#D9D3EC"/><circle cx="100" cy="48" r="9" fill="#D9D3EC"/>`,
    `<g fill="#BDB9B2"><rect x="50" y="40" width="8" height="12" rx="4"/><rect x="50" y="90" width="8" height="20" rx="4"/></g><path d="M54 18 L62 18 L62 110 L56 110Z" fill="#CBC7C0" opacity=".6"/>`),
  // Kioto: pagoda de cinco pisos
  pagoda: cut(`<rect x="57" y="4" width="6" height="22" fill="#4A3F45"/><path d="M34 34 Q60 22 86 34 L80 38 L40 38Z M30 52 Q60 38 90 52 L84 56 L36 56Z M26 70 Q60 54 94 70 L88 74 L32 74Z M22 88 Q60 70 98 88 L92 92 L28 92Z" fill="#3E3A44"/><path d="M44 38 h32 v14 h-32Z M42 56 h36 v14 h-36Z M40 74 h40 v14 h-40Z M38 92 h44 v18 h-44Z" fill="#B9452F"/>`,
    `<g fill="#FFD46B"><rect x="56" y="42" width="8" height="8" rx="2"/><rect x="56" y="60" width="8" height="8" rx="2"/><rect x="56" y="78" width="8" height="8" rx="2"/><rect x="54" y="96" width="12" height="14" rx="2"/></g><path d="M66 38 h10 v72 h-10Z" fill="#8E3424" opacity=".45"/>`),
  // Hội An: puente cubierto y farolitos
  hoian: cut(`<path d="M8 22 Q60 44 112 22" stroke="#6B4A2E" stroke-width="2" fill="none"/><path d="M14 104 Q60 70 106 104 L106 110 L14 110Z" fill="#E9C46A"/><path d="M10 78 Q60 56 110 78 L104 84 L16 84Z" fill="#8E3424"/><rect x="24" y="84" width="72" height="12" fill="#E9C46A"/><g><ellipse cx="30" cy="34" rx="7" ry="9" fill="#E8452C"/><ellipse cx="60" cy="42" rx="7" ry="9" fill="#F2B937"/><ellipse cx="90" cy="34" rx="7" ry="9" fill="#E8452C"/></g>`,
    `<path d="M20 110 Q60 82 100 110" fill="#7FB7CF"/><g fill="#8A5F38"><rect x="32" y="86" width="5" height="8"/><rect x="58" y="86" width="5" height="8"/><rect x="84" y="86" width="5" height="8"/></g><g fill="#FFF3C4" opacity=".7"><ellipse cx="28" cy="31" rx="2" ry="3"/><ellipse cx="58" cy="39" rx="2" ry="3"/><ellipse cx="88" cy="31" rx="2" ry="3"/></g>`),
};

// ── Power-ups de la pista: mismo oficio que moneda, gema y caja (formas planas, tres tonos, sin texto) ──
// Doble: dos monedas apiladas (duplica lo que juntás)
export const DOUBLE = cut(`<circle cx="50" cy="72" r="26" fill="#C98A1E"/><circle cx="68" cy="56" r="26" fill="#F2B937"/>`,
  `<path d="M42 56 A26 26 0 0 1 80 42 Q68 46 60 52 Q52 60 46 66Z" fill="#FFE49A"/><circle cx="68" cy="56" r="15" fill="none" stroke="#C98A1E" stroke-width="4"/><path d="M44 46 Q48 38 56 36" stroke="#FFF3C4" stroke-width="5" fill="none" stroke-linecap="round"/>`);
// Escudo: blasón de papel azul, mitad en sombra, con una franja clara
export const SHIELD = cut(`<path d="M60 16 L96 28 L94 60 Q90 90 60 106 Q30 90 26 60 L24 28Z" fill="#3E5BA9"/>`,
  `<path d="M60 16 L96 28 L94 60 Q90 90 60 106 L60 16Z" fill="#2C4585"/><path d="M60 34 L78 40 L77 60 Q74 78 60 88 Q46 78 43 60 L42 40Z" fill="#7FA0E0"/><path d="M60 34 L60 88 Q46 78 43 60 L42 40Z" fill="#9DB6EA"/><path d="M50 46 Q54 40 60 38" stroke="#FFF4DC" stroke-width="4" fill="none" stroke-linecap="round"/>`);
// Cofre: caja de madera con tapa curva, herrajes dorados y cerradura (como la caja, pero con tapa)
export const CHEST = cut(`<rect x="22" y="58" width="76" height="46" rx="4" fill="#C98F55"/><path d="M22 58 Q22 30 60 30 Q98 30 98 58Z" fill="#E9BC82"/><path d="M84 58 L98 58 L98 100 Q98 104 94 104 L84 104Z" fill="#9E6B3C"/>`,
  `<path d="M22 58 Q22 30 60 30 Q98 30 98 58" fill="none" stroke="#8A5A2E" stroke-width="4"/><rect x="22" y="56" width="76" height="6" fill="#7A4A26"/><path d="M22 84 L84 84" stroke="#A9743F" stroke-width="2.5"/><rect x="34" y="42" width="8" height="60" fill="#5E3E22"/><rect x="78" y="42" width="8" height="60" fill="#5E3E22"/><rect x="50" y="60" width="20" height="22" rx="3" fill="#F2B937" stroke="#C98A1E" stroke-width="2.5"/><rect x="56" y="68" width="8" height="8" rx="1.5" fill="#5E3E22"/><circle cx="60" cy="68" r="3" fill="#5E3E22"/><path d="M50 46 Q58 40 70 42" stroke="#FFF3C4" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#F2B937"><circle cx="27" cy="98" r="2.6"/><circle cx="93" cy="98" r="2.6"/></g>`);
