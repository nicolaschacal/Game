// Los destinos del viaje, en orden de vuelta al mundo hacia el oeste (Kioto → … → Sídney → y de nuevo Kioto). Receta de Kioto en todos: un monumento grande al fondo, una paleta de pocos colores
// y tres adornos de costado. Cada destino trae su monumento (art), su escenario (look) y el piso de la pista.
import { LANDMARKS } from './runner-art.js';
import { t as tt } from './i18n.js';
import { ADORNOS, LUZ, adornosDe } from './adornos.js';
import { fila } from './kit-ciudades.js';
import { FICHAS } from './fichas-ciudades.js';
const CREAM = '#FFF4DC';
const cut = (shapes, details = '') => `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>${shapes}${details}</svg>`;
const win = (x, y, cols, rows, c = '#FFE9A8', dx = 5, dy = 7) => { let s = ''; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += `<rect x="${x + i * dx}" y="${y + j * dy}" width="2.6" height="3.6" fill="${c}"/>`; return s; };
const L = {};
L.liberty = cut(
  `<rect x="8" y="62" width="16" height="48" fill="#8C9BB3"/><rect x="24" y="78" width="12" height="32" fill="#A7B4C8"/><rect x="86" y="70" width="12" height="40" fill="#A7B4C8"/><rect x="98" y="52" width="15" height="58" fill="#8C9BB3"/>`
  + `<path d="M40 110 L40 102 L45 102 L49 82 L71 82 L75 102 L80 102 L80 110Z" fill="#D2C2A4"/>`
  + `<path d="M50 82 L54 50 Q60 43 66 50 L70 82Z" fill="#6FB5A0"/><path d="M64 52 L73 22 L79 24 L71 56Z" fill="#6FB5A0"/><rect x="72" y="18" width="10" height="5" rx="1.5" fill="#6FB5A0"/><path d="M77 18 Q72 10 77 3 Q83 10 80 18Z" fill="#F2B937"/>`
  + `<path d="M52 37 L47 27 L55 33 L57 22 L60 32 L63 22 L65 33 L73 27 L68 37Z" fill="#6FB5A0"/><circle cx="60" cy="41" r="7.5" fill="#6FB5A0"/><rect x="43" y="56" width="10" height="15" rx="1.5" fill="#6FB5A0" transform="rotate(-10 48 63)"/>`,
  `<path d="M60 46 Q66 45 66 50 L70 82 L60 82Z" fill="#4E9482" opacity=".55"/><path d="M49 82 L71 82 L72 88 L48 88Z" fill="#B8A684"/><path d="M40 102 L80 102 L80 106 L40 106Z" fill="#B8A684"/>` + win(11, 67, 2, 5) + win(101, 58, 2, 6) + win(27, 83, 2, 3) + win(88, 75, 2, 4));
L.tokyo = cut(
  `<rect x="8" y="76" width="16" height="34" fill="#B8BEC8"/><rect x="24" y="88" width="12" height="22" fill="#9AA3B2"/><rect x="88" y="84" width="12" height="26" fill="#9AA3B2"/><rect x="100" y="70" width="13" height="40" fill="#B8BEC8"/>`
  + `<rect x="58.5" y="2" width="3" height="14" fill="#E8452C"/><path d="M60 10 L64 40 L70 62 L85 110 L73 110 Q60 90 47 110 L35 110 L50 62 L56 40Z" fill="#E8452C"/><rect x="48" y="58" width="24" height="8" rx="1.5" fill="#FFF8EE"/><rect x="53" y="36" width="14" height="5" rx="1" fill="#FFF8EE"/>`,
  `<path d="M57.4 22 L62.6 22 L63.5 30 L56.5 30Z M51.6 72 L68.4 72 L71 81 L49 81Z" fill="#FFF8EE"/><path d="M45 92 L53.5 92 Q49 97 46.6 103 L41.6 103Z M75 92 L66.5 92 Q71 97 73.4 103 L78.4 103Z" fill="#FFF8EE"/><path d="M52 44 L68 56 M68 44 L52 56 M48 68 L72 88 M72 68 L48 88" stroke="#B93322" stroke-width="1.6" opacity=".7"/>` + win(11, 81, 2, 4) + win(103, 75, 2, 5));
L.piramides = cut(
  `<path d="M2 110 L24 70 L48 110Z" fill="#E6C278"/><path d="M26 110 L68 28 L116 110Z" fill="#E6C278"/>`,
  `<path d="M24 70 L48 110 L34 110Z" fill="#C99A45"/><path d="M68 28 L116 110 L86 110Z" fill="#C99A45"/><path d="M52 60 L60 60 M44 76 L58 76 M38 90 L62 90" stroke="#D4AC5C" stroke-width="2" stroke-linecap="round"/>`);
L.eiffel = cut(
  `<rect x="8" y="80" width="20" height="30" fill="#E2D6C0"/><path d="M6 80 L10 70 L26 70 L30 80Z" fill="#7C8794"/><rect x="92" y="84" width="20" height="26" fill="#E2D6C0"/><path d="M90 84 L94 75 L110 75 L114 84Z" fill="#7C8794"/><rect x="58.5" y="2" width="3" height="12" fill="#7A6450"/><path d="M60 8 L63.5 40 L69 66 L84 110 L72 110 Q60 86 48 110 L36 110 L51 66 L56.5 40Z" fill="#8C735C"/><rect x="47" y="64" width="26" height="6" rx="1.5" fill="#6B5644"/><rect x="52.5" y="38" width="15" height="5" rx="1" fill="#6B5644"/>`,
  `<path d="M52 46 L68 62 M68 46 L52 62 M48 72 L74 96 M72 72 L46 96 M57 14 L63 34 M63 14 L57 34" stroke="#B59A80" stroke-width="1.6" opacity=".8"/>` + win(11, 85, 3, 3, '#8E7F6A', 6, 8) + win(95, 89, 3, 2, '#8E7F6A', 6, 8));
L.bigben = cut(
  `<path d="M6 110 L6 82 L10 82 L10 76 L14 76 L14 82 L28 82 L28 76 L32 76 L32 82 L46 82 L46 110Z" fill="#CDB07A"/><path d="M74 110 L74 86 L92 86 L92 80 L96 80 L96 86 L110 86 L110 80 L114 80 L114 110Z" fill="#CDB07A"/>`
  + `<path d="M50 24 L60 2 L70 24Z" fill="#5E6B78"/><rect x="46" y="24" width="28" height="86" fill="#DDBD82"/>`,
  `<rect x="46" y="24" width="28" height="6" fill="#8A6F45"/><rect x="46" y="60" width="28" height="4" fill="#8A6F45"/><circle cx="60" cy="45" r="11" fill="#FFF8EE" stroke="#3E3A44" stroke-width="2.5"/><path d="M60 45 L60 37 M60 45 L66 48" stroke="#3E3A44" stroke-width="2.4" stroke-linecap="round"/><path d="M52 68 L52 110 M60 68 L60 110 M68 68 L68 110" stroke="#B89658" stroke-width="2"/><rect x="66" y="24" width="8" height="86" fill="#B89658" opacity=".35"/>` + win(11, 90, 6, 2, '#6B5A3C', 6, 9) + win(79, 92, 6, 2, '#6B5A3C', 6, 8));
L.opera = cut(
  `<path d="M0 110 L0 102 Q30 96 60 102 Q90 108 120 102 L120 110Z" fill="#5AA5D2"/><path d="M6 104 L12 92 L108 92 L114 104Z" fill="#D2C2A4"/>`
  + `<path d="M14 92 Q20 50 50 42 Q40 68 44 92Z" fill="#FFF8EE"/><path d="M38 92 Q46 40 82 30 Q66 62 68 92Z" fill="#FFF8EE"/><path d="M64 92 Q74 54 104 48 Q92 70 92 92Z" fill="#FFF8EE"/>`,
  `<path d="M36 92 Q36 62 50 42 Q40 68 44 92Z M60 92 Q62 56 82 30 Q66 62 68 92Z M84 92 Q88 64 104 48 Q92 70 92 92Z" fill="#D9D3EC"/><path d="M6 104 L8 100 L112 100 L114 104Z" fill="#B8A684"/>`);
const arches = (y, x0, x1, n) => { let s = ''; const w = (x1 - x0) / n; for (let i = 0; i < n; i++) s += `<path d="M${x0 + i * w + 2} ${y + 13} L${x0 + i * w + 2} ${y + 5} Q${x0 + i * w + w / 2} ${y - 2} ${x0 + (i + 1) * w - 2} ${y + 5} L${x0 + (i + 1) * w - 2} ${y + 13}Z" fill="#8A6442"/>`; return s; };
L.coliseo = cut(`<path d="M8 110 L8 48 Q36 38 66 42 L66 60 Q92 62 112 70 L112 110Z" fill="#DDBE90"/>`,
  arches(50, 12, 64, 5) + arches(72, 12, 110, 9) + arches(94, 12, 110, 9) + `<path d="M8 66 L66 66 L112 74" stroke="#B99868" stroke-width="2.5" fill="none"/><path d="M8 89 L112 89" stroke="#B99868" stroke-width="2.5"/>`);
L.taj = cut(
  `<rect x="14" y="46" width="7" height="48" fill="#FFF8EE"/><rect x="99" y="46" width="7" height="48" fill="#FFF8EE"/><circle cx="17.5" cy="44" r="5" fill="#FFF8EE"/><circle cx="102.5" cy="44" r="5" fill="#FFF8EE"/>`
  + `<rect x="59" y="14" width="2" height="12" fill="#F2B937"/><path d="M46 64 C36 46 50 34 60 24 C70 34 84 46 74 64Z" fill="#FFF8EE"/><circle cx="40" cy="60" r="7" fill="#FFF8EE"/><circle cx="80" cy="60" r="7" fill="#FFF8EE"/><rect x="32" y="62" width="56" height="32" fill="#FFF8EE"/><rect x="8" y="92" width="104" height="18" rx="2" fill="#FFF8EE"/>`,
  `<path d="M60 24 C70 34 84 46 74 64 L62 64 C70 48 66 36 60 24Z" fill="#E1D8EC"/><path d="M53 94 L53 76 Q60 66 67 76 L67 94Z" fill="#9C8DB8"/><path d="M37 94 L37 80 Q41 75 45 80 L45 94Z M75 94 L75 80 Q79 75 83 80 L83 94Z" fill="#C9BEDD"/><path d="M8 100 L112 100 L112 110 L8 110Z" fill="#E1D8EC"/><path d="M14 58 h7 M14 74 h7 M99 58 h7 M99 74 h7" stroke="#C9BEDD" stroke-width="2"/>`);
L.partenon = cut(
  `<path d="M0 110 Q14 96 34 98 L92 98 Q108 96 120 110Z" fill="#B7A078"/><path d="M10 52 L60 28 L110 52Z" fill="#F1E6CF"/><rect x="12" y="50" width="96" height="9" fill="#F1E6CF"/>`
  + [0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${16 + i * 13.3}" y="59" width="8" height="37" fill="#F1E6CF"/>`).join('') + `<path d="M8 104 L12 95 L108 95 L112 104Z" fill="#F1E6CF"/>`,
  `<path d="M22 50 L60 33 L98 50Z" fill="#D9C8A6"/><rect x="12" y="55" width="96" height="4" fill="#D9C8A6"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${21 + i * 13.3}" y="59" width="3" height="37" fill="#D9C8A6"/>`).join('') + `<path d="M8 104 L10 100 L110 100 L112 104Z" fill="#D9C8A6"/>`);
L.muralla = cut(
  `<path d="M0 110 Q26 56 58 82 Q88 46 120 100 L120 110Z" fill="#6FA255"/><path d="M2 100 Q28 56 58 78 Q88 46 118 92 L118 102 Q88 58 58 90 Q28 68 2 112Z" fill="#CDB48C"/>`
  + `<path d="M48 84 L48 62 L52 62 L52 57 L56 57 L56 62 L60 62 L60 57 L64 57 L64 62 L68 62 L68 84Z" fill="#DCC49C"/><path d="M88 66 L88 50 L91 50 L91 46 L95 46 L95 50 L98 50 L98 46 L102 46 L102 66Z" fill="#DCC49C"/>`,
  `<path d="M2 106 Q28 62 58 84 Q88 52 118 98" stroke="#A88E66" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/><rect x="55" y="70" width="6" height="9" rx="3" fill="#7A6442"/><rect x="93" y="54" width="4" height="7" rx="2" fill="#7A6442"/><path d="M60 62 L68 62 L68 84 L60 84Z" fill="#B99E74" opacity=".5"/>`);
