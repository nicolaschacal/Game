// Pantalla de primera vez: elegir viajero (Mora · Nilo · Ren). Contrato: showTravelerPick(ctx, onDone).
// Protagonista grande con saludo (frame wave) y pestañeo (frames idle), cinta con el nombre, bio en burbuja de papel,
// flechas/swipe/puntos, "Empezás en <ciudad>" con mini pasaporte y botón ELEGIR Y VIAJAR.
const CSS = `
#tpick{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;overflow:hidden;color:var(--ink);font-family:Nunito,system-ui,sans-serif;touch-action:pan-y;user-select:none;-webkit-user-select:none;
 background:radial-gradient(ellipse at 50% 38%,#2d2750d9,#1B1730f2 75%);animation:tpIn .35s ease both}
#tpick.out{animation:tpOut .45s ease both}
@keyframes tpIn{from{opacity:0}}@keyframes tpOut{to{opacity:0;transform:scale(1.06)}}
@media(min-width:600px){#tpick{max-width:480px;left:50%;right:auto;width:100%;transform:translateX(-50%)}}
#tpick .tp-cl{position:absolute;border-radius:99px;background:var(--cream);opacity:.16;box-shadow:24px -12px 0 -2px var(--cream),-26px -6px 0 -4px var(--cream);animation:tpCl 26s linear infinite}
@keyframes tpCl{from{transform:translateX(-120px)}to{transform:translateX(560px)}}
#tpick .tp-top{margin-top:calc(var(--st,0px) + 20px);text-align:center;position:relative;z-index:2}
#tpick .tp-top small{display:block;font:900 11px Nunito;letter-spacing:2.6px;color:#fff4dcbf}
#tpick .tp-top b{display:block;font:400 30px/32px 'Lilita One',sans-serif;color:var(--cream);text-shadow:0 3px 0 var(--ink),2px 0 0 var(--ink),-2px 0 0 var(--ink),0 -2px 0 var(--ink)}
#tpick .tp-stage{position:relative;width:100%;flex:none;height:min(44vh,360px);margin-top:6px}
#tpick .tp-hill{position:absolute;left:50%;bottom:10px;width:88%;height:34%;transform:translateX(-50%);border-radius:50% 50% 24px 24px/70% 70% 24px 24px;border:3px solid var(--ink);box-shadow:0 5px 0 var(--ink);transition:background .35s}
#tpick .tp-hero{position:absolute;left:50%;bottom:calc(10px + 6%);width:min(76vw,330px);aspect-ratio:1;margin-left:calc(min(76vw,330px)/-2);filter:drop-shadow(0 10px 6px rgba(0,0,0,.35))}
#tpick .tp-hero svg{width:100%;height:100%;display:block}
#tpick .tp-hero.in-r{animation:tpR .38s cubic-bezier(.2,.9,.3,1) both}#tpick .tp-hero.in-l{animation:tpL .38s cubic-bezier(.2,.9,.3,1) both}
@keyframes tpR{from{opacity:0;transform:translateX(90px) scale(.9) rotate(4deg)}}@keyframes tpL{from{opacity:0;transform:translateX(-90px) scale(.9) rotate(-4deg)}}
#tpick .tp-hero.hop{animation:tpHop .5s ease}
@keyframes tpHop{30%{transform:translateY(-26px) rotate(-3deg)}60%{transform:translateY(0) scaleY(.94)}80%{transform:translateY(-8px)}}
#tpick .tp-arrow{position:absolute;top:42%;width:46px;height:46px;border-radius:50%;background:var(--cream);border:3px solid var(--ink);box-shadow:0 4px 0 var(--ink);color:var(--ink);font:400 30px/36px 'Lilita One',sans-serif;text-align:center;padding:0;z-index:3;cursor:pointer}
#tpick .tp-arrow:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
#tpick .tp-ribbon{position:relative;z-index:2;margin-top:-6px;padding:6px 38px 8px;background:var(--red);border:3px solid var(--ink);border-radius:12px;box-shadow:0 4px 0 var(--ink);font:400 32px/34px 'Lilita One',sans-serif;letter-spacing:2px;color:var(--cream);text-shadow:0 3px 0 var(--redD);transform:rotate(-1.5deg)}
#tpick .tp-ribbon:before,#tpick .tp-ribbon:after{content:"";position:absolute;top:9px;width:22px;height:100%;background:var(--redD);border:3px solid var(--ink);z-index:-1}
#tpick .tp-ribbon:before{left:-17px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,30% 50%)}#tpick .tp-ribbon:after{right:-17px;clip-path:polygon(0 0,100% 0,70% 50%,100% 100%,0 100%)}
#tpick .tp-bubble{position:relative;margin:16px 22px 0;padding:12px 16px 13px;border-radius:20px;background:var(--cream);border:3px solid var(--ink);box-shadow:0 5px 0 var(--ink);font:900 14.5px/1.38 Nunito,sans-serif;text-align:center;color:var(--ink);min-height:84px;display:flex;align-items:center;justify-content:center}
#tpick .tp-bubble:before{content:"";position:absolute;left:50%;top:-12px;margin-left:-11px;width:20px;height:20px;background:var(--cream);border-left:3px solid var(--ink);border-top:3px solid var(--ink);transform:rotate(45deg) skew(8deg,8deg);border-radius:4px 0 0 0}
#tpick .tp-bubble span{position:relative}
#tpick .tp-dots{display:flex;gap:9px;margin-top:14px}
#tpick .tp-dots i{width:11px;height:11px;border-radius:50%;background:#fff4dc55;border:2.5px solid var(--ink);transition:.25s}#tpick .tp-dots i.on{background:var(--gold);transform:scale(1.35)}
#tpick .tp-from{display:flex;align-items:center;gap:10px;margin-top:12px;font:900 12px Nunito;letter-spacing:.8px;color:#fff4dcd9}
#tpick .tp-from b{color:var(--cream);font:400 17px 'Lilita One',sans-serif;letter-spacing:.5px}
#tpick .tp-pass{position:relative;width:30px;height:40px;border-radius:4px 7px 7px 4px;border:2.5px solid var(--ink);box-shadow:0 3px 0 var(--ink);flex:none;transform:rotate(-6deg);transition:background .3s}
#tpick .tp-pass:before{content:"";position:absolute;left:6px;top:8px;width:14px;height:14px;border-radius:50%;border:2px solid #fff9}
#tpick .tp-pass:after{content:"";position:absolute;left:5px;right:5px;bottom:6px;height:3px;border-radius:2px;background:#fff9}
#tpick .tp-go{margin:auto 22px calc(var(--sb,0px) + 22px);width:calc(100% - 44px);max-width:420px;flex:none}
#tpick .tp-go.stamped{animation:tpStamp .4s ease}@keyframes tpStamp{40%{transform:scale(.92)}70%{transform:scale(1.05)}}
#tpick .tp-mark{position:absolute;left:50%;top:40%;width:150px;height:150px;margin:-75px;border-radius:50%;border:6px solid var(--red);color:var(--red);font:400 28px/1.05 'Lilita One',sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;opacity:0;pointer-events:none;z-index:5;background:#fff4dcd9;letter-spacing:1px}
#tpick .tp-mark.show{animation:tpMark .7s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes tpMark{0%{opacity:0;transform:scale(2.4) rotate(-20deg)}35%{opacity:1;transform:scale(1) rotate(-12deg)}100%{opacity:1;transform:scale(1) rotate(-12deg)}}
@media(max-height:700px){#tpick .tp-stage{height:36vh}#tpick .tp-bubble{min-height:70px;font-size:13.5px}}
`;
const ORDER = ['mora', 'nilo', 'ren'];

