// Historias de los viajeros: el diario de cada uno (ficha + postales), los capítulos que se ganan viajando con ese personaje
// y la escena de diálogo que los cuenta al llegar. Cada historia es independiente: los personajes no se cruzan.
//
// Cómo avanza: después de cada viaje completado con el personaje (onArrive), se mira SOLO el próximo capítulo.
// Se abre si el viaje terminó en su ciudad y se cumplen sus requisitos (viajes con el personaje, sellos de una región, una ruta).
// Si se cumplen los requisitos lejos de esa ciudad, hay que volver a viajar ahí: la historia empuja a moverse por el mapa.
// Guardado: 'hist.<hero>' = { got: [ids], seen: [ids] } · 'histPend' = { hero, ch } (escena a mostrar al volver al inicio).
// TODO(i18n): los textos de las historias están en español; se traducen cuando el guion esté aprobado.
import { DESTINOS, IDX } from './destinos.js';

const CREAM = '#FFF4DC';
let UID = 0;
// ids propios para cada copia del personaje: con dos copias en la página, <use href="#id"> apuntaría a la otra (oculta)
const uniq = svg => { const u = 'hs' + (++UID) + '_'; return String(svg || '').replace(/\bid="([^"]+)"/g, (m, i) => `id="${u}${i}"`).replace(/\bid='([^']+)'/g, (m, i) => `id='${u}${i}'`).replace(/url\(#([^)]+)\)/g, (m, i) => `url(#${u}${i})`).replace(/href=(["'])#([^"']+)\1/g, (m, q, i) => `href=${q}#${u}${i}${q}`); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Fichas de los ocho viajeros (cada uno con su propio motivo) ──
export const FICHAS = {
  nilo: { home: 'Berlín, Alemania', why: 'Encontró el cuaderno de vuelo de su abuelo, el piloto que desapareció en 1974 sobre Sudamérica.', quote: 'El cielo es el único país sin fronteras.', likes: 'El ruido de los motores viejos, el café sin azúcar, las ciudades de noche.', fears: 'Que el cuaderno termine en nada.', dream: 'Salto Ángel', dreamHint: 'Donde el agua cae desde las nubes.', color: '#3E5BA9', dark: '#24305E' },
  mora: { home: 'Buenos Aires, Argentina', why: 'Su hermano Tomi se fue hace tres años y desde entonces le llegan postales sin remitente.', quote: 'Si no sabés adónde vas, cualquier colectivo te sirve.', color: '#4E9A4A', dark: '#2F6B30' },
  sipho: { home: 'Ciudad del Cabo, Sudáfrica', why: 'Va a ser el último farero de su faro y quiere conocer las voces de radio con las que hablaba su padre.', quote: 'Una luz no sirve si nadie la mira.', color: '#C98A1E', dark: '#7A4E12' },
  minji: { home: 'Seúl, Corea del Sur', why: 'Se congeló en la final de baile y se prometió una gira sola hasta animarse a volver al escenario.', quote: 'Si nadie mira, igual bailo.', color: '#7B5CC4', dark: '#523B8E' },
  tuk: { home: 'Reikiavik, Islandia', why: 'Encontró una carta de 1979 que nunca se entregó y juró llevarla a destino.', quote: 'Una carta que no llega es una pregunta sin respuesta.', color: '#2F8C8A', dark: '#1F5E5C' },
  layla: { home: 'Amán, Jordania', why: 'Completa la guía de fotos del desierto que su madre dejó sin terminar.', quote: 'La luz buena siempre llega si sabés esperar.', color: '#B8673A', dark: '#7A4024' },
  cal: { home: 'Boulder, EE. UU.', why: 'Cumple la lista de cumbres que su compañero de montaña no llegó a subir.', quote: 'Un paso. Después otro.', color: '#3F6E9E', dark: '#24486E' },
  anaya: { home: 'Jaipur, India', why: 'Le lleva a su abuela, que está perdiendo la vista, el color de cada ciudad del mundo.', quote: 'Todo lugar tiene un color que nadie nombró.', color: '#D9507E', dark: '#9E2F57' },
};

// ── La historia de Nilo: «El cuaderno de Opa» (7 postales + 1 secreta) ──
// req: at = ciudad donde termina el viaje · trips = viajes con Nilo · stamps = {r, n} sellos distintos de una región · route = ruta especial completada con Nilo
const N = 'Nilo';
export const STORIES = {
  nilo: {
    title: 'El cuaderno de Opa',
    chapters: [
      { id: 1, at: 'Berlín', title: 'El ático', hint: 'Todo empieza en casa: volvé a Berlín, la ciudad de Nilo.', req: {},
        lines: [[N, 'Volví a Berlín y subí al ático de la abuela. Solo quería las antiparras de Opa.', 'hat'],
          [N, 'Pero en la caja había algo más: su cuaderno de vuelo. Siete lugares marcados con tinta roja.'],
          [N, 'La última página está arrancada. Y en cada página hay una sola letra, apretada contra el borde: M.', 'look'],
          [N, 'Opa desapareció en 1974, volando sobre Sudamérica. Nunca encontraron el avión.'],
          [N, 'La abuela dice que no lo lea. Por eso lo voy a leer entero. Primera parada: París.', 'wave']],
        objs: { 1: 'cuaderno', 2: 'cuaderno' },
        back: 'Hoy encontré el cuaderno de Opa. La abuela me pidió que lo deje en la caja. No pude. Primera página: un café de París y una letra, M. Allá voy.', reward: { coins: 150 } },
      { id: 2, at: 'París', title: 'Dos cafés', hint: 'Un café donde siempre sobraba una taza.', req: {},
        lines: [[N, 'La página de París tiene la dirección de un café. Sigue abierto, con las mismas sillas de mimbre.'],
          ['Étienne, el mozo', '¿Esas antiparras? Las conozco. Tu abuelo venía cada martes y pedía dos cafés.'],
          ['Étienne, el mozo', 'Uno se enfriaba siempre. Cuarenta años sirviendo mesas y nunca supe para quién era el segundo.'],
          [N, 'Para M. Tiene que ser para M.', 'up'],
          ['Étienne, el mozo', 'Un día dejó una propina enorme y un papel: «Me voy a Estambul. Si viene, dígale que la espero allá».']],
        back: 'El mozo tiene ochenta años y reconoció las antiparras antes que a mí. Opa pedía dos cafés y uno se enfriaba siempre. ¿Quién eras, M.?', reward: { coins: 200 } },
      { id: 3, at: 'Estambul', title: 'La foto de M.', hint: 'Una foto de 1960 que nadie vino a buscar.', req: { trips: 6 },
        lines: [[N, 'Entre las páginas del cuaderno había un recibo: un estudio de fotos en Gálata, 1960.'],
          ['Selin, la fotógrafa', 'Mi abuelo guardaba todos los negativos que nadie retiraba. Mirá este: un piloto y una chica, riéndose.'],
          [N, 'Ella tiene un pañuelo con una M bordada. Y Opa… nunca lo vi sonreír así en ninguna foto de casa.'],
          ['Selin, la fotógrafa', 'Atrás hay algo escrito a lápiz. «Marrakech. El zoco. Esperame.»'],
          [N, 'Opa la seguía por el mundo. O ella lo seguía a él.', 'look']],
        objs: { 1: 'foto', 2: 'foto', 3: 'foto' },
        back: 'Opa tenía 24 años en la foto. Tiene mi misma sonrisa torcida. Nadie en casa me lo dijo nunca. Ella se reía con los ojos cerrados.', reward: { coins: 250 } },
      { id: 4, at: 'Marrakech', title: 'La carta del zoco', hint: 'Una puerta con un avioncito pintado.', req: { stamps: { r: 'af', n: 3 } },
        lines: [[N, 'Ese puesto de lámparas tiene el avioncito de Opa pintado en la puerta.', 'look'],
          ['Hassan, el vendedor', 'Mi padre guardó esta carta sesenta años. Dijo que un piloto alemán vendría a buscarla.'],
          ['Hassan, el vendedor', 'Nunca vino. Vino su nieto. A veces eso alcanza.'],
          [N, '«M.: si me esperás, te lo voy a decir donde el agua cae del cielo.»'],
          [N, 'Opa nunca mandó esta carta. Entonces M. nunca supo adónde ir.'],
          ['Hassan, el vendedor', 'Mi padre contaba que el piloto se fue de acá hacia Río de Janeiro. Que lo esperaba una tormenta.']],
        objs: { 3: 'carta', 4: 'carta' },
        back: 'La carta nunca le llegó a M. Opa la dejó acá y siguió volando. ¿Ella lo esperó? ¿Y qué le iba a decir donde el agua cae del cielo?', reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Río de Janeiro', title: 'Aterrizaje a ciegas', hint: 'Una tormenta que cerró el cielo tres días.', req: { route: 'andes' },
        lines: [[N, 'La página de Río tiene una sola palabra, escrita tan fuerte que rompió el papel: «tormenta».'],
          ['Dona Lúcia, la controladora', '1961. Un piloto aterrizó a ciegas en plena tormenta. Lo vi yo misma desde la torre.'],
          ['Dona Lúcia, la controladora', 'Gritaba que tenía que llegar a Buenos Aires esa noche, que alguien lo esperaba. Le cerramos el cielo tres días.'],
          [N, 'Tres días tarde. Por eso la carta, por eso los dos cafés. Opa siempre llegaba tarde a M.', 'hat'],
          ['Dona Lúcia, la controladora', 'Antes de irse preguntó por una cascada en Venezuela. Pero primero, dijo, quería pararse en la mitad del mundo.']],
        back: 'Hoy vi el cielo de Río ponerse negro en un minuto. Entendí que no fue culpa de Opa. Igual duele.', reward: { coins: 350 } },
      { id: 6, at: 'Mitad del Mundo', title: 'Un pie en cada mitad', hint: 'La línea que parte el mundo en dos.', req: { stamps: { r: 'am', n: 8 }, trips: 18 },
        lines: [[N, 'Un pie en el norte, un pie en el sur. La línea pasa justo entre mis botas.', 'side'],
          [N, 'La penúltima página dice: «Último intento. Si no está, me quedo con el cielo».'],
          [N, '¿Y si Opa no desapareció en un accidente? ¿Y si eligió no volver?'],
          [N, 'No. Primero el agua que cae del cielo. Después las preguntas.', 'hat']],
        back: 'Hoy por primera vez tuve miedo de lo que voy a encontrar. Sigo igual. Opa también tenía miedo y volaba igual.', reward: { coins: 400 } },
      { id: 7, at: 'Salto Ángel', title: 'Donde el agua cae del cielo', hint: 'Donde el agua cae desde las nubes.', req: { trips: 30 },
        lines: [[N, 'Salto Ángel. Casi mil metros de agua cayendo desde las nubes. Opa tenía razón: parece que el cielo se rompe.', 'up'],
          [N, 'Hay una piedra con el avioncito tallado. Debajo, una lata oxidada.'],
          [N, 'Adentro está la página arrancada. La letra de Opa, temblando:'],
          [N, '«1974. Llegué tarde otra vez: M. ya no estaba. No voy a volver a casa a explicar por qué. Que alguien de los míos llegue a tiempo por mí.»'],
          [N, 'Y abajo, unas coordenadas. No son de acá. Son de una isla en el medio del Pacífico.']],
        objs: { 2: 'pagina', 3: 'pagina', 4: 'pagina' },
        back: 'Opa no se cayó. Opa se fue. Y dejó un mapa para que alguien lo siguiera. Ese alguien soy yo.', reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Isla de Pascua', title: 'La isla', hint: 'Unas coordenadas en el medio del océano.', secret: true, req: {},
        lines: [[N, 'Las coordenadas me trajeron frente a los moáis. No hay nadie. Solo un hangar viejo con la puerta abierta.'],
          [N, 'Adentro hay cientos de postales colgadas con broches. Todas firmadas con un avioncito.'],
          ['???', 'Llegaste a tiempo. Yo nunca pude.'],
          [N, '…¿Opa?', 'up'],
          ['Albrecht', 'Cincuenta años mandando postales a desconocidos para que se animaran a viajar. La que más esperaba era la tuya.'],
          ['Albrecht', '¿Tomamos un café? Pido dos. Esta vez no se enfría ninguno.'], [N, 'Pedí dos, Opa. Yo invito.', 'wave']],
        objs: { 1: 'postales' },
        back: 'No le voy a contar a nadie dónde está. Le prometí volver el martes. Con dos cafés.', reward: { coins: 1000, chest: 'oro' } },
    ],
  },
};

