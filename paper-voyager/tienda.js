// Tienda dentro del panel #shop: Viajeros · Pasaportes · Objetos (submenú: potenciadores, souvenirs, álbum) · PRO.
// Uso: openShop(ctx, 'viajeros'|'pasaportes'|'objetos'|'objetos:sou'|'foto'|'pro'). Reemplaza el contenido de #shop salvo el .head.
// En Viajeros sólo van los personajes; al tocar uno se abre su ficha (bio + trajes).
import { photoPreview } from './album.js';
import { t as tt } from './i18n.js';
import { Vidas, reloj } from './vidas.js';
import { esIOS } from './monetizacion.js';

const TABS = [
  ['viajeros', 'viajero', tt('store.tab.travelers')], ['pasaportes', 'pasaporte', tt('store.tab.passports')], ['objetos', 'objeto', tt('store.tab.objects')], ['pro', 'pro', tt('store.tab.pro')],
];
const SV = (d) => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const TAB_ICO = {
  viajero: SV('<path d="M8.5 7.5a3.5 3.5 0 0 1 7 0"/><path d="M7 8h10"/><circle cx="12" cy="10.5" r="2.5"/><path d="M8 21v-5a4 4 0 0 1 8 0v5"/><path d="M16.5 14.5h2.5v5.5h-2.5"/>'),
  pasaporte: SV('<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10.5" r="3.2"/><path d="M9 17h6"/>'),
  foto: SV('<rect x="3" y="6" width="18" height="14" rx="2.5"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2.5h5L16 6"/>'),
  pro: SV('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>'),
  objeto: SV('<path d="M3.5 8.5L12 4l8.5 4.5v7L12 20l-8.5-4.5z"/><path d="M3.5 8.5L12 13l8.5-4.5M12 13v7"/>'),
};
const RARITY = { nilo: [tt('rarity.common'), '#8a8069', '#DCE9F7'], kami: [tt('rarity.common'), '#8a8069', '#DCE9F7'], sakura: [tt('rarity.rare'), '#3E8FD9', '#FBD9E3'], kitsu: [tt('rarity.epic'), '#8E5CD9', '#FFE1D6'], shinobi: [tt('rarity.epic'), '#8E5CD9', '#DAD5F2'], oro: [tt('rarity.legendary'), '#D98A1E', '#FFF0B8'] };
const rarityOf = k => RARITY[k.id] || (k.price >= 2000 ? [tt('rarity.legendary'), '#D98A1E', '#FFF0B8'] : k.price >= 400 ? [tt('rarity.epic'), '#8E5CD9', '#DAD5F2'] : k.price > 0 ? [tt('rarity.rare'), '#3E8FD9', '#DCE9F7'] : [tt('rarity.common'), '#8a8069', '#DCE9F7']);
const IT_SVG = {
  revive: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.2-7.5 10.2z" fill="currentColor"/>',
  shield: '<path d="M12 3.5l7 2.6v5.4c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6.1z" fill="currentColor"/>',
  anchor: '<circle cx="12" cy="5.5" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v12M8 10.5h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M4.5 14c.6 4 3.6 6 7.5 6s6.900-2 7.500-6l-2.300 1.300M4.500 14l2.400 1.500" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  ballast: '<path d="M8 8.500Q12 7 16 8.500L20 19Q12 21.500 4 19z" fill="currentColor"/><circle cx="12" cy="5.500" r="2" fill="none" stroke="currentColor" stroke-width="1.800"/><path d="M12 17l-3.500-4h2.200V10.500h2.600V13h2.200z" fill="#fff" opacity=".85"/>',
  needle: '<circle cx="7" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.400"/><path d="M11 12h10M17.500 12v3.500M20.500 12v2.500" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/>',
  compass: '<circle cx="12" cy="12" r="8.500" fill="none" stroke="currentColor" stroke-width="2.200"/><path d="M12 6l2.600 6h-5.200z" fill="currentColor"/><path d="M12 18l2.600-6H9.400z" fill="currentColor" opacity=".45"/>',
  freeze: '<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2" fill="none" stroke-width="1.8"/></g>',
};
const HEART = on => `<svg class="hrt${on ? '' : ' off'}" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 21s-9.5-5.7-9.5-12.6A5.4 5.4 0 0 1 12 5.3a5.4 5.4 0 0 1 9.5 3.1C21.5 15.3 12 21 12 21z" fill="#E8452C" stroke="#FFF4DC" stroke-width="2.2" stroke-linejoin="round"/><path d="M6.6 8.6a2.6 2.6 0 0 1 2.4-1.9" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".7"/></svg>`;
const itemIco = k => IT_SVG[k.id] ? `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">${IT_SVG[k.id]}</svg>` : esc(k.icon);
const ITEM_COL = { revive: '#E8452C', shield: '#3E5BA9', double: '#5DB84F', freeze: '#4FB3D9', magnet: '#8E5CD9', anchor: '#2F7FA8', ballast: '#7A6AA8', needle: '#D9961E', compass: '#C23B2A' };
const PHOTO_GROUPS = [['frame', tt('store.photo.frames')], ['cover', tt('store.photo.covers')], ['filter', tt('store.photo.filters')], ['deco', tt('store.photo.decos')]];
const GLYPH = { // motivo del escudo de cada región
  am: '<path d="M60 40 L63 56 L60 76 L57 56Z M44 58 L58 55 L76 58 L58 61Z" fill="#7a4d0b"/>',
  eu: '<path d="M60 38 L64.5 52 L79 52 L67.5 61 L72 75 L60 66.5 L48 75 L52.5 61 L41 52 L55.5 52Z" fill="#7a4d0b"/>',
  af: '<circle cx="60" cy="57" r="9" fill="#7a4d0b"/><g stroke="#7a4d0b" stroke-width="3.5" stroke-linecap="round"><path d="M60 40v6M60 68v6M43 57h6M71 57h6M48 45l4 4M72 69l-4-4M72 45l-4 4M48 69l4-4"/></g>',
  as: '<circle cx="60" cy="57" r="13" fill="#B3321D"/>',
  oc: '<path d="M40 52q5-7 10 0t10 0t10 0t10 0M40 63q5-7 10 0t10 0t10 0t10 0" fill="none" stroke="#7a4d0b" stroke-width="4" stroke-linecap="round"/>',
};

