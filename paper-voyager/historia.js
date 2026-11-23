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
        lines: [[N, 'Volví a Berlín y subí al ático de la abuela. Solo quería las antiparras de Opa.'],
          [N, 'Pero en la caja había algo más: su cuaderno de vuelo. Siete lugares marcados con tinta roja.'],
          [N, 'La última página está arrancada. Y en cada página hay una sola letra, apretada contra el borde: M.'],
          [N, 'Opa desapareció en 1974, volando sobre Sudamérica. Nunca encontraron el avión.'],
          [N, 'La abuela dice que no lo lea. Por eso lo voy a leer entero. Primera parada: París.']],
        back: 'Hoy encontré el cuaderno de Opa. La abuela me pidió que lo deje en la caja. No pude. Primera página: un café de París y una letra, M. Allá voy.', reward: { coins: 150 } },
      { id: 2, at: 'París', title: 'Dos cafés', hint: 'Un café donde siempre sobraba una taza.', req: {},
        lines: [[N, 'La página de París tiene la dirección de un café. Sigue abierto, con las mismas sillas de mimbre.'],
          ['Étienne, el mozo', '¿Esas antiparras? Las conozco. Tu abuelo venía cada martes y pedía dos cafés.'],
          ['Étienne, el mozo', 'Uno se enfriaba siempre. Cuarenta años sirviendo mesas y nunca supe para quién era el segundo.'],
          [N, 'Para M. Tiene que ser para M.'],
          ['Étienne, el mozo', 'Un día dejó una propina enorme y un papel: «Me voy a Estambul. Si viene, dígale que la espero allá».']],
        back: 'El mozo tiene ochenta años y reconoció las antiparras antes que a mí. Opa pedía dos cafés y uno se enfriaba siempre. ¿Quién eras, M.?', reward: { coins: 200 } },
      { id: 3, at: 'Estambul', title: 'La foto de M.', hint: 'Una foto de 1960 que nadie vino a buscar.', req: { trips: 6 },
        lines: [[N, 'Entre las páginas del cuaderno había un recibo: un estudio de fotos en Gálata, 1960.'],
          ['Selin, la fotógrafa', 'Mi abuelo guardaba todos los negativos que nadie retiraba. Mirá este: un piloto y una chica, riéndose.'],
          [N, 'Ella tiene un pañuelo con una M bordada. Y Opa… nunca lo vi sonreír así en ninguna foto de casa.'],
          ['Selin, la fotógrafa', 'Atrás hay algo escrito a lápiz. «Marrakech. El zoco. Esperame.»'],
          [N, 'Opa la seguía por el mundo. O ella lo seguía a él.']],
        back: 'Opa tenía 24 años en la foto. Tiene mi misma sonrisa torcida. Nadie en casa me lo dijo nunca. Ella se reía con los ojos cerrados.', reward: { coins: 250 } },
      { id: 4, at: 'Marrakech', title: 'La carta del zoco', hint: 'Una puerta con un avioncito pintado.', req: { stamps: { r: 'af', n: 3 } },
        lines: [[N, 'Ese puesto de lámparas tiene el avioncito de Opa pintado en la puerta.'],
          ['Hassan, el vendedor', 'Mi padre guardó esta carta sesenta años. Dijo que un piloto alemán vendría a buscarla.'],
          ['Hassan, el vendedor', 'Nunca vino. Vino su nieto. A veces eso alcanza.'],
          [N, '«M.: si me esperás, te lo voy a decir donde el agua cae del cielo.»'],
          [N, 'Opa nunca mandó esta carta. Entonces M. nunca supo adónde ir.'],
          ['Hassan, el vendedor', 'Mi padre contaba que el piloto se fue de acá hacia Río de Janeiro. Que lo esperaba una tormenta.']],
        back: 'La carta nunca le llegó a M. Opa la dejó acá y siguió volando. ¿Ella lo esperó? ¿Y qué le iba a decir donde el agua cae del cielo?', reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Río de Janeiro', title: 'Aterrizaje a ciegas', hint: 'Una tormenta que cerró el cielo tres días.', req: { route: 'andes' },
        lines: [[N, 'La página de Río tiene una sola palabra, escrita tan fuerte que rompió el papel: «tormenta».'],
          ['Dona Lúcia, la controladora', '1961. Un piloto aterrizó a ciegas en plena tormenta. Lo vi yo misma desde la torre.'],
          ['Dona Lúcia, la controladora', 'Gritaba que tenía que llegar a Buenos Aires esa noche, que alguien lo esperaba. Le cerramos el cielo tres días.'],
          [N, 'Tres días tarde. Por eso la carta, por eso los dos cafés. Opa siempre llegaba tarde a M.'],
          ['Dona Lúcia, la controladora', 'Antes de irse preguntó por una cascada en Venezuela. Pero primero, dijo, quería pararse en la mitad del mundo.']],
        back: 'Hoy vi el cielo de Río ponerse negro en un minuto. Entendí que no fue culpa de Opa. Igual duele.', reward: { coins: 350 } },
      { id: 6, at: 'Mitad del Mundo', title: 'Un pie en cada mitad', hint: 'La línea que parte el mundo en dos.', req: { stamps: { r: 'am', n: 8 }, trips: 18 },
        lines: [[N, 'Un pie en el norte, un pie en el sur. La línea pasa justo entre mis botas.'],
          [N, 'La penúltima página dice: «Último intento. Si no está, me quedo con el cielo».'],
          [N, '¿Y si Opa no desapareció en un accidente? ¿Y si eligió no volver?'],
          [N, 'No. Primero el agua que cae del cielo. Después las preguntas.']],
        back: 'Hoy por primera vez tuve miedo de lo que voy a encontrar. Sigo igual. Opa también tenía miedo y volaba igual.', reward: { coins: 400 } },
      { id: 7, at: 'Salto Ángel', title: 'Donde el agua cae del cielo', hint: 'Donde el agua cae desde las nubes.', req: { trips: 30 },
        lines: [[N, 'Salto Ángel. Casi mil metros de agua cayendo desde las nubes. Opa tenía razón: parece que el cielo se rompe.'],
          [N, 'Hay una piedra con el avioncito tallado. Debajo, una lata oxidada.'],
          [N, 'Adentro está la página arrancada. La letra de Opa, temblando:'],
          [N, '«1974. Llegué tarde otra vez: M. ya no estaba. No voy a volver a casa a explicar por qué. Que alguien de los míos llegue a tiempo por mí.»'],
          [N, 'Y abajo, unas coordenadas. No son de acá. Son de una isla en el medio del Pacífico.']],
        back: 'Opa no se cayó. Opa se fue. Y dejó un mapa para que alguien lo siguiera. Ese alguien soy yo.', reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Isla de Pascua', title: 'La isla', hint: 'Unas coordenadas en el medio del océano.', secret: true, req: {},
        lines: [[N, 'Las coordenadas me trajeron frente a los moáis. No hay nadie. Solo un hangar viejo con la puerta abierta.'],
          [N, 'Adentro hay cientos de postales colgadas con broches. Todas firmadas con un avioncito.'],
          ['???', 'Llegaste a tiempo. Yo nunca pude.'],
          [N, '…¿Opa?'],
          ['Albrecht', 'Cincuenta años mandando postales a desconocidos para que se animaran a viajar. La que más esperaba era la tuya.'],
          ['Albrecht', '¿Tomamos un café? Pido dos. Esta vez no se enfría ninguno.']],
        back: 'No le voy a contar a nadie dónde está. Le prometí volver el martes. Con dos cafés.', reward: { coins: 1000, chest: 'oro' } },
    ],
  },
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
  return new Promise(done => {
    const ov = document.createElement('div'); ov.className = 'pvh';
    const dots = ch.lines.map(() => '<i></i>').join('');
    ov.innerHTML = `<div class="hbg"></div><div class="htop"><div class="hdots">${dots}</div><button class="hskip">SALTAR</button></div>
<div class="htag"><small>${esc(S.title.toUpperCase())}</small><b>Capítulo ${ch.id}${ch.secret ? ' · secreto' : ''} · ${esc(ch.title)}</b></div>
<div class="hhero">${art}</div><div class="hbub"><b class="hn"></b><p class="ht"></p><i class="hnext"></i></div>`;
    document.body.appendChild(ov); document.body.classList.add('pvh-on');
    const hn = ov.querySelector('.hn'), ht = ov.querySelector('.ht'), hh = ov.querySelector('.hhero'), bub = ov.querySelector('.hbub'), dd = [...ov.querySelectorAll('.hdots i')];
    let k = -1, typing = null, full = '';
    const show = () => {
      k++; if (k >= ch.lines.length) return finale();
      const [who, txt] = ch.lines[k], me = who === name || who === N && hero === 'nilo';
      hn.textContent = who; hn.style.color = me ? F.dark : '#A4521A'; bub.classList.toggle('npc', !me); hh.classList.toggle('hdim', !me);
      dd.forEach((d, j) => d.classList.toggle('on', j <= k)); full = txt; ht.textContent = ''; bub.classList.remove('done');
      let c = 0; clearInterval(typing); sfx('tap');
      typing = setInterval(() => { c += 2; ht.textContent = full.slice(0, c); if (c >= full.length) { clearInterval(typing); typing = null; bub.classList.add('done'); } }, 22);
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
      if (typing) { clearInterval(typing); typing = null; ht.textContent = full; bub.classList.add('done'); return; }
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
.pvh .hbg{position:absolute;inset:0;background:linear-gradient(rgba(18,14,36,.15),rgba(18,14,36,.35) 45%,rgba(18,14,36,.88))}
.pvh .htop{position:absolute;left:14px;right:14px;top:calc(var(--st,0px) + 14px);display:flex;justify-content:space-between;align-items:center}
.pvh .hdots{display:flex;gap:5px}.pvh .hdots i{width:20px;height:6px;border-radius:3px;background:#FFF4DC;opacity:.35}.pvh .hdots i.on{opacity:1}
.pvh .hskip{border:0;padding:6px 14px;border-radius:99px;background:rgba(27,23,48,.55);color:#FFF4DC;font:400 13px 'Lilita One',sans-serif;letter-spacing:.5px}
.pvh .htag{position:absolute;left:0;right:0;top:calc(var(--st,0px) + 56px);text-align:center;animation:pvhTag .6s .2s cubic-bezier(.2,1.5,.4,1) both}
@keyframes pvhTag{0%{transform:translateY(-30px) rotate(-6deg);opacity:0}}
.pvh .htag small{display:block;font:900 10px Nunito,sans-serif;letter-spacing:1.6px;color:#FFE3B0;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.pvh .htag b{display:inline-block;margin-top:4px;padding:5px 14px 6px;background:#F6EBD0;color:#3A2A12;font:400 17px 'Lilita One',sans-serif;transform:rotate(-1.5deg);box-shadow:0 4px 10px rgba(0,0,0,.3)}
.pvh .hhero{position:absolute;left:-34px;bottom:calc(var(--sb,0px) + 150px);width:min(78vw,330px);aspect-ratio:1;overflow:hidden;clip-path:inset(0 0 22% 0);transition:filter .25s,transform .3s;animation:pvhHero .55s cubic-bezier(.2,1.3,.4,1) both;filter:drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.pvh .hhero svg{display:block;width:100%;height:100%}
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