// ── Personajes secundarios (NPC): un busto de papel genérico que se arma con piezas y colores. Se reusa en todas las historias cambiando la receta. ──
// receta: { piel, pelo: 'calvo'|'corto'|'largo'|'rodete'|'canoso', cPelo, ropa, cuello: 'delantal'|'pañuelo'|'uniforme'|'chilaba'|'chaqueta',
//           extra: ['bigote','barba','lentes','fez','antiparras','camara','arrugas'], cExtra }
export const NPCS = {
  'Étienne, el mozo': { piel: '#F1CDB0', pelo: 'calvo', cPelo: '#E8E4DC', ropa: '#2B2C3A', cuello: 'delantal', extra: ['bigote', 'arrugas'] },
  'Selin, la fotógrafa': { piel: '#E8BE9C', pelo: 'largo', cPelo: '#3A2420', ropa: '#5E7A8C', cuello: 'pañuelo', cExtra: '#C9573E', extra: ['camara'] },
  'Hassan, el vendedor': { piel: '#C9915F', pelo: 'corto', cPelo: '#2A1C16', ropa: '#C98A4A', cuello: 'chilaba', extra: ['barba', 'fez'], cExtra: '#B8402E' },
  'Dona Lúcia, la controladora': { piel: '#9A6644', pelo: 'rodete', cPelo: '#D8D4CC', ropa: '#3E5BA9', cuello: 'uniforme', extra: ['lentes', 'arrugas'] },
  '???': { piel: '#E9C4A4', pelo: 'canoso', cPelo: '#EEEAE2', ropa: '#7A5A3C', cuello: 'chaqueta', extra: ['antiparras', 'bigote', 'arrugas'], sombra: true },
  'Albrecht': { piel: '#E9C4A4', pelo: 'canoso', cPelo: '#EEEAE2', ropa: '#7A5A3C', cuello: 'chaqueta', extra: ['antiparras', 'bigote', 'arrugas'] },
};
const dk = (c, t = .22) => { const n = parseInt(c.slice(1), 16), f = v => Math.round(v * (1 - t)).toString(16).padStart(2, '0'); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).join(''); };
export function npcSVG(r) {
  const P = (d, c, o = '') => `<path d="${d}" fill="${c}"${o}/>`, E = r.extra || [], has = k => E.includes(k), cp = r.cPelo, sk = r.piel;
  let back = '', body = '', head = '', front = '';
  // cuerpo y cuello
  body += P('M14 128 Q16 96 36 90 Q60 84 84 90 Q104 96 106 128Z', r.ropa) + `<rect x="51" y="74" width="18" height="18" rx="5" fill="${dk(sk, .12)}"/>`;
  if (r.cuello === 'delantal') body += P('M40 128 L44 96 Q60 100 76 96 L80 128Z', '#F4F0E6') + P('M52 90 L60 96 L68 90 L68 98 L60 95 L52 98Z', '#B8402E') + P('M36 90 L46 92 L50 104 Z M84 90 L74 92 L70 104Z', '#F4F0E6');
  if (r.cuello === 'pañuelo') body += P('M44 88 Q60 100 76 88 Q74 98 60 104 Q46 98 44 88Z', r.cExtra || '#C9573E') + P('M60 102 L56 118 L62 116 L66 120 L64 102Z', dk(r.cExtra || '#C9573E'));
  if (r.cuello === 'uniforme') body += P('M48 88 L60 104 L72 88 L66 88 L60 96 L54 88Z', '#F4F0E6') + `<circle cx="60" cy="112" r="2" fill="#F2B937"/><circle cx="60" cy="122" r="2" fill="#F2B937"/>` + P('M86 98 l10 2 l-2 6 l-10 -2Z', '#F2B937');
  if (r.cuello === 'chilaba') body += P('M50 88 Q60 102 70 88 L66 128 L54 128Z', dk(r.ropa, .15)) + P('M52 92 Q60 98 68 92', 'none', ` stroke="#F2B937" stroke-width="1.6"`);
  if (r.cuello === 'chaqueta') body += P('M40 92 L56 100 L52 128 L40 128Z M80 92 L64 100 L68 128 L80 128Z', dk(r.ropa, .25)) + P('M44 90 Q60 82 76 90 L72 96 Q60 90 48 96Z', '#D9C7A6');
  // pelo de atrás
  if (r.pelo === 'largo') back += P('M30 46 Q28 16 60 14 Q92 16 90 46 L94 96 Q78 102 60 100 Q42 102 26 96Z', cp);
  // cabeza
  head += `<ellipse cx="33" cy="52" rx="5" ry="7" fill="${dk(sk, .08)}"/><ellipse cx="87" cy="52" rx="5" ry="7" fill="${dk(sk, .08)}"/><ellipse cx="60" cy="48" rx="27" ry="28" fill="${sk}"/>`;
  head += P('M60 20 Q84 22 86 48 Q86 70 66 76 Q82 64 80 44 Q78 26 60 20Z', dk(sk, .06), ' opacity=".7"');
  if (r.pelo === 'calvo') head += P('M33 40 Q34 30 40 28 Q38 38 37 48Z M87 40 Q86 30 80 28 Q82 38 83 48Z', cp);
  if (r.pelo === 'corto') head += P('M33 42 Q32 20 60 18 Q88 20 87 42 Q80 30 66 30 Q60 34 50 30 Q38 32 33 42Z', cp);
  if (r.pelo === 'largo') head += P('M33 46 Q32 18 60 17 Q88 18 87 46 Q78 28 62 30 Q48 28 33 46Z', cp);
  if (r.pelo === 'rodete') head += `<circle cx="60" cy="16" r="10" fill="${cp}"/>` + P('M33 44 Q32 20 60 19 Q88 20 87 44 Q80 28 60 28 Q40 28 33 44Z', cp);
  if (r.pelo === 'canoso') head += P('M33 46 Q30 22 60 20 Q90 22 87 46 Q84 34 78 32 Q70 26 60 30 Q50 26 42 32 Q36 34 33 46Z', cp);
  // cara
  head += `<ellipse cx="43" cy="58" rx="4.5" ry="2.6" fill="#EE9A8E" opacity=".75"/><ellipse cx="77" cy="58" rx="4.5" ry="2.6" fill="#EE9A8E" opacity=".75"/>`
    + `<ellipse cx="50" cy="50" rx="3.6" ry="4.6" fill="#2B2236"/><circle cx="51.4" cy="48.2" r="1.4" fill="#FFF8EA"/><ellipse cx="70" cy="50" rx="3.6" ry="4.6" fill="#2B2236"/><circle cx="71.4" cy="48.2" r="1.4" fill="#FFF8EA"/>`
    + `<rect x="45" y="40" width="10" height="2.6" rx="1.3" fill="${dk(cp === '#EEEAE2' || cp === '#E8E4DC' || cp === '#D8D4CC' ? '#9A948A' : cp, 0)}" transform="rotate(-6 50 41)"/><rect x="65" y="40" width="10" height="2.6" rx="1.3" fill="${dk(cp === '#EEEAE2' || cp === '#E8E4DC' || cp === '#D8D4CC' ? '#9A948A' : cp, 0)}" transform="rotate(6 70 41)"/>`
    + `<ellipse cx="60" cy="56" rx="2" ry="1.4" fill="${dk(sk, .16)}"/>` + P('M54 62 Q60 67 66 62 Q60 64.5 54 62Z', '#2B2236');
  if (has('arrugas')) head += P('M41 47 l-3 -1 M79 47 l3 -1 M54 70 q6 2 12 0', 'none', ` stroke="${dk(sk, .2)}" stroke-width="1.1" stroke-linecap="round"`);
  if (has('bigote')) head += P('M50 62 Q55 58 60 61 Q65 58 70 62 Q66 64 60 62.5 Q54 64 50 62Z', r.cPelo === '#E8E4DC' || r.cPelo === '#EEEAE2' ? '#E2DED6' : dk(cp, 0));
  if (has('barba')) head += P('M34 54 Q36 78 60 82 Q84 78 86 54 Q80 66 70 66 Q60 70 50 66 Q40 66 34 54Z', cp) + P('M54 63 Q60 66 66 63', 'none', ` stroke="#2B2236" stroke-width="1.6" stroke-linecap="round"`);
  if (has('lentes')) head += `<g fill="none" stroke="#6A4E3A" stroke-width="1.8"><circle cx="50" cy="50" r="6.4"/><circle cx="70" cy="50" r="6.4"/><path d="M56.4 50 Q60 48 63.6 50"/></g>`;
  if (has('fez')) head += P('M44 26 L47 8 Q60 5 73 8 L76 26 Q60 30 44 26Z', r.cExtra || '#B8402E') + P('M60 6 Q66 10 68 20', 'none', ` stroke="#2B2236" stroke-width="1.6"`) + `<circle cx="68" cy="21" r="2" fill="#2B2236"/>`;
  if (has('antiparras')) head += `<rect x="36" y="28" width="48" height="6" rx="3" fill="#5E3B2A"/><circle cx="49" cy="31" r="7" fill="#BFE3F5" stroke="#C9A15A" stroke-width="3"/><circle cx="71" cy="31" r="7" fill="#BFE3F5" stroke="#C9A15A" stroke-width="3"/>`;
  if (has('camara')) front += `<g transform="translate(70 100) rotate(-8)"><rect x="0" y="0" width="26" height="17" rx="3" fill="#3A3548"/><circle cx="13" cy="9" r="5.4" fill="#8E9AAA" stroke="#2B2236" stroke-width="1.6"/><rect x="3" y="-3" width="7" height="4" rx="1" fill="#3A3548"/></g>`;
  const all = back + body + head + front;
  return `<svg viewBox="0 -4 120 132" aria-hidden="true"><g stroke="#FFF4DC" stroke-width="7" stroke-linejoin="round">${(back + body + head + front).replace(/<path d="[^"]*" fill="none"[^>]*\/>/g, '')}</g>${all}</svg>`;
}

