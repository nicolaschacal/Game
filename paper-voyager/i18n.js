// Internacionalización: carga SOLO el JSON del idioma elegido (rutas relativas: funciona offline en Capacitor y en Vercel).
// Los módulos que importan este archivo esperan a que termine la carga (top-level await), así t() ya es síncrono
// cuando se evalúan las tablas de datos y el menú no muestra texto cambiando. Cambiar de idioma guarda la elección y recarga.
export const LANGS = [
  { code: 'es', name: 'Español' }, { code: 'en', name: 'English' }, { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' }, { code: 'it', name: 'Italiano' }, { code: 'ja', name: '日本語' },
];
const KEY = 'pv.lang'; // mismo sistema de guardado del juego: localStorage 'pv.*' con valor JSON
const CODES = LANGS.map(l => l.code);
const saved = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return CODES.includes(v) ? v : null; } catch { return null; } };
export function detectLang() {
  for (const l of (navigator.languages?.length ? navigator.languages : [navigator.language || ''])) {
    const c = String(l).toLowerCase().split(/[-_]/)[0];
    if (CODES.includes(c)) return c;
  }
  return 'en';
}
export const lang = saved() || detectLang();
let dict = {};
async function load(code) { const r = await fetch(new URL('./i18n/' + code + '.json', import.meta.url)); if (!r.ok) throw new Error(r.status); return r.json(); }
try { dict = await load(lang); } catch { if (lang !== 'en') { try { dict = await load('en'); } catch {} } }

export function t(key, vars) {
  let s = dict[key]; if (s == null) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
}
export function setLang(code) {
  if (!CODES.includes(code) || code === lang) return;
  try { localStorage.setItem(KEY, JSON.stringify(code)); } catch {}
  location.reload();
}
document.documentElement.lang = lang;
window.t = t;
applyI18n();
