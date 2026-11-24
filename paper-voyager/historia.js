// Historias de los viajeros: el diario de cada uno (ficha + postales), los capítulos que se ganan viajando con ese personaje
// y la escena de diálogo que los cuenta al llegar. Cada historia es independiente: los personajes no se cruzan.
//
// Cómo avanza: después de cada viaje completado con el personaje (onArrive), se mira SOLO el próximo capítulo.
// Se abre si el viaje terminó en su ciudad y se cumplen sus requisitos (viajes con el personaje, sellos de una región, una ruta).
// Si se cumplen los requisitos lejos de esa ciudad, hay que volver a viajar ahí: la historia empuja a moverse por el mapa.
// Guardado: 'hist.<hero>' = { got: [ids], seen: [ids] } · 'histPend' = { hero, ch } (escena a mostrar al volver al inicio).
// TODO(i18n): los textos de las historias están en español; se traducen cuando el guion esté aprobado.
import { DESTINOS, IDX } from './destinos.js';
import { t as tt } from './i18n.js';
// nombre de una ciudad (clave en español) en el idioma del juego · nombre visible del viajero
const placeOf = p => (p && IDX[p] != null ? DESTINOS[IDX[p]].place : p || '');
const heroName = h => h[0].toUpperCase() + h.slice(1);

const CREAM = '#FFF4DC';
let UID = 0;
// ids propios para cada copia del personaje: con dos copias en la página, <use href="#id"> apuntaría a la otra (oculta)
const uniq = svg => { const u = 'hs' + (++UID) + '_'; return String(svg || '').replace(/\bid="([^"]+)"/g, (m, i) => `id="${u}${i}"`).replace(/\bid='([^']+)'/g, (m, i) => `id='${u}${i}'`).replace(/url\(#([^)]+)\)/g, (m, i) => `url(#${u}${i})`).replace(/href=(["'])#([^"']+)\1/g, (m, q, i) => `href=${q}#${u}${i}${q}`); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Fichas de los ocho viajeros (cada uno con su propio motivo) ──
export const FICHAS = {
  nilo: { home: tt('ficha.nilo.home'), why: tt('ficha.nilo.why'), quote: tt('ficha.nilo.quote'), likes: tt('ficha.nilo.likes'), fears: tt('ficha.nilo.fears'), dream: 'Salto Ángel', dreamHint: tt('ficha.nilo.dreamHint'), color: '#3E5BA9', dark: '#24305E' },
  mora: { home: tt('ficha.mora.home'), why: tt('ficha.mora.why'), quote: tt('ficha.mora.quote'), likes: tt('ficha.mora.likes'), fears: tt('ficha.mora.fears'), dream: 'Reikiavik', dreamHint: tt('ficha.mora.dreamHint'), color: '#4E9A4A', dark: '#2F6B30' },
  sipho: { home: tt('ficha.sipho.home'), why: tt('ficha.sipho.why'), quote: tt('ficha.sipho.quote'), likes: tt('ficha.sipho.likes'), fears: tt('ficha.sipho.fears'), dream: 'Ushuaia', dreamHint: tt('ficha.sipho.dreamHint'), color: '#C98A1E', dark: '#7A4E12' },
  minji: { home: tt('ficha.minji.home'), why: tt('ficha.minji.why'), quote: tt('ficha.minji.quote'), likes: tt('ficha.minji.likes'), fears: tt('ficha.minji.fears'), dream: 'Nueva York', dreamHint: tt('ficha.minji.dreamHint'), color: '#7B5CC4', dark: '#523B8E' },
  tuk: { home: tt('ficha.tuk.home'), why: tt('ficha.tuk.why'), quote: tt('ficha.tuk.quote'), likes: tt('ficha.tuk.likes'), fears: tt('ficha.tuk.fears'), dream: 'Ushuaia', dreamHint: tt('ficha.tuk.dreamHint'), color: '#2F8C8A', dark: '#1F5E5C' },
  layla: { home: tt('ficha.layla.home'), why: tt('ficha.layla.why'), quote: tt('ficha.layla.quote'), likes: tt('ficha.layla.likes'), fears: tt('ficha.layla.fears'), dream: 'Sossusvlei', dreamHint: tt('ficha.layla.dreamHint'), color: '#B8673A', dark: '#7A4024' },
  cal: { home: tt('ficha.cal.home'), why: tt('ficha.cal.why'), quote: tt('ficha.cal.quote'), likes: tt('ficha.cal.likes'), fears: tt('ficha.cal.fears'), dream: 'Kilimanjaro', dreamHint: tt('ficha.cal.dreamHint'), color: '#3F6E9E', dark: '#24486E' },
  anaya: { home: tt('ficha.anaya.home'), why: tt('ficha.anaya.why'), quote: tt('ficha.anaya.quote'), likes: tt('ficha.anaya.likes'), fears: tt('ficha.anaya.fears'), dream: 'Agra', dreamHint: tt('ficha.anaya.dreamHint'), color: '#D9507E', dark: '#9E2F57' },
};