// ── Objetos que se muestran al centro de la conversación (el personaje queda de fondo) ──
const OBJ = {
  cuaderno: () => `<svg viewBox="0 0 220 150"><g stroke="#FFF4DC" stroke-width="8" stroke-linejoin="round"><rect x="10" y="14" width="200" height="126" rx="8" fill="#8A5A3B"/></g><rect x="10" y="14" width="200" height="126" rx="8" fill="#8A5A3B"/>`
    + `<rect x="18" y="20" width="90" height="114" rx="3" fill="#FBF4E2"/><rect x="112" y="20" width="90" height="114" rx="3" fill="#F3E8CC"/><rect x="107" y="18" width="6" height="118" fill="#6A4226"/>`
    + `<text x="28" y="40" font-family="'Lilita One',sans-serif" font-size="11" fill="#7A6A54">FLUGBUCH · A. V.</text><path d="M28 52 h70 M28 62 h62 M28 72 h68 M28 82 h56 M28 92 h66 M28 102 h48" stroke="#B9A57E" stroke-width="2" stroke-linecap="round"/>`
    + `<path d="M124 112 C140 70 160 96 176 52 L190 42" stroke="#C9402A" stroke-width="2" stroke-dasharray="4 3" fill="none"/><circle cx="124" cy="112" r="4" fill="#C9402A"/><circle cx="160" cy="80" r="4" fill="#C9402A"/><circle cx="190" cy="42" r="4" fill="#C9402A"/>`
    + `<text x="184" y="124" font-family="'Lilita One',sans-serif" font-size="26" fill="#C9402A">M.</text><path d="M200 20 L212 34 L200 30Z" fill="#E8E0CA"/></svg>`,
  foto: () => `<svg viewBox="0 0 170 190"><g transform="rotate(-4 85 95)"><rect x="12" y="10" width="146" height="170" rx="3" fill="#FFFDF6" stroke="#FFF4DC" stroke-width="8"/><rect x="12" y="10" width="146" height="170" rx="3" fill="#FFFDF6"/>`
    + `<rect x="24" y="22" width="122" height="118" fill="#B8A07A"/><rect x="24" y="22" width="122" height="60" fill="#D2BE98"/><path d="M24 100 Q60 90 146 104 V140 H24Z" fill="#9E865E"/>`
    + `<circle cx="64" cy="66" r="14" fill="#E2CBA8"/><path d="M50 60 Q64 44 78 60 L78 54 Q64 40 50 54Z" fill="#5E4A34"/><rect x="52" y="56" width="24" height="6" rx="3" fill="#7A6040"/><path d="M44 140 Q46 92 64 86 Q82 92 84 140Z" fill="#5E4A34"/>`
    + `<circle cx="104" cy="70" r="13" fill="#E2CBA8"/><path d="M90 70 Q88 50 104 52 Q120 50 118 70 L122 96 Q104 90 86 96Z" fill="#3A2A20"/><path d="M88 140 Q90 94 104 88 Q118 94 120 140Z" fill="#8A6A52"/><path d="M92 92 Q104 100 116 92 L112 104 Q104 108 96 104Z" fill="#C9907A"/><text x="104" y="104" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="8" fill="#FBF4E2">M</text>`
    + `<rect x="24" y="22" width="122" height="118" fill="#C9A86A" opacity=".18"/><text x="85" y="164" text-anchor="middle" font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" font-style="italic" font-size="12" fill="#5E4A34">Gálata, 1960</text></g></svg>`,
  carta: () => `<svg viewBox="0 0 170 200"><g transform="rotate(3 85 100)"><rect x="16" y="10" width="138" height="180" rx="3" fill="#F7EED6" stroke="#FFF4DC" stroke-width="8"/><rect x="16" y="10" width="138" height="180" rx="3" fill="#F7EED6"/>`
    + `<path d="M16 70 H154 M16 130 H154" stroke="#E2D6B6" stroke-width="1.6"/><text x="30" y="40" font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" font-style="italic" font-weight="700" font-size="15" fill="#24305E">M.:</text>`
    + `<g font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" font-style="italic" font-size="11.5" fill="#24305E"><text x="30" y="62">si me esperás,</text><text x="30" y="80">te lo voy a decir</text><text x="30" y="98">donde el agua</text><text x="30" y="116">cae del cielo.</text></g>`
    + `<path d="M104 150 L132 140 L124 150 L132 160Z" fill="#C9402A"/><text x="124" y="180" text-anchor="end" font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" font-style="italic" font-size="12" fill="#24305E">— A.</text><circle cx="140" cy="30" r="14" fill="none" stroke="#C9402A" stroke-width="2" opacity=".6"/></g></svg>`,
  pagina: () => `<svg viewBox="0 0 180 200"><g transform="rotate(-3 90 100)"><path d="M14 12 H164 V188 H14 L20 170 L12 150 L20 130 L12 110 L20 90 L12 70 L20 50 L12 30Z" fill="#EFE2C2" stroke="#FFF4DC" stroke-width="8" stroke-linejoin="round"/><path d="M14 12 H164 V188 H14 L20 170 L12 150 L20 130 L12 110 L20 90 L12 70 L20 50 L12 30Z" fill="#EFE2C2"/>`
    + `<g font-family="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" font-style="italic" font-size="11" fill="#3A2A20"><text x="32" y="38" font-weight="700">1974.</text><text x="32" y="58">Llegué tarde otra vez.</text><text x="32" y="76">No voy a volver a casa</text><text x="32" y="94">a explicar por qué.</text><text x="32" y="116">Que alguien de los míos</text><text x="32" y="134">llegue a tiempo por mí.</text></g>`
    + `<text x="34" y="170" font-family="'Lilita One',sans-serif" font-size="12" fill="#C9402A">27°07'S · 109°21'O</text><path d="M120 40 q20 10 30 0" stroke="#A0602A" stroke-width="5" opacity=".25" fill="none"/></g></svg>`,
  postales: () => `<svg viewBox="0 0 220 150"><path d="M6 20 Q110 40 214 20" stroke="#8A6A44" stroke-width="2" fill="none"/><path d="M6 80 Q110 100 214 80" stroke="#8A6A44" stroke-width="2" fill="none"/>`
    + [[14, 26, '#F2B98A', -6], [62, 32, '#9CC9DE', 4], [112, 33, '#F4B6C2', -3], [162, 27, '#BFE3A8', 6], [30, 86, '#E8C45A', 5], [84, 92, '#B9C8EE', -4], [140, 90, '#F2B98A', 3]].map(([x, y, c, r]) => `<g transform="rotate(${r} ${x + 22} ${y + 18})"><rect x="${x}" y="${y}" width="44" height="34" rx="2" fill="#FFFDF6" stroke="#FFF4DC" stroke-width="5"/><rect x="${x}" y="${y}" width="44" height="34" rx="2" fill="#FFFDF6"/><rect x="${x + 3}" y="${y + 3}" width="38" height="20" fill="${c}"/><path d="M${x + 26} ${y + 30} l8 -3 l-2 3 l2 3Z" fill="#C9402A"/><rect x="${x + 18}" y="${y - 4}" width="8" height="8" rx="1" fill="#8A6A44"/></g>`).join('') + `</svg>`,
};

