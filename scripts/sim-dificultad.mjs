// Simulador de dificultad de Paper Voyager (headless, node >= 18).
// Ejecuta el MISMO código de index.html (generador, DIFF, solver, buildToward, enterRow, moverHit, deriva, aduana) con stubs de DOM/Three,
// y reproduce la física de scene3d.js (avance, visualLane, muerte por camino cortado). Bots con límites humanos.
// USO:  node scripts/sim-dificultad.mjs [--levels=20,40,60,80,100] [--n=50] [--bots=human,expert] [--seed=1] [--v] [--dump=w]
//   --n partidas por nivel/bot · --bots human|expert|ideal · --v causas detalladas · --dump=w imprime la causa de cada muerte
// PV_HTML=ruta/a/index.html permite medir otra versión del juego (p. ej. la original para comparar antes/después).
// Parámetros de los bots: ver BOTS. Los bots NO usan ítems. El simulador usa index.html del repo (cwd = raíz del repo o ruta junto al script).
import fs from 'fs';import os from 'os';import path from 'path';import {fileURLToPath,pathToFileURL} from 'url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'pvsim-'));
// ── stubs globales ──
const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='then'?undefined:k==='length'?0:k===Symbol.iterator?function*(){}:P,apply:()=>P,construct:()=>P,set:()=>true});
const mem=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size},clear:()=>m.clear()};};
Object.defineProperty(globalThis,'navigator',{value:{language:'es',languages:['es'],userAgent:'node'},configurable:true});
Object.assign(globalThis,{document:P,window:P,visualViewport:P,Audio:function(){return P},ResizeObserver:function(){return P},IntersectionObserver:function(){return P},MutationObserver:function(){return P},screen:P,history:P,Capacitor:P,localStorage:mem(),sessionStorage:mem(),requestAnimationFrame:()=>0,getComputedStyle:()=>P,matchMedia:()=>P,AudioContext:undefined,Image:function(){return P},HTMLElement:function(){}});
process.on('unhandledRejection',()=>{});const realST=globalThis.setTimeout;globalThis.setTimeout=()=>0;globalThis.setInterval=()=>0;
Object.defineProperty(globalThis,'location',{value:{search:'',reload(){},href:'',hash:'',pathname:'/'},writable:true,configurable:true});
// stubs de módulos
const names=s=>[...s.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\/paper-voyager\/scene3d\.js'/g)][0][1].split(',').map(x=>x.trim());
fs.writeFileSync(path.join(TMP,'scene3d.mjs'),`export const mountScene=()=>true,runnerLaneAtScreen=()=>null,updateRunnerTile=()=>{},runnerPulse=()=>{},runnerStats=()=>({}),runnerHideItems=()=>{},driftSwoosh=()=>{},driftOff=()=>{},markDecoys=()=>{},setGroundColor=()=>{},setHour=()=>{},freezeMovers=()=>{},renderPolicy=()=>{},setWeather=()=>{},qualityInfo=()=>({});
export function moverLane(mv,now=globalThis.__simNow){const u=((now/1000+mv.phase)/mv.period)%1,tri=u<.5?u*2:2-u*2,k=Math.max(0,Math.min(1,(tri-.28)/.44));return mv.a+(mv.b-mv.a)*k*k*(3-2*k);}`); // copia de scene3d.js moverLane
fs.writeFileSync(path.join(TMP,'clima.mjs'),`export const lluviaAhora=()=>false,climaEstado=()=>({estado:'off',texto:'',temp:0,lluvia:false}),alternarClima=async()=>'ok',refrescarSiHaceFalta=async()=>{},horaFija=()=>null;`);
fs.writeFileSync(path.join(TMP,'mon.mjs'),`const P=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='then'?undefined:k==='recompensa'?async()=>false:P,apply:()=>P});export const Ads=P,Iap=P;`);
fs.writeFileSync(path.join(TMP,'i18n.mjs'),`export const t=k=>k,applyI18n=()=>{},LANGS=[{code:'es',name:'Español'}],lang='es',setLang=()=>{};`);
const U=f=>pathToFileURL(path.join(ROOT,'paper-voyager',f)).href;
// ── genera el módulo del juego ──
function buildSrc(){
 const html=fs.readFileSync(process.env.PV_HTML||path.join(ROOT,'index.html'),'utf8');
 let s=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)][0][1];
 const map={'scene3d.js':'scene3d.mjs','clima.js':'clima.mjs','monetizacion.js':'mon.mjs','i18n.js':'i18n.mjs'};
 s=s.replace(/from\s*'\.\/paper-voyager\/([^']+)'/g,(m,f)=>"from '"+(map[f]?pathToFileURL(path.join(TMP,map[f])).href:U(f))+"'");
 s=s.replace(/import\('\.\/paper-voyager\/[^']+'\)/g,'Promise.resolve({})');
 s=s.replace('(document.fonts?.ready||Promise.resolve())','Promise.resolve()');
 const rep=(a,b)=>{if(!s.includes(a))throw new Error('patch no aplica: '+a.slice(0,50));s=s.replace(a,b);};
 rep('let a=(Date.now()^0x9E3779B9)>>>0;','let a=(globalThis.__seed^0x9E3779B9)>>>0;');
 rep('DIF=V.difficulty(),LAP','DIF=Object.assign(V.difficulty(),{P:globalThis.__w}),LAP');
 rep('function nextWorld(){','function nextWorld(){globalThis.__won=true;return;}function __nw0(){');
 rep('function onGameOver(){','function onGameOver(){globalThis.__dead=true;return;}function __og0(){');
 s+=`\nglobalThis.__G={runner,buildToward,isRockCell,targetRow,prevExit,zone,blockers,movers,drift,driftRows,driftOn,driftLand,custClosed,cust,START,GOAL,RUNWAY,ROWS,blockSet,enterRow,moverHit,speedAt,D,S,DIF,COLS,decoyIds,driftTramos,spans,moverLane:(m,n)=>moverLane(m,n),
 get lastRow(){return lastRow},set lastRow(v){lastRow=v},get held(){return buildHeld},set held(v){buildHeld=v},get lclock(){return lateralClock},set lclock(v){lateralClock=v},begin,clampLane,rides,get rideIndex(){return rideIndex}};`;
 return s;}
