// Cofres: el gancho de "volvé en un rato".
// · Aparecen en la pista (madera / plata / oro, al azar) y al cumplir misiones (plata) o subir de nivel (oro).
// · Se guardan al agarrarlos (aunque pierdas la partida) en 4 espacios. Si están todos ocupados, el nuevo se cambia por unas monedas.
// · Madera se abre al instante; plata tarda 20 min y oro 2 h. Un anuncio con premio los abre ya (oro: −1 h). PRO: siempre al instante.
// · Cada 4 h hay un cofre de madera gratis.
// · Abrir uno es un pequeño show: tiembla, salta la tapa y salen las recompensas (monedas, ítems y, a veces, un souvenir nuevo).
// Guardado: store 'cofres' = { slots: [{ t, ready }], free: ts del próximo gratis }.
import { t as tt } from './i18n.js';
import { CHEST, COIN } from './runner-art.js';

export const SLOTS = 4, FREE_MS = 4 * 3600e3;
export const TIERS = {
  madera: { ms: 0, glow: '#F2B937' },
  plata: { ms: 20 * 60e3, glow: '#BFD3EE' },
  oro: { ms: 2 * 3600e3, glow: '#FFD45E' },
};
// Arte: el cofre de la pista recoloreado por rareza
const RECOLOR = {
  plata: { '#C98F55': '#AFC0D6', '#9E6B3C': '#8396B3', '#E9BC82': '#DCE6F2', '#A9743F': '#8A9DBA', '#7A4F28': '#5C6E8C', '#6A4524': '#4E5D78', '#B98A55': '#A5B4C8', '#5E3E22': '#3E4A60', '#4A2F18': '#2F3A4E', '#F2B937': '#5FA4E0', '#B8741A': '#2F6AA8', '#F9CF5F': '#9CCBF2', '#C98A1E': '#3E7FBF' },
  oro: { '#C98F55': '#EDB43A', '#9E6B3C': '#C78A1E', '#E9BC82': '#FAD56A', '#A9743F': '#D49B26', '#7A4F28': '#9A6410', '#6A4524': '#7E500C', '#B98A55': '#E0B048', '#5E3E22': '#6E2A1C', '#4A2F18': '#4E1C12', '#F2B937': '#D8473B', '#B8741A': '#9E2A20', '#F9CF5F': '#EF6A5C', '#C98A1E': '#B8341F' },
};
const ART = {};
export function chestArt(tier = 'madera') {
  if (ART[tier]) return ART[tier];
  const m = RECOLOR[tier];
  return ART[tier] = m ? CHEST.replace(/#[0-9A-Fa-f]{6}/g, c => m[c] || c) : CHEST;
}

let C = null; // ctx del juego (store, ITEMS, stock, addCoins, V, Iap, Ads, SFX, pop, confetti, buzz, refresh)
const now = () => Date.now();
const sfx = n => { try { C.SFX?.[n]?.(); } catch (e) {} };
function load() {
  const s = C.store.get('cofres', null) || {};
  return { slots: Array.isArray(s.slots) ? s.slots.filter(x => x && TIERS[x.t]).slice(0, SLOTS) : [], free: s.free ?? 0 };
}
const save = S => C.store.set('cofres', S);
export function initCofres(ctx) { C = ctx; }
export const tierName = t => tt('chest.t.' + t);
const isReady = c => C.Iap?.pro || c.ready <= now();

// Rareza del cofre de la pista: más chance de los buenos en las vueltas difíciles
export function rollTier(lap = 0) {
  const r = Math.random(), oro = .06 + Math.min(.06, lap * .02), plata = .26 + Math.min(.08, lap * .03);
  return r < oro ? 'oro' : r < oro + plata ? 'plata' : 'madera';
}
// Guarda un cofre. Si no hay lugar, se cambia por monedas: { ok, coins }
export function addChest(tier) {
  const S = load();
  if (S.slots.length >= SLOTS) { const coins = { madera: 25, plata: 60, oro: 150 }[tier]; C.addCoins(coins); return { ok: false, coins }; }
  S.slots.push({ t: tier, ready: now() + TIERS[tier].ms }); save(S); return { ok: true };
}
export function readyCount() { const S = load(); return S.slots.filter(isReady).length + (S.free <= now() ? 1 : 0); }
const fmtT = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(x).padStart(2, '0')}`; };

// ── Botón de inicio: el cofre más cercano a abrirse, con globito de cuántos están listos ──
export function drawHomeChest(el) {
  css(); if (!el) return;
  const S = load(), n = readyCount(), next = S.slots.filter(c => !isReady(c)).sort((a, b) => a.ready - b.ready)[0];
  const tier = (S.slots.find(isReady) || next || { t: 'madera' }).t;
  const lab = n ? tt('chest.ready') : next ? fmtT(next.ready - now()) : S.free > now() ? fmtT(S.free - now()) : tt('chest.ready');
  el.innerHTML = `<span class="kart${n ? ' rdy' : ''}">${chestArt(tier)}</span>${n ? `<i class="kn">${n}</i>` : ''}<span class="kl${n ? ' rdy' : ''}">${lab}</span>`;
  el.setAttribute('aria-label', tt('chest.panel') + (n ? ' · ' + tt('chest.ready') : ''));
}

// ── Panel COFRES ──
export function openCofres(ctx, onClose) {
  C = ctx || C; css();
  document.querySelectorAll('.pvk').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pvk'; root.style.display = 'block'; document.body.appendChild(root);
  let tick = null;
  const close = () => { clearInterval(tick); root.remove(); sfx('tap'); try { onClose?.(); } catch (e) {} };
  function draw() {
    const S = load(), pro = !!C.Iap?.pro;
    const slot = (c, i) => {
      if (!c) return `<div class="ks empty"><div class="ka">${chestArt('madera')}</div><b>${tt('chest.empty')}</b></div>`;
      const ok = isReady(c), left = c.ready - now();
      return `<div class="ks ${c.t}${ok ? ' rdy' : ''}"><div class="ka">${chestArt(c.t)}</div><b>${tierName(c.t)}</b>`
        + (ok ? `<button class="kb go" data-open="${i}">${tt('chest.open')}</button>`
          : `<small data-left="${c.ready}">${fmtT(left)}</small><button class="kb ad" data-ad="${i}">▶ ${c.t === 'oro' && left > 3600e3 ? tt('chest.skip1h') : tt('chest.skipAd')}</button>`) + `</div>`;
    };
    const fr = S.free <= now();
    root.innerHTML = `<div class="head"><button class="round close" data-x aria-label="${tt('common.close')}">✕</button><small>${tt('chest.panelSub')}</small><h2>${tt('chest.panel')}</h2></div>