// ── Estado ──
let STORE = null;
const st = hero => { const s = STORE?.get('hist.' + hero, null) || {}; return { got: s.got || [], seen: s.seen || [] }; };
const save = (hero, s) => STORE?.set('hist.' + hero, s);
export function initHistoria(store) { STORE = store; }
export const hasStory = hero => !!STORIES[hero];
export const progress = hero => { const S = STORIES[hero]; if (!S) return null; const s = st(hero); return { got: s.got, total: S.chapters.filter(c => !c.secret).length, unseen: s.got.filter(i => !s.seen.includes(i)).length }; };
export function markSeen(hero) { const s = st(hero); s.seen = [...new Set([...s.seen, ...s.got])]; save(hero, s); }

// Requisitos del capítulo con su avance (para el diario y para decidir)
export function reqs(V, hero, ch) {
  const stamps = (V.heroStamps ? V.heroStamps() : V.T.visits) || {}, trips = Object.values(stamps).reduce((a, n) => a + (n || 0), 0), out = [];
  if (ch.at) out.push({ label: `Próximo destino: ${ch.at} (viajá con ${hero === 'nilo' ? 'Nilo' : hero})`, kind: 'at' });
  if (ch.req.trips) out.push({ label: `${ch.req.trips} viajes con Nilo`, n: Math.min(trips, ch.req.trips), goal: ch.req.trips, ok: trips >= ch.req.trips });
  if (ch.req.stamps) { const { r, n } = ch.req.stamps, have = Object.keys(stamps).filter(i => stamps[i] > 0 && V.regionOf(+i) === r).length; out.push({ label: `${n} sellos de ${V.REGIONS[r].name}`, n: Math.min(have, n), goal: n, ok: have >= n }); }
  if (ch.req.route) { const R = V.ROUTES.find(x => x.id === ch.req.route), ok = (V.heroRoutes ? V.heroRoutes() : []).includes(ch.req.route); out.push({ label: `Completar la ${R ? (window.t ? window.t(R.name) : R.name) : 'ruta'}`, ok, n: ok ? 1 : 0, goal: 1 }); }
  return out;
}
export const nextChapter = hero => { const S = STORIES[hero]; if (!S) return null; const s = st(hero); return S.chapters.find(c => !s.got.includes(c.id)) || null; };

// Llamar después de cada viaje completado (ya sumado el sello). Devuelve el capítulo abierto o null; deja la escena pendiente.
export function onArrive(V, at) {
  V.syncAlbum?.(); const hero = V.heroId?.() || 'nilo', S = STORIES[hero]; if (!S) return null;
  const ch = nextChapter(hero); if (!ch) return null;
  if (ch.at && IDX[ch.at] !== at) return null;
  if (reqs(V, hero, ch).some(r => r.ok === false)) return null;
  const s = st(hero); s.got.push(ch.id); save(hero, s);
  STORE.set('histPend', { hero, ch: ch.id });
  return ch;
}
export const pending = () => STORE?.get('histPend', null);
export const clearPending = () => STORE?.set('histPend', null);
export const chapterOf = (hero, id) => STORIES[hero]?.chapters.find(c => c.id === id) || null;