L.machu = cut(
  `<path d="M0 110 L22 56 L34 66 L50 110Z" fill="#5E9A5C"/><path d="M38 110 L60 16 Q68 10 75 24 L106 110Z" fill="#4E8A52"/><path d="M8 110 L8 99 L40 99 L40 91 L84 91 L84 99 L114 99 L114 110Z" fill="#CDB89A"/>`
  + `<path d="M46 91 L46 82 L52 76 L58 82 L58 91Z M64 91 L64 80 L71 73 L78 80 L78 91Z" fill="#B9A27C"/>`,
  `<path d="M60 16 Q68 10 75 24 L106 110 L84 110 Q72 60 60 16Z" fill="#3C7044" opacity=".6"/><path d="M8 105 L114 105 M40 96 L84 96" stroke="#A8916E" stroke-width="2"/><rect x="50" y="84" width="4" height="7" fill="#6B5A3C"/><rect x="69" y="82" width="4" height="9" fill="#6B5A3C"/><path d="M14 40 q-2 -8 8 -8 q4 -8 14 -3 q10 -4 12 5 q8 1 6 8Z" fill="#FFFFFF" opacity=".9"/>`);
L.burj = cut(
  `<rect x="10" y="70" width="16" height="40" fill="#D9C7A4"/><rect x="26" y="84" width="12" height="26" fill="#C9B48C"/><rect x="88" y="78" width="12" height="32" fill="#C9B48C"/><rect x="100" y="62" width="12" height="48" fill="#D9C7A4"/>`
  + `<path d="M60 2 L62 28 L66 28 L66 50 L71 50 L71 74 L77 74 L77 110 L43 110 L43 82 L49 82 L49 56 L54 56 L54 34 L58 34Z" fill="#A9C2D8"/>`,
  `<path d="M60 2 L62 28 L66 28 L66 50 L71 50 L71 74 L77 74 L77 110 L60 110Z" fill="#7E9CB8" opacity=".7"/><path d="M48 90 h26 M48 98 h26 M52 66 h16 M56 44 h8" stroke="#E6F1FA" stroke-width="1.6" opacity=".8"/>` + win(13, 75, 2, 5, '#FFF8EE') + win(102, 67, 2, 6, '#FFF8EE'));
const onion = (cx, cy, r, c) => `<path d="M${cx - r} ${cy + r * .9} C${cx - r * 1.5} ${cy - r * .2} ${cx - r * .3} ${cy - r * .8} ${cx} ${cy - r * 1.7} C${cx + r * .3} ${cy - r * .8} ${cx + r * 1.5} ${cy - r * .2} ${cx + r} ${cy + r * .9}Z" fill="${c}"/>`;
const swirl = (cx, cy, r) => `<path d="M${cx - r * .7} ${cy + r * .7} Q${cx - r * .2} ${cy - r * .2} ${cx} ${cy - r * 1.3} M${cx + r * .1} ${cy + r * .8} Q${cx + r * .7} ${cy} ${cx + r * .3} ${cy - r}" stroke="#FFF8EE" stroke-width="2" fill="none" stroke-linecap="round"/>`;
L.basilio = cut(
  `<rect x="20" y="78" width="80" height="32" fill="#B5532F"/><rect x="24" y="58" width="14" height="22" fill="#FFF0D2"/><rect x="82" y="58" width="14" height="22" fill="#FFF0D2"/><rect x="40" y="48" width="12" height="32" fill="#C96A3C"/><rect x="68" y="48" width="12" height="32" fill="#C96A3C"/>`
  + `<path d="M52 80 L52 46 L60 16 L68 46 L68 80Z" fill="#C96A3C"/>` + onion(31, 47, 8, '#3E86C6') + onion(89, 47, 8, '#5DB84F') + onion(46, 38, 7, '#E8452C') + onion(74, 38, 7, '#F2B937') + onion(60, 12, 4.5, '#F2B937'),
  swirl(31, 47, 8) + swirl(89, 47, 8) + swirl(46, 38, 7) + swirl(74, 38, 7)
  + `<path d="M52 46 L68 46 L68 52 L52 52Z" fill="#FFF0D2"/><path d="M60 16 L68 46 L68 80 L60 80Z" fill="#A8502C" opacity=".5"/><path d="M54 110 L54 94 Q60 86 66 94 L66 110Z" fill="#5E2F1C"/><g fill="#FFF0D2"><rect x="27" y="88" width="6" height="10" rx="3"/><rect x="38" y="88" width="6" height="10" rx="3"/><rect x="76" y="88" width="6" height="10" rx="3"/><rect x="87" y="88" width="6" height="10" rx="3"/><rect x="57" y="58" width="6" height="10" rx="3"/></g><rect x="20" y="78" width="80" height="4" fill="#FFF0D2"/>`);
const spire = (x, top) => `<path d="M${x - 6} 110 L${x - 6} 66 Q${x} ${top - 22} ${x + 6} 66 L${x + 6} 110Z" fill="#CDA774"/>`;
L.sagrada = cut(
  spire(30, 40) + spire(46, 22) + spire(74, 22) + spire(90, 40) + `<path d="M22 110 L22 80 L60 62 L98 80 L98 110Z" fill="#D9B684"/>`,
  `<circle cx="30" cy="28" r="3" fill="#F2B937"/><circle cx="46" cy="10" r="3" fill="#F2B937"/><circle cx="74" cy="10" r="3" fill="#F2B937"/><circle cx="90" cy="28" r="3" fill="#F2B937"/>`
  + `<path d="M52 110 L52 92 Q60 80 68 92 L68 110Z" fill="#7A5A36"/><circle cx="60" cy="76" r="5" fill="#8EC7D8"/><g fill="#A8844F">${[30, 46, 74, 90].map(x => [50, 60, 70].map(y => `<rect x="${x - 1.5}" y="${y}" width="3" height="5" rx="1.5"/>`).join('')).join('')}</g><path d="M60 62 L98 80 L98 110 L72 110 L72 80Z" fill="#B8935C" opacity=".35"/>`);
const moai = `<rect x="39" y="46" width="7" height="30" rx="3" fill="#7D828A"/><rect x="74" y="46" width="7" height="30" rx="3" fill="#7D828A"/><path d="M44 110 L46 42 Q46 30 60 30 Q74 30 74 42 L76 110Z" fill="#8F949C"/><rect x="48" y="15" width="24" height="17" rx="5" fill="#A8553A"/>`;
const moaiD = `<path d="M46 47 L74 47 L74 54 L46 54Z" fill="#5E626A"/><path d="M57 54 L63 54 L66 76 L54 76Z" fill="#A9AEB5"/><path d="M52 86 L68 86" stroke="#5E626A" stroke-width="3.5" stroke-linecap="round"/><path d="M66 30 Q74 30 74 42 L76 110 L66 110Z" fill="#70757D" opacity=".5"/>`;
L.moai = `<svg viewBox="0 0 120 120"><g stroke="${CREAM}" stroke-width="7" stroke-linejoin="round"><path d="M0 110 Q60 88 120 110Z" fill="#7DB04A"/><g transform="translate(-22 44) scale(.6)">${moai}</g><g transform="translate(14 0)">${moai}</g></g><path d="M0 110 Q60 88 120 110Z" fill="#7DB04A"/><g transform="translate(-22 44) scale(.6)">${moai}${moaiD}</g><g transform="translate(14 0)">${moai}${moaiD}</g></svg>`;
const jaca = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M54 110 L57 70 L50 58 L56 56 L61 66 L68 54 L73 57 L65 72 L67 110Z" fill="#6B4A2E"/><path d="M18 58 Q14 40 32 36 Q36 18 56 22 Q72 10 84 26 Q104 26 102 46 Q112 60 96 68 Q84 78 66 70 Q50 80 36 70 Q20 72 18 58Z" fill="#9B7BD4"/></g>`;
L.obelisco = cut(
  `<rect x="4" y="62" width="16" height="48" fill="#C9BBA8"/><rect x="100" y="54" width="16" height="56" fill="#C9BBA8"/>` + jaca(8, 60, .45) + jaca(62, 62, .43)
  + `<path d="M52 110 L55.5 22 L60 8 L64.5 22 L68 110Z" fill="#F6F2EA"/><path d="M44 110 L46 102 L74 102 L76 110Z" fill="#F6F2EA"/>`,
  `<path d="M60 8 L64.5 22 L68 110 L60 110Z" fill="#D9D3C6"/><rect x="58" y="34" width="4" height="6" fill="#8E97A3"/><path d="M22 80 q6 -6 12 -2 M78 82 q6 -6 12 -2" stroke="#B79BE6" stroke-width="3" fill="none" stroke-linecap="round"/>` + win(7, 67, 2, 5, '#8E7F6A') + win(103, 59, 2, 6, '#8E7F6A'));

// ── Segunda tanda de destinos ──
const poly = pts => `M${pts.map(p => p.join(' ')).join(' L')}Z`;
const tube = (a, b, w, c) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2; return `<path d="${poly([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]])}" fill="${c}"/>`; };
const battle = (x0, x1, y, h = 5, w = 5) => { let d = `M${x0} ${y + h}`, x = x0, up = true; while (x < x1) { const nx = Math.min(x1, x + w); d += up ? ` L${x} ${y} L${nx} ${y} L${nx} ${y + h}` : ` L${nx} ${y + h}`; x = nx; up = !up; } return d; };
L.salto = cut(
  `<path d="M10 110 Q19 100 22 80 L24 36 Q26 28 34 28 L86 26 Q94 27 96 35 L98 80 Q102 100 110 110Z" fill="#B98A62"/><path d="M16 110 Q30 98 50 106 Q60 100 72 106 Q90 98 104 110Z" fill="#3F7F4E"/>`,
  `<path d="M24 36 Q26 28 34 28 L86 26 Q94 27 96 35 L95 41 Q60 35 25 43Z" fill="#5E9A4C"/><path d="M98 80 L96 35 Q94 27 86 26 L84 40 L88 80 Q92 98 104 110 L110 110 Q102 100 98 80Z" fill="#8A6040" opacity=".5"/><path d="M30 52 L28 92 M42 48 L41 98 M76 46 L78 98 M88 50 L91 96" stroke="#9A6E4A" stroke-width="2.5" stroke-linecap="round"/><path d="M56 30 L63 30 L66 100 L52 100Z" fill="#FFFFFF"/><path d="M59 34 L58 96" stroke="#CFE6F2" stroke-width="2"/><ellipse cx="59" cy="102" rx="18" ry="6" fill="#FFFFFF" opacity=".85"/><path d="M26 110 Q40 100 58 106 Q76 100 94 110Z" fill="#4E9A5C"/>`);
L.chichen = cut(
  [0, 1, 2, 3, 4].map(i => `<rect x="${12 + i * 8}" y="${96 - i * 14}" width="${96 - i * 16}" height="14" fill="#CDB98E"/>`).join('') + `<rect x="46" y="24" width="28" height="16" fill="#CDB98E"/>`,
  [0, 1, 2, 3, 4].map(i => `<rect x="${12 + i * 8}" y="${96 - i * 14}" width="${96 - i * 16}" height="3" fill="#E6D6B0"/>`).join('') + `<path d="M50 110 L55 40 L65 40 L70 110Z" fill="#E6D6B0"/><path d="M54 110 L57.5 40 M66 110 L62.5 40" stroke="#B49E72" stroke-width="1.5"/><rect x="55" y="29" width="10" height="11" fill="#6B5A3C"/><rect x="46" y="24" width="28" height="3" fill="#E6D6B0"/><path d="M76 40 L108 110 L84 110 L74 68 L74 40Z" fill="#A8946A" opacity=".4"/>`);
L.capitolio = cut(
  `<rect x="8" y="78" width="104" height="32" fill="#F1E9DA"/><rect x="40" y="68" width="40" height="42" fill="#F1E9DA"/><path d="M38 68 L60 58 L82 68Z" fill="#F1E9DA"/><rect x="47" y="44" width="26" height="16" fill="#F1E9DA"/><path d="M45 46 Q45 22 60 17 Q75 22 75 46Z" fill="#C9CED6"/><rect x="56.5" y="8" width="7" height="10" fill="#F1E9DA"/><circle cx="60" cy="6" r="3.5" fill="#F2B937"/>`,
  `<path d="M60 17 Q75 22 75 46 L64 46 Q66 28 60 17Z" fill="#A9B0BB"/><g fill="#C9BFA8">${[44, 50, 56, 62, 68, 74].map(x => `<rect x="${x}" y="70" width="2.6" height="40"/>`).join('')}${[50, 56, 62, 68].map(x => `<rect x="${x}" y="46" width="2" height="13"/>`).join('')}</g>` + win(13, 86, 5, 2, '#8E7F6A', 5.4, 10) + win(85, 86, 5, 2, '#8E7F6A', 5.4, 10) + `<rect x="8" y="78" width="104" height="3" fill="#D9CDB4"/><path d="M36 110 L40 102 L80 102 L84 110Z" fill="#D9CDB4"/>`);