let CSS_DONE = false, livesTick = 0, tab = 'viajeros', sub = 'power', modal = null, fresh = null, lastCtx = null;
const SUBS = [['power', 'store.sub.power'], ['sou', 'store.sub.sou'], ['album', 'store.sub.album']];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const coin = n => '◉ ' + n;

function injectCSS() {
  if (CSS_DONE || document.getElementById('tiendaCSS')) { CSS_DONE = true; return; }
  CSS_DONE = true;
  const s = document.createElement('style'); s.id = 'tiendaCSS';
  s.textContent = `
.vtabs{display:flex;gap:4px;padding:12px 8px 4px;overflow-x:auto;scrollbar-width:none}.vtabs::-webkit-scrollbar{display:none}
.vtabs button{flex:1 1 0;min-width:0;height:52px;padding:0 5px;border-radius:14px;border:3px solid var(--ink);background:#EADBB8;color:#7c7460;font:400 11px/1 'Lilita One',sans-serif;letter-spacing:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
.vtabs button i{font-style:normal;line-height:0;display:block}.vtabs button i svg{display:block}.vtabs .on{background:var(--ink);color:var(--cream)}
.vsec{padding:14px 18px 0;font:400 21px 'Lilita One',sans-serif;color:var(--ink)}.vsec small{display:block;font:700 11px Nunito;color:var(--mute);margin-top:1px}
.vg{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px 14px}.vg3{grid-template-columns:repeat(3,1fr);gap:9px}
.vg .it,.vg .vwide{grid-column:1/3}
.vg3 .sk{padding:6px 5px 9px}.vg3 .sk .art{height:94px}.vg3 .sk .art svg{width:94px;height:94px}.vg3 .sk b{font-size:17px}.vg3 .sk small{margin-bottom:6px;font-size:8px;letter-spacing:1px}
.vg3 .price{padding:0 9px;font-size:14px;height:28px;white-space:nowrap}
.sk .ribbon2{position:absolute;left:50%;top:-11px;transform:translateX(-50%);background:var(--gold);border:2.5px solid var(--ink);border-radius:99px;padding:1px 9px;font:400 11px 'Lilita One',sans-serif;white-space:nowrap;letter-spacing:.5px;z-index:1}
.pp{position:relative;border-radius:20px;border:3.5px solid var(--ink);box-shadow:0 6px 0 var(--ink);background:var(--cream);padding:12px 8px 12px;text-align:center;color:var(--ink);overflow:hidden}
.pp::before{content:'';position:absolute;inset:0 0 auto;height:76px;background:var(--rl);opacity:.8}
.pp .bk{position:relative;display:block;margin:0 auto 6px;width:112px;height:150px;transform:rotate(-2deg);filter:drop-shadow(0 4px 0 rgba(27,23,48,.35))}
.pp:nth-child(even) .bk{transform:rotate(2deg)}
.pp .bk svg{width:100%;height:100%;overflow:visible}
.pp b{display:block;font:400 18px 'Lilita One',sans-serif}.pp small{display:block;font:900 9px Nunito;letter-spacing:1.2px;color:var(--rd)}
.pp .ds{font:700 10.5px/1.25 Nunito;color:#5d5640;margin:5px 4px 3px;min-height:26px}.pp .pm{font:900 8.5px Nunito;letter-spacing:.5px;color:var(--mute);margin-bottom:8px}
.pp.solo{grid-column:1/3;justify-self:center;width:calc(50% - 6px)}
.pp.own{background:#FFF9E8}
.stp{transform:rotate(-16deg);transform-box:fill-box;transform-origin:center}.stp.new{animation:vstamp .55s cubic-bezier(.2,1.3,.3,1) both}
@keyframes vstamp{0%{transform:scale(3) rotate(-40deg);opacity:0}55%{transform:scale(.88) rotate(-16deg);opacity:1}100%{transform:scale(1) rotate(-16deg);opacity:1}}
.pp.pulse{animation:vpulse .5s .2s}@keyframes vpulse{40%{transform:scale(1.04)}}
.ph{position:relative;border-radius:18px;border:3.5px solid var(--ink);box-shadow:0 5px 0 var(--ink);background:var(--cream);padding:8px 8px 10px;text-align:center;color:var(--ink)}
.ph:active,.vg .sk:active{transform:translateY(3px)}.ph.on{background:#FFF9E8;box-shadow:0 5px 0 var(--ink),0 0 0 3.5px var(--gold)}
.ph .pv{height:92px;border-radius:12px;border:2.5px solid var(--ink);background:var(--paper);margin-bottom:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.ph .pv>*{max-width:100%;max-height:100%}.ph b{display:block;font:400 15px/1.1 'Lilita One',sans-serif;margin-bottom:6px;min-height:17px}
.ph.lock .pv{filter:grayscale(.85) opacity(.65)}.ph .lk{font:900 9.5px/1.2 Nunito;color:#7c7460;letter-spacing:.3px;min-height:30px;display:flex;align-items:center;justify-content:center}
.price.lockp{background:#EADBB8;color:#7c7460;box-shadow:0 3px 0 var(--ink);font-size:13px}.price.tk{background:#EADBB8}.price.cant{opacity:.85}
.vnote{padding:2px 18px 0;font:700 11px Nunito;color:var(--mute)}.vnote.hd{text-align:center;padding:10px 18px 0;font-size:12px;color:#5d5640}
.vpro .it{grid-column:1/3}
.vg .it i,.vpro .it i{display:flex;align-items:center;justify-content:center;line-height:1;padding:0;font:400 20px 'Lilita One',sans-serif;color:#fff}.vg .it i svg{display:block;margin:auto;color:#fff;fill:#fff}
.it.pk.best::after{content:none!important}
.hrt{display:inline-block;width:30px;height:28px;vertical-align:middle}.hrt.off{opacity:.28;filter:grayscale(1)}
.vlv.card,.vfc.card{width:auto;animation:none}.vfc.card{text-align:left}
.vlv{margin:12px 14px 4px;padding:14px 14px 16px;text-align:center}
.vlv .hs{display:flex;justify-content:center;gap:4px;margin:2px 0 6px}
.vlv b.t{display:block;font:400 20px 'Lilita One',sans-serif}.vlv small{display:block;font:700 12px/1.35 Nunito;color:#5d5546;margin:2px 0 10px}
.vlv .row{display:flex;gap:8px}.vlv .row .btn{flex:1;height:48px;font-size:15px;padding:0 6px}
.vlv .row .btn[disabled]{opacity:.5;filter:grayscale(.6)}
.vfc{margin:14px 14px 4px;padding:16px 14px 16px}
.vfc h3{margin:0;font:400 24px/1 'Lilita One',sans-serif;display:flex;align-items:center;gap:8px}.vfc h3 svg{width:30px;height:30px;flex:none}
.vfc ul{list-style:none;margin:10px 0 12px;padding:0;text-align:left}.vfc li{font:800 13px/1.3 Nunito;margin:6px 0;display:flex;gap:8px;align-items:center}.vfc li i{font-style:normal;width:22px;text-align:center;flex:none}
.vfc .ok{font:400 17px 'Lilita One',sans-serif;color:#356F2E;text-align:center;margin:4px 0}
.vfc .it{margin-top:8px;width:100%}
.vleg{font:700 10.5px/1.4 Nunito;color:#7c7460;margin:10px 2px 0}.vleg a{color:#34437F;text-decoration:underline}
.vfc.na h3{font-size:21px}.vfc.na p{font:700 12.5px/1.35 Nunito;color:#5d5546;margin:6px 0 10px}

.vsub{display:flex;gap:6px;padding:12px 14px 2px;overflow-x:auto;scrollbar-width:none}.vsub::-webkit-scrollbar{display:none}
.vsub button{flex:1 0 auto;height:34px;padding:0 12px;border-radius:99px;border:2.5px solid var(--ink);background:#EADBB8;color:#7c7460;font:400 13px 'Lilita One',sans-serif}.vsub .on{background:var(--gold);color:var(--ink)}
.vmod{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:calc(var(--st,0px) + 20px) 0 20px;background:rgba(27,23,48,.6);animation:vmIn .2s both}
@keyframes vmIn{from{opacity:0}}
.vmod .card.vmc{width:min(92%,400px);padding:18px 14px 20px;text-align:left}
.vmod .vmi{position:relative;max-height:calc(100vh - var(--st,0px) - 90px);overflow-y:auto;scrollbar-width:none}.vmod .vmi::-webkit-scrollbar{display:none}
.vmod .vmx{right:-8px;top:-12px;z-index:2}
.vmod .vmh{display:flex;gap:12px;align-items:center;padding-right:30px}
.vmod .vma{position:relative;width:120px;height:120px;flex:none;border-radius:18px;border:3px solid var(--ink);background:radial-gradient(circle at 50% 60%,#fff 0,#DCE9F7 70%);overflow:hidden;display:flex;align-items:flex-end;justify-content:center}.vmod .vma svg{width:132px;height:132px;flex:none;margin-bottom:-6px}
.vmod .vmh b{display:block;font:400 28px/1 'Lilita One',sans-serif}.vmod .vmh small{display:block;font:900 10px Nunito;letter-spacing:1.2px;color:var(--mute);margin-top:5px}
.vmod .vmq{font:italic 700 13px/1.35 Nunito;color:#5d5546;margin:12px 2px 4px}.vmod .vmw{font:700 12.5px/1.4 Nunito;color:#5d5546;margin:0 2px 12px}
.vmod .vmb{display:block;width:100%;height:50px;font-size:19px;margin:4px 0 6px}
.vmod .vms{font:400 21px 'Lilita One',sans-serif;margin:12px 2px 0}
.vmod .vg{padding:10px 0 4px;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
body.gpapel .vsub{filter:var(--sh)}
body.gpapel .vsub button,body.gpapel .vmod .vma{clip-path:var(--P);background-color:var(--bot);background-image:var(--nz),linear-gradient(var(--top),var(--top));background-size:160px,100% calc(100% - var(--cant));background-repeat:repeat,no-repeat;background-blend-mode:multiply,normal;border:0;box-shadow:none}
body.gpapel .vsub button{--top:#EBDDB9;--bot:#B39463;--cant:4px;--P:var(--pill-a);color:#6c6450;height:38px;padding-bottom:3px}
body.gpapel .vsub .on{--top:#34437F;--bot:#1C2352;color:#F6EBD0}
body.gpapel .vmod .vma{--top:#DCE9F7;--bot:#9DB4CF;--cant:4px;--P:var(--tab-a);background-image:var(--nz),radial-gradient(circle at 50% 60%,#fff 0,var(--top) 70%);background-size:160px,100% calc(100% - var(--cant));filter:drop-shadow(0 2px 2px rgba(40,24,10,.3))}
.it.pk.best b::after{content:'MEJOR VALOR';display:inline-block;margin-left:8px;vertical-align:2px;background:var(--gold);color:var(--ink);border-radius:99px;padding:2px 8px 1px;font:900 8.5px/1.3 Nunito;letter-spacing:.8px}
`;
  document.head.appendChild(s);
}