<div class="kfree${fr ? ' rdy' : ''}"><div class="ka">${chestArt('madera')}</div><div class="kt"><b>${tt('chest.free')}</b><small>${fr ? tt('chest.freeNow') : tt('chest.freeIn', { time: `<span data-left="${S.free}">${fmtT(S.free - now())}</span>` })}</small></div>${fr ? `<button class="kb go" data-free>${tt('chest.open')}</button>` : ''}</div>
<div class="kgrid">${Array.from({ length: SLOTS }, (_, i) => slot(S.slots[i], i)).join('')}</div>
<div class="khow"><b>${tt('chest.howT')}</b>${tt('chest.how', { n: SLOTS })}${pro ? '' : `<br><u>${tt('chest.proHint')}</u>`}</div>
<div class="ktiers">${Object.keys(TIERS).map(k => `<div><span>${chestArt(k)}</span><b>${tierName(k)}</b><small>${tt('chest.has.' + k)}</small></div>`).join('')}</div>`;
    root.querySelector('[data-x]').onclick = close;
    root.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const S2 = load(), c = S2.slots[+b.dataset.open]; if (!c || !isReady(c)) return; S2.slots.splice(+b.dataset.open, 1); save(S2); reveal(c.t).then(draw); });
    root.querySelector('[data-free]')?.addEventListener('click', () => { const S2 = load(); if (S2.free > now()) return; S2.free = now() + FREE_MS; save(S2); reveal('madera').then(draw); });
    root.querySelectorAll('[data-ad]').forEach(b => b.onclick = async () => {
      sfx('tap'); b.disabled = true;
      let ok = false; try { ok = await C.Ads?.recompensa?.('chest'); } catch (e) {}
      if (!ok) { b.disabled = false; return; }
      const S2 = load(), c = S2.slots[+b.dataset.ad]; if (!c) return;
      c.ready = c.t === 'oro' && c.ready - now() > 3600e3 ? c.ready - 3600e3 : now(); save(S2); sfx('prize'); draw();
    });
  }
  draw();
  tick = setInterval(() => {
    if (!root.isConnected) return clearInterval(tick);
    let redo = false;
    root.querySelectorAll('[data-left]').forEach(e => { const l = +e.dataset.left - now(); if (l <= 0) redo = true; else e.textContent = fmtT(l); });
    if (redo) draw();
  }, 1000);
  return root;
}

// ── Premios ──
const ITEM_W = { shield: 10, double: 9, freeze: 6, revive: 4, anchor: 4, ballast: 4, needle: 4, compass: 3 };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function pickItem() {
  const L = (C.ITEMS || []).filter(i => ITEM_W[i.id]); if (!L.length) return null;
  let r = Math.random() * L.reduce((a, i) => a + ITEM_W[i.id], 0);
  for (const i of L) { r -= ITEM_W[i.id]; if (r <= 0) return i; } return L[0];
}
function newSouvenir() {
  const V = C.V, own = V?.PHOTO?.owned || [], free = (V?.SOUVENIRS || []).filter(s => !own.includes(s.id));
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}
function roll(tier) {
  const out = [], spec = { madera: [40, 90, .35, 0, 0], plata: [120, 220, 1, 0, .12], oro: [300, 500, 2, 0, .4] }[tier];
  out.push({ coins: ri(spec[0], spec[1]) });
  const nItems = spec[2] >= 1 ? spec[2] : Math.random() < spec[2] ? 1 : 0;
  for (let k = 0; k < nItems; k++) { const it = pickItem(); if (it) out.push({ item: it }); }
  if (Math.random() < spec[4]) { const s = newSouvenir(); if (s) out.push({ souvenir: s }); else out.push({ coins: 150 }); }
  return out;
}
function grant(list) {
  for (const r of list) {
    if (r.coins) C.addCoins(r.coins);
    if (r.item) { C.stock[r.item.id] = (C.stock[r.item.id] || 0) + 1; C.saveStock?.(); }
    if (r.souvenir) { const P = C.V.PHOTO; if (!P.owned.includes(r.souvenir.id)) { P.owned.push(r.souvenir.id); C.V.savePhoto(); } }
  }
  try { C.refresh?.(); } catch (e) {}
}
async function rewardArt(r) {
  if (r.coins) return COIN;
  if (r.item) return `<span class="kic">${r.item.icon || '★'}</span>`;
  if (r.souvenir) { try { const m = await import('./album.js'); return m.photoPreview(r.souvenir.id); } catch (e) { return ''; } }
  return '';
}
const rewardText = r => r.coins ? `+◉ ${r.coins}` : r.item ? r.item.name : r.souvenir ? r.souvenir.name : '';
const rewardSub = r => r.coins ? tt('chest.r.coins') : r.item ? tt('chest.r.item') : tt('chest.r.souvenir');

// ── El show de abrir: tocar → tiembla, salta la tapa, rayos y las recompensas una por una ──
export function reveal(tier = 'madera') {
  css();
  return new Promise(async done => {
    const list = roll(tier); grant(list); // se entregan ya: si cierran la app a mitad del show, no se pierde nada
    const arts = await Promise.all(list.map(rewardArt));
    const ov = document.createElement('div'); ov.className = 'pvkr ' + tier; ov.style.setProperty('--gl', TIERS[tier].glow);
    ov.innerHTML = `<div class="rays"></div><div class="kname">${tierName(tier)}</div><div class="kc"><div class="l">${chestArt(tier)}</div><div class="b">${chestArt(tier)}</div></div><div class="kr"></div><div class="khint">${tt('chest.tapOpen')}</div><button class="btn green kok">${tt('chest.great')}</button>`;
    document.body.appendChild(ov); sfx('tap');
    const kc = ov.querySelector('.kc'), kr = ov.querySelector('.kr'), hint = ov.querySelector('.khint');
    let step = 0, busy = false;
    const open = () => {
      busy = true; hint.style.display = 'none'; kc.classList.add('shake'); sfx('chest'); try { C.buzz?.([15, 30, 15]); } catch (e) {}
      setTimeout(() => {
        kc.classList.remove('shake'); kc.classList.add('open'); ov.classList.add('lit'); sfx('prize'); try { C.confetti?.(); C.buzz?.([20, 40, 20]); } catch (e) {}
        list.forEach((r, k) => setTimeout(() => {
          const d = document.createElement('div'); d.className = 'kcard' + (r.souvenir ? ' sv' : '');
          d.innerHTML = `<div class="ki">${arts[k]}</div><b>${rewardText(r)}</b><small>${rewardSub(r)}</small>`; kr.appendChild(d); sfx(r.souvenir ? 'win' : 'tap');
          if (k === list.length - 1) setTimeout(() => { ov.classList.add('end'); busy = false; step = 2; }, 450);
        }, 420 + k * 380));
      }, 900);
    };
    const end = () => { ov.classList.add('bye'); setTimeout(() => { ov.remove(); done(list); }, 220); };
    ov.addEventListener('click', e => { if (busy) return; if (step === 0) { step = 1; open(); } else if (step === 2 && (e.target.closest('.kok') || e.target === ov)) end(); });
    ov.querySelector('.kok').onclick = e => { e.stopPropagation(); if (step === 2) end(); };
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { step = 1; open(); }
  });
}

// ── Panel MISIONES: qué hay que hacer, qué dan y para qué sirve el nivel ──
// m = { prog, pool, mult(level) , coins(level) , icon(id) }
export function openMisiones(ctx, m) {
  C = ctx || C; css();
  document.querySelectorAll('.pvk').forEach(e => e.remove());
  const root = document.createElement('div'); root.className = 'panel pvk pvm'; root.style.display = 'block'; document.body.appendChild(root);
  const P = m.prog, L = P.level + 1;
  root.innerHTML = `<div class="head"><button class="round close" data-x aria-label="${tt('common.close')}">✕</button><small>${tt('mission.panelSub', { level: L, mult: m.mult(P.level) })}</small><h2>${tt('mission.panel')}</h2></div>