L.mitad = cut(
  `<path d="M26 110 L30 100 L90 100 L94 110Z" fill="#CDBFA4"/><path d="M40 102 L48 42 L72 42 L80 102Z" fill="#B9A88C"/><rect x="50" y="33" width="20" height="10" fill="#CDBFA4"/><circle cx="60" cy="22" r="12" fill="#C9CED6"/>`,
  `<path d="M60 42 L72 42 L80 102 L60 102Z" fill="#9C8B70" opacity=".6"/><path d="M58.5 110 L59.4 42 L60.6 42 L61.5 110Z" fill="#F2B937"/><path d="M48 22 Q60 27 72 22 M49.5 16 Q60 20 70.5 16 M49.5 28 Q60 32 70.5 28 M60 10 V34" stroke="#8E97A3" stroke-width="1.6" fill="none"/><path d="M47 22 Q60 30 73 22" stroke="#E8452C" stroke-width="2.4" fill="none"/><rect x="50" y="52" width="6" height="8" fill="#8A7A60"/><rect x="64" y="52" width="6" height="8" fill="#8A7A60"/>`);
L.salvo = cut(
  `<rect x="22" y="70" width="76" height="40" fill="#BDAE98"/><circle cx="28" cy="68" r="7" fill="#BDAE98"/><circle cx="92" cy="68" r="7" fill="#BDAE98"/><rect x="42" y="30" width="36" height="80" fill="#C9BBA4"/><circle cx="44" cy="29" r="5.5" fill="#C9BBA4"/><circle cx="76" cy="29" r="5.5" fill="#C9BBA4"/><path d="M48 30 Q48 13 60 9 Q72 13 72 30Z" fill="#C9BBA4"/><rect x="58.5" y="0" width="3" height="11" fill="#8E97A3"/>`,
  `<path d="M60 9 Q72 13 72 30 L78 30 L78 110 L62 110 L62 30 Q66 16 60 9Z" fill="#9C8D76" opacity=".6"/>` + win(46, 36, 6, 9, '#5A5046', 5.2, 8) + win(26, 78, 3, 4, '#5A5046', 5, 8) + win(82, 78, 3, 4, '#5A5046', 5, 8) + `<rect x="42" y="66" width="36" height="3" fill="#B8AA94"/><path d="M26 110 L26 100 h8 v10Z M40 110 v-10 h8 v10Z M56 110 v-10 h8 v10Z M72 110 v-10 h8 v10Z M86 110 v-10 h8 v10Z" fill="#5A5046"/>`);
L.reloj = cut(
  `<rect x="6" y="70" width="108" height="40" fill="#F2C14E"/><rect x="45" y="32" width="30" height="40" fill="#F2C14E"/><path d="M45 32 L50 21 L70 21 L75 32Z" fill="#FFF4DC"/><path d="M50 21 L60 4 L70 21Z" fill="#C96A3C"/>`,
  `<circle cx="60" cy="47" r="8.5" fill="#FFF8EE" stroke="#8A5F38" stroke-width="2"/><path d="M60 47 V41 M60 47 L64.5 49" stroke="#3E3A44" stroke-width="2" stroke-linecap="round"/><rect x="45" y="60" width="30" height="3" fill="#FFF4DC"/><rect x="6" y="70" width="108" height="4" fill="#FFF4DC"/><path d="M50 110 L50 92 Q60 80 70 92 L70 110Z M20 110 L20 96 Q27 88 34 96 L34 110Z M86 110 L86 96 Q93 88 100 96 L100 110Z" fill="#6B4A2E"/><path d="M60 4 L70 21 L64 21Z" fill="#A8502C"/><rect x="67" y="32" width="8" height="38" fill="#D9A63A" opacity=".5"/>`);
const ATO = { t: [60, 14], b: [60, 104], c: [60, 59], ul: [26, 40], ur: [94, 40], ll: [26, 78], lr: [94, 78], um: [60, 36], lm: [60, 82] };
L.atomium = cut(
  [['t', 'ul'], ['t', 'ur'], ['t', 'um'], ['b', 'll'], ['b', 'lr'], ['b', 'lm'], ['ul', 'll'], ['ur', 'lr'], ['c', 't'], ['c', 'b'], ['c', 'ul'], ['c', 'ur'], ['c', 'll'], ['c', 'lr'], ['ul', 'lm'], ['ur', 'lm'], ['ll', 'um'], ['lr', 'um']].map(([a, b]) => tube(ATO[a], ATO[b], 4, '#9AA3B2')).join('')
  + tube([40, 110], ATO.ll, 3, '#8E97A3') + tube([80, 110], ATO.lr, 3, '#8E97A3') + Object.values(ATO).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10.5" fill="#CDD3DC"/>`).join(''),
  Object.values(ATO).map(([x, y]) => `<path d="M${x - 6.5} ${y - 3} Q${x - 3} ${y - 8.5} ${x + 3} ${y - 7}" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${x - 9} ${y + 3} Q${x} ${y + 8} ${x + 9} ${y + 3} A10.5 10.5 0 0 1 ${x - 9} ${y + 3}Z" fill="#A9B2BF"/>`).join(''));
L.brandeburgo = cut(
  `<path d="M49 30 L52 20 L57 23 L60 13 L63 23 L68 20 L71 30Z" fill="#5E8F7A"/><rect x="30" y="29" width="60" height="12" fill="#DCCBA4"/><rect x="12" y="40" width="96" height="14" fill="#DCCBA4"/>`
  + [0, 1, 2, 3, 4, 5].map(i => `<rect x="${15 + i * 16.4}" y="54" width="8" height="48" fill="#DCCBA4"/>`).join('') + `<path d="M8 110 L12 101 L108 101 L112 110Z" fill="#DCCBA4"/>`,
  `<rect x="12" y="50" width="96" height="4" fill="#BBA97E"/><rect x="30" y="38" width="60" height="3" fill="#BBA97E"/>` + [0, 1, 2, 3, 4, 5].map(i => `<rect x="${20 + i * 16.4}" y="54" width="3" height="48" fill="#BBA97E"/>`).join('') + `<path d="M8 110 L10 105.5 L110 105.5 L112 110Z" fill="#BBA97E"/><path d="M16 46 h88" stroke="#F1E6CF" stroke-width="2" stroke-dasharray="6 5"/>`);
L.belem = cut(
  `<path d="M0 110 L0 102 Q30 96 60 102 Q90 108 120 102 L120 110Z" fill="#5AA5D2"/><path d="${battle(12, 58, 66)} L58 104 L12 104Z" fill="#E8DFCA"/><path d="${battle(50, 88, 26)} L88 104 L50 104Z" fill="#E8DFCA"/><rect x="56" y="12" width="26" height="16" fill="#E8DFCA"/><circle cx="52" cy="26" r="5" fill="#E8DFCA"/><circle cx="86" cy="26" r="5" fill="#E8DFCA"/><circle cx="14" cy="66" r="5" fill="#E8DFCA"/>`,
  `<path d="${battle(56, 82, 9, 4, 4.3)} L82 14 L56 14Z" fill="#E8DFCA"/><rect x="50" y="52" width="38" height="4" fill="#CFC3A8"/><rect x="58" y="60" width="22" height="5" fill="#CFC3A8"/><g fill="#7A6E5C"><rect x="62" y="38" width="5" height="9" rx="2.5"/><rect x="72" y="38" width="5" height="9" rx="2.5"/><rect x="62" y="68" width="5" height="9" rx="2.5"/><rect x="72" y="68" width="5" height="9" rx="2.5"/><rect x="66" y="17" width="6" height="8" rx="3"/><rect x="20" y="82" width="5" height="8" rx="2.5"/><rect x="32" y="82" width="5" height="8" rx="2.5"/></g><path d="M78 26 L88 26 L88 104 L78 104Z" fill="#CFC3A8" opacity=".5"/>`);
L.alcala = cut(
  `<rect x="8" y="46" width="104" height="64" fill="#DCD6C8"/><rect x="38" y="30" width="44" height="18" fill="#DCD6C8"/><path d="M40 30 L60 18 L80 30Z" fill="#DCD6C8"/>`,
  `<path d="M52 110 L52 76 Q60 64 68 76 L68 110Z M32 110 L32 80 Q38.5 71 45 80 L45 110Z M75 110 L75 80 Q81.5 71 88 80 L88 110Z" fill="#5E6672"/><rect x="14" y="80" width="11" height="30" fill="#5E6672"/><rect x="95" y="80" width="11" height="30" fill="#5E6672"/><rect x="8" y="46" width="104" height="5" fill="#BDB6A4"/><rect x="8" y="62" width="104" height="3" fill="#BDB6A4"/><rect x="38" y="44" width="44" height="3" fill="#BDB6A4"/><rect x="48" y="34" width="24" height="8" fill="#BDB6A4"/><g fill="#C9C2B0"><rect x="27" y="66" width="3" height="44"/><rect x="47" y="66" width="3" height="44"/><rect x="70" y="66" width="3" height="44"/><rect x="90" y="66" width="3" height="44"/></g>`);
L.campanile = cut(
  `<path d="M0 110 L0 103 Q30 98 60 103 Q90 108 120 103 L120 110Z" fill="#5AA5D2"/><rect x="6" y="74" width="40" height="30" fill="#F0D2C4"/><rect x="76" y="80" width="38" height="24" fill="#F1E6CF"/><path d="M74 80 Q84 66 95 80 Q106 66 116 80Z" fill="#9AA7B5"/>`
  + `<rect x="48" y="40" width="24" height="64" fill="#C0603C"/><rect x="46" y="28" width="28" height="13" fill="#FFF4DC"/><rect x="48" y="19" width="24" height="10" fill="#C0603C"/><path d="M47 20 L60 0 L73 20Z" fill="#5E9A8A"/>`,
  `<circle cx="60" cy="2.5" r="2.5" fill="#F2B937"/><g fill="#7A6E5C"><rect x="50" y="31" width="4" height="9" rx="2"/><rect x="56" y="31" width="4" height="9" rx="2"/><rect x="62" y="31" width="4" height="9" rx="2"/><rect x="68" y="31" width="4" height="9" rx="2"/></g><path d="M54 46 V100 M60 46 V100 M66 46 V100" stroke="#A04C2E" stroke-width="2"/><path d="M60 0 L73 20 L66 20Z" fill="#4A8272"/>` + win(10, 80, 7, 1, '#A8806E', 5, 8) + `<path d="M10 104 L10 94 Q13 90 16 94 L16 104Z M20 104 v-10 q3 -4 6 0 v10Z M30 104 v-10 q3 -4 6 0 v10Z" fill="#A8806E"/><path d="M82 104 v-12 q3 -4 6 0 v12Z M92 104 v-12 q3 -4 6 0 v12Z M102 104 v-12 q3 -4 6 0 v12Z" fill="#B8AA94"/>`);
const minaret = (x, top) => `<rect x="${x - 3}" y="${top + 10}" width="6" height="${100 - top}" fill="#F1E6CF"/><path d="M${x - 4} ${top + 11} L${x} ${top - 6} L${x + 4} ${top + 11}Z" fill="#8E97A3"/>`;
L.sofia = cut(
  minaret(14, 30) + minaret(106, 30) + minaret(30, 44) + minaret(90, 44)
  + `<path d="M20 110 L20 80 Q34 72 40 72 L40 64 L80 64 L80 72 Q86 72 100 80 L100 110Z" fill="#D9937A"/><path d="M22 82 Q24 66 40 66 L40 82Z M98 82 Q96 66 80 66 L80 82Z" fill="#9AA7B5"/><path d="M40 66 Q42 38 60 33 Q78 38 80 66Z" fill="#9AA7B5"/><rect x="59" y="24" width="2" height="10" fill="#F2B937"/>`,
  `<path d="M60 33 Q78 38 80 66 L68 66 Q70 44 60 33Z" fill="#7E8C9C"/><g fill="#7A4A3C">${[44, 51, 58, 65, 72].map(x => `<rect x="${x}" y="58" width="4" height="7" rx="2"/>`).join('')}${[28, 40, 52, 64, 76, 88].map(x => `<rect x="${x}" y="90" width="5" height="10" rx="2.5"/>`).join('')}</g><rect x="20" y="84" width="80" height="3" fill="#C07A62"/><g fill="#F1E6CF">${[14, 106].map(x => `<rect x="${x - 4.5}" y="58" width="9" height="3"/>`).join('')}</g>`);