// ── Secciones ──
// Viajeros: los 8 personajes del elenco, cada uno con sus atuendos (skins) en venta aparte en su misma fila. Un atuendo solo se compra si tienes al personaje.
const CH_COL = { nilo: '#3E5BA9', mora: '#4E9A4A', sipho: '#C98A1E', minji: '#7B5CC4', tuk: '#2E8E94', layla: '#C27A4A', cal: '#D9692A', anaya: '#D9567E' };
const FEM = ['mora', 'minji', 'layla', 'anaya'], TH = new Map();
const thumb = (c, id, sk) => { const k = id + '|' + sk; if (!TH.has(k)) TH.set(k, c.thumbOf(id, sk)); return TH.get(k); };
function viajeros(c) {
  const tid = c.V.T && c.V.T.traveler;
  const cards = c.SKINS.map(k => {
    const has = c.owned.includes(k.id), on = k.id === c.skinId, rc = CH_COL[k.id] || '#3E5BA9', n = k.skins.length;
    return `<button class="sk${on ? ' on' : ''}${has ? '' : ' locked'}" data-v="ch" data-id="${k.id}" style="--rc:${rc};--bg:#DCE9F7">${tid === k.id ? `<span class="ribbon2">${tt('store.yourTraveler')}</span>` : ''}<div class="art">${thumb(c, k.id, c.wornOf(k.id) || 'base')}</div><b>${esc(k.name)}</b><small>${esc(k.tag.toUpperCase())}${n ? ' · ' + n + ' ' + tt('store.outfits').toUpperCase() : ''}</small><span class="price ${on ? 'use' : has ? 'own' : ''}">${on ? tt('shop.inUse') : has ? tt('shop.use') : coin(k.price)}</span></button>`;
  }).join('');
  return `<div class="vsec">${tt('store.yourTravelers')}<small>${tt('store.charTap')}</small></div><div class="vg vg3">${cards}</div>`;
}
// Ficha del personaje: retrato, de dónde es, su frase, por qué viaja y sus trajes
function chModal(c, id) {
  const k = c.SKINS.find(s => s.id === id); if (!k) return '';
  const has = c.owned.includes(id), on = id === c.skinId, rc = CH_COL[id] || '#3E5BA9', worn = c.wornOf(id) || 'base';
  const f = key => { const v = tt('ficha.' + id + '.' + key); return v && v !== 'ficha.' + id + '.' + key ? v : ''; };
  const skin = (sid, name, price, story) => {
    const base = sid === 'base', hv = base || c.ownedV.includes(id + ':' + sid), wearing = has && worn === sid;
    return `<button class="sk${wearing ? ' on' : ''}${has ? '' : ' locked'}" data-v="wear" data-id="${id}" data-s="${sid}" style="--rc:${rc};--bg:#FFF1D6"><div class="art">${thumb(c, id, sid)}</div><b>${esc(name)}</b><small>${tt('store.skinTag')}</small><span class="price ${wearing ? 'use' : hv ? 'own' : story ? 'story' : ''}">${wearing ? tt('shop.inUse') : hv ? tt('shop.use') : story ? '📖 ' + tt('store.story') : coin(price)}</span></button>`;
  };
  return `<div class="vmod" data-v="closeM"><div class="card vmc" style="--rc:${rc}"><button class="round vmx" data-v="closeM" aria-label="${tt('common.close')}">✕</button><div class="vmi">
<div class="vmh"><div class="vma">${thumb(c, id, worn)}</div><div><b>${esc(k.name)}</b><small>${esc((f('home') || k.tag).toUpperCase())}</small></div></div>
${f('quote') ? `<div class="vmq">«${esc(f('quote'))}»</div>` : ''}${f('why') ? `<div class="vmw">${esc(f('why'))}</div>` : ''}
<button class="btn ${on ? '' : 'green'} vmb" data-v="sk" data-id="${id}">${on ? tt('shop.inUse') : has ? tt('shop.use') : coin(k.price)}</button>
<div class="vms">${tt('store.outfits')}</div><div class="vg vg3">${skin('base', tt('cloth.base'), 0, false)}${k.skins.map(w => skin(w.id, w.name, w.price, w.story)).join('')}</div></div></div></div>`;
}

