// Viaje libre: viajeros, regiones, pasaportes, tarifas y álbum de selfies.
// Es la única fuente de verdad del progreso de viaje. Guarda con el mismo `store` del juego (claves pv.*),
// así no hay un segundo sistema de guardado. Todo lo que cambia se guarda en el acto (sobrevive a recargas).
import { DESTINOS } from './destinos.js';

export const NW = DESTINOS.length;

// ── Regiones y pasaportes ──
export const REGIONS = {
  am: { id: 'am', name: 'América', pass: 'Pasaporte Verde', color: '#4E9A4A', dark: '#2F6B30', light: '#BFE3A8' },
  eu: { id: 'eu', name: 'Europa', pass: 'Pasaporte Azul', color: '#3E5BA9', dark: '#283E7A', light: '#B9C8EE' },
  af: { id: 'af', name: 'África', pass: 'Pasaporte Naranja', color: '#E07A2B', dark: '#A4521A', light: '#F8CFA4' },
  as: { id: 'as', name: 'Asia', pass: 'Pasaporte Violeta', color: '#7B5CC4', dark: '#523B8E', light: '#D5C6F2' },
  oc: { id: 'oc', name: 'Oceanía', pass: 'Pasaporte Amarillo', color: '#E8B425', dark: '#A87D12', light: '#FBE7A2' },
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
  [-34.90, -56.16, 'am'], [-34.60, -58.38, 'am'], [-54.80, -68.30, 'am', 1], [-27.11, -109.35, 'oc', 1], [-33.87, 151.21, 'oc'],
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
// Una sola regla para todos los viajes:
//   40 de tasa base + 1 moneda cada 35 km
//   + 60 si cruza de región (vuelo internacional) + 30 si el destino es remoto (pocas conexiones)
//   redondeado a 5, mínimo 40. Repetir el destino donde estás es gratis.
// Una ronda completada deja ≈150–200 monedas (y sólo se cobran al llegar): un vecino cuesta media ronda,
// cruzar la región ≈1 ronda y cruzar el océano 2–4 rondas.
// Montevideo → Buenos Aires 45 · Río 95 · Cartagena 185 · Madrid 385 · Kioto → Buenos Aires ≈ 625.
export const FARE = { base: 40, kmPerCoin: 35, intl: 60, remote: 30, min: 40 };
export function fare(from, to) {
  if (from === to) return 0;
  let c = FARE.base + km(from, to) / FARE.kmPerCoin;
  if (regionOf(from) !== regionOf(to)) c += FARE.intl;
  if (GEO[to][3]) c += FARE.remote;
  return Math.max(FARE.min, Math.round(c / 5) * 5);
}

// ── Viajeros ──
// Los tres protagonistas. El que elegís es gratis y define tu ciudad de origen y tu primer pasaporte.
// Los otros dos se compran en la tienda (sección Viajeros). `skin` es el id del arte en runner-art.js (SKINS).
export const TRAVELERS = [
  { id: 'mora', name: 'Mora', home: 41, region: 'am', price: 1200, bio: '¡Hola! Soy Mora, de Buenos Aires. Tengo una libreta llena de mapas dibujados a mano y no hay colectivo que no sepa tomar. ¿Me acompañás a dar la vuelta al mundo?' },
  { id: 'nilo', name: 'Nilo', home: 18, region: 'eu', price: 1200, bio: '¡Hola! Soy Nilo. Salí de Berlín con mi gorra de aviador, mis antiparras y la bufanda roja de la abuela. Me encanta volar en globo y juntar sellos en el pasaporte.' },
  { id: 'ren', name: 'Ren', home: 0, region: 'as', price: 1200, bio: '¡Hola! Soy Ren, de Kioto. Camino entre bambúes desde chico y siempre llevo mi cámara. Quiero sacarme una selfie en cada rincón del planeta.' },
];
export const traveler = id => TRAVELERS.find(t => t.id === id);

// ── Selfies ──
// Tres tomas por destino; se consiguen atrapando la cámara polaroid en la pista (una por partida).
export const SHOTS = [
  { id: 0, name: 'Llegada' },
  { id: 1, name: 'Paseo' },
  { id: 2, name: 'Recuerdo' },
];
export const SELFIE_REWARD = { first: 25, dup: 10, regionCoins: 300 }; // completar la primera toma de todos los destinos de una región: +300 y un revivir (reemplaza el premio de la palabra del día)

// ── Fotografía (sección de la tienda): personaliza cómo se ven los selfies y el álbum ──
// kind: frame (marco de la polaroid) · cover (diseño del álbum) · filter (filtro de la foto) · deco (adorno, se pueden tener varios)
// Los tres primeros (precio 0) vienen de regalo y están puestos de entrada. El arte de cada uno vive en album.js (photoPreview).
export const PHOTO_ITEMS = [
  { id: 'f-clasico', kind: 'frame', name: 'Polaroid clásica', price: 0 },
  { id: 'f-kraft', kind: 'frame', name: 'Papel kraft', price: 150 },
  { id: 'f-washi', kind: 'frame', name: 'Cinta washi', price: 250 },
  { id: 'f-sello', kind: 'frame', name: 'Estampilla', price: 350 },
  { id: 'f-oro', kind: 'frame', name: 'Marco dorado', price: 600 },
  { id: 'a-carton', kind: 'cover', name: 'Cartón de viaje', price: 0 },
  { id: 'a-cuero', kind: 'cover', name: 'Cuero de aviador', price: 400 },
  { id: 'a-mapa', kind: 'cover', name: 'Mapa antiguo', price: 450 },
  { id: 'a-noche', kind: 'cover', name: 'Noche violeta', price: 500 },
  { id: 'x-natural', kind: 'filter', name: 'Natural', price: 0 },
  { id: 'x-sepia', kind: 'filter', name: 'Sepia', price: 200 },
  { id: 'x-atardecer', kind: 'filter', name: 'Atardecer', price: 250 },
  { id: 'x-byn', kind: 'filter', name: 'Blanco y negro', price: 250 },
  { id: 'd-sellos', kind: 'deco', name: 'Sellos de goma', price: 120 },
  { id: 'd-pasajes', kind: 'deco', name: 'Pasajes de avión', price: 150 },
  { id: 'd-stickers', kind: 'deco', name: 'Stickers de papel', price: 180 },
];
export const photoItem = id => PHOTO_ITEMS.find(p => p.id === id);
// Souvenirs (sección Objetos): uno por región, coleccionables; sólo se venden si tenés el pasaporte de esa región.
// Se exhiben en la tapa del álbum.
export const SOUVENIRS = [
  { id: 's-am', country: 'Uruguay', region: 'am', name: 'Mate de calabaza', price: 200 },
  { id: 's-eu', country: 'Francia', region: 'eu', name: 'Torre en miniatura', price: 200 },
  { id: 's-af', country: 'Kenia', region: 'af', name: 'Máscara tallada', price: 200 },
  { id: 's-as', country: 'Japón', region: 'as', name: 'Farolito de papel', price: 200 },
  { id: 's-oc', country: 'Australia', region: 'oc', name: 'Boomerang', price: 200 },
];

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
export function buyPass(r, wallet) {
  if (hasPass(r)) return { ok: false, why: 'own' };
  const p = passPrice(r); if (wallet < p) return { ok: false, why: 'coins', need: p - wallet };
  T.passports.push(r); save(); return { ok: true, price: p };
}
// Estado de un destino visto desde donde estás
export function destState(i, wallet) {
  const r = regionOf(i), cost = fare(T.at, i);
  if (i === T.at) return { st: 'cur', cost: 0, r };
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
  const P = countriesDone(), lap = Math.floor(P / NW), wi = P % NW;
  return { S: Math.min(8, Math.round(wi * 6 / (NW - 1)) + lap * 2), SP: Math.min(16, wi * 10 / (NW - 1) + lap * 3), lap, wi, P };
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
