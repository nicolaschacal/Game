// Arte del Tile Runner, con las reglas de recorte de KANJŪ: formas planas de papel, borde crema,
// sombra inferior más oscura, ojos grandes con brillo y la paleta del juego. Lienzo 120×120, base en y≈110.
const CREAM = '#FFF4DC', INK = '#1A1220';
// Recorte: la silueta se dibuja primero con borde crema y encima las mismas formas sin borde + detalles.
const cut = (shapes, details = '', under = '') => `<svg viewBox="0 0 120 120">${under}<g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
const limb = (x, y, w, h, deg, fill, ox = x + w / 2, oy = y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fill}" transform="rotate(${deg} ${ox} ${oy})"/>`;

// ── Kami, el viajero de papel ───────────────────────────────────────────────
const C = { hat: '#EFC76A', hatD: '#C99A3C', coat: '#3E5BA9', coatD: '#2D4585', scarf: '#E8452C', scarfD: '#B93322', skin: '#F6D2B0', leg: '#2B2440', sole: '#D9A066', hair: '#2B1D16' };
const hat = dy => `<path d="M60 ${9 + dy} L101 ${42 + dy} Q60 ${55 + dy} 19 ${42 + dy}Z" fill="${C.hat}"/>`;
const hatLines = dy => `<path d="M60 ${9 + dy} L46 ${47 + dy} M60 ${9 + dy} L74 ${47 + dy} M60 ${9 + dy} L32 ${43 + dy} M60 ${9 + dy} L88 ${43 + dy}" stroke="${C.hatD}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/><path d="M19 ${42 + dy} Q60 ${55 + dy} 101 ${42 + dy} Q60 ${61 + dy} 19 ${42 + dy}Z" fill="${C.hatD}"/>`;
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
    + `<circle cx="60" cy="50" r="16" fill="${C.skin}"/>` + hat(-2);
  const details = coatShade(0) + `<path d="M52 61 L60 76 L68 61" fill="${CREAM}"/><path d="M45 62 Q60 70 75 62 L75 68 Q60 76 45 68Z" fill="${C.scarf}"/>`
    + `<ellipse cx="52" cy="55" rx="3.6" ry="4.8" fill="${INK}"/><ellipse cx="68" cy="55" rx="3.6" ry="4.8" fill="${INK}"/><circle cx="53.2" cy="53" r="1.5" fill="#FFF"/><circle cx="69.2" cy="53" r="1.5" fill="#FFF"/>`
    + `<ellipse cx="45.5" cy="60" rx="3.6" ry="2.2" fill="#F28C8C" opacity=".75"/><ellipse cx="74.5" cy="60" rx="3.6" ry="2.2" fill="#F28C8C" opacity=".75"/><path d="M56.5 60.5 Q60 64 63.5 60.5" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    + hatLines(-2);
  return cut(shapes, details);
}
export const HERO = { idle: [frontPose()], run: [runPose(-1, 0), runPose(0, 1), runPose(1, 0), runPose(0, 1)] };

// ── Barco de papel (visto desde popa) ───────────────────────────────────────
function boatPose(k, sailing) {
  const b = k ? 3 : 0; // la vela se hincha
  const shapes = `<rect x="57.5" y="10" width="5" height="68" rx="2.5" fill="#704332"/>`
    + `<path d="M62 ${12} L${82 + b} ${17 + b} L62 23Z" fill="#E8452C"/>`
    + `<path d="M60 22 C${88 + b} 26 ${96 + b} 50 ${90 + b} 70 L${30 - b} 70 C${24 - b} 50 ${32 - b} 26 60 22Z" fill="#FFF0D2"/>`
    + `<path d="M12 76 Q60 68 108 76 L97 100 Q60 108 23 100Z" fill="#B94D36"/>`;
  const details = `<path d="M${30 - b} 70 C${28 - b} 62 ${28 - b} 56 ${29 - b} 50 C50 56 70 56 ${91 + b} 50 C${92 + b} 58 ${92 + b} 64 ${90 + b} 70Z" fill="#EAD3A6"/>`
    + `<circle cx="60" cy="42" r="9" fill="#E8452C"/><path d="M60 22 V70" stroke="#704332" stroke-width="2.5" opacity=".35"/>`
    + `<path d="M84 60 L99 74 Q84 80 69 74Z" fill="${C.hat}" stroke="${CREAM}" stroke-width="3" stroke-linejoin="round"/><path d="M69 74 Q84 80 99 74 Q84 83 69 74Z" fill="${C.hatD}"/>`
    + `<path d="M12 76 Q60 68 108 76 L105.5 82 Q60 74 14.5 82Z" fill="#F5E7C8"/><path d="M19 92 Q60 101 101 92 L97 100 Q60 108 23 100Z" fill="#8E3526"/>`
    + `<circle cx="40" cy="89" r="3" fill="#F2B937"/><circle cx="60" cy="91" r="3" fill="#F2B937"/><circle cx="80" cy="89" r="3" fill="#F2B937"/>`
    + (sailing ? `<path d="M${6 + b * 2} 106 q7 -9 14 0 q7 -9 14 0 M${72 - b * 2} 108 q7 -9 14 0 q7 -9 14 0 M${38 + b} 112 q7 -7 14 0 q7 -7 14 0" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>`
               : `<path d="M16 106 q8 -6 16 0 M88 106 q8 -6 16 0" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`);
  return cut(shapes, details);
}
export const BOAT = { idle: [boatPose(0, false)], run: [boatPose(0, true), boatPose(1, true)] };

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
export const GATE = cut(`<path d="M8 30 Q60 14 112 30 L108 42 Q60 28 12 42Z" fill="#E8452C"/><rect x="26" y="34" width="11" height="76" rx="3" fill="#E8452C"/><rect x="83" y="34" width="11" height="76" rx="3" fill="#E8452C"/><rect x="20" y="52" width="80" height="9" rx="3" fill="#E8452C"/>`,
  `<path d="M8 30 Q60 14 112 30 L111 34 Q60 19 9 34Z" fill="#2B1D16"/><rect x="26" y="100" width="11" height="10" fill="#2B1D16"/><rect x="83" y="100" width="11" height="10" fill="#2B1D16"/><rect x="52" y="40" width="16" height="22" rx="3" fill="#F2B937"/>`);