<div class="mlv"><div class="mx">x${m.mult(P.level)}</div><div><b>${tt('mission.lvl', { level: L })}</b><small>${tt('mission.howMult')}</small></div></div>
<div class="mls">${P.set.map(x => { const M = m.pool[x.id], pc = Math.round(x.n / x.goal * 100); return `<div class="mit${x.done ? ' ok' : ''}"><div class="mi">${m.icon(M.ico)}</div><div class="mt"><b>${M.t(x.goal)}</b><div class="bar"><i style="width:${pc}%"></i></div></div><div class="mr">${x.done ? '✓' : `<span>${chestArt('plata')}</span>`}<small>${x.done ? tt('mission.got') : x.n + '/' + x.goal}</small></div></div>`; }).join('')}</div>
<div class="mnext"><span>${chestArt('oro')}</span><div><b>${tt('mission.next', { level: L + 1 })}</b><small>${tt('mission.nextReward', { mult: m.mult(P.level + 1), coins: m.coins(P.level + 1) })}</small></div></div>
<button class="btn green mplay">${tt('menu.play')}</button>`;
  const close = () => { root.remove(); sfx('tap'); };
  root.querySelector('[data-x]').onclick = close;
  root.querySelector('.mplay').onclick = () => { root.remove(); document.getElementById('play')?.click(); };
  return root;
}

function css() {
  if (document.getElementById('pvkCss')) return;
  const st = document.createElement('style'); st.id = 'pvkCss';
  st.textContent = `