L.parlamento = cut(
  `<path d="M0 110 L0 103 Q30 98 60 103 Q90 108 120 103 L120 110Z" fill="#5AA5D2"/><rect x="6" y="72" width="108" height="32" fill="#E8DFCA"/>` + [12, 24, 96, 108].map(x => `<path d="M${x - 3.5} 74 L${x} 54 L${x + 3.5} 74Z" fill="#9E4A3A"/>`).join('')
  + [38, 82].map(x => `<rect x="${x - 4}" y="50" width="8" height="24" fill="#E8DFCA"/><path d="M${x - 4.5} 51 L${x} 30 L${x + 4.5} 51Z" fill="#9E4A3A"/>`).join('')
  + `<rect x="47" y="56" width="26" height="18" fill="#E8DFCA"/><path d="M46 58 Q46 36 60 26 Q74 36 74 58Z" fill="#9E4A3A"/><rect x="59" y="8" width="2" height="20" fill="#9E4A3A"/>`,
  `<path d="M60 26 Q74 36 74 58 L64 58 Q66 40 60 26Z" fill="#7E382C"/><rect x="6" y="72" width="108" height="5" fill="#9E4A3A"/>` + win(11, 82, 19, 2, '#8A7A60', 5.3, 9) + `<g fill="#8A7A60"><rect x="52" y="62" width="4" height="9" rx="2"/><rect x="58" y="62" width="4" height="9" rx="2"/><rect x="64" y="62" width="4" height="9" rx="2"/></g>`);
L.edimburgo = cut(
  `<path d="M2 110 L14 74 L38 58 L86 56 L106 74 L118 110Z" fill="#6E7A68"/><path d="${battle(30, 94, 42)} L94 60 L30 60Z" fill="#BDB39C"/><path d="${battle(34, 50, 26)} L50 60 L34 60Z" fill="#C9BFA8"/><path d="${battle(66, 90, 32, 5, 4.8)} L90 60 L66 60Z" fill="#C9BFA8"/><rect x="41" y="8" width="2" height="20" fill="#3E3A44"/><path d="M43 9 L56 12 L43 17Z" fill="#3E5BA9"/>`,
  `<g fill="#6B6258"><rect x="39" y="36" width="5" height="8" rx="2.5"/><rect x="72" y="40" width="4" height="7" rx="2"/><rect x="80" y="40" width="4" height="7" rx="2"/><path d="M55 60 L55 52 Q59 47 63 52 L63 60Z"/></g><path d="M14 74 L38 58 L46 76 L30 96Z M86 56 L106 74 L96 92 L78 74Z" fill="#84907C"/><path d="M40 60 L46 76 L40 108 M78 74 L84 108" stroke="#55604F" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
L.kutubia = cut(
  `<path d="${battle(45, 75, 22, 5, 5)} L75 110 L45 110Z" fill="#DDA06A"/><rect x="53" y="13" width="14" height="14" fill="#DDA06A"/><path d="M52 14 Q60 2 68 14Z" fill="#DDA06A"/><rect x="59.2" y="0" width="1.6" height="8" fill="#F2B937"/>`,
  `<circle cx="60" cy="1.5" r="2" fill="#F2B937"/><circle cx="60" cy="5.5" r="2.6" fill="#F2B937"/><rect x="45" y="32" width="30" height="5" fill="#3F8F7F"/><g fill="#A8683C"><path d="M51 62 L51 50 Q55 44 59 50 L59 62Z M61 62 L61 50 Q65 44 69 50 L69 62Z M55 86 L55 74 Q60 67 65 74 L65 86Z"/><rect x="57" y="17" width="6" height="8" rx="3"/></g><path d="M49 42 h22 M49 68 h22 M49 92 h22" stroke="#C58850" stroke-width="2"/><path d="M68 27 L75 27 L75 110 L68 110Z" fill="#C58850" opacity=".5"/><path d="M55 110 L55 100 Q60 94 65 100 L65 110Z" fill="#7A4A2C"/>`);
L.petra = cut(
  `<path d="M6 110 L6 22 Q30 6 60 14 Q92 4 114 22 L114 110Z" fill="#D98C6A"/>`,
  `<path d="M14 30 Q22 60 14 96 M104 28 Q96 60 106 98 M26 18 Q30 40 24 58" stroke="#C0714F" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26 62 L60 48 L94 62Z" fill="#F0B592"/><rect x="28" y="62" width="64" height="5" fill="#F0B592"/><rect x="28" y="67" width="64" height="37" fill="#B8684A"/><g fill="#F0B592">${[30, 41, 52, 63, 74, 85].map(x => `<rect x="${x}" y="67" width="5" height="37"/>`).join('')}<rect x="32" y="28" width="16" height="20" /><rect x="72" y="28" width="16" height="20"/><path d="M30 28 L48 28 L48 22Z M90 28 L72 28 L72 22Z"/><rect x="53" y="28" width="14" height="20"/><path d="M50 28 L60 14 L70 28Z"/></g><path d="M55 104 L55 82 L65 82 L65 104Z" fill="#5E2F22"/><rect x="24" y="104" width="72" height="6" fill="#F0B592"/><g fill="#B8684A"><rect x="38" y="33" width="4" height="12"/><rect x="78" y="33" width="4" height="12"/><rect x="58" y="33" width="4" height="12"/></g>`);
const prang = (x, top, w) => `<path d="M${x - w} 104 L${x - w * .7} ${top + (104 - top) * .55} L${x - w * .45} ${top + (104 - top) * .25} Q${x} ${top - 8} ${x + w * .45} ${top + (104 - top) * .25} L${x + w * .7} ${top + (104 - top) * .55} L${x + w} 104Z" fill="#F1EADC"/>`;
L.watarun = cut(
  prang(22, 62, 9) + prang(98, 62, 9) + prang(39, 48, 10) + prang(81, 48, 10) + prang(60, 14, 15) + `<path d="M6 110 L10 102 L110 102 L114 110Z" fill="#E3D8C4"/>`,
  `<path d="M49 80 h22 M51.5 64 h17 M54 48 h12 M56.5 34 h7 M31 84 h16 M73 84 h16 M15 88 h14 M91 88 h14" stroke="#C9BCA0" stroke-width="2.5"/><g>${[[54, 90], [60, 90], [66, 90], [57, 72], [63, 72], [60, 56], [39, 92], [81, 92], [22, 95], [98, 95]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${['#3F8F7F', '#E8452C', '#F2B937', '#3E86C6'][i % 4]}"/>`).join('')}</g><rect x="59.2" y="2" width="1.6" height="10" fill="#F2B937"/><path d="M60 8 Q72 20 66.7 36 L70.5 63 L75 104 L64 104 Q64 40 60 8Z" fill="#D9CDB4" opacity=".5"/>`);
const torre = x => `<path d="M${x - 8} 110 L${x - 8} 52 L${x - 6} 52 L${x - 6} 38 L${x - 3.5} 38 L${x - 3.5} 26 L${x - 1.5} 26 L${x} 6 L${x + 1.5} 26 L${x + 3.5} 26 L${x + 3.5} 38 L${x + 6} 38 L${x + 6} 52 L${x + 8} 52 L${x + 8} 110Z" fill="#9DAFC4"/>`;
L.petronas = cut(
  `<rect x="8" y="80" width="14" height="30" fill="#8E9FB6"/><rect x="98" y="74" width="14" height="36" fill="#8E9FB6"/>` + torre(42) + torre(78) + `<rect x="50" y="60" width="20" height="4" fill="#9DAFC4"/><path d="M52 64 L60 78 L68 64 L65 64 L60 73 L55 64Z" fill="#9DAFC4"/>`,
  [42, 78].map(x => `<path d="M${x} 6 L${x + 1.5} 26 L${x + 3.5} 26 L${x + 3.5} 38 L${x + 6} 38 L${x + 6} 52 L${x + 8} 52 L${x + 8} 110 L${x} 110Z" fill="#6F84A0" opacity=".6"/><path d="M${x - 8} 62 h16 M${x - 8} 72 h16 M${x - 8} 82 h16 M${x - 8} 92 h16 M${x - 8} 102 h16 M${x - 6} 45 h12 M${x - 3.5} 32 h7" stroke="#D4DFEA" stroke-width="1.6" opacity=".95"/>`).join('') + win(10, 85, 2, 3) + win(100, 79, 2, 4));
L.perla = cut(
  `<rect x="8" y="72" width="14" height="38" fill="#A9A0C0"/><rect x="24" y="86" width="10" height="24" fill="#BDB4D0"/><rect x="88" y="80" width="10" height="30" fill="#BDB4D0"/><rect x="100" y="64" width="13" height="46" fill="#A9A0C0"/>`
  + tube([42, 110], [56, 80], 5, '#DDE1E8') + tube([78, 110], [64, 80], 5, '#DDE1E8') + `<rect x="52.5" y="38" width="4" height="72" fill="#DDE1E8"/><rect x="58" y="24" width="4" height="86" fill="#DDE1E8"/><rect x="63.5" y="38" width="4" height="72" fill="#DDE1E8"/><rect x="59" y="0" width="2" height="16" fill="#C9CED6"/>`
  + `<circle cx="60" cy="76" r="14.5" fill="#C4567E"/><circle cx="60" cy="38" r="10" fill="#C4567E"/><circle cx="60" cy="18" r="4.5" fill="#C4567E"/>`,
  `<path d="M50 70 Q54 63 62 63" stroke="#F0A8C4" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M53.5 34 Q56 30 61 30" stroke="#F0A8C4" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M46.5 80 Q60 88 73.5 80 A14.5 14.5 0 0 1 46.5 80Z" fill="#A04468"/><path d="M51 41 Q60 46 69 41 A10 10 0 0 1 51 41Z" fill="#A04468"/><rect x="48" y="96" width="24" height="4" fill="#C9CED6"/>` + win(10, 77, 2, 4) + win(102, 69, 2, 5));
L.palacio = cut(
  `<path d="M8 110 L13 96 L107 96 L112 110Z" fill="#DCD6C8"/><rect x="22" y="70" width="76" height="26" fill="#B5432F"/><path d="M6 60 Q10 66 22 64 Q60 54 98 64 Q110 66 114 60 L104 74 L16 74Z" fill="#4E5B66"/><rect x="32" y="48" width="56" height="12" fill="#B5432F"/><path d="M18 38 Q22 44 32 42 Q60 30 88 42 Q98 44 102 38 L92 52 L28 52Z" fill="#4E5B66"/>`,
  `<rect x="22" y="70" width="76" height="5" fill="#3F8F7F"/><rect x="32" y="48" width="56" height="4" fill="#3F8F7F"/><g fill="#7E2E20">${[30, 43, 56.5, 70, 83, 93].map(x => `<rect x="${x - 2}" y="75" width="4" height="21"/>`).join('')}</g><g fill="#3F7F6A"><rect x="34" y="80" width="7" height="16"/><rect x="47" y="80" width="7" height="16"/><rect x="60" y="80" width="7" height="16"/><rect x="73" y="80" width="7" height="16"/><rect x="86" y="80" width="5" height="16"/></g><path d="M16 74 L104 74 L102 77 L18 77Z M28 52 L92 52 L90 54.5 L30 54.500Z" fill="#35414B"/><path d="M48 110 L51 96 L69 96 L72 110Z" fill="#C2BBAA"/><path d="M8 110 L10 104 L110 104 L112 110Z" fill="#C2BBAA" opacity=".6"/>`);
const candi = `M20 110 L20 97 L25 97 L25 82 L31 82 L31 64 L37 64 L37 46 L43 46 L43 28 L49 28 L51.5 10 L54 28 L54 110Z`;
L.bali = cut(
  `<path d="M0 110 Q60 98 120 110Z" fill="#64A050"/><path d="${candi}" fill="#8E857C"/><g transform="translate(120 0) scale(-1 1)"><path d="${candi}" fill="#8E857C"/></g><path d="M50 110 L54 100 L66 100 L70 110Z" fill="#B8AEA2"/>`,
  `<g fill="#C96A3C"><rect x="25" y="82" width="29" height="4"/><rect x="31" y="64" width="23" height="4"/><rect x="37" y="46" width="17" height="4"/><rect x="43" y="28" width="11" height="4"/><rect x="66" y="82" width="29" height="4"/><rect x="66" y="64" width="23" height="4"/><rect x="66" y="46" width="17" height="4"/><rect x="66" y="28" width="11" height="4"/></g><path d="M20 97 h34 M66 97 h34" stroke="#6E665E" stroke-width="2.5"/><path d="M50 110 L52 105 L68 105 L70 110Z" fill="#9A9084"/><path d="M12 96 L12 70" stroke="#6B4A2E" stroke-width="2.5"/><path d="M4 72 Q12 60 20 72Z M6 80 Q12 72 18 80Z" fill="#F2B937"/><path d="M108 96 L108 70" stroke="#6B4A2E" stroke-width="2.5"/><path d="M100 72 Q108 60 116 72Z M102 80 Q108 72 114 80Z" fill="#F2B937"/>`);