// ── Arte ──
const destOf = ch => DESTINOS[IDX[ch.place || ch.at]] || DESTINOS[0];
// Frente de la postal: el monumento real del destino sobre su cielo, con estampilla
export function postalFront(ch, w = 160) {
  const d = destOf(ch), fog = d.look?.fog || '#CFE3F0', sky = d.look?.far?.[0] || '#8FD0F0';
  const art = String(d.art || '').replace(/<svg[^>]*>/, '<svg viewBox="0 0 120 120" x="34" y="6" width="92" height="92" overflow="visible">');
  return `<svg viewBox="0 0 160 110" width="${w}" aria-label="${esc(d.place)}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pfs${ch.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fog}"/><stop offset="1" stop-color="#FDEBC4"/></linearGradient></defs>`
    + `<rect width="160" height="110" fill="url(#pfs${ch.id})"/><circle cx="132" cy="22" r="11" fill="#FFD45E" opacity=".9"/><path d="M-4 84 Q40 70 80 80 T164 76 V112 H-4Z" fill="${d.hillColor || '#8DBF5E'}"/>${art}<rect y="92" width="160" height="18" fill="${d.ground || '#A8C98A'}"/>`
    + `<text x="8" y="22" font-family="'Lilita One',sans-serif" font-size="16" fill="${CREAM}" stroke="#24305E" stroke-width="3" paint-order="stroke">${esc(d.place)}</text><rect x="136" y="84" width="18" height="20" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 1.6"/></svg>`;
}
// El diario sobre la mesa de la mochila: libreta de cuero con elástico del color del viajero y postales asomando
export function diarySVG(hero, n = 0, fresh = 0) {
  const F = FICHAS[hero] || FICHAS.nilo, name = (hero[0].toUpperCase() + hero.slice(1)).toUpperCase();
  const cards = ['#F2B98A', '#9CC9DE', '#F4B6C2', '#BFE3A8'].slice(0, Math.min(4, n)).map((c, k) => `<g transform="rotate(${[-9, 6, -3, 11][k]} ${30 + k * 14} 20)"><rect x="${18 + k * 15}" y="${2 - k * 1.5}" width="34" height="24" rx="1.5" fill="#FFFDF6"/><rect x="${20 + k * 15}" y="${4 - k * 1.5}" width="30" height="13" fill="${c}"/></g>`).join('');
  return `<svg viewBox="0 0 110 140" aria-hidden="true">${cards}`
    + `<g stroke="${CREAM}" stroke-width="6" stroke-linejoin="round"><rect x="8" y="16" width="94" height="118" rx="7" fill="#8A5A3B"/></g><rect x="8" y="16" width="94" height="118" rx="7" fill="#8A5A3B"/>`
    + `<rect x="8" y="16" width="14" height="118" rx="6" fill="#6A4226"/><rect x="25" y="22" width="72" height="106" rx="4" fill="none" stroke="#B98A55" stroke-width="1.2" stroke-dasharray="3 2.4"/>`
    + `<rect x="34" y="40" width="58" height="24" rx="3" fill="#F3E6C4"/><text x="63" y="57" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="13" fill="${F.dark}">${name}</text>`
    + `<path d="M50 84 L63 74 L76 84 M63 74 V100" stroke="#E9C08A" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="63" cy="88" r="15" fill="none" stroke="#E9C08A" stroke-width="2" opacity=".7"/>`
    + `<rect x="84" y="16" width="8" height="118" fill="${F.color}"/><rect x="84" y="16" width="8" height="118" fill="#000" opacity=".12"/>`
    + `<path d="M8 120 Q8 134 20 134 H90 Q102 134 102 120 V114 Q55 124 8 114Z" fill="#000" opacity=".15"/>`
    + (fresh ? `<circle cx="98" cy="20" r="11" fill="#E8452C" stroke="${CREAM}" stroke-width="2.5"/><text x="98" y="25" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="13" fill="#fff">${fresh}</text>` : '') + `</svg>`;
}