function booklet(R, own, isNew) {
  const id = 'g' + R.id;
  return `<svg viewBox="0 0 120 160"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${R.color}"/><stop offset="1" stop-color="${R.dark}"/></linearGradient></defs>
<g stroke="#FFF4DC" stroke-width="6" stroke-linejoin="round"><rect x="10" y="8" width="102" height="146" rx="9" fill="${R.dark}"/><rect x="6" y="4" width="102" height="146" rx="9" fill="url(#${id})"/></g>
<rect x="6" y="4" width="10" height="146" rx="5" fill="${R.dark}" opacity=".55"/>
<rect x="19" y="14" width="82" height="126" rx="6" fill="none" stroke="${R.light}" stroke-width="1.6" stroke-dasharray="4 3" opacity=".9"/>
<g transform="translate(-6 4) scale(1.0)"><circle cx="66" cy="57" r="30" fill="#F2B937" stroke="#FFF4DC" stroke-width="3.5"/><circle cx="66" cy="57" r="24" fill="#FFD86B" stroke="#C98A1E" stroke-width="1.6"/><g transform="translate(6 0)">${GLYPH[R.id] || ''}</g></g>
<text x="62" y="112" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="14" letter-spacing="1" fill="#F2B937" stroke="${R.dark}" stroke-width="3" paint-order="stroke" stroke-linejoin="round">${tt('passport.word')}</text>
<text x="62" y="128" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="11" letter-spacing="1.2" fill="#FFF4DC">${esc(R.name.toUpperCase())}</text>
${own ? `<g class="stp${isNew ? ' new' : ''}"><g opacity=".93"><circle cx="84" cy="88" r="23" fill="#FFF4DC" fill-opacity=".72" stroke="#C8301A" stroke-width="3.5"/><circle cx="84" cy="88" r="18.5" fill="none" stroke="#C8301A" stroke-width="1.4" stroke-dasharray="3 2"/><text x="84" y="92" text-anchor="middle" font-family="'Lilita One',sans-serif" font-size="10.5" fill="#C8301A">${tt('passport.owned')}</text></g></g>` : ''}</svg>`;
}

