// Clima real (opcional): sólo se pide ubicación si el jugador lo activa desde el inicio.
// Datos de Open-Meteo (sin clave). Si está lloviendo donde estás, llueve en el juego.
const KEY = 'kanjuu.clima', CACHE = 'kanjuu.clima.dato', TTL = 20 * 60e3;
const Q = new URLSearchParams(location.search);
// Nombres en español de los códigos WMO que devuelve Open-Meteo
const WMO = { 0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado', 45: 'Niebla', 48: 'Niebla',
  51: 'Llovizna', 53: 'Llovizna', 55: 'Llovizna', 56: 'Llovizna helada', 57: 'Llovizna helada', 61: 'Lluvia', 63: 'Lluvia', 65: 'Lluvia fuerte',
  66: 'Lluvia helada', 67: 'Lluvia helada', 71: 'Nieve', 73: 'Nieve', 75: 'Nieve fuerte', 77: 'Granizo fino', 80: 'Chaparrones', 81: 'Chaparrones',
  82: 'Chaparrones fuertes', 85: 'Nevadas', 86: 'Nevadas fuertes', 95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo' };
const llueve = c => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;

const leer = () => { try { return JSON.parse(localStorage.getItem(CACHE)) || null; } catch { return null; } };
let dato = leer();

// ¿El jugador activó el clima real?
export const climaActivo = () => localStorage.getItem(KEY) === '1';

// Estado para mostrar en el inicio: 'off' | 'load' | 'ok' | 'denied' | 'error'
export function climaEstado() {
  if (!climaActivo()) return { estado: 'off' };
  if (!dato) return { estado: 'load' };
  return { estado: 'ok', ...dato };
}

// Lluvia para el motor 3D (se evalúa cada 2 s). ?lluvia fuerza lluvia para probar.
export const lluviaAhora = () => Q.has('lluvia') || (climaActivo() && !!dato?.lluvia);

function pedirUbicacion() {
  return new Promise((ok, no) => {
    if (!navigator.geolocation) return no(new Error('sin-geo'));
    navigator.geolocation.getCurrentPosition(p => ok(p.coords), e => no(e),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60e3 });
  });
}

// Consulta el clima para la posición actual. Devuelve true si salió bien.
export async function actualizarClima() {
  let c;
  try { c = await pedirUbicacion(); }
  catch (e) { if (e?.code === 1) { localStorage.setItem(KEY, '0'); dato = null; return 'denied'; } return 'error'; }
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${c.latitude.toFixed(3)}&longitude=${c.longitude.toFixed(3)}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const r = await fetch(u); if (!r.ok) throw new Error(r.status);
    const j = (await r.json()).current, code = j.weather_code;
    dato = { temp: Math.round(j.temperature_2m), codigo: code, texto: WMO[code] || 'Variable', lluvia: llueve(code), dia: !!j.is_day, t: Date.now() };
    localStorage.setItem(CACHE, JSON.stringify(dato));
    return 'ok';
  } catch { return 'error'; }
}

// Activar / desactivar desde el inicio. Activar pide permiso de ubicación.
export async function alternarClima() {
  if (climaActivo()) { localStorage.setItem(KEY, '0'); dato = null; localStorage.removeItem(CACHE); return 'off'; }
  const r = await actualizarClima();
  if (r === 'ok') { localStorage.setItem(KEY, '1'); return 'on'; }
  return r;
}

// Refresca sólo si ya estaba activado y el dato tiene más de 20 min
export async function refrescarSiHaceFalta() {
  if (!climaActivo()) return;
  if (dato && Date.now() - dato.t < TTL) return;
  await actualizarClima();
}

// Hora que usa el cielo del juego. Sin clima real: siempre de día (12:00).
// Con clima real: de día o de noche según la ubicación del jugador. ?hora=N la fuerza para probar.
export function horaFija() {
  const h = Q.get('hora');
  if (h !== null && !isNaN(+h)) return +h;
  if (!climaActivo() || !dato) return 12;
  return dato.dia ? 12 : 23;
}