export function showTravelerPick(ctx, onDone) {
  if (!document.getElementById('tpick-css')) { const st = document.createElement('style'); st.id = 'tpick-css'; st.textContent = CSS; document.head.appendChild(st); }
  const old = document.getElementById('tpick'); if (old) old.remove();
  const V = ctx.V, list = ORDER.map(id => V.TRAVELERS.find(t => t.id === id)).filter(Boolean);
  let i = Math.max(0, list.findIndex(t => t.id === 'nilo')), timers = [], busy = false, tick = 0, wavingUntil = 0;
  const el = document.createElement('div'); el.id = 'tpick';
  el.innerHTML = `<div class="tp-cl" style="top:12%;width:90px;height:26px;animation-delay:-4s"></div><div class="tp-cl" style="top:46%;width:70px;height:22px;animation-delay:-15s;animation-duration:34s"></div>
  <div class="tp-top"><small>PRIMER VIAJE</small><b>ELEGÍ A TU VIAJERO</b></div>
  <div class="tp-stage"><div class="tp-hill"></div><div class="tp-hero"></div>
   <button class="tp-arrow" style="left:10px" aria-label="Anterior">‹</button><button class="tp-arrow" style="right:10px" aria-label="Siguiente">›</button></div>
  <div class="tp-ribbon"></div>
  <div class="tp-bubble"><span></span></div>
  <div class="tp-dots">${list.map(() => '<i></i>').join('')}</div>
  <div class="tp-from"><span class="tp-pass"></span><span>Empezás en <b class="tp-city"></b></span></div>
  <button class="btn green tp-go">ELEGIR Y VIAJAR</button><div class="tp-mark">¡A<br>VIAJAR!</div>`;
  const $ = s => el.querySelector(s);
  const hero = $('.tp-hero'), dots = [...el.querySelectorAll('.tp-dots i')];
  const frames = () => ctx.artFor(list[i].id).HERO;
  let art = frames();
  const setFrame = svg => { if (hero._f !== svg) { hero.innerHTML = svg; hero._f = svg; } };
  // Animación: saluda ~2.2 s al aparecer cada viajero (alterna wave/idle) y después pestañea con la secuencia idle
  const loop = () => {
    tick++;
    if (Date.now() < wavingUntil) setFrame(tick % 3 === 0 ? art.idle[0] : art.wave[0]);
    else setFrame(art.idle[(tick - 1) % art.idle.length]);
  };
  const show = dir => {
    const t = list[i], r = V.REGIONS[t.region], d = ctx.DESTINOS[t.home];
    art = frames(); tick = 0; wavingUntil = Date.now() + 2300;
    hero.className = 'tp-hero ' + (dir > 0 ? 'in-r' : dir < 0 ? 'in-l' : ''); void hero.offsetWidth;
    hero._f = null; loop();
    $('.tp-ribbon').textContent = t.name.toUpperCase();
    $('.tp-bubble span').textContent = t.bio;
    $('.tp-city').textContent = d ? d.place : '';
    $('.tp-pass').style.background = r.color; $('.tp-hill').style.background = r.light;
    $('.tp-pass').title = r.pass;
    dots.forEach((x, k) => x.classList.toggle('on', k === i));
  };
  const go = dir => { if (busy) return; i = (i + dir + list.length) % list.length; try { ctx.SFX.tap(); } catch (e) {} show(dir); };
  $('.tp-arrow[aria-label=Anterior]').onclick = () => go(-1);
  $('.tp-arrow[aria-label=Siguiente]').onclick = () => go(1);
  // swipe horizontal
  let sx = null;
  el.addEventListener('pointerdown', e => { sx = e.clientX; });
  el.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
  el.addEventListener('pointercancel', () => { sx = null; });
  // tocar al personaje: saluda de nuevo
  hero.onclick = () => { wavingUntil = Date.now() + 1600; hero.classList.remove('hop'); void hero.offsetWidth; hero.classList.add('hop'); };
  const close = () => { timers.forEach(clearTimeout); clearInterval(iv); document.removeEventListener('keydown', key); el.remove(); };
  const key = e => { if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'Enter') pick(); };
  const pick = () => {
    if (busy) return; busy = true; const t = list[i];
    $('.tp-go').classList.add('stamped'); $('.tp-mark').classList.add('show');
    try { ctx.SFX.stamp(); } catch (e) {}
    try { ctx.buzz && ctx.buzz([70, 40, 25]); } catch (e) {}
    V.pickTraveler(t.id);
    wavingUntil = Date.now() + 1500; hero.classList.add('hop');
    timers.push(setTimeout(() => el.classList.add('out'), 1000));
    timers.push(setTimeout(() => { close(); onDone && onDone(t.id); }, 1450));
  };
  $('.tp-go').onclick = pick;
  document.addEventListener('keydown', key);
  const iv = setInterval(loop, 170);
  (document.getElementById('stage') ? document.body : document.body).appendChild(el);
  show(0);
  return { close };
}