function pasaportes(c) {
  const V = c.V;
  const cards = V.REGION_ORDER.map((r, i, a) => {
    const R = V.REGIONS[r], own = V.hasPass(r), ds = V.destsOf(r), p = V.passPrice(r);
    const names = ds.slice(0, 4).map(d => c.DESTINOS[d]?.place).filter(Boolean).join(', ') + (ds.length > 4 ? '…' : '');
    const solo = i === a.length - 1 && a.length % 2 === 1;
    return `<button class="pp${own ? ' own' : ''}${solo ? ' solo' : ''}${fresh === r ? ' pulse' : ''}" data-v="pass" data-id="${r}" style="--rl:${R.light};--rd:${R.dark}"><span class="bk">${booklet(R, own, fresh === r)}</span>
<div><b>${esc(R.name)}</b><small>${tt(ds.length === 1 ? 'store.dest.one' : 'store.dest.many', { n: ds.length })}</small><div class="ds">${esc(names)}</div><div class="pm">${tt('store.permanent')}</div>
<span class="price ${own ? 'use' : ''}">${own ? '✓ ' + tt('passport.owned') : coin(p)}</span></div></button>`;
  }).join('');
  return `<div class="vnote hd">${tt('store.passNote')}</div><div class="vg">${cards}</div>`;
}

function fotoState(c, p) {
  const P = c.V.PHOTO, has = P.owned.includes(p.id);
  const on = p.kind === 'deco' ? P.deco.includes(p.id) : P[p.kind] === p.id;
  return { has, on };
}
function fotoCard(c, p) {
  const { has, on } = fotoState(c, p);
  return `<button class="ph${on ? ' on' : ''}" data-v="photo" data-id="${p.id}"><div class="pv">${photoPreview(p.id)}</div><b>${esc(p.name)}</b><span class="price ${on ? 'use' : has ? 'tk' : ''}">${on ? tt('store.placed') : has ? tt('store.have') : coin(p.price)}</span></button>`;
}
function foto(c) {
  const V = c.V;
  return `<div class="vnote hd">${tt('store.photoNote')}</div>` + PHOTO_GROUPS.map(([k, t]) =>
    `<div class="vsec">${t}${k === 'deco' ? `<small>${tt('store.decoMany')}</small>` : ''}</div><div class="vg">${V.PHOTO_ITEMS.filter(p => p.kind === k).map(p => fotoCard(c, p)).join('')}</div>`).join('');
}