#chestBtn{position:absolute;left:0;top:6px;width:78px;border:0;background:none;padding:0;pointer-events:auto;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center}
#chestBtn:active{transform:translateY(2px) scale(.97)}
#chestBtn .kart{display:block;width:70px;filter:drop-shadow(0 1.5px 1.5px rgba(40,24,10,.35)) drop-shadow(0 5px 6px rgba(27,23,48,.3))}#chestBtn .kart svg{display:block;width:100%;height:auto;overflow:visible}
#chestBtn .kart.rdy{animation:pvkBob 1.6s ease-in-out infinite}
@keyframes pvkBob{0%,100%{transform:rotate(-3deg)}50%{transform:translateY(-4px) rotate(3deg)}}
#chestBtn .kn{position:absolute;right:2px;top:0;min-width:22px;height:22px;border-radius:99px;background:#E8452C;color:#fff;font:400 14px/22px 'Lilita One',sans-serif;font-style:normal;box-shadow:0 2px 0 #9E2A20}
#chestBtn .kl{margin-top:-6px;padding:2px 9px 3px;background:#F6EBD0;color:#3A2A12;font:400 12px 'Lilita One',sans-serif;letter-spacing:.3px;box-shadow:0 1px 1px rgba(40,24,10,.3),0 3px 6px rgba(27,23,48,.22);transform:rotate(-3deg);white-space:nowrap}
#chestBtn .kl.rdy{background:#76B85A;color:#fff}
#mission{pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}#mission:active{transform:translateY(2px)}
#mission .mch{display:inline-block;width:17px;height:17px;vertical-align:-3px;margin-left:4px}#mission .mch svg{width:100%;height:100%}
.pvk{overflow-x:hidden}
.pvk .ka svg,.pvk .ktiers span svg,.pvm .mnext span svg,.pvm .mr span svg{display:block;width:100%;height:auto;overflow:visible}
.kfree{display:flex;align-items:center;gap:12px;margin:14px 14px 0;padding:10px 12px;border-radius:16px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12}
.kfree .ka{width:56px;flex:none}.kfree .kt{flex:1;min-width:0}.kfree b{display:block;font:400 18px 'Lilita One',sans-serif}.kfree small{font:800 11px Nunito;color:#6B4E26}
.kfree.rdy{box-shadow:0 0 0 3px #76B85A,0 6px 10px rgba(27,23,48,.22)}.kfree.rdy .ka{animation:pvkBob 1.6s ease-in-out infinite}
.kgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:14px 14px 0}
.ks{position:relative;padding:10px 8px 10px;border-radius:16px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
.ks .ka{width:74%}.ks b{font:400 16px/1.05 'Lilita One',sans-serif}.ks small{font:400 18px 'Lilita One',sans-serif;color:#6B4E26}
.ks.empty{background:transparent;box-shadow:none;border:2.5px dashed #B39463}.ks.empty .ka{opacity:.18;filter:grayscale(1)}.ks.empty b{color:#8C7E5C;font-size:14px}
.ks.plata{background:linear-gradient(#EEF3F8,#DCE5F0)}.ks.oro{background:linear-gradient(#FFF1C2,#F7DE8F)}
.ks.rdy{box-shadow:0 0 0 3px #76B85A,0 6px 10px rgba(27,23,48,.22)}.ks.rdy .ka{animation:pvkBob 1.6s ease-in-out infinite}
.kb{border:0;cursor:pointer;font:400 14px 'Lilita One',sans-serif;padding:4px 16px 5px;border-radius:99px;background:#F2BC3E;color:#3A2410;box-shadow:0 2px 0 #A9701B;margin-top:2px}.kb:active{transform:translateY(2px);box-shadow:none}
.kb.go{background:#76B85A;color:#fff;box-shadow:0 2px 0 #356F2E;padding:5px 22px 6px;font-size:16px}.kb:disabled{opacity:.5}
.khow{margin:16px 18px 0;font:700 12px/1.45 Nunito;color:#6B4E26}.khow b{display:block;font:400 16px 'Lilita One',sans-serif;color:#3A2A12;margin-bottom:2px}.khow u{text-decoration:none;color:#A9701B;font-weight:900}
.ktiers{display:flex;gap:8px;padding:12px 14px 0}.ktiers div{flex:1;text-align:center;padding:8px 4px;border-radius:12px;background:#F7ECD3;box-shadow:0 1px 1px rgba(40,24,10,.25),0 4px 7px rgba(27,23,48,.16);color:#3A2A12}
.ktiers span{display:block;width:44px;margin:0 auto}.ktiers b{display:block;font:400 12.5px 'Lilita One',sans-serif}.ktiers small{display:block;font:800 9px/1.25 Nunito;color:#6B4E26;margin-top:2px}
/* show de apertura */
.pvkr{position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 42%,#3B2F6Bee,#120E24f4 70%);color:#FFF4DC;animation:pvaFade .25s;touch-action:none;overflow:hidden;user-select:none;-webkit-user-select:none}
@keyframes pvaFade{0%{opacity:0}}
.pvkr.bye{opacity:0;transition:opacity .2s}
.pvkr .rays{position:absolute;left:50%;top:40%;width:900px;height:900px;margin:-450px 0 0 -450px;background:repeating-conic-gradient(from 0deg,var(--gl) 0 8deg,transparent 8deg 22deg);opacity:0;border-radius:50%;-webkit-mask:radial-gradient(circle,#000 0 20%,transparent 62%);mask:radial-gradient(circle,#000 0 20%,transparent 62%);transition:opacity .5s}
.pvkr.lit .rays{opacity:.35;animation:pvkSpin 14s linear infinite}
@keyframes pvkSpin{to{transform:rotate(360deg)}}
.pvkr .kname{position:relative;font:400 30px 'Lilita One',sans-serif;letter-spacing:.6px;color:var(--gl);text-shadow:0 3px 0 #1B1730;margin-bottom:64px;animation:pvkIn .5s cubic-bezier(.2,1.5,.4,1)}
.pvkr .kc{position:relative;width:min(56vw,230px);aspect-ratio:1;animation:pvkIn .55s cubic-bezier(.2,1.5,.4,1)}
@keyframes pvkIn{0%{transform:scale(.3) translateY(60px);opacity:0}}
.pvkr .kc>div{position:absolute;inset:0;filter:drop-shadow(0 10px 12px rgba(0,0,0,.45))}.pvkr .kc svg{display:block;width:100%;height:100%;overflow:visible}
.pvkr .kc .l{clip-path:inset(-30% -30% 47.5% -30%);transform-origin:80% 52%;transition:transform .5s cubic-bezier(.3,1.6,.5,1)}
.pvkr .kc .b{clip-path:inset(52.5% -30% -30% -30%)}
.pvkr .kc.shake{animation:pvkShake .9s ease-in-out}
@keyframes pvkShake{0%,100%{transform:none}10%{transform:rotate(-6deg) scale(1.04)}20%{transform:rotate(6deg)}30%{transform:rotate(-7deg) scale(1.07)}40%{transform:rotate(7deg)}55%{transform:rotate(-9deg) scale(1.1)}70%{transform:rotate(9deg) scale(1.12)}85%{transform:scale(.92,1.08)}}
.pvkr .kc.open .l{transform:translate(10%,-20%) rotate(20deg)}
.pvkr .kc.open{animation:pvkPop .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes pvkPop{0%{transform:scale(.88,1.12)}}
.pvkr .kr{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;min-height:126px;margin-top:-8px;padding:0 14px;max-width:420px}
.pvkr .kcard{width:96px;padding:8px 6px 9px;border-radius:14px;background:#FFF4DC;color:#3A2A12;text-align:center;box-shadow:0 2px 0 #B39463,0 10px 18px rgba(0,0,0,.4);animation:pvkCard .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes pvkCard{0%{transform:translateY(-120px) scale(.2) rotate(-20deg);opacity:0}}
.pvkr .kcard .ki{width:54px;height:54px;margin:0 auto 2px;display:flex;align-items:center;justify-content:center}.pvkr .kcard .ki svg{width:100%;height:100%;overflow:visible}
.pvkr .kcard b{display:block;font:400 14px/1.05 'Lilita One',sans-serif}.pvkr .kcard small{display:block;font:900 8px Nunito;letter-spacing:.8px;color:#8A6A44;text-transform:uppercase;margin-top:2px}
.pvkr .kcard.sv{background:#FFE9A8;box-shadow:0 0 0 3px #F2B937,0 10px 18px rgba(0,0,0,.4)}
.pvkr .kic{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#3E5BA9;color:#fff;font:400 24px 'Lilita One',sans-serif;box-shadow:0 3px 0 #24305E}
.pvkr .khint{position:relative;margin-top:16px;font:400 18px 'Lilita One',sans-serif;letter-spacing:.8px;animation:pvkPulse 1.1s ease-in-out infinite;transition:opacity .2s}
@keyframes pvkPulse{50%{opacity:.45}}
.pvkr .kok{position:relative;width:min(70vw,260px);height:56px;font-size:24px;margin-top:18px;opacity:0;pointer-events:none;transform:translateY(20px);transition:opacity .3s,transform .3s}
.pvkr.end .kok{opacity:1;pointer-events:auto;transform:none}
/* panel misiones */
.mlv{display:flex;align-items:center;gap:12px;margin:14px 14px 0;padding:12px;border-radius:16px;background:#1F2757;color:#F6EBD0;box-shadow:0 6px 10px rgba(27,23,48,.25)}
.mlv .mx{flex:none;font:400 30px 'Lilita One',sans-serif;color:#F2B937;background:#2C2545;border-radius:14px;padding:2px 12px}
.mlv b{display:block;font:400 18px 'Lilita One',sans-serif}.mlv small{font:700 11.5px/1.35 Nunito;color:#D6D2EA}
.mls{padding:12px 14px 0;display:flex;flex-direction:column;gap:10px}
.mit{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;background:#F7ECD3;box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 5px 9px rgba(27,23,48,.2);color:#3A2A12}
.mit .mi{width:34px;height:34px;flex:none}.mit .mi svg{width:100%;height:100%}
.mit .mt{flex:1;min-width:0}.mit .mt b{display:block;font:400 15.5px/1.1 'Lilita One',sans-serif}
.mit .bar{height:8px;border-radius:99px;background:#E2D3AE;margin-top:5px;overflow:hidden}.mit .bar i{display:block;height:100%;background:#F2B937;border-radius:99px}
.mit.ok{background:#E6F2D8}.mit.ok .bar i{background:#76B85A}
.mit .mr{flex:none;width:60px;text-align:center}.mit .mr span{display:block;width:40px;margin:0 auto}.mit .mr small{font:400 13px 'Lilita One',sans-serif;color:#6B4E26}.mit.ok .mr{font:400 24px/1 'Lilita One',sans-serif;color:#4E9A4A}.mit.ok .mr small{display:block;font-size:11px;color:#4E9A4A}
.mnext{display:flex;align-items:center;gap:12px;margin:14px 14px 0;padding:12px;border-radius:16px;background:linear-gradient(#FFF1C2,#F7DE8F);box-shadow:0 1.5px 1.5px rgba(40,24,10,.28),0 6px 10px rgba(27,23,48,.22);color:#3A2A12}
.mnext span{width:56px;flex:none}.mnext b{display:block;font:400 16px/1.1 'Lilita One',sans-serif}.mnext small{font:800 11.5px Nunito;color:#6B4E26}
.pvm .mplay{width:calc(100% - 28px);margin:18px 14px 0;height:58px;font-size:26px}
`;
  document.head.appendChild(st);
}