let SRC=null,gid=0;
export async function newWorld(w,seed){
 SRC??=buildSrc();globalThis.__seed=seed>>>0;globalThis.__w=w;globalThis.__won=false;globalThis.__dead=false;
 globalThis.location.search='?world='+(1+(seed%21));
 const f=path.join(TMP,'game.mjs');if(!gid)fs.writeFileSync(f,SRC);
 await import(pathToFileURL(f).href+'?g='+(++gid));
 return globalThis.__G;}

// ── bots ──
// visible = filas legibles por delante (cámara: fov 58°, a 800 px de alto una fila mide ~6 px a 14 filas y ~4 px a 20); react = latencia de decisión (s);
// rate = máx. cambios de dedo por segundo; jit = desvío del instante del toque (s); err = prob. de caer en el carril contiguo; mvSig = error al estimar cuándo pasa un móvil (s);
// lead = anticipación del toque respecto de la fila (s); hold = margen de seguridad frente a móviles (carriles)
export const BOTS={
 human:{visible:14,react:.30,rate:5.5,jit:.07,err:.015,mvSig:.10,lead:.12,margin:.9},
 expert:{visible:20,react:.18,rate:8,jit:.03,err:.004,mvSig:.04,lead:.05,margin:.75},
 ideal:{visible:40,react:0,rate:1e3,jit:0,err:0,mvSig:0,lead:0,margin:.75}};
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const gauss=r=>Math.sqrt(-2*Math.log(r()||1e-9))*Math.cos(2*Math.PI*r());
const DT=1/120,EXT=.07;
export async function playOne(w,seed,botName,opt={}){
 const B=BOTS[botName],rng=mulberry(seed*7919+botName.length*13+w),G=await newWorld(w,seed),R=G.runner,C=G.COLS;
 const base=rng()*1e5;let t=0;globalThis.__simNow=base;
 // mundo de la partida
 const mvNoise={};const noise=y=>mvNoise[y]??=gauss(rng)*B.mvSig;
 const tSw={};let queue=[],lastEv=-9,lastPlan=-9,lastTarget=null,Lrow={},events=0,fingerEvents=0;
 const speed=()=>R.speed||1.3;
 // filas -> tabla de celdas para el plan
 const tabCache={};
 function tab(y,tNow,v,kMax){ // celdas bloqueadas (a distintos instantes de la fila) y peligro de móvil para la fila y
  const tb=tNow+((G.START-(y+1))-R.distance)/v+noise(y),tc=tb+1/v,out={rk:[],dr:Array(C).fill(0)};
  const ms=G.movers[y];
  for(let j=0;j<=4;j++){const a=Array(C).fill(false);for(let x=0;x<C;x++)a[x]=G.blockSet.has(x+','+y)||G.custClosed(x,y);
   if(ms)for(const m of ms){const l=Math.round(G.moverLane(m.mv,base+(tb+EXT*j)*1000));a[l]=true;}
   out.rk.push(a);}
  for(let x=0;x<C;x++)out.dr[x]=G.driftOn(x,y);
  out.ml=Array(C).fill(false);if(ms)for(const m of ms){out.ml[m.mv.a]=true;out.ml[m.mv.b]=true;}out.sol=Array(C).fill(false);for(let x=0;x<C;x++)out.sol[x]=G.blockSet.has(x+','+y)||G.custClosed(x,y);if(ms)for(const m of ms){out.sol[m.mv.a]=true;out.sol[m.mv.b]=true;}
  out.mv=[];out.mvS=[];if(ms)for(let s=-1.3/v;s<=.42/v;s+=.03){out.mv.push({p:-s*v,ls:ms.map(m=>G.moverLane(m.mv,base+(tc+s)*1000))});out.mvS.push({p:-s*v,ls:ms.flatMap(m=>[m.mv.a,m.mv.b])});}
  return out;}
 // trayectoria del corredor sobre la fila (misma fórmula que scene3d: entrada f→x1 antes del centro, x1→xe después) contra la posición de cada móvil
 function hitMv(S,e,f,x1,xe){let vl=e;const k=1-Math.exp(-14*.03);for(const q of S){const p=q.p,want=p>1?e:p>.65?e+(f-e)*(1-p)/.35:p>0?f+(x1-f)*Math.max(0,Math.min(1,(1-p-.35)/.65)):x1+(xe-x1)*Math.min(1,-p/.35);vl+=(want-vl)*k; // visualLane del juego: suavizado exponencial (14/s) hacia la trayectoria
  if(Math.abs(p)<=.42)for(const l of q.ls)if(Math.abs(l-vl)<B.margin)return true;}return false;}
 function outc(T,f,L,kMax,strict,e=f,solid=false){
  const rk=solid?(x=>x<0||x>=C||T.sol[x]):((x,j)=>x<0||x>=C||T.rk[Math.min(j,4)][x]);
  let x=Math.abs(L-f)>1?f+Math.sign(L-f):L;
  if(rk(x,0)){if(x!==f&&!rk(f,0))x=f;else return null;}
  let x1=x;const d=T.dr[x];if(d){let n=x+d;if(Math.abs(n-f)>1)n=x;if(n>=0&&n<C){if(rk(n,0))return null;x1=n;}}
  let hit=false,xe=x1,j=1;while(xe!==L&&j<=kMax){const nx=xe+Math.sign(L-xe);if(rk(nx,1+j))break;xe=nx;j++;}
  if(T.mv.length&&hitMv(T.mv,e,f,x1,xe)){if(strict)return null;hit=true;}
  const hitS=T.mv.length>0&&hitMv(T.mvS,e,f,x1,xe),gam=T.ml[x1]||T.ml[xe]; // hitS: peligro si el móvil estuviera en cualquiera de sus dos extremos · gam: apuesta por el tiempo del móvil (carril propio del móvil)
  return {x1,x:xe,d:!!d,hit,hitS,gam};}
 function dp(rows,Ts,f0,Lp0,kMax,strict,e0=f0,solid=false){
  let layer=new Map([[(f0*C+Lp0)*C+e0,{c:0,bp:null,L:null}]]),deep=[layer];
  for(let i=0;i<rows.length;i++){const next=new Map();
   for(const [k,st] of layer){const x=Math.floor(k/C/C),Lp=Math.floor(k/C)%C,ep=k%C;
    for(let L=0;L<C;L++){const o=outc(Ts[i],x,L,kMax,strict,ep,solid);if(!o)continue;
     const c=st.c+(L!==Lp?1:0)+(o.x!==o.x1?.4:0)+(o.x1!==x?.15:0)+(o.d?.3:0)+(o.hit?3:0)+(o.hitS?2.5:0)+(o.gam?5:0)-(Lrow[rows[i]]===L?.25:0)+(i===rows.length-1&&(o.x===0||o.x===C-1)?.3:0),kk=(o.x*C+L)*C+o.x1,e=next.get(kk);
     if(!e||c<e.c)next.set(kk,{c,bp:st,L,k});}}
   if(!next.size)break;layer=next;deep.push(layer);}
  let best=null;for(const [k,st] of layer)if(!best||st.c<best.c)best=st;
  const Ls=[];for(let s=best;s&&s.bp;s=s.bp)Ls.push(s.L);Ls.reverse();return Ls;} // Ls[i] = carril del dedo para rows[i]
 function replan(){
  const yt=G.targetRow(),v=speed();if(yt<G.GOAL)return;
  const tRow=y=>t+((G.START-(y+1))-R.distance)/v,kMax=Math.min(4,Math.max(1,Math.floor(.9/v/EXT)));
  const commit=y=>tRow(y)-B.lead<t+B.react;
  // estado previsto tras las filas ya comprometidas
  let y=yt,x,Lc=R.buildLane,e1=null;
  if(R.path[yt]){x=R.path[yt].x;y=yt-1;}else x=G.prevExit(yt);
  for(;y>=G.GOAL&&commit(y);y--){const L=Lrow[y]??Lc,o=outc(tab(y,t,v,kMax),x,L,kMax,false);if(!o){x=x;break;}x=o.x;Lc=L;e1=o.x1;}
  const yS=y,seen=Math.floor(G.START-(R.distance-v*B.react))-B.visible,yEnd=Math.max(G.GOAL,seen,yS-24);
  if(yS<yEnd)return;
  const rows=[],Ts=[];for(let q=yS;q>=yEnd;q--){rows.push(q);Ts.push(tab(q,t,v,kMax));}
  const e0=R.path[yS+1]?.e??e1??x;let Ls=dp(rows,Ts,x,Lc,kMax,true,e0),loose=false;const need=Math.min(rows.length,8);if(Ls.length<need){Ls=dp(rows,Ts,x,Lc,kMax,false,e0);loose=true;}
  opt.trace?.({t,yt,yS,x,Lc,rows,Ls,Ts,loose});
  queue=queue.filter(e=>e.y>yS);let prev=Lc;
  let pL=Lc;for(let i=0;i<Ls.length;i++){Lrow[rows[i]]=Ls[i];if(Ls[i]!==pL){queue.push({y:rows[i],L:Ls[i],off:-B.lead+gauss(rng)*B.jit,tau:0});pL=Ls[i];}}
  for(const e of queue)e.tau=tSw[e.y]!==undefined?tSw[e.y]+e.off:tRow(e.y)+e.off;
  queue.sort((a,b)=>b.y-a.y);}
 function applyEv(e){let L=e.L;if(rng()<B.err)L=Math.max(0,Math.min(C-1,L+(rng()<.5?-1:1)));opt.ev?.({t,e,L,at:G.targetRow()});Lrow[e.y]=L;R.buildLane=L;lastEv=t;fingerEvents++;}
 // pointerdown inicial
 G.begin();G.held=true;G.lclock=0;R.buildLane=2;G.buildToward(2);
 let death=null;const maxT=400;
 for(let step=0;t<maxT;step++){
  t+=DT;globalThis.__simNow=base+t*1000;
  const yt0=G.targetRow();if(yt0!==lastTarget&&tSw[yt0]===undefined){tSw[yt0]=t;for(const e of queue)if(e.y===yt0)e.tau=t+e.off;}
  if(yt0!==lastTarget||t-lastPlan>=B.react){lastTarget=yt0;lastPlan=t;replan();}
  while(queue.length&&queue[0].tau<=t&&t>=lastEv+1/B.rate)applyEv(queue.shift());
  // frame() del juego
  let y=G.targetRow();R.buildRow=y;
  if(!R.gameOver&&y>=0&&R.started){
   if(!R.path[y])G.buildToward(G.held?R.buildLane:G.prevExit(y));
   if(G.held&&R.path[y]&&G.clampLane(R.buildLane)!==R.path[y].x){G.lclock-=DT;if(G.lclock<=0){G.lclock=EXT;G.buildToward(R.buildLane);}}
   G.moverHit();if(globalThis.__dead){death={how:'mover',y,pos:G.START-R.distance};break;}
   const r=Math.ceil(G.START-R.distance);while(G.lastRow>r&&!R.gameOver){G.lastRow--;G.enterRow(G.lastRow);if(R.gameOver)break;}
  }
  if(globalThis.__won)break;
  // scene3d: avance y muerte por camino cortado
  if(!R.gameOver&&R.started)R.distance+=DT*(R.speed||1.25);
  const pos=R.startRow-R.distance,row=Math.ceil(pos),blend=Math.max(0,Math.min(1,row-pos)),here=R.path[row],next=R.path[row-1];
  if(R.distance>.04&&!here&&!R.gameOver){R.gameOver=true;death={how:'camino',y:G.targetRow(),pos};break;}
  if(blend>.35&&!next&&!R.gameOver){R.gameOver=true;death={how:'camino',y:G.targetRow(),pos};break;}
  const eA=here?.e??here?.x??R.lane??2,xA=here?.x??eA,eB=next?.e??next?.x??xA,SL=.35;
  const want=blend<=SL?eA+(xA-eA)*(blend/SL):xA+(eB-xA)*((blend-SL)/(1-SL));
  R.visualLane=(R.visualLane??eA)+(want-(R.visualLane??eA))*Math.min(1,DT*14);R.lane=Math.round(want);
 }
 const won=!!globalThis.__won;let cause=null,info={};
 if(!won){const y=death?.y??G.targetRow(),zone=G.zone[y];
  if(!death)cause='tiempo';
  else if(death.how==='mover')cause='móvil';
  else{const from=G.prevExit(y),alts=[from-1,from,from+1].filter(a=>a>=0&&a<C&&!G.isRockCell(a,y)&&!G.driftLand(a,from,G.driftOn,y,G.isRockCell).crash);
   info.alt=alts.length>0;
   if(R.blockedByRock===y)cause=R.custCrash?'aduana':R.driftCrash?'corriente':alts.length?'roca (ejecución)':'sin salida real';
   else cause='otro';
   if(cause==='roca (ejecución)'&&G.zone[y]==='free')cause='otro';}
  const near=[y+2,y+1,y,y-1].some(q=>G.driftRows[q]);info.tag=near?'deriva':[y+2,y+1,y,y-1].some(q=>G.movers[q])?'móvil':[y+2,y+1,y,y-1].some(q=>Object.keys(G.cust).some(k=>k.endsWith(','+q)))?'aduana':'simple';
  info.y=y;info.zone=zone;info.v=R.speed;info.prog=(G.START-y)/(G.START-G.GOAL);}
 return {won,cause,...info,rows:G.START-(death?.y??G.targetRow()),total:G.START-G.GOAL,fe:fingerEvents,time:t,v:R.speed};
}
// ── CLI ──
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const A=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v='1']=a.replace(/^--/,'').split('=');return [k,v];}));
 const levels=(A.levels||'20,40,60,80,100').split(',').map(Number),N=+(A.n||50),bots=(A.bots||'human,expert').split(','),s0=+(A.seed||1);
 for(const b of bots){console.log('\n== bot '+b+' ==');
  for(const w of levels){let ok=0,rows=0,n=0;const causes={},tags={};const vs=[];
   for(let i=0;i<N;i++){const r=await playOne(w,s0*1000+i,b);n++;if(r.won)ok++;else{rows+=r.prog??0;causes[r.cause]=(causes[r.cause]||0)+1;tags[r.tag]=(tags[r.tag]||0)+1;if(A.dump==w)console.log(JSON.stringify(r));}}
   const f=Object.entries(causes).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' '),g=Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' ');
   console.log(`w=${w}  completa ${(100*ok/n).toFixed(0)}%  progreso medio de muerte ${(100*rows/Math.max(1,n-ok)).toFixed(0)}%  causas {${f}}  zonas {${g}}`);}}
 process.exit(0);}