function objetos(c) {
  const V = c.V;
  const bar = `<div class="vsub">${SUBS.map(([k, t]) => `<button class="${sub === k ? 'on' : ''}" data-v="sub" data-id="${k}">${tt(t)}</button>`).join('')}</div>`;
  if (sub === 'album') return bar + foto(c);
  if (sub === 'sou') {
    const sou = V.SOUVENIRS.map(s => {
      const R = V.REGIONS[s.region], pass = V.hasPass(s.region) || V.isRico(), has = V.PHOTO.owned.includes(s.id);
      return `<button class="ph${pass || has ? '' : ' lock'}" data-v="sou" data-id="${s.id}"><div class="pv">${photoPreview(s.id)}</div><b>${esc(s.name)}</b>` +
        (has ? `<span class="price tk">${tt('store.have')}</span>` : pass ? `<span class="price">${coin(s.price)}</span>` : `<div class="lk">🔒 ${tt('store.needPass', { pass: esc(R.pass) })}</div>`) + '</button>';
    }).join('');
    return bar + `<div class="vsec">${tt('shop.secSou')}<small>${tt('shop.secSouNote')}</small></div><div class="vg">${sou}</div>`;
  }
  const items = c.ITEMS.map(k => `<button class="it" data-v="item" data-id="${k.id}"><i style="background:${ITEM_COL[k.id] || '#3E5BA9'};color:#fff">${itemIco(k)}</i><div><b>${esc(k.name)}${c.stock[k.id] ? `<u>x${c.stock[k.id]}</u>` : ''}</b><small>${esc(k.tag)}</small></div><span class="price">${coin(k.price)}</span></button>`).join('');
  return bar + `<div class="vsec">${tt('shop.secPower')}<small>${tt('shop.secPowerNote')}</small></div><div class="vg">${items}</div>`;
}
// Bloque de vidas (lo usan la pestaña PRO y el aviso «sin vidas»)
export function livesHTML(c, modal) {
  if (Vidas.infinito) return `<div class="card vlv"><div class="hs">${HEART(1)}</div><b class="t">${tt('lives.inf')}</b><small>${tt('lives.infSub')}</small></div>`;
  const n = Vidas.n, full = n >= Vidas.MAX, nx = Vidas.proxima();
  const hs = Array.from({ length: Vidas.MAX }, (_, i) => HEART(i < n)).join('');
  const sub = full ? tt('lives.full') : tt('lives.next', { t: `<span class="lvT">${reloj(nx)}</span>` }) + ' · ' + tt('lives.fullIn', { t: reloj(Vidas.llenasEn()) });
  const vid = Vidas.puedeVideo();
  return `<div class="card vlv">${modal ? `<b class="t">${tt('lives.none')}</b>` : `<b class="t">${tt('lives.title')}</b>`}<div class="hs">${hs}</div><small>${sub}</small>
<div class="row"><button class="btn" data-v="lvAd"${full || !vid ? ' disabled' : ''}>▶ ${tt('lives.video')}</button><button class="btn green" data-v="lvFill"${full ? ' disabled' : ''}>${tt('lives.fill')} · ${coin(Vidas.PRECIO_LLENAR)}</button></div>
${!full && !vid && Vidas.videosHoy() >= Vidas.VIDEOS_DIA ? `<small style="margin:8px 0 0">${tt('lives.videoLimit')}</small>` : ''}</div>`;
}
const PLANE_I = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#34437F"/><path d="M5 13.2l4.6-.6 3.5-5.2h1.8l-1.6 5 3.9-.5 1.3-1.7h1.2l-.8 2.6.8 2.6h-1.2l-1.3-1.7-3.9-.5 1.6 5h-1.8l-3.5-5.2L5 15z" fill="#F2BC3E"/></svg>';
// Letra chica obligatoria de la suscripción (Apple 3.1.2 / Google Play): renovación automática, cómo cancelar y enlaces a Términos y Privacidad
function legalHTML(c) {
  const L = c.Iap?.legal; if (!L) return '';
  const a = (u, k) => `<a href="${u}" target="_blank" rel="noopener">${tt(k)}</a>`;
  return `<div class="vleg">${tt(esIOS() ? 'legal.subs.ios' : 'legal.subs.android')}<br>${a(esIOS() ? L.eulaApple : L.terminos, 'legal.terms')} · ${a(L.privacidad, 'legal.privacy')}${c.Ads?.privacidadAds ? ` · <a href="#" data-v="adsPriv">${tt('legal.adsPrivacy')}</a>` : ''}</div>`;
}
function vfCard(c) {
  const I = c.Iap, own = I?.frecuente, pk = (I?.paquetes || []).filter(p => p.tipo === 'vf');
  const perks = [['<b style="color:#E8452C;font-size:18px">♥</b>', 'vf.perk.lives'], ['🚫', 'vf.perk.ads'], ['<b style="color:#D9961E;font-size:17px">◉</b>', 'vf.perk.coins']].map(([i, k]) => `<li><i>${i}</i>${tt(k)}</li>`).join('');
  return `<div class="card vfc"><h3>${PLANE_I}${tt('vf.title')}</h3><ul>${perks}</ul>` +
    (own ? `<div class="ok">✓ ${tt('vf.active')}</div>` : pk.map(p => `<button class="it pk${p.destacado ? ' best' : ''}" data-v="pk" data-id="${p.id}"><i>${p.id === '$rc_annual' ? '☀' : '☾'}</i><div><b>${esc(p.nombre)}</b><small>${esc(p.desc)}</small></div><span class="price">${I.precio(p.id)}</span></button>`).join('') + legalHTML(c)) + '</div>';
}
function naCard(c) {
  const I = c.Iap, p = (I?.paquetes || []).find(x => x.tipo === 'noads'); if (!p) return '';
  if (I.frecuente && !I.sinAnuncios) return '';
  return `<div class="card vfc na"><h3>🚫 ${tt('pack.noads')}</h3><p>${tt('pack.noads.long')}</p>` +
    (I.sinAnuncios ? `<div class="ok">✓ ${tt('shop.active')}</div>` : `<button class="it pk" data-v="pk" data-id="${p.id}"><i>✈</i><div><b>${tt('pack.once')}</b><small>${esc(p.desc)}</small></div><span class="price">${I.precio(p.id)}</span></button>`) + '</div>';
}
function pro(c) {
  const I = c.Iap;
  return livesHTML(c) + (I ? vfCard(c) + naCard(c) + `<div class="vg vpro"><button class="link" data-v="restore" style="grid-column:1/3">${tt(I.pro ? 'shop.manage' : 'shop.restore')}</button></div>` : '');
}
// Aviso «sin vidas» al tocar JUGAR o REINTENTAR con 0 vidas. onReady() se llama si el jugador recupera una vida.
let noLivesCb = null;
export function noLives(ctx, onReady) {
  injectCSS(); lastCtx = ctx; noLivesCb = onReady || null;
  document.getElementById('vNoLives')?.remove();
  const m = document.createElement('div'); m.id = 'vNoLives';
  const draw = () => { m.innerHTML = `<div class="vmod" data-v="closeNL"><div class="card vmc" style="padding:14px 4px 10px"><button class="round vmx" data-v="closeNL" aria-label="${tt('common.close')}">✕</button><div class="vmi">${livesHTML(ctx, true)}${ctx.Iap && !ctx.Iap.frecuente ? vfCard(ctx) : ''}</div></div></div>`; };
  m._draw = draw; draw(); m.addEventListener('click', onClick); document.body.appendChild(m);
  tickLives();
}
function tickLives() {
  clearInterval(livesTick);
  livesTick = setInterval(() => {
    const open = document.getElementById('vNoLives') || (document.getElementById('shop')?.style.display === 'block' && tab === 'pro');
    if (!open) { clearInterval(livesTick); return; }
    const nl = document.getElementById('vNoLives');
    if (nl && Vidas.puede() && noLivesCb) { const f = noLivesCb; noLivesCb = null; nl.remove(); f(); return; }
    const el = document.querySelectorAll('.lvT'); if (!el.length) return;
    const nx = Vidas.proxima(); if (nx <= 0) { nl ? nl._draw() : render(); return; }
    el.forEach(e => e.textContent = reloj(nx));
  }, 1000);
}

