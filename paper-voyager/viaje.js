// Viaje libre: viajeros, regiones, pasaportes, tarifas y álbum de selfies.
// Es la única fuente de verdad del progreso de viaje. Guarda con el mismo `store` del juego (claves pv.*),
// así no hay un segundo sistema de guardado. Todo lo que cambia se guarda en el acto (sobrevive a recargas).
import { DESTINOS, IDX } from './destinos.js';
import { t as tt } from './i18n.js';

export const NW = DESTINOS.length;
export const NW0 = 46; // destinos de la vuelta al mundo original: el mapa los une con la ruta punteada y la dificultad sube a lo largo de ellos (las ciudades nuevas se suman al final)

// ── Regiones y pasaportes ──
export const REGIONS = {
  am: { id: 'am', name: tt('region.am'), pass: tt('region.am.pass'), color: '#4E9A4A', dark: '#2F6B30', light: '#BFE3A8' },
  eu: { id: 'eu', name: tt('region.eu'), pass: tt('region.eu.pass'), color: '#3E5BA9', dark: '#283E7A', light: '#B9C8EE' },
  af: { id: 'af', name: tt('region.af'), pass: tt('region.af.pass'), color: '#E07A2B', dark: '#A4521A', light: '#F8CFA4' },
  as: { id: 'as', name: tt('region.as'), pass: tt('region.as.pass'), color: '#7B5CC4', dark: '#523B8E', light: '#D5C6F2' },
  oc: { id: 'oc', name: tt('region.oc'), pass: tt('region.oc.pass'), color: '#E8B425', dark: '#A87D12', light: '#FBE7A2' },
};
export const REGION_ORDER = ['am', 'eu', 'af', 'as', 'oc'];

// Coordenadas reales (lat, lon) y región de cada destino, en el mismo orden que DESTINOS.
// remote: lugares con pocas conexiones aéreas (islas o confines), que pagan una tasa extra.
const GEO = [
  [35.01, 135.77, 'as'], [35.68, 139.69, 'as'], [37.57, 126.98, 'as'], [39.90, 116.40, 'as'], [31.23, 121.47, 'as'],
  [13.76, 100.50, 'as'], [3.14, 101.69, 'as'], [-8.34, 115.09, 'as', 1], [27.18, 78.01, 'as'], [25.20, 55.27, 'as'],
  [-20.25, 44.42, 'af', 1], [-3.07, 37.35, 'af'], [30.33, 35.44, 'as'], [30.04, 31.24, 'af'], [41.01, 28.98, 'eu'],
  [37.98, 23.73, 'eu'], [55.76, 37.62, 'eu'], [47.50, 19.04, 'eu'], [52.52, 13.40, 'eu'], [45.44, 12.32, 'eu'],
  [41.90, 12.50, 'eu'], [43.72, 10.40, 'eu'], [41.39, 2.17, 'eu'], [31.63, -7.99, 'af'], [38.72, -9.14, 'eu'],
  [40.42, -3.70, 'eu'], [48.86, 2.35, 'eu'], [50.85, 4.35, 'eu'], [51.51, -0.13, 'eu'], [55.95, -3.19, 'eu'],
  [64.15, -21.94, 'eu', 1], [40.71, -74.01, 'am'], [36.99, -110.10, 'am'], [20.68, -88.57, 'am'], [23.11, -82.37, 'am'],
  [10.39, -75.51, 'am'], [5.97, -62.54, 'am', 1], [0, -78.46, 'am'], [-13.16, -72.55, 'am'], [-22.91, -43.17, 'am'],
  [-34.90, -56.16, 'am'], [-34.60, -58.38, 'am'], [-54.80, -68.30, 'am', 1], [-27.11, -109.35, 'oc', 1], [-33.87, 151.21, 'oc'], [34.69, 135.50, 'as'],
  // ciudades nuevas (índices 46 en adelante)
  [21.03, 105.85, 'as'], [20.95, 107.08, 'as'], [15.88, 108.33, 'as'], [13.36, 103.86, 'as'], [18.79, 98.99, 'as'],
  [8.09, 98.91, 'as'], [7.74, 98.77, 'as', 1], [1.35, 103.82, 'as'], [38.64, 34.83, 'eu'], [59.93, 30.34, 'eu'],
  [-37.81, 144.96, 'oc'], [-25.34, 131.04, 'oc', 1], [-1.29, 36.82, 'af'], [-6.16, 39.2, 'af', 1], [-33.92, 18.42, 'af'],
  [35.17, -5.27, 'af'], [37.77, -122.42, 'am'], [19.43, -99.13, 'am'], [52.37, 4.9, 'eu'],
];
if (GEO.length !== NW) console.warn('viaje.js: GEO no coincide con DESTINOS', GEO.length, NW);
export const regionOf = i => GEO[i]?.[2] || 'eu';
export const destsOf = r => DESTINOS.map((_, i) => i).filter(i => regionOf(i) === r);

