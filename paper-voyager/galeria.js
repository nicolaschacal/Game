// GALERÍA DE CIUDADES: index.html?galeria muestra el fondo REAL de cada destino (el mismo motor 3D de la partida, no una maqueta)
// como miniaturas, para revisarlas en el teléfono. San Francisco va primero: es la referencia aprobada.
//   ?galeria                 todas las ciudades del juego
//   ?galeria=fichas          sólo las hechas con ficha + kit (fichas-ciudades.js)
//   ?galeria=borradores      los borradores de destinos-draft.js
//   ?galeria=Melbourne,Hoi An   las que se nombren (sin tildes ni mayúsculas)
// Tocar una miniatura abre esa ciudad con ?preview= (no guarda nada).
import { cambiarEscenario, capturaEscena } from './scene3d.js';
import { DESTINOS, IDX } from './destinos.js';
import { FICHAS } from './fichas-ciudades.js';

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const espera = ms => new Promise(r => setTimeout(r, ms));
const cuadro = () => new Promise(r => requestAnimationFrame(() => r()));

async function lista(filtro) {
  const reales = Object.keys(IDX).map(k => ({ clave: k, d: DESTINOS[IDX[k]] }));
  let L;
  if (!filtro) L = reales;
  else if (norm(filtro) === 'fichas') L = reales.filter(x => FICHAS[x.clave]);
  else if (norm(filtro) === 'borradores') { const m = await import('./destinos-draft.js'); L = m.DRAFT.map(d => ({ clave: d.place, d })); }
  else { const q = filtro.split(',').map(norm).filter(Boolean); L = reales.filter(x => q.includes(norm(x.clave))); }
  const sf = L.findIndex(x => x.clave === 'San Francisco'), ref = sf >= 0 ? L.splice(sf, 1) : reales.filter(x => x.clave === 'San Francisco');
  return [...ref.map(x => ({ ...x, ref: true })), ...L];
}

export async function abrirGaleria(filtro) {
  const css = document.createElement('style');
  css.textContent = `#galeria{position:fixed;inset:0;z-index:9999;overflow:auto;background:#EFE6D6;padding:calc(10px + env(safe-area-inset-top)) 10px 30px;font-family:Nunito,system-ui,sans-serif;color:#3A2A3E}
#galeria h1{font:22px 'Lilita One',system-ui;margin:4px 4px 2px;letter-spacing:.5px}#galeria p{margin:0 4px 10px;font-size:13px;opacity:.75}
#galeria .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
#galeria a{display:block;text-decoration:none;color:inherit;background:#FFF4DC;border-radius:10px;padding:5px;box-shadow:0 2px 6px rgba(58,42,62,.18)}
#galeria a.ref{outline:3px solid #D2502E}#galeria img{width:100%;display:block;border-radius:6px;aspect-ratio:390/230;object-fit:cover;background:#ddd}
#galeria b{display:block;font-size:13px;margin:4px 2px 0}#galeria small{font-size:11px;opacity:.7;margin-left:2px}`;
  document.head.appendChild(css);
  const box = document.createElement('div'); box.id = 'galeria';
  box.innerHTML = `<h1>Galería de ciudades</h1><p id="gEstado">Preparando…</p><div class="g" id="gGrid"></div>`;
  document.body.appendChild(box);
  const L = await lista(filtro), grid = box.querySelector('#gGrid'), est = box.querySelector('#gEstado');
  const celdas = L.map(x => { const a = document.createElement('a'); a.href = '?preview=' + encodeURIComponent(x.clave); if (x.ref) a.className = 'ref';
    a.innerHTML = `<img alt=""><b>${x.clave}</b><small>${x.ref ? 'referencia aprobada' : FICHAS[x.clave] ? 'ficha + kit' : x.d.draft ? 'borrador' : ''}</small>`; grid.appendChild(a); return a; });
  await espera(1200);
  for (let i = 0; i < L.length; i++) {
    est.textContent = `Dibujando ${i + 1} de ${L.length}: ${L[i].clave}`;
    cambiarEscenario(L[i].d); capturaEscena(); await cuadro(); await espera(450); // primer cuadro: arma el escenario; las texturas SVG cargan solas
    const url = capturaEscena(.85); if (!url) break;
    const img = new Image(); img.src = url; await img.decode().catch(() => {});
    // recorte de la franja del fondo (sol, horizonte, monumento y lomas): casi sin pista, que en la galería conserva el color del destino inicial
    const c = document.createElement('canvas'), W = img.naturalWidth, H = img.naturalHeight, y0 = Math.round(H * .1), h = Math.round(W * 230 / 390);
    c.width = 390; c.height = 230; c.getContext('2d').drawImage(img, 0, y0, W, h, 0, 0, 390, 230);
    celdas[i].querySelector('img').src = c.toDataURL('image/jpeg', .85);
  }
  est.textContent = `${L.length} ciudades · tocá una para verla en el juego (no guarda nada)`;
}