// ── Estructura y render ──
function shell(panel) {
  if (panel.dataset.tienda) return;
  panel.dataset.tienda = '1';
  const head = panel.querySelector('.head');
  [...panel.children].forEach(n => { if (n !== head) n.remove(); });
  panel.insertAdjacentHTML('beforeend', `<div class="vtabs" id="vTabs">${TABS.map(([k, i, t]) => `<button data-t="${k}"><i>${TAB_ICO[i]}</i>${t}</button>`).join('')}</div><div id="vBody"></div>`);
  panel.addEventListener('click', onClick);
}
function render() {
  const c = lastCtx, panel = document.getElementById('shop');
  if (!c || !panel) return;
  const w = panel.querySelector('#sWallet'); if (w) w.textContent = c.walletTxt ?? c.wallet;
  panel.querySelectorAll('#vTabs button').forEach(b => { const on = b.dataset.t === tab; b.classList.toggle('on', on); if (on) b.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); });
  const body = panel.querySelector('#vBody'), st = panel.scrollTop; if (!body) return;
  body.innerHTML = { viajeros, pasaportes, objetos, pro }[tab](c);
  if (tab === 'pro') tickLives();
  panel.scrollTop = st;
  document.getElementById('vModal')?.remove();
  if (modal) { const m = document.createElement('div'); m.id = 'vModal'; m.innerHTML = chModal(c, modal); m.addEventListener('click', onClick); document.body.appendChild(m); }
}
function bad(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function done(c, el) { c.refresh(); render(); }

async function onClick(e) {
  const c = lastCtx; if (!c) return;
  const tb = e.target.closest('#vTabs button');
  if (tb) { c.SFX.tap(); tab = tb.dataset.t; fresh = null; document.getElementById('shop').scrollTop = 0; render(); return; }
  const el = e.target.closest('[data-v]'); if (!el) return;
  const kind = el.dataset.v, id = el.dataset.id, V = c.V;
  if (kind === 'closeM') { if (e.target !== el && !e.target.closest('.vmx')) return; c.SFX.tap(); modal = null; return render(); }
  if (kind === 'closeNL') { if (e.target !== el && !e.target.closest('.vmx')) return; c.SFX.tap(); noLivesCb = null; document.getElementById('vNoLives')?.remove(); return; }
  if (kind === 'lvAd' || kind === 'lvFill') return livesBuy(c, kind, el);
  if (kind === 'adsPriv') { e.preventDefault(); return c.Ads?.opcionesPrivacidad(); }
  if (kind === 'ch') { c.SFX.tap(); modal = id; return render(); }
  if (kind === 'sub') { c.SFX.tap(); sub = id; document.getElementById('shop').scrollTop = 0; return render(); }
  if (kind === 'sk') {
    const k = c.SKINS.find(s => s.id === id), price = k.price, name = k.name;
    if (!c.owned.includes(id)) {
      if (!c.buy(price, name)) return bad(el);
      c.owned.push(id); c.saveOwned(); c.setSkin(id); c.SFX.buy(); c.pop(tt('toast.prize', { name: name.toUpperCase() }), 'big');
    } else { c.SFX.tap(); c.setSkin(id); }
    done(c);
  } else if (kind === 'wear') {
    const k = c.SKINS.find(s => s.id === id);
    if (!c.owned.includes(id)) { c.SFX.nope(); c.toast(tt('store.skinNeed', { name: k.name.toUpperCase() })); return bad(el); }
    if (el.dataset.s === 'base') { c.SFX.tap(); c.setWear(id, 'base'); if (id !== c.skinId) c.setSkin(id); return done(c); }
    const w = k.skins.find(x => x.id === el.dataset.s), key = id + ':' + w.id;
    if (!c.ownedV.includes(key) && w.story) { c.SFX.nope(); c.toast(tt('store.storyNeed', { name: k.name })); return bad(el); }
    if (!c.ownedV.includes(key)) {
      if (!c.buy(w.price, w.name)) return bad(el);
      c.ownedV.push(key); c.saveOwnedV(); c.SFX.buy(); c.pop(tt('toast.prize', { name: w.name.toUpperCase() }), 'big');
      c.setWear(id, w.id); if (id !== c.skinId) c.setSkin(id);
    } else { c.SFX.tap(); c.setWear(id, c.wornOf(id) === w.id ? 'base' : w.id); if (id !== c.skinId) c.setSkin(id); }
    done(c);
  } else if (kind === 'pass') {
    if (V.hasPass(id)) { c.SFX.tap(); return; }
    const R = V.REGIONS[id], price = V.passPrice(id), w = c.wallet;
    if (w < price) { c.buy(price, R.pass); return bad(el); } // buy() avisa "TE FALTAN…"
    if (!c.buy(price, R.pass)) return bad(el);
    const r = V.buyPass(id, w); // se le pasa el saldo previo al cobro: buyPass sólo valida
    if (!r.ok) { c.addCoins(price); return bad(el); }
    fresh = id; c.SFX.stamp(); c.confetti(); c.pop(tt('toast.prize', { name: R.pass.toUpperCase() }), 'big');
    done(c); setTimeout(() => { if (fresh === id) fresh = null; }, 900);
  } else if (kind === 'photo' || kind === 'sou') {
    const P = V.PHOTO;
    if (kind === 'sou') {
      const s = V.SOUVENIRS.find(x => x.id === id);
      if (P.owned.includes(id)) return c.SFX.tap();
      if (!V.hasPass(s.region) && !V.isRico()) { c.SFX.nope(); c.toast(tt('toast.needPass', { pass: V.REGIONS[s.region].pass.toUpperCase() })); return bad(el); }
      if (!c.buy(s.price, s.name)) return bad(el);
      P.owned.push(id); V.savePhoto(); c.SFX.buy(); c.pop(tt('toast.prize', { name: s.name.toUpperCase() }), 'big'); return done(c);
    }
    const p = V.PHOTO_ITEMS.find(x => x.id === id);
    if (!P.owned.includes(id)) {
      if (!c.buy(p.price, p.name)) return bad(el);
      P.owned.push(id); c.SFX.buy();
    } else c.SFX.tap();
    if (p.kind === 'deco') { const i = P.deco.indexOf(id); i >= 0 ? P.deco.splice(i, 1) : P.deco.push(id); }
    else P[p.kind] = id;
    V.savePhoto(); done(c);
  } else if (kind === 'item') {
    const k = c.ITEMS.find(x => x.id === id);
    if (!c.buy(k.price, k.name)) return bad(el);
    c.stock[id]++; c.saveStock(); c.SFX.buy(); done(c);
  } else if (kind === 'paywall' || kind === 'pk' || kind === 'restore') proFlow(c, kind, id);
}

async function livesBuy(c, kind, el) {
  const redraw = () => { const nl = document.getElementById('vNoLives'); if (nl) { if (Vidas.puede() && noLivesCb) { const f = noLivesCb; noLivesCb = null; nl.remove(); c.refresh(); return f(); } nl._draw(); } c.refresh(); render(); };
  if (kind === 'lvFill') {
    if (!c.buy(Vidas.PRECIO_LLENAR, tt('lives.fill'))) return bad(el);
    Vidas.llenar(); c.SFX.buy(); c.pop(tt('lives.filled'), 'big'); return redraw();
  }
  if (!Vidas.puedeVideo()) return c.SFX.nope();
  c.SFX.tap();
  if (await c.Ads.recompensa('life')) { Vidas.contarVideo(); Vidas.sumar(1); c.SFX.prize?.(); c.pop(tt('lives.plusOne'), 'big'); }
  redraw();
}
async function proFlow(c, kind, id) {
  const I = c.Iap, ok = () => { document.getElementById('vNoLives')?.remove(); if (noLivesCb && Vidas.puede()) { const f = noLivesCb; noLivesCb = null; setTimeout(f, 600); } c.pop(tt(I.frecuente ? 'toast.vf' : 'toast.pro'), 'big'); c.SFX.buy(); c.confetti(); document.body.classList.remove('ads'); c.refresh(); render(); };
  c.SFX.tap();
  if (kind === 'paywall') {
    const r = await I.paywall();
    if (r === 'PURCHASED' || r === 'RESTORED') ok(); else if (r === 'sin-ui') c.toast(tt('toast.pickPlan'));
  } else if (kind === 'pk') {
    if (I.tiene(id)) return c.toast(tt('toast.alreadyPro'));
    const r = await I.comprar(id);
    if (r === 'ok') ok(); else if (r === 'solo-app') c.toast(tt('toast.storeOnly')); else if (r === 'error') c.toast(tt('toast.purchaseError'));
  } else if (I.pro) { if (!await I.centroCliente()) c.toast(tt('toast.manageInApp')); }
  else { c.toast(await I.restaurar() ? tt('toast.restored') : tt('toast.noRestore')); c.refresh(); render(); }
}

export function openShop(ctx, t = 'viajeros') {
  const panel = document.getElementById('shop'); if (!panel) return;
  injectCSS(); shell(panel);
  lastCtx = ctx; fresh = null; modal = null;
  if (t === 'foto') t = 'objetos:album';
  const [tb, sb] = String(t || 'viajeros').split(':');
  tab = TABS.some(x => x[0] === tb) ? tb : 'viajeros'; if (tab === 'objetos') sub = SUBS.some(x => x[0] === sb) ? sb : 'power';
  panel.style.display = 'block'; panel.scrollTop = 0;
  render();
}
// Para redibujar desde afuera (p. ej. Iap.onCambio) si la tienda está abierta.
export function refreshShop() { if (document.getElementById('shop')?.style.display === 'block') render(); }