L.monument = cut(
  `<path d="M0 110 Q60 98 120 110Z" fill="#E0A070"/><path d="M6 108 L10 88 L20 80 L22 46 L40 46 L42 80 L52 88 L56 108Z" fill="#C0603C"/><rect x="44" y="60" width="7" height="22" fill="#C0603C"/><path d="M64 108 L68 90 L78 82 L80 54 L88 54 L88 34 L102 34 L104 82 L112 90 L116 108Z" fill="#C0603C"/>`,
  `<path d="M32 46 L40 46 L42 80 L52 88 L56 108 L40 108 L36 84 L34 80Z M96 34 L102 34 L104 82 L112 90 L116 108 L100 108 L98 84Z" fill="#9E4A2E" opacity=".6"/><path d="M22 58 h18 M22 70 h19 M12 94 h40 M80 66 h23 M88 46 h14 M70 96 h42" stroke="#D98C6A" stroke-width="2.5" stroke-linecap="round"/><path d="M0 110 Q60 102 120 110Z" fill="#E8B488"/>`);

// ── Monumentos rehechos (tanda 3): mismo oficio que Kioto, Moscú o París: formas planas, sombra de papel a media opacidad y pocos recortes ──
const bar = (x1, y1, x2, y2, w) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; return `M${(x1 + nx).toFixed(1)} ${(y1 + ny).toFixed(1)} L${(x2 + nx).toFixed(1)} ${(y2 + ny).toFixed(1)} L${(x2 - nx).toFixed(1)} ${(y2 - ny).toFixed(1)} L${(x1 - nx).toFixed(1)} ${(y1 - ny).toFixed(1)}Z`; };
// Wat Arun: prang central de cuatro cuerpos con terrazas, corona con aguja, y cuatro prangs menores
const prang2 = (x, base, h, hw) => {
  const st = [[0, .3, 1, .82], [.3, .56, .72, .56], [.56, .76, .5, .36]]; let s = '', d = '', dots = '';
  st.forEach(([a, b, w0, w1]) => { const yb = base - h * a, yt = base - h * b; s += `<path d="M${x - hw * w0 - 1.6} ${yb} L${x - hw * w0 - 1.6} ${yb - 2.6} L${x - hw * w0 + .6} ${yb - 2.6} L${x - hw * w1} ${yt} L${x + hw * w1} ${yt} L${x + hw * w0 - .6} ${yb - 2.6} L${x + hw * w0 + 1.6} ${yb - 2.6} L${x + hw * w0 + 1.6} ${yb}Z" fill="#F1EADC"/>`;
    d += `<path d="M${x} ${yb - 2.6} L${x + hw * w0 + 1.6} ${yb - 2.6} L${x + hw * w0 + 1.6} ${yb} L${x} ${yb}Z M${x} ${yt} L${x + hw * w1} ${yt} L${x + hw * w0 - .6} ${yb - 2.6} L${x} ${yb - 2.6}Z" fill="#D9CDB4" opacity=".55"/>`;
    const n = Math.max(1, Math.round(w1 * 3)); for (let i = 0; i < n; i++) { const nx = x + (i - (n - 1) / 2) * hw * w1 * 1.2 / n * 1.6; d += `<path d="M${nx - 1.6} ${yb - 5} L${nx - 1.6} ${yb - 9} Q${nx} ${yb - 11.4} ${nx + 1.6} ${yb - 9} L${nx + 1.6} ${yb - 5}Z" fill="#BFB094"/>`; }
    dots += [-.55, 0, .55].map((q, i) => `<circle cx="${x + q * hw * w1}" cy="${yt + 3}" r="${Math.max(.9, hw * .07)}" fill="${['#3F8F7F', '#E8452C', '#F2B937'][i]}"/>`).join(''); });
  const yc = base - h * .76, top = base - h;
  s += `<path d="M${x - hw * .36} ${yc} Q${x - hw * .34} ${yc - h * .13} ${x - hw * .14} ${top + h * .06} L${x} ${top} L${x + hw * .14} ${top + h * .06} Q${x + hw * .34} ${yc - h * .13} ${x + hw * .36} ${yc}Z" fill="#F1EADC"/>`;
  d += `<path d="M${x} ${top} L${x + hw * .14} ${top + h * .06} Q${x + hw * .34} ${yc - h * .13} ${x + hw * .36} ${yc} L${x} ${yc}Z" fill="#D9CDB4" opacity=".55"/><rect x="${x - .8}" y="${top - h * .14}" width="1.6" height="${h * .15}" fill="#E4B23A"/><path d="M${x - 3.4} ${top - h * .08} Q${x} ${top - h * .02} ${x + 3.4} ${top - h * .08}" stroke="#E4B23A" stroke-width="1.4" fill="none"/>`;
  return [s, d + dots];
};
{ const parts = [[22, 104, 44, 9], [98, 104, 44, 9], [40, 104, 58, 10], [80, 104, 58, 10]].map(a => prang2(...a)), c = prang2(60, 104, 92, 17);
  L.watarun = cut(parts.map(p => p[0]).join('') + c[0] + `<path d="M4 110 L8 102 L112 102 L116 110Z" fill="#E3D8C4"/>`, parts.map(p => p[1]).join('') + c[1] + `<path d="M50 110 L52 104 L68 104 L70 110Z" fill="#D9CDB4"/><path d="M6 106 L114 106" stroke="#C9BCA0" stroke-width="2"/>`); }
// Les Éclaireurs (Ushuaia): faro rojo y blanco sobre su islote; sin montañas propias (van las del fondo)
L.faro = cut(
  `<path d="M0 110 Q40 100 60 104 Q90 100 120 110Z" fill="#8FB6D0"/><path d="M14 110 L24 100 L40 94 L50 90 L74 92 L92 96 L106 110Z" fill="#7D7A78"/><path d="M52 92 L55 54 L57 34 L63 34 L65 54 L68 92Z" fill="#F6F2EA"/><path d="M46 34 L74 34 L74 38 L46 38Z" fill="#3C3A44"/><rect x="54" y="22" width="12" height="12" rx="2" fill="#F6F2EA"/><path d="M52 22 L60 8 L68 22Z" fill="#D9402E"/><circle cx="60" cy="7" r="2.4" fill="#3C3A44"/>`,
  `<path d="M54.4 80 L67.6 80 L68 92 L52 92Z M55.2 62 L64.8 62 L65.4 70 L54.6 70Z" fill="#D9402E"/><path d="M60 34 L65 34 L66 50 L64.8 62 L67.6 80 L68 92 L60 92Z" fill="#CFC8BC" opacity=".5"/><rect x="56.4" y="25" width="7" height="6" fill="#F2D27A"/><path d="M48 38 h24" stroke="#5A5666" stroke-width="1.4"/><path d="M57 92 L57 86 Q60 82 63 86 L63 92Z" fill="#6B5A4A"/><path d="M52 92 L74 92 L92 96 L106 110 L66 110Z" fill="#5E5C5A" opacity=".45"/><path d="M24 100 L40 94 L50 90 L44 100Z" fill="#9A9794" opacity=".6"/><path d="M6 106 q8 -3 16 0 M84 107 q8 -3 16 0" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>`);
// Gran Muralla: lienzo serpenteando por dos capas de colinas, con torres de vigía
{ const pts = [[6, 108], [16, 90], [28, 70], [38, 60], [50, 72], [62, 80], [74, 64], [86, 50], [96, 42], [106, 54], [114, 106]];
  const hill = dy => `M6 110 ` + pts.map(([x, y], i) => `L${x} ${i === 0 || i === pts.length - 1 ? 110 : y + dy}`).join(' ') + ` L114 110Z`, back = 'M16 110 Q26 78 50 78 Q70 62 88 46 Q104 52 110 110Z';
  const wall = pts.slice(1).map((p, i) => bar(pts[i][0], pts[i][1] - 2, p[0], p[1] - 2, 5.6)).join('');
  const top = pts.slice(1).map((p, i) => bar(pts[i][0], pts[i][1] - 4.6, p[0], p[1] - 4.6, 2.2)).join('');
  const tw = (x, y, k = 1) => `M${x - 6 * k} ${y} L${x - 6 * k} ${y - 14 * k} L${x - 7.4 * k} ${y - 14 * k} L${x - 7.4 * k} ${y - 18 * k} L${x - 4 * k} ${y - 18 * k} L${x - 4 * k} ${y - 16 * k} L${x - 1.6 * k} ${y - 16 * k} L${x - 1.6 * k} ${y - 18 * k} L${x + 1.6 * k} ${y - 18 * k} L${x + 1.6 * k} ${y - 16 * k} L${x + 4 * k} ${y - 16 * k} L${x + 4 * k} ${y - 18 * k} L${x + 7.4 * k} ${y - 18 * k} L${x + 7.4 * k} ${y - 14 * k} L${x + 6 * k} ${y - 14 * k} L${x + 6 * k} ${y}Z`;
  const tws = [[28, 70, 1], [50, 72, .9], [74, 64, 1], [96, 42, 1.1]];
  L.muralla = cut(`<path d="${back}" fill="#A9C58C"/><path d="${hill(6)}" fill="#6FA255"/><path d="${wall}${top}" fill="#CDB48C"/>` + tws.map(([x, y, k]) => `<path d="${tw(x, y - 1, k)}" fill="#DCC49C"/>`).join(''),
    `<path d="${hill(6)}" fill="none"/>` + tws.map(([x, y, k]) => `<path d="M${x} ${y - 18 * k} L${x + 4 * k} ${y - 16 * k} L${x + 4 * k} ${y - 18 * k} L${x + 7.4 * k} ${y - 18 * k} L${x + 7.4 * k} ${y - 14 * k} L${x + 6 * k} ${y - 14 * k} L${x + 6 * k} ${y - 1} L${x} ${y - 1}Z" fill="#B99E74" opacity=".5"/><path d="M${x - 2 * k} ${y - 1} L${x - 2 * k} ${y - 6 * k} Q${x} ${y - 8.4 * k} ${x + 2 * k} ${y - 6 * k} L${x + 2 * k} ${y - 1}Z" fill="#7A6442"/><rect x="${x - 1.4 * k}" y="${y - 12 * k}" width="${2.8 * k}" height="${3.4 * k}" rx="1" fill="#7A6442"/>`).join('')
    + pts.slice(1).map((p, i) => i % 2 ? '' : `<path d="M${pts[i][0]} ${pts[i][1] - 2} L${p[0]} ${p[1] - 2}" stroke="#A88E66" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>`).join('')
    + ``); }