// ── La historia de Nilo: «El cuaderno de Opa» (7 postales + 1 secreta) ──
// req: at = ciudad donde termina el viaje · trips = viajes con Nilo · stamps = {r, n} sellos distintos de una región · route = ruta especial completada con Nilo
const N = 'Nilo', MO = 'Mora', SI = 'Sipho', MI = 'Minji', TU = 'Tuk', LA = 'Layla', AN = 'Anaya', CA = 'Cal';
// ── La historia de Mora: «Las postales de Tomi» (7 postales + 1 secreta). Mora nunca salió de Buenos Aires: sigue las postales sin remitente de su hermano y termina viajando por ella. Cada postal cierra con una pregunta que empuja a la siguiente ──
export const STORIES = {
  nilo: {
    title: tt('hist.nilo.title'),
    chapters: [
      { id: 1, at: 'Berlín', title: tt('hist.nilo.1.title'), hint: tt('hist.nilo.1.hint'), req: {},
        lines: [[N, tt('hist.nilo.1.l1')],
          [N, tt('hist.nilo.1.l2')],
          [N, tt('hist.nilo.1.l3'), 'look', 'duda'],
          [N, tt('hist.nilo.1.l4'), null, 'triste'],
          [N, tt('hist.nilo.1.l5'), 'wave', 'serio']],
        back: tt('hist.nilo.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'París', title: tt('hist.nilo.2.title'), hint: tt('hist.nilo.2.hint'), req: {},
        lines: [[N, tt('hist.nilo.2.l1')],
          [tt('hist.npc.etienne'), tt('hist.nilo.2.l2')],
          [tt('hist.npc.etienne'), tt('hist.nilo.2.l3')],
          [N, tt('hist.nilo.2.l4'), 'up', 'duda'],
          [tt('hist.npc.etienne'), tt('hist.nilo.2.l5')]],
        back: tt('hist.nilo.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Estambul', title: tt('hist.nilo.3.title'), hint: tt('hist.nilo.3.hint'), req: { trips: 6 },
        lines: [[N, tt('hist.nilo.3.l1')],
          [tt('hist.npc.selin'), tt('hist.nilo.3.l2')],
          [N, tt('hist.nilo.3.l3'), null, 'sorpresa'],
          [tt('hist.npc.selin'), tt('hist.nilo.3.l4')],
          [N, tt('hist.nilo.3.l5'), 'look', 'duda']],
        back: tt('hist.nilo.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Marrakech', title: tt('hist.nilo.4.title'), hint: tt('hist.nilo.4.hint'), req: { stamps: { r: 'af', n: 3 } },
        lines: [[N, tt('hist.nilo.4.l1'), 'look'],
          [tt('hist.npc.hassan'), tt('hist.nilo.4.l2')],
          [tt('hist.npc.hassan'), tt('hist.nilo.4.l3')],
          [N, tt('hist.nilo.4.l4')],
          [N, tt('hist.nilo.4.l5'), null, 'duda'],
          [tt('hist.npc.hassan'), tt('hist.nilo.4.l6')]],
        back: tt('hist.nilo.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Río de Janeiro', title: tt('hist.nilo.5.title'), hint: tt('hist.nilo.5.hint'), req: {},
        lines: [[N, tt('hist.nilo.5.l1')],
          [tt('hist.npc.lucia'), tt('hist.nilo.5.l2')],
          [tt('hist.npc.lucia'), tt('hist.nilo.5.l3')],
          [N, tt('hist.nilo.5.l4'), null, 'triste'],
          [tt('hist.npc.lucia'), tt('hist.nilo.5.l5')]],
        back: tt('hist.nilo.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Mitad del Mundo', title: tt('hist.nilo.6.title'), hint: tt('hist.nilo.6.hint'), req: { stamps: { r: 'am', n: 8 }, trips: 18 },
        lines: [[N, tt('hist.nilo.6.l1'), 'side'],
          [N, tt('hist.nilo.6.l2'), null, 'sorpresa'],
          [N, tt('hist.nilo.6.l3')],
          [N, tt('hist.nilo.6.l4'), null, 'duda']],
        back: tt('hist.nilo.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Salto Ángel', title: tt('hist.nilo.7.title'), hint: tt('hist.nilo.7.hint'), req: { trips: 30 },
        lines: [[N, tt('hist.nilo.7.l1'), 'up'],
          [N, tt('hist.nilo.7.l2')],
          [N, tt('hist.nilo.7.l3'), null, 'sorpresa'],
          [N, tt('hist.nilo.7.l4'), null, 'triste'],
          [N, tt('hist.nilo.7.l5'), null, 'triste']],
        back: tt('hist.nilo.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Isla de Pascua', title: tt('hist.nilo.8.title'), hint: tt('hist.nilo.8.hint'), secret: true, req: {},
        lines: [[N, tt('hist.nilo.8.l1')],
          [N, tt('hist.nilo.8.l2')],
          [tt('hist.npc.oma'), tt('hist.nilo.8.l3'), null, 'triste'],
          [N, tt('hist.nilo.8.l4'), 'up', 'sorpresa'],
          [tt('hist.npc.margit'), tt('hist.nilo.8.l5')],
          [tt('hist.npc.margit'), tt('hist.nilo.8.l6')], [N, tt('hist.nilo.8.l7'), 'wave']],
        back: tt('hist.nilo.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'opa' } },
    ],
  },
  mora: {
    title: tt('hist.mora.title'),
    chapters: [
      { id: 1, at: 'Buenos Aires', title: tt('hist.mora.1.title'), hint: tt('hist.mora.1.hint'), req: {},
        lines: [[MO, tt('hist.mora.1.l1'), null, 'triste'],
          [MO, tt('hist.mora.1.l2')],
          [MO, tt('hist.mora.1.l3'), 'look', 'sorpresa'],
          [MO, tt('hist.mora.1.l4')],
          [MO, tt('hist.mora.1.l5'), 'up']],
        back: tt('hist.mora.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Montevideo', title: tt('hist.mora.2.title'), hint: tt('hist.mora.2.hint'), req: {},
        lines: [[MO, tt('hist.mora.2.l1')],
          [tt('hist.npc.ruben'), tt('hist.mora.2.l2')],
          [tt('hist.npc.ruben'), tt('hist.mora.2.l3'), null, 'serio'],
          [MO, tt('hist.mora.2.l4'), 'look', 'serio'],
          [tt('hist.npc.ruben'), tt('hist.mora.2.l5')]],
        back: tt('hist.mora.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Cartagena', title: tt('hist.mora.3.title'), hint: tt('hist.mora.3.hint'), req: { trips: 6 },
        lines: [[MO, tt('hist.mora.3.l1')],
          [tt('hist.npc.carmen'), tt('hist.mora.3.l2')],
          [tt('hist.npc.carmen'), tt('hist.mora.3.l3')],
          [MO, tt('hist.mora.3.l4'), 'look', 'duda'],
          [tt('hist.npc.carmen'), tt('hist.mora.3.l5')]],
        back: tt('hist.mora.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Machu Picchu', title: tt('hist.mora.4.title'), hint: tt('hist.mora.4.hint'), req: { stamps: { r: 'am', n: 5 } },
        lines: [[MO, tt('hist.mora.4.l1'), 'up'],
          [tt('hist.npc.rosa'), tt('hist.mora.4.l2')],
          [tt('hist.npc.rosa'), tt('hist.mora.4.l3')],
          [MO, tt('hist.mora.4.l4'), null, 'duda'],
          [tt('hist.npc.rosa'), tt('hist.mora.4.l5')]],
        back: tt('hist.mora.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Ushuaia', title: tt('hist.mora.5.title'), hint: tt('hist.mora.5.hint'), req: { trips: 14 },
        lines: [[MO, tt('hist.mora.5.l1'), null, 'serio'],
          [tt('hist.npc.anibal'), tt('hist.mora.5.l2')],
          [MO, tt('hist.mora.5.l3')],
          [MO, tt('hist.mora.5.l4'), 'look'],
          [MO, tt('hist.mora.5.l5'), 'up', 'sorpresa']],
        back: tt('hist.mora.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Reikiavik', title: tt('hist.mora.6.title'), hint: tt('hist.mora.6.hint'), req: { stamps: { r: 'eu', n: 4 }, trips: 20 },
        lines: [[MO, tt('hist.mora.6.l1'), null, 'triste'],
          [MO, tt('hist.mora.6.l2'), 'up', 'sorpresa'],
          [tt('hist.npc.tomi'), tt('hist.mora.6.l3')],
          [tt('hist.npc.tomi'), tt('hist.mora.6.l4')],
          [MO, tt('hist.mora.6.l5')]],
        back: tt('hist.mora.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Buenos Aires', title: tt('hist.mora.7.title'), hint: tt('hist.mora.7.hint'), req: { trips: 28 },
        lines: [[MO, tt('hist.mora.7.l1')],
          [tt('hist.npc.mamaMora'), tt('hist.mora.7.l2'), null, 'sorpresa'],
          [tt('hist.npc.tomi'), tt('hist.mora.7.l3')],
          [MO, tt('hist.mora.7.l4'), 'look'],
          [MO, tt('hist.mora.7.l5'), 'wave']],
        back: tt('hist.mora.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Cataratas Victoria', title: tt('hist.mora.8.title'), hint: tt('hist.mora.8.hint'), secret: true, req: {},
        lines: [[MO, tt('hist.mora.8.l1')],
          [MO, tt('hist.mora.8.l2'), 'up'],
          [tt('hist.npc.tomi'), tt('hist.mora.8.l3')],
          [MO, tt('hist.mora.8.l4'), 'wave']],
        back: tt('hist.mora.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'remitente' } },
    ],
  },
  // ── La historia de Sipho: «Las voces del faro». El último farero de Ciudad del Cabo busca las voces de radio del cuaderno de su papá ──
  sipho: {
    title: tt('hist.sipho.title'),
    chapters: [
      { id: 1, at: 'Ciudad del Cabo', title: tt('hist.sipho.1.title'), hint: tt('hist.sipho.1.hint'), req: {},
        lines: [[SI, tt('hist.sipho.1.l1'), null, 'triste'],
          [SI, tt('hist.sipho.1.l2')],
          [SI, tt('hist.sipho.1.l3'), 'look'],
          [SI, tt('hist.sipho.1.l4'), 'up', 'sorpresa'],
          [SI, tt('hist.sipho.1.l5'), null, 'triste']],
        back: tt('hist.sipho.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Zanzíbar', title: tt('hist.sipho.2.title'), hint: tt('hist.sipho.2.hint'), req: {},
        lines: [[SI, tt('hist.sipho.2.l1')],
          [tt('hist.npc.amina'), tt('hist.sipho.2.l2')],
          [tt('hist.npc.amina'), tt('hist.sipho.2.l3')],
          [SI, tt('hist.sipho.2.l4'), 'look', 'duda'],
          [tt('hist.npc.amina'), tt('hist.sipho.2.l5')]],
        back: tt('hist.sipho.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Lisboa', title: tt('hist.sipho.3.title'), hint: tt('hist.sipho.3.hint'), req: { trips: 6 },
        lines: [[SI, tt('hist.sipho.3.l1')],
          [tt('hist.npc.manuel'), tt('hist.sipho.3.l2')],
          [tt('hist.npc.manuel'), tt('hist.sipho.3.l3')],
          [SI, tt('hist.sipho.3.l4'), 'look', 'duda'],
          [tt('hist.npc.manuel'), tt('hist.sipho.3.l5')]],
        back: tt('hist.sipho.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Reikiavik', title: tt('hist.sipho.4.title'), hint: tt('hist.sipho.4.hint'), req: { stamps: { r: 'eu', n: 4 } },
        lines: [[SI, tt('hist.sipho.4.l1')],
          [tt('hist.npc.bergur'), tt('hist.sipho.4.l2')],
          [SI, tt('hist.sipho.4.l3'), 'up', 'triste'],
          [SI, tt('hist.sipho.4.l4'), null, 'triste'],
          [tt('hist.npc.bergur'), tt('hist.sipho.4.l5')]],
        back: tt('hist.sipho.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Busan', title: tt('hist.sipho.5.title'), hint: tt('hist.sipho.5.hint'), req: { trips: 14 },
        lines: [[SI, tt('hist.sipho.5.l1')],
          [tt('hist.npc.jaewon'), tt('hist.sipho.5.l2')],
          [tt('hist.npc.jaewon'), tt('hist.sipho.5.l3'), null, 'sorpresa'],
          [SI, tt('hist.sipho.5.l4'), 'look', 'serio'],
          [tt('hist.npc.jaewon'), tt('hist.sipho.5.l5')]],
        back: tt('hist.sipho.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Sídney', title: tt('hist.sipho.6.title'), hint: tt('hist.sipho.6.hint'), req: { stamps: { r: 'as', n: 4 }, trips: 20 },
        lines: [[SI, tt('hist.sipho.6.l1')],
          [tt('hist.npc.ruth'), tt('hist.sipho.6.l2')],
          [tt('hist.npc.ruth'), tt('hist.sipho.6.l3')],
          [SI, tt('hist.sipho.6.l4'), 'up', 'sorpresa'],
          [tt('hist.npc.ruth'), tt('hist.sipho.6.l5')]],
        back: tt('hist.sipho.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Ushuaia', title: tt('hist.sipho.7.title'), hint: tt('hist.sipho.7.hint'), req: { trips: 28 },
        lines: [[SI, tt('hist.sipho.7.l1')],
          [tt('hist.npc.elena'), tt('hist.sipho.7.l2')],
          [tt('hist.npc.elena'), tt('hist.sipho.7.l3'), null, 'sorpresa'],
          [SI, tt('hist.sipho.7.l4'), 'look', 'duda'],
          [tt('hist.npc.elena'), tt('hist.sipho.7.l5')]],
        back: tt('hist.sipho.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Ciudad del Cabo', title: tt('hist.sipho.8.title'), hint: tt('hist.sipho.8.hint'), secret: true, req: {},
        lines: [[SI, tt('hist.sipho.8.l1'), null, 'triste'],
          [SI, tt('hist.sipho.8.l2')],
          [SI, tt('hist.sipho.8.l3'), 'up'],
          [SI, tt('hist.sipho.8.l4'), 'look', 'triste'],
          [SI, tt('hist.sipho.8.l5'), 'wave']],
        back: tt('hist.sipho.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'faro' } },
    ],
  },
  // ── La historia de Minji: «Pasos perdidos». Se congeló en la final de baile; alguien sube cada baile suyo por el mundo ──
  minji: {
    title: tt('hist.minji.title'),
    chapters: [
      { id: 1, at: 'Seúl', title: tt('hist.minji.1.title'), hint: tt('hist.minji.1.hint'), req: {},
        lines: [[MI, tt('hist.minji.1.l1'), null, 'triste'],
          [MI, tt('hist.minji.1.l2'), null, 'triste'],
          [MI, tt('hist.minji.1.l3'), 'look', 'sorpresa'],
          [MI, tt('hist.minji.1.l4')],
          [MI, tt('hist.minji.1.l5'), 'up', 'duda']],
        back: tt('hist.minji.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Tokio', title: tt('hist.minji.2.title'), hint: tt('hist.minji.2.hint'), req: {},
        lines: [[MI, tt('hist.minji.2.l1')],
          [MI, tt('hist.minji.2.l2'), 'up', 'serio'],
          [MI, tt('hist.minji.2.l3')],
          [MI, tt('hist.minji.2.l4'), 'look'],
          [MI, tt('hist.minji.2.l5'), null, 'sorpresa']],
        back: tt('hist.minji.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Madrid', title: tt('hist.minji.3.title'), hint: tt('hist.minji.3.hint'), req: { trips: 6 },
        lines: [[tt('hist.npc.lola'), tt('hist.minji.3.l1')],
          [tt('hist.npc.lola'), tt('hist.minji.3.l2')],
          [MI, tt('hist.minji.3.l3'), 'look', 'triste'],
          [tt('hist.npc.lola'), tt('hist.minji.3.l4')]],
        back: tt('hist.minji.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'La Habana', title: tt('hist.minji.4.title'), hint: tt('hist.minji.4.hint'), req: { stamps: { r: 'am', n: 4 } },
        lines: [[MI, tt('hist.minji.4.l1')],
          [tt('hist.npc.musico'), tt('hist.minji.4.l2'), null, 'sorpresa'],
          [MI, tt('hist.minji.4.l3'), 'look', 'triste'],
          [MI, tt('hist.minji.4.l4'), 'up']],
        back: tt('hist.minji.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Río de Janeiro', title: tt('hist.minji.5.title'), hint: tt('hist.minji.5.hint'), req: { trips: 14 },
        lines: [[MI, tt('hist.minji.5.l1')],
          [MI, tt('hist.minji.5.l2'), 'look'],
          [MI, tt('hist.minji.5.l3'), null, 'sorpresa'],
          [MI, tt('hist.minji.5.l4'), 'up', 'duda']],
        back: tt('hist.minji.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Buenos Aires', title: tt('hist.minji.6.title'), hint: tt('hist.minji.6.hint'), req: { stamps: { r: 'eu', n: 4 }, trips: 20 },
        lines: [[tt('hist.npc.milonguero'), tt('hist.minji.6.l1')],
          [MI, tt('hist.minji.6.l2')],
          [MI, tt('hist.minji.6.l3')],
          [MI, tt('hist.minji.6.l4'), 'look', 'sorpresa']],
        back: tt('hist.minji.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Nueva York', title: tt('hist.minji.7.title'), hint: tt('hist.minji.7.hint'), req: { trips: 28 },
        lines: [[MI, tt('hist.minji.7.l1'), null, 'triste'],
          [MI, tt('hist.minji.7.l2'), 'up', 'sorpresa'],
          [tt('hist.npc.hana'), tt('hist.minji.7.l3'), null, 'triste'],
          [tt('hist.npc.hana'), tt('hist.minji.7.l4')],
          [MI, tt('hist.minji.7.l5'), 'wave']],
        back: tt('hist.minji.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Seúl', title: tt('hist.minji.8.title'), hint: tt('hist.minji.8.hint'), secret: true, req: {},
        lines: [[MI, tt('hist.minji.8.l1')],
          [tt('hist.npc.hana'), tt('hist.minji.8.l2'), null, 'serio'],
          [MI, tt('hist.minji.8.l3'), 'look', 'serio'],
          [MI, tt('hist.minji.8.l4'), 'wave']],
        back: tt('hist.minji.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'duo' } },
    ],
  },
  // ── La historia de Tuk: «La carta de 1979». Una carta sin entregar de Sólveig a su hermana Ingrid, llevada por el mundo ──
  tuk: {
    title: tt('hist.tuk.title'),
    chapters: [
      { id: 1, at: 'Reikiavik', title: tt('hist.tuk.1.title'), hint: tt('hist.tuk.1.hint'), req: {},
        lines: [[TU, tt('hist.tuk.1.l1')],
          [TU, tt('hist.tuk.1.l2'), null, 'sorpresa'],
          [TU, tt('hist.tuk.1.l3'), 'look'],
          [TU, tt('hist.tuk.1.l4'), null, 'serio'],
          [TU, tt('hist.tuk.1.l5'), 'up']],
        back: tt('hist.tuk.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Lisboa', title: tt('hist.tuk.2.title'), hint: tt('hist.tuk.2.hint'), req: {},
        lines: [[TU, tt('hist.tuk.2.l1')],
          [tt('hist.npc.graca'), tt('hist.tuk.2.l2')],
          [tt('hist.npc.graca'), tt('hist.tuk.2.l3'), null, 'triste'],
          [TU, tt('hist.tuk.2.l4'), 'look', 'triste'],
          [tt('hist.npc.graca'), tt('hist.tuk.2.l5')]],
        back: tt('hist.tuk.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Edimburgo', title: tt('hist.tuk.3.title'), hint: tt('hist.tuk.3.hint'), req: { trips: 6 },
        lines: [[TU, tt('hist.tuk.3.l1')],
          [TU, tt('hist.tuk.3.l2')],
          [TU, tt('hist.tuk.3.l3'), 'look', 'triste'],
          [TU, tt('hist.tuk.3.l4'), 'up'],
          [tt('hist.npc.biblio'), tt('hist.tuk.3.l5')]],
        back: tt('hist.tuk.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Ciudad del Cabo', title: tt('hist.tuk.4.title'), hint: tt('hist.tuk.4.hint'), req: { stamps: { r: 'af', n: 3 } },
        lines: [[TU, tt('hist.tuk.4.l1')],
          [tt('hist.npc.thandi'), tt('hist.tuk.4.l2')],
          [tt('hist.npc.thandi'), tt('hist.tuk.4.l3'), null, 'triste'],
          [TU, tt('hist.tuk.4.l4'), 'look'],
          [tt('hist.npc.thandi'), tt('hist.tuk.4.l5')]],
        back: tt('hist.tuk.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Sídney', title: tt('hist.tuk.5.title'), hint: tt('hist.tuk.5.hint'), req: { trips: 14 },
        lines: [[TU, tt('hist.tuk.5.l1')],
          [tt('hist.npc.reyes'), tt('hist.tuk.5.l2')],
          [TU, tt('hist.tuk.5.l3'), 'look', 'sorpresa'],
          [tt('hist.npc.reyes'), tt('hist.tuk.5.l4')]],
        back: tt('hist.tuk.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Ushuaia', title: tt('hist.tuk.6.title'), hint: tt('hist.tuk.6.hint'), req: { stamps: { r: 'am', n: 4 }, trips: 20 },
        lines: [[TU, tt('hist.tuk.6.l1')],
          [TU, tt('hist.tuk.6.l2'), null, 'serio'],
          [tt('hist.npc.ingrid'), tt('hist.tuk.6.l3')],
          [tt('hist.npc.ingrid'), tt('hist.tuk.6.l4'), null, 'triste'],
          [TU, tt('hist.tuk.6.l5'), 'up', 'sorpresa']],
        back: tt('hist.tuk.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Reikiavik', title: tt('hist.tuk.7.title'), hint: tt('hist.tuk.7.hint'), req: { trips: 28 },
        lines: [[TU, tt('hist.tuk.7.l1')],
          [tt('hist.npc.solveig'), tt('hist.tuk.7.l2'), null, 'sorpresa'],
          [tt('hist.npc.ingrid'), tt('hist.tuk.7.l3'), null, 'triste'],
          [tt('hist.npc.solveig'), tt('hist.tuk.7.l4')],
          [TU, tt('hist.tuk.7.l5'), 'wave']],
        back: tt('hist.tuk.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Lisboa', title: tt('hist.tuk.8.title'), hint: tt('hist.tuk.8.hint'), secret: true, req: {},
        lines: [[TU, tt('hist.tuk.8.l1')],
          [tt('hist.npc.ingrid'), tt('hist.tuk.8.l2')],
          [tt('hist.npc.solveig'), tt('hist.tuk.8.l3')],
          [TU, tt('hist.tuk.8.l4'), 'wave']],
        back: tt('hist.tuk.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'honor' } },
    ],
  },
  // ── La historia de Layla: «El cometa L-18». Sigue la guía de su mamá astrónoma, que dejó de contestar, hasta el cometa que lleva su nombre ──
  layla: {
    title: tt('hist.layla.title'),
    chapters: [
      { id: 1, at: 'Amán', title: tt('hist.layla.1.title'), hint: tt('hist.layla.1.hint'), req: {},
        lines: [[LA, tt('hist.layla.1.l1'), null, 'triste'],
          [LA, tt('hist.layla.1.l2')],
          [LA, tt('hist.layla.1.l3'), 'look', 'duda'],
          [LA, tt('hist.layla.1.l4'), 'up', 'serio']],
        back: tt('hist.layla.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'El Cairo', title: tt('hist.layla.2.title'), hint: tt('hist.layla.2.hint'), req: {},
        lines: [[tt('hist.npc.omar'), tt('hist.layla.2.l1')],
          [tt('hist.npc.omar'), tt('hist.layla.2.l2'), null, 'duda'],
          [LA, tt('hist.layla.2.l3'), 'look', 'duda']],
        back: tt('hist.layla.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Marrakech', title: tt('hist.layla.3.title'), hint: tt('hist.layla.3.hint'), req: { trips: 6 },
        lines: [[tt('hist.npc.youssef'), tt('hist.layla.3.l1')],
          [LA, tt('hist.layla.3.l2')],
          [LA, tt('hist.layla.3.l3'), 'look', 'sorpresa'],
          [LA, tt('hist.layla.3.l4'), 'up', 'sorpresa']],
        back: tt('hist.layla.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Uluru', title: tt('hist.layla.4.title'), hint: tt('hist.layla.4.hint'), req: { stamps: { r: 'af', n: 3 } },
        lines: [[tt('hist.npc.mary'), tt('hist.layla.4.l1'), null, 'triste'],
          [LA, tt('hist.layla.4.l2'), 'look'],
          [tt('hist.npc.mary'), tt('hist.layla.4.l3')]],
        back: tt('hist.layla.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Monument Valley', title: tt('hist.layla.5.title'), hint: tt('hist.layla.5.hint'), req: { trips: 14 },
        lines: [[LA, tt('hist.layla.5.l1'), null, 'sorpresa'],
          [LA, tt('hist.layla.5.l2')],
          [LA, tt('hist.layla.5.l3'), 'look'],
          [LA, tt('hist.layla.5.l4'), 'up', 'duda']],
        back: tt('hist.layla.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Swakopmund', title: tt('hist.layla.6.title'), hint: tt('hist.layla.6.hint'), req: { stamps: { r: 'am', n: 4 }, trips: 20 },
        lines: [[LA, tt('hist.layla.6.l1')],
          [LA, tt('hist.layla.6.l2'), null, 'triste'],
          [tt('hist.npc.recep'), tt('hist.layla.6.l3'), null, 'triste'],
          [LA, tt('hist.layla.6.l4'), 'up', 'serio']],
        back: tt('hist.layla.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Sossusvlei', title: tt('hist.layla.7.title'), hint: tt('hist.layla.7.hint'), req: { trips: 28 },
        lines: [[LA, tt('hist.layla.7.l1')],
          [LA, tt('hist.layla.7.l2'), 'up', 'sorpresa'],
          [LA, tt('hist.layla.7.l3'), 'look', 'sorpresa'],
          [tt('hist.npc.mamaLayla'), tt('hist.layla.7.l4')],
          [tt('hist.npc.mamaLayla'), tt('hist.layla.7.l5')]],
        back: tt('hist.layla.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Petra', title: tt('hist.layla.8.title'), hint: tt('hist.layla.8.hint'), secret: true, req: {},
        lines: [[LA, tt('hist.layla.8.l1')],
          [tt('hist.npc.mamaLayla'), tt('hist.layla.8.l2')],
          [LA, tt('hist.layla.8.l3'), 'look'],
          [LA, tt('hist.layla.8.l4'), 'wave']],
        back: tt('hist.layla.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'l18' } },
    ],
  },
  // ── La historia de Anaya: «El color perdido». Sigue de mano en mano el pañuelo de un color que su abuela vio hace sesenta años ──
  anaya: {
    title: tt('hist.anaya.title'),
    chapters: [
      { id: 1, at: 'Jaipur', title: tt('hist.anaya.1.title'), hint: tt('hist.anaya.1.hint'), req: {},
        lines: [[AN, tt('hist.anaya.1.l1'), null, 'triste'],
          [AN, tt('hist.anaya.1.l2'), null, 'serio'],
          [AN, tt('hist.anaya.1.l3'), 'look'],
          [AN, tt('hist.anaya.1.l4')],
          [AN, tt('hist.anaya.1.l5'), 'up']],
        back: tt('hist.anaya.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Marrakech', title: tt('hist.anaya.2.title'), hint: tt('hist.anaya.2.hint'), req: {},
        lines: [[AN, tt('hist.anaya.2.l1')],
          [tt('hist.npc.yusra'), tt('hist.anaya.2.l2')],
          [AN, tt('hist.anaya.2.l3'), 'look', 'duda'],
          [tt('hist.npc.yusra'), tt('hist.anaya.2.l4')]],
        back: tt('hist.anaya.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Estambul', title: tt('hist.anaya.3.title'), hint: tt('hist.anaya.3.hint'), req: { trips: 6 },
        lines: [[AN, tt('hist.anaya.3.l1')],
          [tt('hist.npc.murat'), tt('hist.anaya.3.l2')],
          [AN, tt('hist.anaya.3.l3'), 'look', 'duda'],
          [tt('hist.npc.murat'), tt('hist.anaya.3.l4')]],
        back: tt('hist.anaya.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Venecia', title: tt('hist.anaya.4.title'), hint: tt('hist.anaya.4.hint'), req: { stamps: { r: 'eu', n: 4 } },
        lines: [[AN, tt('hist.anaya.4.l1')],
          [tt('hist.npc.paolo'), tt('hist.anaya.4.l2'), null, 'triste'],
          [AN, tt('hist.anaya.4.l3'), 'look', 'duda'],
          [tt('hist.npc.paolo'), tt('hist.anaya.4.l4')]],
        back: tt('hist.anaya.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'La Habana', title: tt('hist.anaya.5.title'), hint: tt('hist.anaya.5.hint'), req: { trips: 14 },
        lines: [[AN, tt('hist.anaya.5.l1')],
          [tt('hist.npc.chela'), tt('hist.anaya.5.l2')],
          [tt('hist.npc.chela'), tt('hist.anaya.5.l3')],
          [tt('hist.npc.chela'), tt('hist.anaya.5.l4')]],
        back: tt('hist.anaya.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Ciudad de México', title: tt('hist.anaya.6.title'), hint: tt('hist.anaya.6.hint'), req: { stamps: { r: 'am', n: 4 }, trips: 20 },
        lines: [[AN, tt('hist.anaya.6.l1')],
          [tt('hist.npc.lupe'), tt('hist.anaya.6.l2')],
          [tt('hist.npc.lupe'), tt('hist.anaya.6.l3'), null, 'sorpresa'],
          [AN, tt('hist.anaya.6.l4'), 'look', 'sorpresa'],
          [AN, tt('hist.anaya.6.l5'), 'up']],
        back: tt('hist.anaya.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Jaipur', title: tt('hist.anaya.7.title'), hint: tt('hist.anaya.7.hint'), req: { trips: 28 },
        lines: [[AN, tt('hist.anaya.7.l1'), null, 'triste'],
          [AN, tt('hist.anaya.7.l2')],
          [tt('hist.npc.dadi'), tt('hist.anaya.7.l3'), null, 'sorpresa'],
          [tt('hist.npc.dadi'), tt('hist.anaya.7.l4')],
          [AN, tt('hist.anaya.7.l5'), 'wave']],
        back: tt('hist.anaya.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'Agra', title: tt('hist.anaya.8.title'), hint: tt('hist.anaya.8.hint'), secret: true, req: {},
        lines: [[AN, tt('hist.anaya.8.l1'), 'up'],
          [tt('hist.npc.dadi'), tt('hist.anaya.8.l2')],
          [AN, tt('hist.anaya.8.l3')],
          [tt('hist.npc.dadi'), tt('hist.anaya.8.l4')]],
        back: tt('hist.anaya.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'color' } },
    ],
  },
  // ── La historia de Cal: «Las Polaroid de Eli». Sube la lista de cumbres de su compañero y encuentra Polaroids firmadas «E.» una semana antes ──
  cal: {
    title: tt('hist.cal.title'),
    chapters: [
      { id: 1, at: 'San Francisco', title: tt('hist.cal.1.title'), hint: tt('hist.cal.1.hint'), req: {},
        lines: [[CA, tt('hist.cal.1.l1'), null, 'triste'],
          [CA, tt('hist.cal.1.l2')],
          [CA, tt('hist.cal.1.l3'), 'look'],
          [CA, tt('hist.cal.1.l4'), null, 'triste'],
          [CA, tt('hist.cal.1.l5'), 'up', 'duda']],
        back: tt('hist.cal.1.back'), reward: { coins: 150 } },
      { id: 2, at: 'Edimburgo', title: tt('hist.cal.2.title'), hint: tt('hist.cal.2.hint'), req: {},
        lines: [[CA, tt('hist.cal.2.l1')],
          [CA, tt('hist.cal.2.l2'), 'look', 'sorpresa'],
          [CA, tt('hist.cal.2.l3'), null, 'sorpresa'],
          [CA, tt('hist.cal.2.l4'), 'up', 'duda']],
        back: tt('hist.cal.2.back'), reward: { coins: 200 } },
      { id: 3, at: 'Ciudad del Cabo', title: tt('hist.cal.3.title'), hint: tt('hist.cal.3.hint'), req: { trips: 6 },
        lines: [[CA, tt('hist.cal.3.l1')],
          [tt('hist.npc.telef'), tt('hist.cal.3.l2'), null, 'sorpresa'],
          [CA, tt('hist.cal.3.l3'), 'look', 'sorpresa']],
        back: tt('hist.cal.3.back'), reward: { coins: 250 } },
      { id: 4, at: 'Machu Picchu', title: tt('hist.cal.4.title'), hint: tt('hist.cal.4.hint'), req: { stamps: { r: 'am', n: 4 } },
        lines: [[CA, tt('hist.cal.4.l1')],
          [tt('hist.npc.guiaC'), tt('hist.cal.4.l2')],
          [tt('hist.npc.guiaC'), tt('hist.cal.4.l3')],
          [CA, tt('hist.cal.4.l4'), 'look', 'duda']],
        back: tt('hist.cal.4.back'), reward: { coins: 300, chest: 'plata' } },
      { id: 5, at: 'Río de Janeiro', title: tt('hist.cal.5.title'), hint: tt('hist.cal.5.hint'), req: { trips: 14 },
        lines: [[CA, tt('hist.cal.5.l1'), 'up', 'sorpresa'],
          [tt('hist.npc.eli'), tt('hist.cal.5.l2'), null, 'sorpresa'],
          [CA, tt('hist.cal.5.l3'), null, 'triste'],
          [CA, tt('hist.cal.5.l4'), 'look', 'duda']],
        back: tt('hist.cal.5.back'), reward: { coins: 350 } },
      { id: 6, at: 'Mitad del Mundo', title: tt('hist.cal.6.title'), hint: tt('hist.cal.6.hint'), req: { stamps: { r: 'af', n: 3 }, trips: 20 },
        lines: [[tt('hist.npc.eli'), tt('hist.cal.6.l1')],
          [tt('hist.npc.eli'), tt('hist.cal.6.l2'), null, 'sorpresa'],
          [CA, tt('hist.cal.6.l3'), null, 'triste'],
          [tt('hist.npc.eli'), tt('hist.cal.6.l4')],
          [tt('hist.npc.eli'), tt('hist.cal.6.l5'), null, 'sorpresa']],
        back: tt('hist.cal.6.back'), reward: { coins: 400 } },
      { id: 7, at: 'Kilimanjaro', title: tt('hist.cal.7.title'), hint: tt('hist.cal.7.hint'), req: { trips: 28 },
        lines: [[CA, tt('hist.cal.7.l1'), null, 'serio'],
          [CA, tt('hist.cal.7.l2'), 'up'],
          [tt('hist.npc.eli'), tt('hist.cal.7.l3')],
          [CA, tt('hist.cal.7.l4'), 'look'],
          [CA, tt('hist.cal.7.l5'), 'wave']],
        back: tt('hist.cal.7.back'), reward: { coins: 600, chest: 'oro' } },
      { id: 8, at: 'San Francisco', title: tt('hist.cal.8.title'), hint: tt('hist.cal.8.hint'), secret: true, req: {},
        lines: [[CA, tt('hist.cal.8.l1')],
          [tt('hist.npc.eli'), tt('hist.cal.8.l2')],
          [CA, tt('hist.cal.8.l3'), 'look'],
          [CA, tt('hist.cal.8.l4'), 'wave']],
        back: tt('hist.cal.8.back'), reward: { coins: 1000, chest: 'oro', skin: 'cumbres' } },
    ],
  },
};

// ── Estado ──
let STORE = null;
const st = hero => { const s = STORE?.get('hist.' + hero, null) || {}; return { got: s.got || [], seen: s.seen || [] }; };
const save = (hero, s) => STORE?.set('hist.' + hero, s);
export function initHistoria(store) { STORE = store; }
// ?rico (MODO PRUEBA): todas las historias de todos los personajes abiertas, secretos incluidos (se guarda en sessionStorage, no toca el progreso real)
// Bienvenida de Nilo al primer arranque (después de elegir la ciudad de partida). ?bienvenida la repite.
export function playWelcome(ctx) {
  const L = [['wave'], ['up'], [null], ['look'], [null], ['side'], [null, 'serio'], ['up'], ['wave']];
  return playScene(ctx, 'nilo', 0, { kicker: tt('welcome.kicker'), title: tt('welcome.title'), lines: L.map(([g, m], i) => [N, tt('welcome.' + (i + 1)), g, m]) });
}

export function unlockAll() { for (const hero in STORIES) { const s = st(hero); s.got = [...new Set([...s.got, ...STORIES[hero].chapters.map(c => c.id)])].sort((a, b) => a - b); save(hero, s); } }
export const hasStory = hero => !!STORIES[hero];
export const progress = hero => { const S = STORIES[hero]; if (!S) return null; const s = st(hero); return { got: s.got, total: S.chapters.filter(c => !c.secret).length, unseen: s.got.filter(i => !s.seen.includes(i)).length }; };
export function markSeen(hero) { const s = st(hero); s.seen = [...new Set([...s.seen, ...s.got])]; save(hero, s); }

// Requisitos del capítulo con su avance (para el diario y para decidir)
export function reqs(V, hero, ch) {
  const stamps = (V.heroStamps ? V.heroStamps() : V.T.visits) || {}, trips = Object.values(stamps).reduce((a, n) => a + (n || 0), 0), out = [];
  if (ch.req.route) { // llegar a la ciudad DENTRO de la ruta especial (en curso o ya completada con este viajero)
    const R = V.ROUTES.find(x => x.id === ch.req.route), act = STORE?.get('route', null), ok = (V.heroRoutes ? V.heroRoutes() : []).includes(ch.req.route) || act?.id === ch.req.route;
    out.push({ label: tt('diary.atRoute', { place: placeOf(ch.at), route: R ? tt(R.name) : '' }), sub: R ? R.cities.map(i => DESTINOS[i]?.place).join(' → ') : '', kind: 'at', ok });
  } else if (ch.at) out.push({ label: tt('diary.nextAt', { place: placeOf(ch.at), name: heroName(hero) }), kind: 'at' });
  if (ch.req.trips) out.push({ label: tt('diary.trips', { n: ch.req.trips, name: heroName(hero) }), n: Math.min(trips, ch.req.trips), goal: ch.req.trips, ok: trips >= ch.req.trips });
  if (ch.req.stamps) { const { r, n } = ch.req.stamps, have = Object.keys(stamps).filter(i => stamps[i] > 0 && V.regionOf(+i) === r).length; out.push({ label: tt('diary.stamps', { n, region: V.REGIONS[r].name }), n: Math.min(have, n), goal: n, ok: have >= n }); }
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
// Llegaste a la ciudad del próximo capítulo pero falta algo: qué falta (para avisarlo al volver al inicio)
export function blocked(V, at) {
  V.syncAlbum?.(); const hero = V.heroId?.() || 'nilo', ch = nextChapter(hero);
  if (!ch || !ch.at || IDX[ch.at] !== at) return null;
  const miss = reqs(V, hero, ch).filter(r => r.ok === false); if (!miss.length) return null;
  return { hero, ch: ch.id, miss: miss.map(r => r.label + (r.goal > 1 ? ` (${r.n}/${r.goal})` : '')) };
}
// Aviso sobre cualquier panel (el mapa se abre solo al volver): cinta roja con lo que falta; se va sola o al tocarla
export function showHint(hh, over) {
  css(); const el = document.createElement('div'); el.className = 'pvhh';
  el.innerHTML = `<div class="ribbon"><small>${esc(over)}</small>${hh.miss.map(esc).join('<br>')}</div>`;
  document.body.appendChild(el); const off = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  el.onclick = off; setTimeout(off, 4200);
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

// ── Expresiones de la cara (sólo cejas y boca, sobre el dibujo del personaje): 'duda' | 'triste' | 'sorpresa' | 'serio'.
// Toca el grupo de cara visible (eyI / eyO / eyC): rota y sube las cejas, y cambia la boca (lo que va después de la nariz).
const MOOD = {
  duda: { bL: [-14, -1.2], bR: [7, -.2], boca: ['M55.4 55.4 Q57.8 53.6 60.2 55 Q62.6 56.4 64.8 54.4', 0] },
  triste: { bL: [-18, -.6], bR: [18, -.6], boca: ['M55.2 57 Q60 52.6 64.8 57', 0] },
  sorpresa: { bL: [-4, -3], bR: [4, -3], boca: ['M60 52.2 C62.8 52.2 62.8 58.2 60 58.2 C57.2 58.2 57.2 52.2 60 52.2Z', 1] },
  serio: { bL: [-6, .4], bR: [6, .4], boca: ['M56.2 55.4 Q60 54.6 63.8 55.4', 0] },
};
function applyMood(root, mood) {
  const M = MOOD[mood]; if (!M) return;
  root.querySelectorAll("[data-j='eyI'],[data-j='eyO'],[data-j='eyC'],[data-j='eyM']").forEach(g => {
    if (g.style.display === 'none' || !g.children.length) return;
    const kids = [...g.children], rects = kids.filter(c => c.tagName === 'rect' && /rotate/.test(c.getAttribute('transform') || ''));
    rects.forEach(r => { const m = (r.getAttribute('transform') || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/); if (!m) return;
      const x = +m[1], y = +m[2], [a, dy] = x < 60 ? M.bL : M.bR; r.setAttribute('transform', `translate(${x} ${y + dy}) rotate(${a})`); });
    if (!rects.length) { // sin cejas rectangulares (Tuk): las cejas son los dos últimos trazos
      kids.filter(c => c.tagName === 'path').slice(-2).forEach(pth => { try { const b = pth.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2, [a, dy] = cx < 60 ? M.bL : M.bR;
        pth.setAttribute('transform', `translate(0 ${dy}) rotate(${a} ${cx} ${cy})`); } catch (e) {} });
      return;
    }
    const ni = kids.findIndex(c => c.tagName === 'ellipse' && Math.abs(+c.getAttribute('cy') - 49.6) < .5 && +c.getAttribute('rx') < 2.5); if (ni < 0) return;
    const boca = kids.slice(ni + 1).filter(c => c.tagName !== 'g'); if (!boca.length) return;
    const col = boca[0].getAttribute('fill') && boca[0].getAttribute('fill') !== 'none' ? boca[0].getAttribute('fill') : (boca[0].getAttribute('stroke') || '#2B2236');
    boca.forEach(c => c.remove());
    const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pth.setAttribute('d', M.boca[0]);
    if (M.boca[1]) pth.setAttribute('fill', col); else { pth.setAttribute('fill', 'none'); pth.setAttribute('stroke', col); pth.setAttribute('stroke-width', '2.2'); pth.setAttribute('stroke-linecap', 'round'); }
    g.appendChild(pth);
  });
}

// ── Escena de diálogo (como en los juegos de aventura: personaje grande, globo de papel, tocar para seguir) ──
// ctx: { thumbOf, wornOf, SFX, buzz, confetti }. Devuelve una promesa al cerrarse.
export function playScene(ctx, hero, id, opts = {}) {
  css();
  // opts.lines: una conversación suelta (p. ej. la bienvenida) con el mismo escenario de diálogo, sin postal al final
  const ch = opts.lines ? { id: 0, lines: opts.lines, title: opts.title || '' } : chapterOf(hero, id); if (!ch) return Promise.resolve();
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
    ov.innerHTML = `<div class="hbg"></div><div class="htop"><div class="hdots">${dots}</div><button class="hskip">${tt('diary.skip')}</button></div>
<div class="htag"><div class="ribbon">${opts.lines ? `<small>${esc(opts.kicker || '')}</small>${esc(ch.title)}` : `<small>${esc(S.title.toUpperCase())}</small>${tt('diary.chapter', { n: ch.id })}${ch.secret ? ' · ' + tt('diary.secretCh') : ''} · ${esc(ch.title)}`}</div></div>
<div class="hhero"><div class="hhf">${art}</div></div><div class="hbub"><b class="hn"></b><p class="ht"></p><i class="hnext"></i></div>`;
    document.body.appendChild(ov); document.body.classList.add('pvh-on');
    const hn = ov.querySelector('.hn'), ht = ov.querySelector('.ht'), hh = ov.querySelector('.hhero'), bub = ov.querySelector('.hbub'), dd = [...ov.querySelectorAll('.hdots i')];
    let k = -1, typing = null, full = '';
    // Gestos: respira y parpadea siempre; al hablar mueve la cabeza; en algunas líneas saluda, mira alrededor o se acomoda la gorra; cuando habla otro, lo mira
    const hf = ov.querySelector('.hhf'), UC = new Map(), G = { mood: null, ph: 0, lx: 0, ly: 0, tx: 0, ty: 0, blinkAt: Date.now() + 1500, bk: -1, clip: null, ck: 0, cph: 0, wave: 0, t: 0 };
    const put = f => { if (!f || hf._f === f) return; let u = UC.get(f); if (!u) { u = uniq(f); if (UC.size > 80) UC.clear(); UC.set(f, u); } hf.innerHTML = u; hf._f = f; if (G.mood) applyMood(hf, G.mood); };
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
      k++; if (k >= ch.lines.length) return opts.lines ? close(false) : finale();
      const [who, txt, g, mood] = ch.lines[k], me = who === name || who === N && hero === 'nilo';
      if ((mood || null) !== G.mood) { G.mood = mood || null; const f0 = hf._f; hf._f = null; put(f0); }
      hn.textContent = who; hn.style.color = me ? F.dark : '#A4521A'; bub.classList.toggle('npc', !me); hh.classList.toggle('hdim', !me);
      gesture(me ? g : 'listen'); hh.classList.toggle('talk', me);
      dd.forEach((d, j) => d.classList.toggle('on', j <= k)); full = txt; ht.textContent = ''; bub.classList.remove('done');
      let c = 0; clearInterval(typing); sfx('tap');
      typing = setInterval(() => { c += 2; ht.textContent = full.slice(0, c); if (c >= full.length) { clearInterval(typing); typing = null; bub.classList.add('done'); hh.classList.remove('talk'); } }, 22);
    };
    // Premio permanente de la historia: un traje nuevo que se anuncia en la tarjeta final
    const winSkin = r => { if (!r.skin) return ''; let art = ''; try { art = (ctx.thumbOf?.(hero, r.skin) || '').replace(/(id="|href="#|url\(#)/g, '$1w_'); } catch (e) {} // ids propios: la escena ya tiene un personaje con los mismos ids
      return `<div class="hwin"><div class="hwa">${art}</div><div><em>${tt('hist.win.title')}</em><b>${esc(tt('cast.skin.' + r.skin))}</b><small>${tt('hist.win.skinSub')}</small></div></div>`; };
    const finale = () => {
      clearInterval(typing); ov.classList.add('fin'); sfx('prize'); try { ctx.buzz?.([20, 40, 20]); ctx.confetti?.(); } catch (e) {}
      const r = ch.reward || {}, chips = [r.coins ? `+◉ ${r.coins}` : '', r.chest ? tt('chest.t.' + r.chest) : ''].filter(Boolean).map(x => `<span>${x}</span>`).join('');
      const card = document.createElement('div'); card.className = 'hend';
      card.innerHTML = `<small>${tt('diary.newPostal')} · ${ch.id}/${S.chapters.filter(c => !c.secret).length}${ch.secret ? ' · ' + tt('diary.secret') : ''}</small><div class="hpc">${postalFront(ch, 250)}</div><b>${esc(ch.title)}</b>${opts.replay ? '' : `<div class="hrw">${chips}</div>${winSkin(r)}`}<button class="hok">${opts.replay ? tt('diary.close') : tt('diary.saveIt')}</button>`;
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
    const dream = F.dream ? (done7 ? `<b class="L">${esc(placeOf(F.dream))}</b>` : `<b class="L">${tt('diary.inked')}</b><small>«${esc(F.dreamHint)}»</small>`) : `<b class="L">${tt('diary.untold')}</b>`;
    const nextHTML = next ? `<div class="dnx"><div class="dnxh"><b>${next.secret ? tt('diary.secretPostal') : tt('diary.chOf', { n: next.id, total })}</b><span>«${esc(next.hint)}»</span></div>${reqs(V, hero, next).map(r => `<div class="drq${r.ok ? ' ok' : ''}${r.kind === 'at' && r.ok == null ? ' at' : ''}"><i>${r.ok ? '✓' : ''}</i><span>${esc(r.label)}${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</span>${r.goal ? `<em>${r.n}/${r.goal}</em>` : ''}</div>`).join('')}</div>` : '';
    const cards = S ? S.chapters.filter(c => !c.secret || got.includes(c.id) || done7).map(c => {
      const ok = got.includes(c.id), nu = ok && !s.seen.includes(c.id);
      if (ok) return `<button class="dpc${nu ? ' nu' : ''}${c.secret ? ' sec' : ''}" data-ch="${c.id}"><div class="dpi">${postalFront(c, 150)}</div><small>${c.id} · ${esc(placeOf(c.place || c.at).toUpperCase())}</small><b>${esc(c.title)}</b>${nu ? `<u>${tt('diary.new')}</u>` : ''}</button>`;
      return `<div class="dpc lk${c.secret ? ' sec' : ''}"><div class="dpi"><span>${c.secret ? '?' : `«${esc(c.hint)}»`}</span></div><small>${c.id} · ${c.secret ? tt('diary.secret') : '???'}</small><b>???</b></div>`;
    }).join('') : '';
    root.innerHTML = `<div class="head"><button class="round close" data-x aria-label="${tt('common.close')}">✕</button><small>${tt('diary.of')}</small><h2>${esc(name.toUpperCase())}</h2></div>
<div class="dfi"><div class="dpol"><div class="dph">${art}</div><span>${esc(name)}</span></div><div class="dtx"><h5>${tt('diary.home')}</h5><b class="L">${esc(F.home)}</b><h5>${tt('diary.why')}</h5><p>${esc(F.why)}</p><q>${esc(F.quote)}</q></div></div>
<div class="dst"><div><b>${trips}</b><small>${tt('diary.tripsUp')}</small></div><div><b>${nSt}</b><small>${tt('diary.stampsUp')}</small></div><div><b>${selfies}</b><small>SELFIES</small></div></div>
<div class="ddr"><div class="ink">?</div><div><h5>${tt('diary.dream')}</h5>${dream}</div></div>
${S ? `<div class="dsec"><b>${esc(S.title)}</b><span>${tt('diary.postals', { n: got.filter(i => i <= total).length, total })}</span></div><div class="dbar"><i style="width:${Math.round(got.filter(i => i <= total).length / total * 100)}%"></i></div>${nextHTML}<div class="dgr">${cards}</div>`
      : `<div class="dsoon"><b class="L">${tt('diary.soon')}</b><p>${tt('diary.soonSub')}</p></div>`}`;
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { sfx('tap'); postal(+b.dataset.ch); });
  }
  function postal(id) {
    const ch = chapterOf(hero, id), ov = document.createElement('div'); ov.className = 'pvhp';
    ov.innerHTML = `<button class="round close" aria-label="${tt('common.close')}">✕</button><small>${tt('diary.postal', { n: id })}${ch.secret ? ' · ' + tt('diary.secret') : ''} · ${esc(S.title.toUpperCase())}</small>
<div class="hpf"><div class="hpin"><div class="fr">${postalFront(ch, 300)}</div><div class="bk"><p>${esc(ch.back)}</p><div class="hps"><span>${esc(placeOf(ch.place || ch.at).toUpperCase())}</span></div><em>— N.</em></div></div></div>
<div class="hpb"><button class="hflip">${tt('diary.flip')}</button><button class="hplay">${tt('diary.replay')}</button></div>`;
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
.pvhh{position:fixed;left:0;right:0;top:calc(var(--st,0px) + 130px);z-index:96;height:0;animation:pvhTag .6s cubic-bezier(.2,1.5,.4,1) both}
.pvhh .ribbon{top:0;white-space:normal;max-width:84vw;font-size:18px;line-height:1.15;pointer-events:auto}.pvhh.out{opacity:0;transition:opacity .3s}
.pvh{position:fixed;inset:0;z-index:95;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;animation:pvhIn .35s}
@keyframes pvhIn{0%{opacity:0}}
.pvh .hbg{position:absolute;inset:0;background:linear-gradient(rgba(18,14,36,.3),rgba(18,14,36,.45) 45%,rgba(18,14,36,.9));-webkit-backdrop-filter:blur(7px) saturate(.85);backdrop-filter:blur(7px) saturate(.85)}
.pvh .htop{position:absolute;left:14px;right:14px;top:calc(var(--htop,0px) + 12px);display:flex;justify-content:space-between;align-items:center}
.pvh .hdots{display:flex;gap:5px}.pvh .hdots i{width:20px;height:6px;border-radius:3px;background:#FFF4DC;opacity:.35}.pvh .hdots i.on{opacity:1}
.pvh .hskip{border:0;padding:6px 14px;border-radius:99px;background:rgba(27,23,48,.55);color:#FFF4DC;font:400 13px 'Lilita One',sans-serif;letter-spacing:.5px}
.pvh .htag{position:absolute;left:0;right:0;top:calc(var(--htop,0px) + 56px);height:60px;animation:pvhTag .6s .2s cubic-bezier(.2,1.5,.4,1) both}
.pvh .htag .ribbon{top:0;font-size:18px;white-space:nowrap;line-height:1.1}
@keyframes pvhTag{0%{transform:translateY(-30px) rotate(-6deg);opacity:0}}
.pvh .hhero{position:absolute;left:-30px;bottom:calc(var(--sb,0px) + 70px);width:min(88vw,370px);aspect-ratio:1;overflow:visible;clip-path:inset(-25% -20% 0 -20%);transition:filter .25s,transform .3s;animation:pvhHero .55s cubic-bezier(.2,1.3,.4,1) both;filter:drop-shadow(0 10px 14px rgba(0,0,0,.4))}
.pvh .hhero svg{display:block;width:100%;height:100%}
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
.pvh .hwin{display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;border-radius:18px;background:#FFF6DF;color:#3A2410;border:3px solid #F2BC3E;box-shadow:0 6px 0 rgba(0,0,0,.25);text-align:left;animation:pvhWin .6s .5s cubic-bezier(.2,1.5,.4,1) both;max-width:300px}
.pvh .hwin .hwa{width:64px;height:64px;flex:none;border-radius:14px;background:#F2E3BE}.pvh .hwin .hwa svg{width:100%;height:100%;display:block}
.pvh .hwin em{display:block;font:400 13px 'Lilita One',sans-serif;color:#C0532A;font-style:normal;letter-spacing:.5px}.pvh .hwin b{display:block;font:400 21px 'Lilita One',sans-serif;line-height:1.05}.pvh .hwin small{display:block;font:600 12px Nunito,sans-serif;color:#7A5A3A;letter-spacing:0;text-transform:none}
@keyframes pvhWin{0%{transform:scale(.3);opacity:0}100%{transform:none;opacity:1}}
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
.pvdia .drq.at i{border-radius:50% 50% 50% 0;transform:rotate(-45deg);border-color:#F2BC3E;background:#F2BC3E}.pvdia .drq span small{display:block;font:700 10.5px Nunito;color:#B9BEDA;margin-top:1px}
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