// ── Escena de diálogo (como en los juegos de aventura: personaje grande, globo de papel, tocar para seguir) ──
// ctx: { thumbOf, wornOf, SFX, buzz, confetti }. Devuelve una promesa al cerrarse.
export function playScene(ctx, hero, id, opts = {}) {
  css();
  const ch = chapterOf(hero, id); if (!ch) return Promise.resolve();
  const F = FICHAS[hero], S = STORIES[hero], name = hero[0].toUpperCase() + hero.slice(1);
  const sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  let art = ''; try { art = uniq(ctx.thumbOf(hero, ctx.wornOf ? ctx.wornOf(hero) : 'base')); } catch (e) {}
  let HA = null; try { HA = ctx.artFor ? ctx.artFor(hero, ctx.wornOf ? ctx.wornOf(hero) : 'base').HERO : null; } catch (e) {}
  // justo debajo del encabezado rojo del panel abierto (mapa, mochila…); en el inicio, arriba de todo
  const heads = [...document.querySelectorAll('.panel .head')].map(e => e.getBoundingClientRect()).filter(r => r.height > 0 && r.top < 60 && r.bottom > 0);
  const topY = heads.length ? Math.max(...heads.map(r => r.bottom)) + 'px' : 'var(--st,0px)';
  return new Promise(done => {
    const ov = document.createElement('div'); ov.className = 'pvh';
    const dots = ch.lines.map(() => '<i></i>').join('');
    ov.style.setProperty('--htop', topY);
    ov.innerHTML = `<div class="hbg"></div><div class="htop"><div class="hdots">${dots}</div><button class="hskip">SALTAR</button></div>
<div class="htag"><div class="ribbon"><small>${esc(S.title.toUpperCase())}</small>Capítulo ${ch.id}${ch.secret ? ' · secreto' : ''} · ${esc(ch.title)}</div></div>
<div class="hhero"><div class="hhf">${art}</div></div><div class="hnpc"></div><div class="hobj"></div><div class="hbub"><b class="hn"></b><p class="ht"></p><i class="hnext"></i></div>`;
    document.body.appendChild(ov); document.body.classList.add('pvh-on');
    const hn = ov.querySelector('.hn'), ht = ov.querySelector('.ht'), hh = ov.querySelector('.hhero'), bub = ov.querySelector('.hbub'), dd = [...ov.querySelectorAll('.hdots i')];
    let k = -1, typing = null, full = '', npcNow = null, objNow = null;
    const hnp = ov.querySelector('.hnpc'), hob = ov.querySelector('.hobj');
    const setNpc = who => { const R = NPCS[who]; if (!R) return; if (npcNow !== who) { npcNow = who; hnp.classList.remove('on'); setTimeout(() => { if (npcNow !== who) return; hnp.innerHTML = `<div class="hnf${R.sombra ? ' sil' : ''}">${npcSVG(R)}</div>`; hnp.classList.add('on'); }, hnp.innerHTML ? 180 : 0); } };
    const setObj = key => { if (key === objNow) return; objNow = key; ov.classList.toggle('obj', !!key); hob.classList.remove('on'); if (key && OBJ[key]) setTimeout(() => { if (objNow !== key) return; hob.innerHTML = OBJ[key](); hob.classList.add('on'); sfx('tap'); }, hob.innerHTML ? 160 : 60); };
    // Gestos: respira y parpadea siempre; al hablar mueve la cabeza; en algunas líneas saluda, mira alrededor o se acomoda la gorra; cuando habla otro, lo mira
    const hf = ov.querySelector('.hhf'), UC = new Map(), G = { ph: 0, lx: 0, ly: 0, tx: 0, ty: 0, blinkAt: Date.now() + 1500, bk: -1, clip: null, ck: 0, cph: 0, wave: 0, t: 0 };
    const put = f => { if (!f || hf._f === f) return; let u = UC.get(f); if (!u) { u = uniq(f); if (UC.size > 80) UC.clear(); UC.set(f, u); } hf.innerHTML = u; hf._f = f; };
    const gesture = g => {
      G.clip = null; G.wave = 0;
      if (!HA || !HA.at) return;
      if (g === 'wave' && HA.wave) G.wave = 12;
      else if (g === 'look' && HA.clips?.lookAround) { G.clip = HA.clips.lookAround; G.ck = 0; G.cph = G.ph; }
      else if (g === 'hat' && HA.clips?.fixHat) { G.clip = HA.clips.fixHat; G.ck = 0; G.cph = G.ph; }
      else if (g === 'up') { G.tx = 0; G.ty = 1; }
      else if (g === 'side') { G.tx = -1; G.ty = 0; }
      else if (g === 'listen') { G.tx = 1; G.ty = 0; }
      else { G.tx = [-.5, 0, .5][Math.floor(Math.random() * 3)]; G.ty = 0; }
    };
    const anim = setInterval(() => {
      if (!ov.isConnected) return clearInterval(anim);
      if (!HA || !HA.at) return; G.t++; G.ph = (G.ph + 1) % 27; const now = Date.now();
      if (G.wave > 0) { G.wave--; put(HA.wave[G.t % HA.wave.length]); return; }
      if (G.clip) { if (G.ck >= G.clip.len) G.clip = null; else { put(G.clip.frame(G.ck++, G.cph)); return; } }
      G.lx += Math.max(-.25, Math.min(.25, G.tx - G.lx)); G.ly += Math.max(-.5, Math.min(.5, G.ty - G.ly));
      let bl = 0; if (G.bk >= 0) { bl = [1, 2, 1][G.bk++]; if (G.bk > 2) { G.bk = -1; G.blinkAt = now + 1800 + Math.random() * 2600; } } else if (now >= G.blinkAt) { G.bk = 1; bl = 1; }
      put(HA.at(G.ph, { lx: G.lx, ly: G.ly, blink: bl }));
    }, 110);
    const show = () => {
      k++; if (k >= ch.lines.length) return finale();
      const [who, txt, g] = ch.lines[k], me = who === name || who === N && hero === 'nilo';
      hn.textContent = who; hn.style.color = me ? F.dark : '#A4521A'; bub.classList.toggle('npc', !me); hh.classList.toggle('hdim', !me);
      if (!me) setNpc(who); hnp.classList.toggle('hdim', me); hnp.classList.toggle('talk', !me); ov.classList.toggle('duo', !!npcNow);
      setObj(ch.objs?.[k] || null);
      gesture(me ? g : 'listen'); hh.classList.toggle('talk', me);
      dd.forEach((d, j) => d.classList.toggle('on', j <= k)); full = txt; ht.textContent = ''; bub.classList.remove('done');
      let c = 0; clearInterval(typing); sfx('tap');
      typing = setInterval(() => { c += 2; ht.textContent = full.slice(0, c); if (c >= full.length) { clearInterval(typing); typing = null; bub.classList.add('done'); hh.classList.remove('talk'); hnp.classList.remove('talk'); } }, 22);
    };
    const finale = () => {
      clearInterval(typing); ov.classList.add('fin'); sfx('prize'); try { ctx.buzz?.([20, 40, 20]); ctx.confetti?.(); } catch (e) {}
      const r = ch.reward || {}, chips = [r.coins ? `+◉ ${r.coins}` : '', r.chest ? `Cofre de ${r.chest}` : ''].filter(Boolean).map(x => `<span>${x}</span>`).join('');
      const card = document.createElement('div'); card.className = 'hend';
      card.innerHTML = `<small>NUEVA POSTAL · ${ch.id}/${S.chapters.filter(c => !c.secret).length}${ch.secret ? ' · SECRETA' : ''}</small><div class="hpc">${postalFront(ch, 250)}</div><b>${esc(ch.title)}</b>${opts.replay ? '' : `<div class="hrw">${chips}</div>`}<button class="hok">${opts.replay ? 'CERRAR' : 'GUARDAR EN EL DIARIO'}</button>`;
      ov.appendChild(card);
      card.querySelector('.hok').onclick = e => { e.stopPropagation(); close(true); };
    };
    const close = fly => {
      sfx('tap');
      const bag = document.getElementById('openAlbum'), pc = ov.querySelector('.hpc');
      if (fly && bag && pc && pc.animate && !opts.replay) {
        const a = pc.getBoundingClientRect(), b = bag.getBoundingClientRect();
        pc.animate([{ transform: 'none' }, { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top - a.top - a.height / 2}px) scale(.12) rotate(-20deg)`, opacity: .4 }], { duration: 620, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
        ov.querySelectorAll('.hend>*:not(.hpc)').forEach(x => x.style.opacity = '0'); ov.classList.add('bye1');
        setTimeout(() => { bag.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 320 }); ov.remove(); document.body.classList.remove('pvh-on'); done(); }, 640);
      } else { ov.remove(); document.body.classList.remove('pvh-on'); done(); }
    };
    ov.addEventListener('click', e => {
      if (ov.classList.contains('fin')) return;
      if (e.target.closest('.hskip')) { k = ch.lines.length - 1; clearInterval(typing); typing = null; show(); return; }
      if (typing) { clearInterval(typing); typing = null; ht.textContent = full; bub.classList.add('done'); hh.classList.remove('talk'); return; }
      show();
    });
    setTimeout(show, 450);
  });
}

// ── El diario (ficha + postales) ──
// opts: { preload, closeAnim } como el álbum. ctx: { V, thumbOf, wornOf, SFX }
export function openDiary(ctx, hero, onClose, opts = {}) {
  css();
  const V = ctx.V, F = FICHAS[hero] || FICHAS.nilo, S = STORIES[hero], name = hero[0].toUpperCase() + hero.slice(1);
  const sfx = n => { try { ctx.SFX?.[n]?.(); } catch (e) {} };
  document.querySelectorAll('.pvdia').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pvk pvdia'; root.style.display = 'block'; root.style.setProperty('--hc', F.color); root.style.setProperty('--hd', F.dark);
  if (opts.preload) { root.style.animation = 'none'; root.style.opacity = '0'; root.style.pointerEvents = 'none'; }
  document.body.appendChild(root);
  let closing = false;
  const finish = () => { root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  const close = () => { if (closing) return; closing = true; if (opts.closeAnim) opts.closeAnim(root, finish); else finish(); };
  const stamps = (V.heroStamps ? V.heroStamps() : {}) || {}, trips = Object.values(stamps).reduce((a, n) => a + (n || 0), 0), nSt = Object.keys(stamps).filter(k => stamps[k] > 0).length;
  const selfies = V.selfieCount ? V.selfieCount() : 0;
  let art = ''; try { art = uniq(ctx.thumbOf(hero, ctx.wornOf ? ctx.wornOf(hero) : 'base')); } catch (e) {}
  function draw() {
    const s = st(hero), got = s.got, total = S ? S.chapters.filter(c => !c.secret).length : 0, next = S ? nextChapter(hero) : null, done7 = S && S.chapters.filter(c => !c.secret).every(c => got.includes(c.id));
    const dream = F.dream ? (done7 ? `<b class="L">${esc(F.dream)}</b>` : `<b class="L">Tapado con tinta</b><small>«${esc(F.dreamHint)}»</small>`) : '<b class="L">Todavía no lo cuenta</b>';
    const nextHTML = next ? `<div class="dnx"><div class="dnxh"><b>${next.secret ? 'Postal secreta' : `Capítulo ${next.id} de ${total}`}</b><span>«${esc(next.hint)}»</span></div>${reqs(V, hero, next).map(r => `<div class="drq${r.ok ? ' ok' : ''}"><i>${r.ok ? '✓' : ''}</i><span>${esc(r.label)}</span>${r.goal ? `<em>${r.n}/${r.goal}</em>` : ''}</div>`).join('')}</div>` : '';
    const cards = S ? S.chapters.filter(c => !c.secret || got.includes(c.id) || done7).map(c => {
      const ok = got.includes(c.id), nu = ok && !s.seen.includes(c.id);
      if (ok) return `<button class="dpc${nu ? ' nu' : ''}${c.secret ? ' sec' : ''}" data-ch="${c.id}"><div class="dpi">${postalFront(c, 150)}</div><small>${c.id} · ${esc((c.place || c.at || '').toUpperCase())}</small><b>${esc(c.title)}</b>${nu ? '<u>¡NUEVA!</u>' : ''}</button>`;
      return `<div class="dpc lk${c.secret ? ' sec' : ''}"><div class="dpi"><span>${c.secret ? '?' : `«${esc(c.hint)}»`}</span></div><small>${c.id} · ${c.secret ? 'SECRETA' : '???'}</small><b>???</b></div>`;
    }).join('') : '';
    root.innerHTML = `<div class="head"><button class="round close" data-x aria-label="Cerrar">✕</button><small>EL DIARIO DE</small><h2>${esc(name.toUpperCase())}</h2></div>
<div class="dfi"><div class="dpol"><div class="dph">${art}</div><span>${esc(name)}</span></div><div class="dtx"><h5>CIUDAD NATAL</h5><b class="L">${esc(F.home)}</b><h5>VIAJA PORQUE</h5><p>${esc(F.why)}</p><q>${esc(F.quote)}</q></div></div>
<div class="dst"><div><b>${trips}</b><small>VIAJES</small></div><div><b>${nSt}</b><small>SELLOS</small></div><div><b>${selfies}</b><small>SELFIES</small></div></div>
<div class="ddr"><div class="ink">?</div><div><h5>DESTINO SOÑADO</h5>${dream}</div></div>
${S ? `<div class="dsec"><b>${esc(S.title)}</b><span>${got.filter(i => i <= total).length}/${total} postales</span></div><div class="dbar"><i style="width:${Math.round(got.filter(i => i <= total).length / total * 100)}%"></i></div>${nextHTML}<div class="dgr">${cards}</div>`
      : `<div class="dsoon"><b class="L">Su historia llega pronto</b><p>Cada viajero va a tener su propio diario de postales.</p></div>`}`;
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { sfx('tap'); postal(+b.dataset.ch); });
  }
  function postal(id) {
    const ch = chapterOf(hero, id), ov = document.createElement('div'); ov.className = 'pvhp';
    ov.innerHTML = `<button class="round close" aria-label="Cerrar">✕</button><small>POSTAL ${id}${ch.secret ? ' · SECRETA' : ''} · ${esc(S.title.toUpperCase())}</small>
<div class="hpf"><div class="hpin"><div class="fr">${postalFront(ch, 300)}</div><div class="bk"><p>${esc(ch.back)}</p><div class="hps"><span>${esc((ch.place || ch.at || '').toUpperCase())}</span></div><em>— N.</em></div></div></div>
<div class="hpb"><button class="hflip">DAR VUELTA</button><button class="hplay">VER LA ESCENA</button></div>`;
    root.appendChild(ov);
    ov.querySelector('.round').onclick = () => { ov.remove(); sfx('tap'); };
    ov.querySelector('.hflip').onclick = () => { ov.querySelector('.hpin').classList.toggle('flip'); sfx('tap'); };
    ov.querySelector('.hpin').onclick = () => { ov.querySelector('.hpin').classList.toggle('flip'); sfx('tap'); };
    ov.querySelector('.hplay').onclick = () => playScene(ctx, hero, id, { replay: true });
  }
  draw(); markSeen(hero);
  return root;
}

function css() {
  if (document.getElementById('pvhCss')) return;
  const s = document.createElement('style'); s.id = 'pvhCss';
  s.textContent = `
body.pvh-on #menu>*:not(#mNav),body.pvh-on #mNav{visibility:hidden}
.pvh{position:fixed;inset:0;z-index:95;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;animation:pvhIn .35s}
@keyframes pvhIn{0%{opacity:0}}
.pvh .hbg{position:absolute;inset:0;background:linear-gradient(rgba(18,14,36,.3),rgba(18,14,36,.45) 45%,rgba(18,14,36,.9));-webkit-backdrop-filter:blur(7px) saturate(.85);backdrop-filter:blur(7px) saturate(.85)}
.pvh .htop{position:absolute;left:14px;right:14px;top:calc(var(--htop,0px) + 12px);display:flex;justify-content:space-between;align-items:center}
.pvh .hdots{display:flex;gap:5px}.pvh .hdots i{width:20px;height:6px;border-radius:3px;background:#FFF4DC;opacity:.35}.pvh .hdots i.on{opacity:1}
.pvh .hskip{border:0;padding:6px 14px;border-radius:99px;background:rgba(27,23,48,.55);color:#FFF4DC;font:400 13px 'Lilita One',sans-serif;letter-spacing:.5px}
.pvh .htag{position:absolute;left:0;right:0;top:calc(var(--htop,0px) + 56px);height:60px;animation:pvhTag .6s .2s cubic-bezier(.2,1.5,.4,1) both}
.pvh .htag .ribbon{top:0;font-size:18px;white-space:nowrap;line-height:1.1}
@keyframes pvhTag{0%{transform:translateY(-30px) rotate(-6deg);opacity:0}}
.pvh .hhero{position:absolute;left:-30px;bottom:calc(var(--sb,0px) + 70px);width:min(88vw,370px);aspect-ratio:1;overflow:hidden;transition:filter .25s,transform .3s;animation:pvhHero .55s cubic-bezier(.2,1.3,.4,1) both;filter:drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.pvh .hhero svg{display:block;width:100%;height:100%}
.pvh .hnpc{position:absolute;right:-22px;bottom:calc(var(--sb,0px) + 92px);width:min(62vw,250px);opacity:0;transform:translateX(40%);transition:opacity .25s,transform .45s cubic-bezier(.2,1.3,.4,1),filter .25s}
.pvh .hnpc.on{opacity:1;transform:none}.pvh .hnpc.on.hdim{filter:brightness(.55);transform:translateX(12px) scale(.96)}
.pvh .hnpc svg{display:block;width:100%;height:auto;overflow:visible;filter:drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.pvh .hnf{transform-origin:50% 90%;animation:pvhBreath 3.2s ease-in-out infinite}.pvh .hnpc.talk .hnf{animation:pvhTalk .26s ease-in-out infinite alternate}
.pvh .hnf.sil svg{filter:brightness(0) drop-shadow(0 0 10px rgba(255,220,150,.55))}
@keyframes pvhBreath{50%{transform:translateY(-2px) scale(1.006,.995)}}
.pvh.duo .hhero{transform:translateX(-14%)}
.pvh .hobj{position:absolute;left:50%;top:calc(var(--htop,0px) + 120px);width:min(80vw,330px);transform:translate(-50%,30px) scale(.6) rotate(-8deg);opacity:0;transition:opacity .25s,transform .5s cubic-bezier(.2,1.4,.4,1);filter:drop-shadow(0 14px 22px rgba(0,0,0,.5));pointer-events:none}
.pvh .hobj.on{opacity:1;transform:translate(-50%,0) scale(1) rotate(0)}.pvh .hobj svg{display:block;width:100%;height:auto;overflow:visible}
.pvh.obj .hhero,.pvh.obj .hnpc{filter:blur(2.5px) brightness(.5)!important}
.pvh .hhf{width:100%;height:100%;transform-origin:50% 90%}
.pvh .hhero.talk .hhf{animation:pvhTalk .26s ease-in-out infinite alternate}
@keyframes pvhTalk{to{transform:translateY(-3px) scale(1.012,.99)}}
.pvh .hhero.hdim{filter:brightness(.55) drop-shadow(0 10px 14px rgba(0,0,0,.4));transform:translateX(-14px) scale(.96)}
@keyframes pvhHero{0%{transform:translateX(-60%)}}
.pvh .hbub{position:absolute;left:14px;right:14px;bottom:calc(var(--sb,0px) + 24px);min-height:132px;box-sizing:border-box;padding:14px 18px 22px;background:#F6EBD0;border-radius:6px;box-shadow:0 12px 26px rgba(0,0,0,.45);animation:pvhBub .4s .25s cubic-bezier(.2,1.4,.4,1) both}
@keyframes pvhBub{0%{transform:translateY(40px);opacity:0}}
.pvh .hbub:before{content:"";position:absolute;left:44px;top:-15px;width:28px;height:18px;background:#F6EBD0;clip-path:polygon(0 100%,30% 0,100% 100%);transition:left .25s}
.pvh .hbub.npc:before{left:auto;right:44px;clip-path:polygon(0 100%,70% 0,100% 100%)}
.pvh .hn{display:block;font:400 21px 'Lilita One',sans-serif}
.pvh .ht{margin:4px 0 0;font:800 15.5px/1.4 Nunito,sans-serif;color:#3A2A12;min-height:44px}
.pvh .hnext{position:absolute;right:16px;bottom:10px;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #6B4E26;opacity:0}
.pvh .hbub.done .hnext{opacity:1;animation:pvhNx .9s ease-in-out infinite}
@keyframes pvhNx{50%{transform:translateY(4px)}}
.pvh.fin .hbub,.pvh.fin .hhero,.pvh.fin .htop{opacity:0;transition:opacity .25s}
.pvh.fin .hbg{background:rgba(18,14,36,.86);transition:background .3s}
.pvh .hend{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:10px;color:#FFF4DC;text-align:center;padding:0 20px}
.pvh .hend>*{transition:opacity .2s}
.pvh .hend small{font:900 11px Nunito,sans-serif;letter-spacing:1.6px;color:#F2BC3E}
.pvh .hend b{font:400 26px 'Lilita One',sans-serif}
.pvh .hpc{padding:8px;background:#FFFDF6;box-shadow:0 14px 28px rgba(0,0,0,.5);animation:pvhPc .7s cubic-bezier(.2,1.4,.4,1) both;transform-origin:50% 50%}
.pvh .hpc svg{display:block}
@keyframes pvhPc{0%{transform:translateY(-80vh) rotate(-30deg)}70%{transform:rotate(4deg)}100%{transform:rotate(-3deg)}}
.pvh .hpc{transform:rotate(-3deg)}
.pvh .hrw{display:flex;gap:8px}.pvh .hrw span{padding:4px 12px;border-radius:99px;background:#F2BC3E;color:#3A2410;font:400 15px 'Lilita One',sans-serif}
.pvh .hok{margin-top:8px;border:0;padding:14px 26px;border-radius:18px;background:#76B85A;color:#fff;font:400 20px 'Lilita One',sans-serif;box-shadow:0 5px 0 #356F2E}
.pvh.bye1 .hbg{background:transparent;transition:background .5s}
/* diario */
.pvdia{overflow-x:hidden;background:#EFE3C6}
.pvdia .head{background:var(--hc)!important}
.pvdia h5{margin:0;font:900 9px Nunito,sans-serif;letter-spacing:1.2px;color:#8A6A44}
.pvdia .L{font-family:'Lilita One',sans-serif;font-weight:400}
.pvdia .dfi{display:flex;gap:14px;padding:16px 16px 0;align-items:flex-start;color:#3A2A12}
.pvdia .dpol{flex:none;width:128px;padding:7px 7px 24px;background:#FFFDF6;box-shadow:0 2px 2px rgba(40,24,10,.3),0 8px 12px rgba(27,23,48,.25);transform:rotate(-4deg);position:relative}
.pvdia .dph{height:118px;overflow:hidden;background:linear-gradient(#8FD0F0,#DDEFF6)}.pvdia .dph svg{display:block;width:150%;height:auto;margin:-4px 0 0 -25%}
.pvdia .dpol span{position:absolute;left:0;right:0;bottom:3px;text-align:center;font:400 14px 'Lilita One',sans-serif;color:var(--hd)}
.pvdia .dpol:before{content:"";position:absolute;left:40px;top:-7px;width:46px;height:14px;background:var(--hc);opacity:.85;transform:rotate(3deg)}
.pvdia .dtx{flex:1;min-width:0}.pvdia .dtx b{display:block;font-size:18px;margin-bottom:6px}
.pvdia .dtx p{margin:0 0 6px;font:700 12.5px/1.38 Nunito,sans-serif}
.pvdia .dtx q{display:block;font:italic 800 13px/1.3 Nunito,sans-serif;color:var(--hd)}
.pvdia .dst{display:flex;gap:8px;padding:14px 14px 0}.pvdia .dst div{flex:1;text-align:center;padding:7px 4px 6px;background:#F7ECD3;border-radius:12px;box-shadow:0 1px 1px rgba(40,24,10,.28),0 4px 7px rgba(27,23,48,.18)}
.pvdia .dst b{display:block;font:400 23px/1 'Lilita One',sans-serif;color:#C9402A}.pvdia .dst small{font:900 9px Nunito;letter-spacing:.9px;color:#6B4E26}
.pvdia .ddr{display:flex;gap:12px;align-items:center;margin:12px 14px 0;padding:10px 12px;border-radius:14px;background:#F7ECD3;color:#3A2A12;box-shadow:0 1px 1px rgba(40,24,10,.28),0 4px 7px rgba(27,23,48,.18)}
.pvdia .ddr .ink{flex:none;width:48px;height:48px;border-radius:12px;background:repeating-linear-gradient(45deg,#3A2A12 0 6px,#4A3A22 6px 12px);color:#F2BC3E;font:400 26px/48px 'Lilita One',sans-serif;text-align:center}
.pvdia .ddr b{display:block;font-size:16px}.pvdia .ddr small{font:700 11.5px Nunito;color:#6B4E26}
.pvdia .dsec{display:flex;justify-content:space-between;align-items:baseline;margin:20px 16px 0;color:#3A2A12}.pvdia .dsec b{font:400 21px 'Lilita One',sans-serif}.pvdia .dsec span{font:900 11px Nunito;color:#6B4E26}
.pvdia .dbar{height:10px;margin:6px 16px 0;border-radius:99px;background:#E2D3AE;overflow:hidden}.pvdia .dbar i{display:block;height:100%;background:var(--hc);border-radius:99px}
.pvdia .dnx{margin:12px 14px 0;padding:10px 12px;border-radius:14px;background:#1F2757;color:#F6EBD0}
.pvdia .dnxh b{display:block;font:400 15px 'Lilita One',sans-serif;color:#F2BC3E}.pvdia .dnxh span{display:block;font:italic 800 13px/1.3 Nunito;margin:2px 0 6px}
.pvdia .drq{display:flex;align-items:center;gap:8px;font:800 12px Nunito;padding:3px 0}.pvdia .drq i{flex:none;width:16px;height:16px;border-radius:5px;border:2px solid #8C93C4;font:400 12px/14px 'Lilita One';text-align:center;font-style:normal;color:#1F2757}
.pvdia .drq.ok i{background:#76B85A;border-color:#76B85A;color:#fff}.pvdia .drq span{flex:1}.pvdia .drq em{font:400 13px 'Lilita One';font-style:normal;color:#F2BC3E}
.pvdia .dgr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px;padding:14px 16px 0}
.pvdia .dpc{position:relative;border:0;padding:6px 6px 8px;background:#FFFDF6;text-align:left;color:#3A2A12;box-shadow:0 1.5px 1.5px rgba(40,24,10,.3),0 6px 9px rgba(27,23,48,.22);font-family:inherit}
.pvdia .dpc:nth-child(odd){transform:rotate(-1.6deg)}.pvdia .dpc:nth-child(even){transform:rotate(1.8deg)}
.pvdia .dpi{aspect-ratio:160/110;overflow:hidden}.pvdia .dpi svg{display:block;width:100%;height:100%}
.pvdia .dpc small{display:block;margin-top:5px;font:900 8.5px Nunito;letter-spacing:.8px;color:#8A6A44}.pvdia .dpc b{display:block;font:400 13.5px/1.1 'Lilita One',sans-serif}
.pvdia .dpc.nu{box-shadow:0 0 0 3px #F2BC3E,0 6px 9px rgba(27,23,48,.22)}
.pvdia .dpc u{position:absolute;right:-6px;top:-9px;text-decoration:none;background:#E8452C;color:#fff;font:400 11px 'Lilita One';padding:2px 8px;border-radius:99px;box-shadow:0 2px 0 #9E2A20}
.pvdia .dpc.lk{background:#EFE3C6}.pvdia .dpc.lk .dpi{background:#D8C9A2;display:flex;align-items:center;justify-content:center;padding:6px;box-sizing:border-box}
.pvdia .dpc.lk .dpi span{font:italic 800 12px/1.25 Nunito;color:#5E4A2A;text-align:center}.pvdia .dpc.lk b{color:#8C7E5C}
.pvdia .dpc.sec{background:#FFF1C2}.pvdia .dpc.lk.sec .dpi{background:#2C2545}.pvdia .dpc.lk.sec .dpi span{color:#F2BC3E;font:400 30px 'Lilita One';font-style:normal}
.pvdia .dsoon{margin:20px 16px;padding:16px;border-radius:14px;border:2.5px dashed #B39463;text-align:center;color:#6B4E26}.pvdia .dsoon b{font-size:18px;color:#3A2A12}.pvdia .dsoon p{margin:4px 0 0;font:700 12px Nunito}
.pvhp{position:fixed;inset:0;z-index:45;background:rgba(27,23,48,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;animation:pvhIn .2s}
.pvhp .round{right:14px;top:calc(var(--st,0px) + 14px)}
.pvhp>small{font:900 10px Nunito;letter-spacing:1.6px;color:#B9BEDA}
.pvhp .hpf{perspective:1200px;width:min(88vw,340px)}
.pvhp .hpin{position:relative;aspect-ratio:160/110;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.3,1.2,.5,1);transform:rotate(-2deg)}
.pvhp .hpin.flip{transform:rotate(1.5deg) rotateY(180deg)}
.pvhp .fr,.pvhp .bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#FFFDF6;padding:7px;box-sizing:border-box;box-shadow:0 14px 28px rgba(0,0,0,.5)}
.pvhp .fr svg{display:block;width:100%;height:100%}
.pvhp .bk{transform:rotateY(180deg);background:#FBF4E2;padding:12px 84px 12px 14px}
.pvhp .bk p{margin:0;font:italic 800 13px/1.35 Nunito,sans-serif;color:#24305E}
.pvhp .bk em{position:absolute;left:14px;bottom:10px;font:italic 900 13px Nunito;color:#24305E}
.pvhp .hps{position:absolute;right:12px;top:12px;width:56px;height:66px;background:#E8452C;outline:2px solid #E8452C;border:3px dotted #FBF4E2;display:flex;align-items:center;justify-content:center}
.pvhp .hps span{font:400 9.5px/1.1 'Lilita One';color:#FFF4DC;text-align:center;padding:2px}
.pvhp .hpb{display:flex;gap:10px}.pvhp .hpb button{border:0;padding:10px 18px;border-radius:99px;font:400 15px 'Lilita One',sans-serif;background:#F6EBD0;color:#3A2A12}.pvhp .hpb .hplay{background:#76B85A;color:#fff}
`;
  document.head.appendChild(s);
}