const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
// ── Monumentos de la tanda de ciudades nuevas (mismo formato cut()) ──
const NM = (() => {
const M = {};
const win = (x, y, cols, rows, c = '#FFE9A8', dx = 5, dy = 7, w = 2.6, h = 3.6) => { let s = ''; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += `<rect x="${x + i * dx}" y="${y + j * dy}" width="${w}" height="${h}" fill="${c}"/>`; return s; };
const shade = (c, t) => mix(c, '#3A2A3E', t);
const lant = (x, y, c, r = 3.2) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.25}" fill="${c}"/><rect x="${x - r * .55}" y="${y - r * 1.5}" width="${r * 1.1}" height="${r * .5}" fill="#8A5F38"/>`;
// 4 Siem Reap: Angkor Wat, cinco torres de capullo de loto y estanque
const bud = (x, b, h, w, c) => `<path d="M${x - w} ${b} L${x - w} ${b - h * .45} Q${x - w * .9} ${b - h * .82} ${x} ${b - h} Q${x + w * .9} ${b - h * .82} ${x + w} ${b - h * .45} L${x + w} ${b}Z" fill="${c}"/>`;
M.angkor = cut(
  bud(44, 80, 48, 8, '#A8946E') + bud(76, 80, 48, 8, '#A8946E') + bud(60, 78, 66, 10, '#BCA67E') + bud(30, 84, 36, 7, '#B09C76') + bud(90, 84, 36, 7, '#B09C76')
  + `<path d="M18 88 L18 78 L102 78 L102 88Z" fill="#B8A27E"/><path d="M10 100 L10 88 L110 88 L110 100Z" fill="#C9B48E"/><path d="M2 110 L2 100 L118 100 L118 110Z" fill="#B8A27E"/>`
  + `<path d="M4 100 L5 70 L6 100Z M114 100 L115 66 L116 100Z" fill="#6B4A2E"/><circle cx="5" cy="66" r="6" fill="#4F8A4A"/><circle cx="115" cy="62" r="6" fill="#4F8A4A"/>`,
  `<path d="M60 12 Q69 26 70 48 L70 78 L60 78Z M44 32 Q51 44 52 56 L52 80 L44 80Z M76 32 Q83 44 84 56 L84 80 L76 80Z" fill="#8A7656" opacity=".4"/>`
  + `<path d="M50 40 h20 M50 52 h20 M50 64 h20 M36 50 h16 M36 62 h16 M68 50 h16 M68 62 h16 M23 66 h14 M83 66 h14" stroke="#8A7656" stroke-width="1.6"/>`
  + win(22, 81, 14, 1, '#6B5A44', 6, 0, 2.6, 5) + win(14, 91, 16, 1, '#6B5A44', 6, 0, 2.6, 6) + `<path d="M55 100 L55 92 Q60 87 65 92 L65 100Z" fill="#6B5A44"/><path d="M8 106 Q60 101 112 106 L112 110 L8 110Z" fill="#7FB7CF"/>`);
// 5 Chiang Mai: chedi dorado (Doi Suthep) y su templo de techos rojos. SIN suelo propio: las bases bajan hasta el borde y las lomas del destino (FORE) las tapan
M.chiang = cut(
  `<rect x="2" y="84" width="34" height="36" fill="#F1EADC"/><path d="M-2 88 L18 62 L40 88Z" fill="#C0392B"/><path d="M4 74 L18 54 L32 74Z" fill="#A8301E"/>`
  + `<rect x="36" y="96" width="50" height="24" fill="#E4B23A"/><rect x="41" y="88" width="40" height="8" fill="#E4B23A"/><path d="M44 88 Q42 66 61 58 Q80 66 78 88Z" fill="#F2C14E"/><rect x="53" y="52" width="16" height="6" fill="#E4B23A"/><path d="M55 52 L61 8 L67 52Z" fill="#F2C14E"/>`
  + `<rect x="94" y="98" width="20" height="22" fill="#E4B23A"/><path d="M96 98 Q96 86 104 82 Q112 86 112 98Z" fill="#F2C14E"/><path d="M102 82 L104 62 L106 82Z" fill="#F2C14E"/>`,
  `<path d="M61 58 Q80 66 78 88 L62 88Z M61 8 L67 52 L61 52Z M104 82 Q112 86 112 98 L104 98Z" fill="#C99A2E" opacity=".55"/><path d="M45 80 Q61 74 77 80 M47 72 Q61 66 75 72 M56 40 h10 M57 28 h8" stroke="#FFE27A" stroke-width="1.6" fill="none"/>`
  + `<path d="M36 100 h50 M41 92 h40" stroke="#C99A2E" stroke-width="1.6"/><path d="M18 62 L18 56 M18 54 L19 49" stroke="#F2B937" stroke-width="1.6"/><path d="M-2 88 L40 88" stroke="#F2B937" stroke-width="1.8"/>`
  + `<rect x="13" y="94" width="10" height="26" rx="5" fill="#8A5F38"/>` + win(5, 92, 2, 1, '#C99A2E', 24, 0, 3, 8));
// 8 Singapur: tres superárboles frente al Marina Bay Sands
const stree = (x, top, w, h) => `<path d="M${x - w} ${top} L${x + w} ${top} L${x + w * .22} ${top + 14} L${x - w * .22} ${top + 14}Z" fill="#9A7AC4"/><path d="M${x - w * .22} ${top + 12} L${x - 2.4} ${top + h * .7} L${x - 5} 110 L${x + 5} 110 L${x + 2.4} ${top + h * .7} L${x + w * .22} ${top + 12}Z" fill="#7A5C9A"/>`;
M.singapur = cut(
  `<path d="M26 110 L28 46 L40 46 L42 110Z M52 110 L54 46 L66 46 L68 110Z M78 110 L80 46 L92 46 L94 110Z" fill="#C9C2D4"/><path d="M20 42 L100 40 L104 44 L22 46Z" fill="#B4ACC4"/>`
  + stree(24, 52, 16, 58) + stree(64, 30, 20, 80) + stree(100, 60, 14, 50),
  `<path d="M34 46 L40 46 L42 110 L36 110Z M60 46 L66 46 L68 110 L62 110Z M86 46 L92 46 L94 110 L88 110Z" fill="#A69EB4" opacity=".55"/>` + win(29, 52, 2, 8, '#E6E0F0', 4, 7, 2, 3) + win(55, 52, 2, 8, '#E6E0F0', 4, 7, 2, 3) + win(81, 52, 2, 8, '#E6E0F0', 4, 7, 2, 3)
  + [[24, 52, 16], [64, 30, 20], [100, 60, 14]].map(([x, t, w]) => `<path d="M${x - w * .8} ${t + 3} L${x + w * .8} ${t + 3}" stroke="#6FAE4A" stroke-width="2.4"/><path d="M${x - 2} ${t + 20} L${x - 3} ${t + 44} M${x + 2} ${t + 26} L${x + 3} ${t + 50}" stroke="#6FAE4A" stroke-width="2" stroke-dasharray="3 3"/>` + win(x - w * .7, t + 6, 5, 1, '#FFD46B', w * .32, 0, 2, 2)).join(''));
// 10 San Petersburgo: Palacio de Invierno sobre el canal (Neva) y aguja dorada del Almirantazgo
M.peter = cut(
  `<rect x="98" y="4" width="2.4" height="40" fill="#E4B23A"/><path d="M94 52 L96 42 L102 42 L104 52Z" fill="#E4B23A"/>`
  + `<rect x="4" y="58" width="112" height="44" fill="#7FBFAA"/><rect x="2" y="54" width="116" height="6" fill="#F1EADC"/><rect x="42" y="46" width="36" height="56" fill="#7FBFAA"/><path d="M40 48 L60 36 L80 48Z" fill="#F1EADC"/>`
  + `<path d="M0 110 L0 102 L120 102 L120 110Z" fill="#7FA8C8"/>`,
  win(8, 66, 6, 2, '#F6F2EA', 5.6, 16, 2, 11) + win(81, 66, 6, 2, '#F6F2EA', 5.6, 16, 2, 11) + win(45, 54, 7, 3, '#F6F2EA', 4.6, 16, 1.8, 13)
  + win(11, 68, 5, 2, '#4E7F78', 5.6, 16, 3, 7) + win(84, 68, 5, 2, '#4E7F78', 5.6, 16, 3, 7) + `<path d="M54 102 L54 92 Q60 86 66 92 L66 102Z" fill="#4E7F78"/>`
  + `<path d="M4 80 h112 M42 52 h36" stroke="#F1EADC" stroke-width="2"/>` + win(6, 50, 19, 1, '#E4B23A', 6, 0, 1.6, 4) + `<circle cx="60" cy="44" r="2.4" fill="#E4B23A"/>`
  + `<path d="M8 106 h20 M50 105 h22 M90 107 h18" stroke="#D2E6F2" stroke-width="1.6" stroke-linecap="round"/><path d="M104 58 L116 58 L116 102 L104 102Z" fill="#5E9A88" opacity=".35"/>`);
// 12 Uluru: la roca roja con sus surcos, matas de spinifex al pie
M.uluru = cut(
  `<path d="M2 106 Q4 82 14 74 Q30 64 60 64 Q92 64 106 72 Q116 82 118 106Z" fill="#C8553A"/><path d="M0 110 L0 104 L120 104 L120 110Z" fill="#D98A5C"/>`
  + `<path d="M10 104 Q14 96 20 104Z M30 104 Q34 98 40 104Z M86 104 Q92 96 98 104Z" fill="#B8B45A"/>`,
  `<path d="M14 74 Q30 64 60 64 Q92 64 106 72 Q84 68 60 69 Q34 69 14 74Z" fill="#E07A52"/><path d="M106 72 Q116 82 118 106 L100 106 Q102 84 94 70Z" fill="#9A3A28" opacity=".5"/>`
  + `<path d="M24 72 Q22 88 24 104 M40 67 Q38 86 42 104 M58 66 Q56 86 60 104 M76 66 Q78 86 74 104 M92 68 Q94 86 90 104" stroke="#A8442E" stroke-width="2" fill="none" opacity=".6"/>`);
// 16 Chefchaouen: casas azules escalonadas en la ladera del Rif, escalera y macetas. SIN suelo propio: ladera y casas bajan hasta el borde y las lomas del destino (FORE) tapan su pie
const azules = [[4, 78, 22, 42, '#7FAEE6'], [24, 66, 22, 54, '#5B8FD0'], [44, 56, 24, 64, '#A9CCF2'], [66, 66, 20, 54, '#4A78C0'], [84, 76, 32, 44, '#7FAEE6'], [30, 92, 26, 28, '#A9CCF2'], [60, 90, 30, 30, '#5B8FD0']];
M.chaouen = cut(
  `<path d="M0 80 L22 40 L40 56 L62 26 L88 50 L104 38 L120 60 L120 120 L0 120Z" fill="#A8A08A"/><rect x="50" y="34" width="10" height="24" fill="#F1EADC"/><path d="M49 34 L61 34 L55 28Z" fill="#E6D9BC"/>`
  + azules.map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join(''),
  `<path d="M62 26 L88 50 L104 38 L120 60 L120 70 L96 56 L88 60 L66 34Z" fill="#8A8270" opacity=".5"/>`
  + azules.map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="2.4" fill="#F6F2EA"/><path d="M${x + w * .3} ${y + h} L${x + w * .3} ${y + Math.min(h, 16) * .4 + h - Math.min(h, 16)} Q${x + w / 2} ${y + h - Math.min(h, 16) + 1} ${x + w * .7} ${y + Math.min(h, 16) * .4 + h - Math.min(h, 16)} L${x + w * .7} ${y + h}Z" fill="${shade(c, .35)}"/><rect x="${x + w * .2}" y="${y + 6}" width="3.4" height="4" fill="#2F5A9A"/>`).join('')
  + `<path d="M52 120 L52 110 L56 102 L60 102 L62 96 L66 96 L68 90" stroke="#F6F2EA" stroke-width="3" fill="none"/>` + [[22, 64], [42, 54], [82, 74], [64, 88]].map(([x, y]) => `<rect x="${x - 2}" y="${y - 3}" width="4" height="3.4" fill="#D9733A"/><circle cx="${x}" cy="${y - 4.6}" r="2.4" fill="#E8452C"/>`).join(''));
// 18 Ciudad de México: Palacio de Bellas Artes (cúpula naranja). SIN suelo propio: el zócalo baja hasta el borde y las capas del destino (FORE) tapan su pie
M.cdmx = cut(
  `<path d="M38 62 Q38 30 60 24 Q82 30 82 62Z" fill="#E8A040"/><rect x="57" y="12" width="6" height="12" fill="#E8A040"/><path d="M14 64 Q14 52 24 50 Q34 52 34 64Z M86 64 Q86 52 96 50 Q106 52 106 64Z" fill="#E8A040"/>`
  + `<rect x="10" y="62" width="100" height="58" fill="#F2ECE0"/><rect x="6" y="94" width="108" height="26" fill="#E2D8C6"/>`,
  `<path d="M60 24 Q82 30 82 62 L62 62Z M96 50 Q106 52 106 64 L97 64Z" fill="#C97A28" opacity=".55"/><path d="M44 48 Q60 40 76 48 M48 36 Q60 30 72 36" stroke="#F6D27A" stroke-width="1.6" fill="none"/>`
  + win(16, 68, 4, 2, '#C9BCA4', 6, 10, 2.4, 6) + win(82, 68, 4, 2, '#C9BCA4', 6, 10, 2.4, 6) + `<path d="M46 96 L46 74 Q53 66 60 74 Q67 66 74 74 L74 96Z" fill="#B8A684"/><path d="M10 62 L110 62 L110 65 L10 65Z" fill="#D9CDB4"/><path d="M6 94 L114 94" stroke="#C9BCA4" stroke-width="1.6"/>`);
// 20 Ámsterdam: casas angostas de gablete sobre el canal
M.amsterdam = cut(
  `<path d="M6 100 L6 40 L10 40 L10 33 L14 33 L14 26 L22 26 L22 33 L26 33 L26 40 L30 40 L30 100Z" fill="#8A5A44"/><path d="M30 100 L30 42 Q30 34 36 32 Q36 22 42 19 Q48 22 48 32 Q54 34 54 42 L54 100Z" fill="#C9503E"/>`
  + `<path d="M54 100 L54 36 Q58 36 60 32 L60 22 L72 22 L72 32 Q74 36 78 36 L78 100Z" fill="#EFE4CC"/><path d="M78 100 L78 46 L84 46 L84 39 L90 39 L90 32 L98 32 L98 39 L104 39 L104 46 L110 46 L110 100Z" fill="#3E6B5A"/>`
  + `<path d="M0 110 L0 100 L120 100 L120 110Z" fill="#6F9BB8"/>`,
  win(11, 44, 3, 6, '#F6F2EA', 5, 9, 3, 5) + win(35, 42, 3, 6, '#F6F2EA', 5.4, 9, 3, 5) + win(59, 40, 3, 6, '#7A6A58', 5.4, 9, 3, 5) + win(83, 52, 4, 5, '#F6F2EA', 6, 9, 3, 5)
  + `<rect x="16" y="88" width="6" height="12" fill="#4A3F45"/><rect x="38" y="88" width="7" height="12" fill="#4A3F45"/><rect x="63" y="88" width="7" height="12" fill="#4A3F45"/><rect x="90" y="88" width="7" height="12" fill="#4A3F45"/>`
  + `<path d="M42 22 L42 28 M66 24 L66 30" stroke="#6B4A2E" stroke-width="1.6"/><rect x="26" y="40" width="4" height="60" fill="#6B3E2E" opacity=".35"/><rect x="50" y="42" width="4" height="58" fill="#9A3A2A" opacity=".35"/><rect x="74" y="36" width="4" height="64" fill="#C9BCA0" opacity=".5"/><rect x="106" y="46" width="4" height="54" fill="#2A4A3E" opacity=".4"/>`
  + `<path d="M4 104 h18 M40 106 h22 M78 104 h20" stroke="#D2E6F2" stroke-width="1.6" stroke-linecap="round"/><path d="M0 100 L120 100" stroke="#4A3F45" stroke-width="1.4"/>`);
return M;
})();

// Adornos de costado: viven en adornos.js, organizados por BIOMA (ver BIOMAS). Cada destino sólo elige bioma (+ extras opcionales).
// [nombre del mundo, ciudad, país, monumento, cielo/bruma, colina clara, colina oscura, suelo alrededor, piso de la pista, piso ya construido, horizonte, clima, hora, adornos]
const PAV = '#8D919B', VEREDA = '#6F737D';
const TABLA = [
  ['BAMBÚ', 'Kioto', 'Japón', LANDMARKS.pagoda, '#E3F0C8', '#D2E4AA', '#A0C672', '#9FBF6A', '#A9C873', '#5F9447', 'dune', 'bamboo', 11.5, 'oriente'],
  ['CIUDAD', 'Tokio', 'Japón', L.tokyo, '#FBE3E6', '#F2C4CE', '#DDA6B8', '#BDB9C4', PAV, VEREDA, 'city', 'petals', 10.5, 'moderna !cerezo'],
  ['PALACIO', 'Seúl', 'Corea del Sur', L.palacio, '#FBE6E4', '#F2C8CE', '#DEA8B6', '#C9C2B4', '#C9C2AE', '#A59D86', 'peak', 'petals', 10.5, 'oriente'],
  fila(FICHAS['Pekín']), // ficha + kit (fichas-ciudades.js)
  ['CIUDAD', 'Shanghái', 'China', L.perla, '#EFE4F2', '#DCC8E4', '#C4A8D4', '#B8B4BE', PAV, VEREDA, 'city', 'lanterns', 15.5, 'moderna neon'],
  ['TEMPLOS', 'Bangkok', 'Tailandia', L.watarun, '#FBEAD8', '#F4D4B4', '#E8BA90', '#D9C8A8', '#C9BCA4', '#A89A80', 'dune', 'petals', 15.5, 'oriente'],
  ['CIUDAD', 'Kuala Lumpur', 'Malasia', L.petronas, '#E0EEF4', '#BCD6E2', '#98BCD0', '#B0B8BC', PAV, VEREDA, 'city', 'leaves', 13, 'moderna !palmeraTropical'],
  ['ISLA', 'Bali', 'Indonesia', L.bali, '#E0F2E0', '#BCE0BC', '#94C894', '#7FB86A', '#98C87C', '#64A050', 'peak', 'petals', 11, 'tropical loto'],
  ['MÁRMOL', 'Agra', 'India', L.taj, '#FBE8DC', '#F4CFC0', '#E8B4A8', '#E6D7C4', '#F0E6DA', '#D6C6B4', 'dune', 'petals', 10, 'desierto chhatri'],
  ['CIUDAD', 'Dubái', 'Emiratos Árabes', L.burj, '#FBEBD0', '#F2D6A8', '#E4BE88', '#D8C8A8', '#A39C92', '#827B72', 'city', 'sand', 13.5, 'moderna !palmera'],
  fila(FICHAS['Madagascar']), // 10 · ficha + kit (fichas-ciudades.js): Avenida de los Baobabs
  fila(FICHAS['Kilimanjaro']), // 11 · ficha + kit: el Kibo desde la sabana
  ['CAÑÓN', 'Petra', 'Jordania', L.petra, '#FBE0D0', '#F2C0A4', '#E09C80', '#E0A888', '#E8B89A', '#C8906E', 'peak', 'sand', 13, 'desierto'],
  ['DESIERTO', 'El Cairo', 'Egipto', L.piramides, '#F6E2B4', '#EDD09A', '#DDB877', '#E3C98C', '#EBD49C', '#D9BC7C', 'dune', 'sand', 13, 'desierto'],
  fila(FICHAS['Estambul']), // 14 · ficha + kit (fichas-ciudades.js): Santa Sofía y el Bósforo
  ['RUINAS', 'Atenas', 'Grecia', L.partenon, '#E2F0FA', '#C0DCF0', '#A0C6E4', '#DDD2B8', '#E9E0CA', '#C8BC9C', 'dune', 'leaves', 12.5, 'mediterraneo !olivo'],
  ['CÚPULAS', 'Moscú', 'Rusia', L.basilio, '#EAF1F8', '#D2DEEC', '#B4C4DA', '#DCE4EC', '#E6EBF0', '#C3CDD8', 'city', 'snow', 13, 'nieve'],
  ['RÍO', 'Budapest', 'Hungría', L.parlamento, '#F4E8DC', '#E6D0BC', '#D0B49C', '#C9C0B0', '#A8A098', '#88807A', 'city', 'leaves', 15, 'europa'],
  ['CIUDAD', 'Berlín', 'Alemania', L.brandeburgo, '#EEEAE0', '#DAD2C0', '#C0B6A0', '#C2BDB0', '#9A968E', '#7A766E', 'city', 'leaves', 14, 'europa quiosco'],
  ['LAGUNA', 'Venecia', 'Italia', L.campanile, '#FBE8DC', '#F0D0C0', '#E0B4A4', '#D9CDB8', '#C9BCA8', '#A89A86', 'dune', 'bubbles', 10.5, 'mediterraneo velero'],
  ['RUINAS', 'Roma', 'Italia', L.coliseo, '#FAE6C8', '#EFCFA2', '#DDB684', '#D6C2A0', '#C9B694', '#A8956F', 'dune', 'leaves', 15.5, 'mediterraneo !pinoParasol'],
  ['PRADERA', 'Pisa', 'Italia', LANDMARKS.pisa, '#E6F4DA', '#C4E0A2', '#97C670', '#A6CC78', '#B9D88E', '#8DBF5E', 'dune', 'petals', 10, 'mediterraneo !cipres'],
  ['CIUDAD', 'Barcelona', 'España', L.sagrada, '#FBE9D2', '#F4D2A6', '#E6B880', '#DCC8A6', '#C6B8A0', '#A39479', 'city', 'petals', 14, 'mediterraneo toldo'],
  ['ZOCO', 'Marrakech', 'Marruecos', L.kutubia, '#FBE4C8', '#F4C89A', '#E6A870', '#E3B98A', '#E0A878', '#C08A5C', 'dune', 'sand', 15.5, 'desierto'],
  ['COSTA', 'Lisboa', 'Portugal', L.belem, '#DDF1FA', '#B4DCEF', '#8CC7E4', '#E8DDB8', '#EFE6C6', '#DCCDA0', 'dune', 'bubbles', 15, 'mediterraneo velero'],
  ['CIUDAD', 'Madrid', 'España', L.alcala, '#FBE9D2', '#F4D2A6', '#E6B880', '#C9C2B4', '#9A9690', '#787470', 'city', 'leaves', 15.5, 'europa toldo'],
  ['CIUDAD', 'París', 'Francia', L.eiffel, '#E9EEF6', '#CBD6E6', '#AEBED6', '#C2C0BC', '#9A9CA3', '#797B83', 'city', 'leaves', 15, 'europa toldo'],
  ['CIUDAD', 'Bruselas', 'Bélgica', L.atomium, '#E6ECF2', '#C8D2DE', '#A8B8CA', '#B4B8BE', PAV, VEREDA, 'city', 'leaves', 13, 'europa morris'],
  ['CIUDAD', 'Londres', 'Reino Unido', L.bigben, '#E4E8EC', '#C2CAD2', '#A3AEBA', '#B2B5BA', '#84888F', '#666A72', 'city', 'leaves', 14, 'europa cabina'],
  ['CASTILLO', 'Edimburgo', 'Escocia', L.edimburgo, '#E4ECE6', '#C6D6CC', '#A4BEB0', '#8FB07A', '#A4C08E', '#6F9460', 'peak', 'leaves', 13, 'montana'],
  ['HIELO', 'Reikiavik', 'Islandia', LANDMARKS.iglesia, '#EAF2F6', '#D6E4EC', '#B4CAD8', '#DCE6EC', '#E6EDF2', '#C3CDD8', 'peak', 'snow', 11, 'nieve rocaLava'],
  ['CIUDAD', 'Nueva York', 'EE.UU.', L.liberty, '#DCEBF5', '#B9CDE0', '#9DB5CE', '#B4BAC4', PAV, VEREDA, 'city', 'leaves', 12, 'moderna taxi'],
  ['CAÑONES', 'Monument Valley', 'EE.UU.', L.monument, '#FBE6D0', '#F4C8A4', '#E8A47C', '#E0A070', '#E8B488', '#C4845C', 'dune', 'sand', 15.5, 'desierto !cactus'],
  ['MAYA', 'Chichén Itzá', 'México', L.chichen, '#F4ECC8', '#DCE0A0', '#B4C878', '#A9C070', '#C9C08A', '#A59D6A', 'dune', 'leaves', 13, 'selva'],
  ['CIUDAD', 'La Habana', 'Cuba', L.capitolio, '#DDF3F5', '#B4E0E4', '#8CCBD4', '#E6D6B0', '#B8AC9C', '#958A7A', 'city', 'bubbles', 15, 'tropical auto'],
  ['MURALLA', 'Cartagena', 'Colombia', L.reloj, '#FBEBC8', '#F4D69A', '#E8BE74', '#E6CFA0', '#D9C7A4', '#B8A47E', 'dune', 'bubbles', 14, 'tropical'],
  ['SELVA', 'Salto Ángel', 'Venezuela', L.salto, '#DDF0E2', '#B4DCC0', '#86C098', '#6FA85A', '#8DBF6A', '#5F9447', 'peak', 'leaves', 11, 'selva'],
  ['ECUADOR', 'Mitad del Mundo', 'Ecuador', L.mitad, '#E0F0F4', '#BCDDE4', '#94C4D0', '#9FBF7A', '#C9C2AE', '#A59D86', 'peak', 'leaves', 12, 'montana'],
  ['ANDES', 'Machu Picchu', 'Perú', L.machu, '#DCEFE0', '#B8DCC0', '#8FC49C', '#7FAE6A', '#93BF78', '#5F9447', 'peak', 'leaves', 11, 'montana llama'],
  ['COSTA', 'Río de Janeiro', 'Brasil', LANDMARKS.cristo, '#DDF3F5', '#A9DCE2', '#8FCED6', '#F2E3B5', '#F4E6BC', '#E2CE97', 'dune', 'bubbles', 12, 'tropical sombrilla'],
  ['CIUDAD', 'Montevideo', 'Uruguay', L.salvo, '#E4EEF8', '#C4D6EA', '#A4BEDC', '#B8BCC4', PAV, VEREDA, 'city', 'leaves', 15, 'europa quiosco'],
  ['CIUDAD', 'Buenos Aires', 'Argentina', L.obelisco, '#E6E0F4', '#CDC2E8', '#B4A6D8', '#B8B4BE', PAV, VEREDA, 'city', 'petals', 15, 'europa !jacaranda quiosco'],
  ['NIEVE', 'Ushuaia', 'Argentina', L.faro, '#F0F6FB', '#E4EEF6', '#BFD5E5', '#E1EBF2', '#EDF3F6', '#F3F0EA', 'peak', 'snow', 11, 'nieve'],
  ['ISLA', 'Isla de Pascua', 'Chile', L.moai, '#DDF0F6', '#B8DDEA', '#8CC6DA', '#8DBB62', '#A2CB78', '#6FA24F', 'dune', 'bubbles', 12, 'tropical moaiChico'],
  ['COSTA', 'Sídney', 'Australia', L.opera, '#DDF1FA', '#B4DCEF', '#8CC7E4', '#E8DDB8', '#EFE6C6', '#DCCDA0', 'dune', 'bubbles', 11, 'tropical velero'],
  fila(FICHAS['Osaka']), // ficha + kit (fichas-ciudades.js): Castillo de Osaka
  // ── ciudades nuevas (se agregan al final: los índices guardados no cambian). El último campo puede ser una lista de 3 adornos (grande, chico, farol) en vez de un bioma ──
  fila(FICHAS['Hanói']), // ficha + kit (fichas-ciudades.js): lago Hoàn Kiếm
  fila(FICHAS['Ha Long']), // ficha + kit (fichas-ciudades.js)
  fila(FICHAS['Hoi An']), // ficha + kit (fichas-ciudades.js)
  ['TEMPLOS', 'Siem Reap', 'Camboya', NM.angkor, '#FBE4CC', '#F2CDA8', '#DDAE84', '#9FBF6A', '#C9BCA4', '#A89A80', 'dune', 'leaves', 6.9, ['palmeraTropical', 'loto', 'farolSelva']],
  ['TEMPLOS', 'Chiang Mai', 'Tailandia', NM.chiang, '#EEF2D8', '#CFE0B0', '#A6C48A', '#9FBF6A', '#D9C8A8', '#A89A80', 'peak', 'petals', 16, ['pino', 'loto', 'farolPapel']],
  fila(FICHAS['Krabi']), // ficha + kit (fichas-ciudades.js)
  fila(FICHAS['Phi Phi']), // ficha + kit (fichas-ciudades.js)
  ['JARDÍN', 'Singapur', 'Singapur', NM.singapur, '#EFE4F2', '#DCC8E4', '#C4A8D4', '#8FB87A', '#A4A0AE', '#827E8C', 'city', 'leaves', 18.6, ['palmeraTropical', 'monstera', 'farolModerno']],
  fila(FICHAS['Capadocia']), // ficha + kit (fichas-ciudades.js)
  ['CANALES', 'San Petersburgo', 'Rusia', NM.peter, '#E8F0F6', '#CCDCEA', '#AFC4DA', '#C9C2B4', '#A8A098', '#88807A', 'city', 'leaves', 13, ['castano', 'arbusto', 'farolEuropeo']],
  fila(FICHAS['Melbourne']), // ficha + kit (fichas-ciudades.js)
  ['DESIERTO', 'Uluru', 'Australia', NM.uluru, '#FBDCC8', '#F2B898', '#E0927A', '#D98A5C', '#E0A070', '#B8744C', 'dune', 'sand', 18.3, ['acacia', 'mata', 'farolDesierto']],
  fila(FICHAS['Nairobi']), // 58 · ficha + kit: jirafas con la ciudad detrás
  fila(FICHAS['Zanzíbar']), // 59 · ficha + kit: Casa de las Maravillas y dhow
  fila(FICHAS['Ciudad del Cabo']), // 60 · ficha + kit: Table Mountain
  ['PUEBLO AZUL', 'Chefchaouen', 'Marruecos', NM.chaouen, '#E6F0FA', '#C6DAF0', '#A6C2E4', '#D6C8B0', '#C6D4E6', '#8FA8C8', 'peak', 'petals', 14, ['olivo', 'macetaAzul', 'farolDesierto']],
  fila(FICHAS['San Francisco']), // ficha + kit (fichas-ciudades.js)
  ['CIUDAD', 'Ciudad de México', 'México', NM.cdmx, '#F6E4EC', '#E8C8D8', '#D4A8C2', '#C9C2B4', '#C2B49C', '#A0927A', 'city', 'petals', 15, ['jacaranda', 'cactus', 'farolEuropeo']],
  ['CANALES', 'Ámsterdam', 'Países Bajos', NM.amsterdam, '#E6ECF2', '#C8D2DE', '#A8B8CA', '#B4B8BE', '#A8A098', '#88807A', 'city', 'leaves', 14, ['castano', 'bici', 'farolEuropeo']],
  fila(FICHAS['Busan']), // 65 · ficha + kit (fichas-ciudades.js): aldea de Gamcheon
  fila(FICHAS['Gyeongju']), // 66 · ficha + kit (fichas-ciudades.js): templo Bulguksa
  fila(FICHAS['Sossusvlei']), // 67 · ficha + kit: Deadvlei (ruta overland Cabo → Namibia → Cataratas)
  fila(FICHAS['Swakopmund']), // 68 · ficha + kit: faro y costa atlántica de Namibia
  fila(FICHAS['Cataratas Victoria']), // 69 · ficha + kit: Mosi-oa-Tunya
];
// El último campo es el bioma y, opcionalmente, extras: 'europa cabina' (reemplaza el adorno chico), 'oriente farolPiedra' (reemplaza el farol), '!cerezo' (reemplaza el árbol grande)
// Escala opcional del monumento en el fondo (1 = 8.5 unidades de lado), anclada a la base
const LM_ESCALA = { 'Dubái': 1.4, 'Sídney': 1.35 };
// Desplazamiento horizontal opcional del monumento (unidades de mundo; negativo = hacia la izquierda/centro): evita que se corte contra el borde derecho de la pantalla
const LM_X = { 'Salto Ángel': -1.0 };
// Capas DELANTERAS del paisaje por destino (opcional): se dibujan entre el monumento y la cámara para "meterlo" en la escena
// (como Kioto o Buenos Aires, donde el suelo y las colinas tapan la base). Usar cuando el recorte del monumento NO trae suelo propio.
// Coordenadas relativas al monumento: x = fracción de su ancho (0 = borde izquierdo, 1 = derecho; puede salirse), dz = cuánto más
// cerca de la cámara que el monumento (unidades de mundo; ~.2–1), y = altura sobre el suelo. Colores: c = 0–3 (paleta de montañas
// del destino, de la más clara a la más oscura), 'fog' (cielo/bruma), '#hex', o [a, b, t] = mezcla de dos de esos (t de 0 a 1).
//   { t: 'hill', x, w, h, c, dz, kind }  loma recortada con la misma textura del horizonte (kind: 'dune'|'peak'|'city'; por defecto la del destino)
//   { t: 'band', z0, z1, c, x, w }       franja plana sobre el suelo, de dz z0 a z1 (agua de bahía, arena, río); se ve en perspectiva. w = ancho en anchos del monumento (sin w: de borde a borde), x = centro
//   { t: 'cut', svg, x, s, y, dz, o, ro } recorte de papel libre de lado s (bruma, olas, barcos); o = opacidad; ro = orden de dibujo (35 por defecto: debajo de las colinas, que van en 40; 45 = encima)
// Ej.: para otro destino con lago, agregar 'Nombre': [{ t: 'band', z0: -2, z1: 3, c: [2, '#6F9BB8', .4] }, { t: 'hill', x: .1, w: 4, h: 2, c: 2, dz: .5 }]
const NIEBLA = `<svg viewBox="0 0 120 120"><path d="M0 120 L0 108 Q6 102 14 105 Q20 97 30 102 Q36 94 46 100 Q54 96 60 101 Q68 95 76 101 Q84 96 92 102 Q100 98 106 104 Q114 101 120 106 L120 120Z" fill="#F4F6F8"/><path d="M8 110 Q28 106 48 109 M64 106 Q84 103 104 108" stroke="#DCE2EA" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
const JIRON = `<svg viewBox="0 0 120 120"><path d="M6 108 Q14 100 26 103 Q34 95 48 100 Q58 94 70 100 Q82 97 92 102 Q104 101 114 106 Q104 111 86 109 Q60 112 34 110 Q14 112 6 108Z" fill="#F4F6F8"/></svg>`; // jirón de niebla suelto
const FORE = {
  // San Francisco ya no está acá: su FORE lo arma solo el kit (kit-ciudades.js) y es la plantilla de las lomas de todas las fichas
  // Mismo esquema para los recortes sin suelo propio: loma baja al centro (pie del monumento) + lomas laterales (extremos) + capa más cercana y oscura
  'Chiang Mai': [
    { t: 'hill', x: .55, w: 7, h: 1.3, c: [2, 3, .7], dz: .45, kind: 'dune' }, // pie del chedi
    { t: 'hill', x: .02, w: 6, h: 2.2, c: [2, 3, .5], dz: .5, kind: 'dune' }, { t: 'hill', x: 1.02, w: 5, h: 1.9, c: [2, 3, .5], dz: .5, kind: 'dune' }, // templo y chedi chico
    { t: 'hill', x: -.15, w: 7, h: 1.6, c: 3, dz: .8, kind: 'dune' }, { t: 'hill', x: 1.15, w: 6, h: 1.4, c: 3, dz: .8, kind: 'dune' },
  ],
  'Chefchaouen': [
    { t: 'hill', x: .5, w: 7, h: 1.1, c: [2, 3, .7], dz: .45, kind: 'dune' }, // pie de las casas azules
    { t: 'hill', x: -.02, w: 6, h: 2.4, c: [2, 3, .5], dz: .5, kind: 'dune' }, { t: 'hill', x: 1.02, w: 6, h: 2.4, c: [2, 3, .5], dz: .5, kind: 'dune' }, // laderas
    { t: 'hill', x: -.15, w: 7, h: 1.6, c: 3, dz: .8, kind: 'dune' }, { t: 'hill', x: 1.15, w: 6, h: 1.5, c: 3, dz: .8, kind: 'dune' },
  ],
  'Ciudad de México': [
    { t: 'hill', x: .5, w: 7, h: 1.3, c: [2, 3, .7], dz: .45, kind: 'dune' }, // zócalo del palacio
    { t: 'hill', x: -.02, w: 6, h: 2.2, c: [2, 3, .5], dz: .5, kind: 'dune' }, { t: 'hill', x: 1.02, w: 6, h: 2.0, c: [2, 3, .5], dz: .5, kind: 'dune' },
    { t: 'hill', x: -.15, w: 7, h: 1.6, c: 3, dz: .8, kind: 'dune' }, { t: 'hill', x: 1.15, w: 6, h: 1.5, c: 3, dz: .8, kind: 'dune' },
  ],
};
const BIOMA_DE = { arbolUrbano: 'moderna', castano: 'europa', palmeraTropical: 'tropical', sombrilla: 'tropical', bambu: 'oriente', pino: 'oriente', cipres: 'mediterraneo', acacia: 'sabana', palmera: 'desierto', olivo: 'mediterraneo', jacaranda: 'europa', liana: 'selva' };
const armar = (row, idx) => { const [name, place, country, art, fog, c1, c2, around, ground, hillColor, ridge, wx, hour, biomaStr] = row; const arr = Array.isArray(biomaStr), [biome, ...extras] = arr ? [BIOMA_DE[biomaStr[0]] || 'europa'] : biomaStr.split(' '), names = arr ? [...biomaStr] : adornosDe(biome, idx, extras.filter(x => x[0] !== '!')); extras.filter(x => x[0] === '!').forEach(x => { names[0] = x.slice(1); }); return ({
  name, place: tt('dest.' + idx + '.place'), country: tt('dest.' + idx + '.country'), art, ground, hill: 'plaza', hillColor, wx, hour, id: 'look', biome, lmScale: row.lmScale ?? LM_ESCALA[place] ?? 1, lmX: row.lmX ?? LM_X[place] ?? 0, fore: row.fore ?? FORE[place] ?? null, // filas de ficha (kit-ciudades.js) traen su escala, posición y FORE calculados // place/country: texto traducido; el nombre en español de la tabla sólo sirve de clave para LM_ESCALA/LM_X
  look: { fog, ground: around, far: [mix(fog, c1, .55), c1, mix(c1, c2, .5), c2], ridge, props: names.map(k => ADORNOS[k]), lamps: names.map(k => /^farol/.test(k)), lights: names.map(k => LUZ[k] || null) },
}); };
export const DESTINOS = TABLA.map(armar);
// Índice de cada destino por su nombre en español (clave estable, no cambia con el idioma). Lo usan las rutas especiales.
export const IDX = Object.fromEntries(TABLA.map((r, i) => [r[1], i]));