// Precio de un pasaporte: base + un tanto por cada destino que abre (más destinos, más vale). Redondeado a 50.
export const passPrice = r => Math.round((500 + 60 * destsOf(r).length) / 50) * 50;

// ── Tarifas ──
// km reales por la superficie de la Tierra (gran círculo)
export function km(a, b) {
  const [la1, lo1] = GEO[a], [la2, lo2] = GEO[b], R = 6371, d = Math.PI / 180;
  const h = Math.sin((la2 - la1) * d / 2) ** 2 + Math.cos(la1 * d) * Math.cos(la2 * d) * Math.sin((lo2 - lo1) * d / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Una sola regla para todos los viajes: precio proporcional a la distancia real (gran círculo) entre donde estás y el destino.
//   monedas = km × 0.0915, redondeado a 10, mínimo 60. Repetir el destino donde estás es gratis.
// Calibrado para que Montevideo → Tokio (18 575 km) cueste 1700. Vecinos ≈ 60–150 · mismo continente ≈ 150–600 · cruzar el océano ≈ 800–1800.
export const FARE = { perKm: 0.0915, round: 10, min: 60 };
export function fare(from, to) {
  if (from === to) return 0;
  return Math.max(FARE.min, Math.round(km(from, to) * FARE.perKm / FARE.round) * FARE.round);
}

// ── Viajeros ──
// Los tres protagonistas. El que elegís es gratis y define tu ciudad de origen y tu primer pasaporte.
// Los otros dos se compran en la tienda (sección Viajeros). `skin` es el id del arte en runner-art.js (SKINS).
export const TRAVELERS = [
  { id: 'mora', name: 'Mora', home: 41, region: 'am', price: 1200, bio: tt('traveler.mora.bio') },
  { id: 'nilo', name: 'Nilo', home: 18, region: 'eu', price: 1200, bio: tt('traveler.nilo.bio') },
  { id: 'ren', name: 'Ren', home: 0, region: 'as', price: 1200, bio: tt('traveler.ren.bio') },
];
export const traveler = id => TRAVELERS.find(t => t.id === id);

// ── Selfies ──
// Tres tomas por destino; se consiguen atrapando la cámara polaroid en la pista (una por partida).
export const SHOTS = [
  { id: 0, name: tt('shot.0') },
  { id: 1, name: tt('shot.1') },
  { id: 2, name: tt('shot.2') },
];
export const SELFIE_REWARD = { first: 25, dup: 10, regionCoins: 300 }; // completar la primera toma de todos los destinos de una región: +300 y un revivir (reemplaza el premio de la palabra del día)

// ── Fotografía (sección de la tienda): personaliza cómo se ven los selfies y el álbum ──
// kind: frame (marco de la polaroid) · cover (diseño del álbum) · filter (filtro de la foto) · deco (adorno, se pueden tener varios)
// Los tres primeros (precio 0) vienen de regalo y están puestos de entrada. El arte de cada uno vive en album.js (photoPreview).
export const PHOTO_ITEMS = [
  { id: 'f-clasico', kind: 'frame', name: tt('photo.f-clasico'), price: 0 },
  { id: 'f-kraft', kind: 'frame', name: tt('photo.f-kraft'), price: 150 },
  { id: 'f-washi', kind: 'frame', name: tt('photo.f-washi'), price: 250 },
  { id: 'f-sello', kind: 'frame', name: tt('photo.f-sello'), price: 350 },
  { id: 'f-oro', kind: 'frame', name: tt('photo.f-oro'), price: 600 },
  { id: 'a-carton', kind: 'cover', name: tt('photo.a-carton'), price: 0 },
  { id: 'a-cuero', kind: 'cover', name: tt('photo.a-cuero'), price: 400 },
  { id: 'a-mapa', kind: 'cover', name: tt('photo.a-mapa'), price: 450 },
  { id: 'a-noche', kind: 'cover', name: tt('photo.a-noche'), price: 500 },
  { id: 'x-natural', kind: 'filter', name: tt('photo.x-natural'), price: 0 },
  { id: 'x-sepia', kind: 'filter', name: tt('photo.x-sepia'), price: 200 },
  { id: 'x-atardecer', kind: 'filter', name: tt('photo.x-atardecer'), price: 250 },
  { id: 'x-byn', kind: 'filter', name: tt('photo.x-byn'), price: 250 },
  { id: 'd-sellos', kind: 'deco', name: tt('photo.d-sellos'), price: 120 },
  { id: 'd-pasajes', kind: 'deco', name: tt('photo.d-pasajes'), price: 150 },
  { id: 'd-stickers', kind: 'deco', name: tt('photo.d-stickers'), price: 180 },
];
export const photoItem = id => PHOTO_ITEMS.find(p => p.id === id);
// Souvenirs (sección Objetos): uno por región, coleccionables; sólo se venden si tenés el pasaporte de esa región.
// Se exhiben en la tapa del álbum.
export const SOUVENIRS = [
  { id: 's-am', country: tt('country.s-am'), region: 'am', name: tt('souvenir.s-am'), price: 200 },
  { id: 's-eu', country: tt('country.s-eu'), region: 'eu', name: tt('souvenir.s-eu'), price: 200 },
  { id: 's-af', country: tt('country.s-af'), region: 'af', name: tt('souvenir.s-af'), price: 200 },
  { id: 's-as', country: tt('country.s-as'), region: 'as', name: tt('souvenir.s-as'), price: 200 },
  { id: 's-oc', country: tt('country.s-oc'), region: 'oc', name: tt('souvenir.s-oc'), price: 200 },
];

// ── Rutas especiales ──
// Ciudades que se juegan seguidas. Se ofrecen en la tarjeta de cada ciudad de la ruta (mapa). Al elegir una, la ruta arranca ahí
// y sigue con las demás en su orden, rotando (golden desde Kioto → Kioto, Osaka, Tokio). Se guardan en store 'route' = { id, i, seq }
// (seq = ciudades en el orden del recorrido, i = posición actual dentro de seq).
// Perder una partida (game over sin revivir) o viajar a otro lado la cancela. Completarla sin perder da el premio y se anota en store 'routesDone'.
//
// Cómo agregar una ruta: sumá un objeto a ROUTES con
//   id:     identificador corto (se guarda en el progreso; no lo cambies después)
//   name:   clave i18n del nombre (agregala en los 7 JSON de paper-voyager/i18n/, p. ej. "route.golden")
//   cities: nombres de las ciudades tal como figuran en DESTINOS (en español, en el orden de la ruta)
// Y su premio en ROUTE_REWARDS con la misma id.
// Una ruta sólo se ofrece si TODAS sus ciudades existen en DESTINOS: si falta alguna, queda fuera sin romper nada.
export const ROUTES = [
  { id: 'golden', name: 'route.golden', cities: ['Tokio', 'Kioto', 'Osaka'] },
  { id: 'classic', name: 'route.classic', cities: ['Londres', 'París', 'Roma'] },
  { id: 'andes', name: 'route.andes', cities: ['Cartagena', 'Machu Picchu', 'Río de Janeiro'] },
  { id: 'thai', name: 'route.thai', cities: ['Bangkok', 'Krabi', 'Phi Phi'] },
  // Una ciudad puede estar en varias rutas. Las que tienen alguna ciudad que todavía no existe en DESTINOS quedan inactivas solas.
  { id: 'indochina', name: 'route.indochina', cities: ['Bangkok', 'Chiang Mai', 'Siem Reap', 'Hanói'] },
  { id: 'vietnam', name: 'route.vietnam', cities: ['Hanói', 'Ha Long', 'Hoi An', 'Ho Chi Minh'] },
  { id: 'malaca', name: 'route.malaca', cities: ['Singapur', 'Kuala Lumpur', 'Bali'] },
  { id: 'china', name: 'route.china', cities: ['Pekín', "Xi'an", 'Guilin', 'Shanghái', 'Hong Kong'] },
  { id: 'corea', name: 'route.corea', cities: ['Seúl', 'Busan', 'Tokio'] },
  { id: 'india', name: 'route.india', cities: ['Delhi', 'Agra', 'Jaipur'] },
  { id: 'seda', name: 'route.seda', cities: ['Estambul', 'Capadocia', 'Samarcanda'] },
  { id: 'transiberiano', name: 'route.transiberiano', cities: ['Moscú', 'San Petersburgo', 'Lago Baikal', 'Vladivostok'] },
  { id: 'australia', name: 'route.australia', cities: ['Sídney', 'Melbourne', 'Uluru'] },
  { id: 'nz', name: 'route.nz', cities: ['Sídney', 'Auckland', 'Queenstown'] },
  { id: 'safari', name: 'route.safari', cities: ['Nairobi', 'Kilimanjaro', 'Zanzíbar'] },
  { id: 'surafrica', name: 'route.surafrica', cities: ['Ciudad del Cabo', 'Cataratas Victoria', 'Sossusvlei'] },
  { id: 'egipto', name: 'route.egipto', cities: ['El Cairo', 'Luxor', 'Petra'] },
  { id: 'marruecos', name: 'route.marruecos', cities: ['Marrakech', 'Fez', 'Chefchaouen', 'Merzouga'] },
  { id: 'oeste', name: 'route.oeste', cities: ['San Francisco', 'Los Ángeles', 'Las Vegas', 'Gran Cañón', 'Monument Valley'] },
  { id: 'este', name: 'route.este', cities: ['Nueva York', 'Washington', 'Niágara'] },
  { id: 'mexico', name: 'route.mexico', cities: ['Ciudad de México', 'Chichén Itzá', 'La Habana'] },
  { id: 'benelux', name: 'route.benelux', cities: ['París', 'Bruselas', 'Ámsterdam'] },
].map(r => ({ ...r, cities: r.cities.map(n => IDX[n]) })).filter(r => r.cities.every(c => c != null));
// PROVISORIO: el premio de cada ruta son monedas: 150 por ciudad. El dueño definirá trajes/souvenirs exclusivos después (agregar acá, p. ej. { coins, suit, souvenir }).
export const ROUTE_REWARDS = Object.fromEntries(ROUTES.map(r => [r.id, { coins: 150 * r.cities.length }]));
// Todas las rutas activas que pasan por la ciudad i (en el orden de ROUTES). routeOf: sólo la primera (compatibilidad).
export const routesOf = i => ROUTES.filter(r => r.cities.includes(i));
export const routeOf = i => routesOf(i)[0] || null;
// Orden del recorrido que arranca en la ciudad `start` (la elegida en el mapa): las demás siguen en su orden, rotando.
export const routeSeq = (r, start) => { const k = Math.max(0, r.cities.indexOf(start)); return [...r.cities.slice(k), ...r.cities.slice(0, k)]; };
export const routeRegions = r => [...new Set(r.cities.map(regionOf))];
export const routesDone = () => store.get('routesDone', []);
export function routeComplete(id) { const d = routesDone(); if (!d.includes(id)) { d.push(id); store.set('routesDone', d); } return d.length; }
// Avanza al jugador a la siguiente ciudad de la ruta sin cobrar tarifa (la ruta ya está paga con el primer tramo).
export function hop(i) { T.at = i; save(); store.set('world', i); }

// ── Vuelo demorado ──
// A veces (DELAY_P) al elegir destino sale por otra ruta: un solo medio de punta a punta que paga más.
export const DELAY_P = 0.12, DELAY_MIN_WORLD = 6; // nunca en los mundos 1-5
export const DELAY_MULT = 1.5; // PROVISORIO: multiplicador de monedas al cobrar el viaje

// ── Aduana por color ──
// El pasaporte equipado (store 'passEq') abre las casillas de aduana de su color. Cada destino tiene dos colores de aduana: el de su región y otro fijo.
export const passEq = () => { const e = store.get('passEq', null); return e && hasPass(e) ? e : null; };
export function setPassEq(r) { store.set('passEq', hasPass(r) ? r : null); }
export const customsColors = i => { const r = regionOf(i), o = REGION_ORDER.filter(x => x !== r); return [r, o[(i * 7 + 3) % o.length]]; };
export const CUSTOMS_BONUS = 3; // monedas por pasar una casilla de aduana con el pasaporte correcto

// ── Estado guardado ──
// pv.trip = { v, traveler, at, passports:[], trips, visits:{i:n}, fresh }
// pv.album = { [destIdx]: [toma, …] } · pv.albumDone = [región, …] · pv.photo = { owned:[], frame, cover, filter, deco }
let store = null;
export let T = null;
export let ALBUM = {};
export let PHOTO = null;

export function initViaje(st) {
  store = st;
  T = store.get('trip', null);
  if (!T || !T.v) T = migrate();
  if (T.migrated && T.base == null) { T.base = Math.min(T.trips || 0, NW); store.set('trip', T); } // migradas antes de que la dificultad contara destinos distintos
  ALBUM = store.get('album', {});
  PHOTO = { owned: ['f-clasico', 'a-carton', 'x-natural'], frame: 'f-clasico', cover: 'a-carton', filter: 'x-natural', deco: [], ...store.get('photo', {}) };
  return T;
}
const save = () => store.set('trip', T);
export const saveAlbum = () => store.set('album', ALBUM);
export const savePhoto = () => store.set('photo', PHOTO);

// Partidas anteriores a esta versión: el jugador ya venía jugando como Nilo.
// Conserva monedas, personajes e ítems (no se tocan) y le abre todas las regiones de los destinos que ya alcanzó,
// para que nadie pierda acceso a donde ya llegó. No vuelve a pedir que elija viajero.
function migrate() {
  const world = store.get('world', null), maxWorld = store.get('maxWorld', null);
  const veteran = world != null || maxWorld != null || store.get('wallet', null) != null || store.get('best', null) != null;
  if (!veteran) return { v: 1, traveler: null, at: null, passports: [], trips: 0, visits: {}, fresh: true };
  const mw = Math.max(maxWorld || 0, world || 0), passports = new Set(['eu']);
  for (let i = 0; i <= Math.min(mw, NW - 1); i++) passports.add(regionOf(i));
  if (mw >= NW) REGION_ORDER.forEach(r => passports.add(r));
  const t = { v: 1, traveler: 'nilo', at: (world || 0) % NW, passports: [...passports], trips: mw, visits: {}, migrated: true, base: Math.min(mw, NW) };
  store.set('trip', t);
  return t;
}

export const needsPick = () => !T.traveler;
// Elección inicial (una sola vez): fija viajero, origen y primer pasaporte.
export function pickTraveler(id) {
  const tr = traveler(id); if (!tr) return;
  T.traveler = id; T.at = tr.home; T.fresh = false;
  if (!T.passports.includes(tr.region)) T.passports.push(tr.region);
  save(); store.set('world', tr.home);
  const owned = store.get('owned', null) || []; if (!owned.includes(id)) { owned.push(id); store.set('owned', owned); }
  store.set('skin', id);
}
// Primer arranque: Nilo por defecto; el jugador elige cualquier ciudad como origen (sin costo) y recibe el pasaporte de esa región.
export function pickStart(i) {
  T.traveler = 'nilo'; T.at = i; T.passports = [regionOf(i)]; T.fresh = false;
  save(); store.set('world', i);
  const owned = store.get('owned', null) || []; if (!owned.includes('nilo')) { owned.push('nilo'); store.set('owned', owned); }
  store.set('skin', 'nilo');
}
export const hasPass = r => T.passports.includes(r);
// ?rico (modo prueba, lo activa index.html; nunca en la app nativa): viajar a cualquier destino del mapa sin costo ni pasaporte
let rico = false;
export const setRico = v => { rico = !!v; };
export const isRico = () => rico;
export function buyPass(r, wallet) {
  if (hasPass(r)) return { ok: false, why: 'own' };
  const p = passPrice(r); if (wallet < p) return { ok: false, why: 'coins', need: p - wallet };
  T.passports.push(r); save(); return { ok: true, price: p };
}
// Estado de un destino visto desde donde estás
export function destState(i, wallet) {
  const r = regionOf(i), cost = fare(T.at, i);
  if (i === T.at) return { st: 'cur', cost: 0, r };
  if (rico) return { st: 'ok', cost: 0, r };
  if (!hasPass(r)) return { st: 'nopass', cost, r };
  if (wallet < cost) return { st: 'nocoins', cost, r };
  return { st: 'ok', cost, r };
}
// Viajar: cobra (lo hace quien llama, con su monedero) y mueve al jugador. Devuelve el costo o null si no se puede.
export function travel(i, wallet) {
  const s = destState(i, wallet); if (s.st !== 'ok') return null;
  T.at = i; save(); store.set('world', i); return s.cost;
}
// Ronda completada en el destino actual
export function roundDone() { T.trips++; T.visits[T.at] = (T.visits[T.at] || 0) + 1; save(); }

// Dificultad según cuántos destinos DISTINTOS completaste (sin importar cuáles ni en qué orden; repetir uno no la sube).
// Así empezar en Buenos Aires o Kioto es igual de amable. Partidas migradas parten de los destinos que ya habían alcanzado.
// Misma curva que antes: sube a lo largo de los NW destinos; con todos completados queda en el máximo de la primera vuelta.
export const countriesDone = () => Math.max(Object.keys(T.visits || {}).length, T.base || 0);
export function difficulty() {
  const P = countriesDone(), lap = Math.floor(P / NW0), wi = P % NW0;
  return { S: Math.min(8, Math.round(wi * 6 / (NW0 - 1)) + lap * 2), SP: Math.min(16, wi * 10 / (NW0 - 1) + lap * 3), lap, wi, P };
}

// Selfie atrapada en el destino actual. Devuelve { shot, nuevo, coins, region } (region si se completó una región).
export function addSelfie(i) {
  const got = ALBUM[i] || (ALBUM[i] = []);
  const missing = SHOTS.map(s => s.id).filter(s => !got.includes(s));
  let res;
  if (missing.length) { got.push(missing[0]); res = { shot: missing[0], nuevo: true, coins: SELFIE_REWARD.first }; }
  else res = { shot: Math.floor(Math.random() * SHOTS.length), nuevo: false, coins: SELFIE_REWARD.dup };
  saveAlbum();
  const r = regionOf(i), done = store.get('albumDone', []);
  if (res.nuevo && !done.includes(r) && destsOf(r).every(d => (ALBUM[d] || []).length)) { done.push(r); store.set('albumDone', done); res.region = r; }
  return res;
}
export const selfieCount = () => Object.values(ALBUM).reduce((a, s) => a + s.length, 0);
export const selfieTotal = () => NW * SHOTS.length;
