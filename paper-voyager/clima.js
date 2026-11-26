// Día / noche: un interruptor en el inicio. Sin ubicación ni servicios externos (nada sale del teléfono).
// ?hora=N fuerza la hora para probar · ?lluvia fuerza lluvia.
const KEY = 'pv.noche';
const Q = new URLSearchParams(location.search);
try { localStorage.removeItem('pv.clima'); localStorage.removeItem('pv.clima.dato'); } catch {} // restos del clima real

export const climaActivo = () => localStorage.getItem(KEY) === '1'; // true = modo noche
export function climaEstado() { return { estado: climaActivo() ? 'noche' : 'dia' }; }
export const lluviaAhora = () => Q.has('lluvia');
export async function alternarClima() { const n = !climaActivo(); localStorage.setItem(KEY, n ? '1' : '0'); return n ? 'noche' : 'dia'; }
export async function refrescarSiHaceFalta() {}
export function horaFija() {
  const h = Q.get('hora');
  if (h !== null && !isNaN(+h)) return +h;
  return climaActivo() ? 23 : 12;
}
