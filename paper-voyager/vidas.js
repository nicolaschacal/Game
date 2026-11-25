// ── Vidas ──
// Versión gratis: hasta MAX vidas. Se pierde una al perder una partida (llegar al destino no cuesta nada).
// Se recupera una cada REGEN_MIN minutos hasta llenarse (de 0 a 5 en una hora). Con 0 no se puede salir a jugar.
// Viajero frecuente (suscripción) = vidas ilimitadas.
// Recargas: ver un video (+1, hasta VIDEOS_DIA por día) o llenar todas con monedas (PRECIO_LLENAR).
// ?vidas=N fuerza N vidas (para probar).
export const MAX = 5, REGEN_MIN = 12, PRECIO_LLENAR = 300, VIDEOS_DIA = 5;
const REGEN = REGEN_MIN * 60e3, KEY = 'pv.lives';
const Q = new URLSearchParams(location.search);
let infinito = () => false;
const hoy = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);

function leer() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  if (!s || typeof s.n !== 'number') s = { n: MAX, t: Date.now(), vd: 0, d: hoy() };
  if (s.d !== hoy()) { s.d = hoy(); s.vd = 0; }
  // regeneración: cuenta cuántos períodos pasaron desde t
  if (s.n >= MAX) s.t = Date.now();
  else { const k = Math.floor((Date.now() - s.t) / REGEN); if (k > 0) { s.n = Math.min(MAX, s.n + k); s.t = s.n >= MAX ? Date.now() : s.t + k * REGEN; } }
  return s;
}
function guardar(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} avisar.forEach(f => { try { f(); } catch {} }); }
const avisar = new Set();
if (Q.has('vidas')) { const s = leer(); s.n = Math.max(0, Math.min(MAX, +Q.get('vidas') || 0)); s.t = Date.now(); guardar(s); }

export const Vidas = {
  MAX, REGEN_MIN, PRECIO_LLENAR, VIDEOS_DIA,
  setInfinito(f) { infinito = f; },
  get infinito() { return !!infinito(); },
  get n() { return infinito() ? Infinity : leer().n; },
  puede() { return infinito() || leer().n > 0; },
  // ms que faltan para la próxima vida (0 si están llenas o son ilimitadas)
  proxima() { if (infinito()) return 0; const s = leer(); return s.n >= MAX ? 0 : Math.max(0, REGEN - (Date.now() - s.t)); },
  llenasEn() { if (infinito()) return 0; const s = leer(); return s.n >= MAX ? 0 : Vidas.proxima() + (MAX - s.n - 1) * REGEN; },
  perder() { if (infinito()) return; const s = leer(); if (s.n >= MAX) s.t = Date.now(); s.n = Math.max(0, s.n - 1); guardar(s); },
  sumar(k = 1) { const s = leer(); s.n = Math.min(MAX, s.n + k); if (s.n >= MAX) s.t = Date.now(); guardar(s); },
  llenar() { const s = leer(); s.n = MAX; s.t = Date.now(); guardar(s); },
  videosHoy() { return leer().vd; },
  puedeVideo() { return !infinito() && leer().n < MAX && leer().vd < VIDEOS_DIA; },
  contarVideo() { const s = leer(); s.vd++; guardar(s); },
  onCambio(f) { avisar.add(f); },
};
export const reloj = ms => { const t = Math.ceil(ms / 1000), m = Math.floor(t / 60), s = t % 60; return m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + ':' + String(s).padStart(2, '0'); };
