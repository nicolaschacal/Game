// ── Publicidad y compras ──
// Un solo módulo con dos caras:
//  · En la app nativa (Capacitor) usa AdMob (@capacitor-community/admob) y RevenueCat
//    (@revenuecat/purchases-capacitor + @revenuecat/purchases-capacitor-ui para el Paywall y el Customer Center).
//  · En la web muestra anuncios simulados (un cartel que se cierra solo) y, con ?debug, compras simuladas,
//    para poder probar todos los flujos sin cuenta de AdMob ni build nativo.
//
// Espacios de publicidad en el juego:
//  · BANNER       → abajo de la pantalla de inicio.
//  · INTERSTICIAL → al perder, cada 3 partidas (nunca antes de 90 s de la anterior).
//  · RECOMPENSADO → revivir gratis, duplicar monedas al perder, abrir un cofre extra.
// Compras (RevenueCat), dos entitlements:
//  · "sin_anuncios"      → pago único (producto no consumible, paquete $rc_lifetime): sin banner ni intersticiales.
//  · "viajero_frecuente" → suscripción mensual ($rc_monthly) o anual ($rc_annual): vidas ilimitadas, sin anuncios
//                          y +25% de monedas («millas»). Los videos con recompensa quedan siempre, porque los elige el jugador.
// En el panel de RevenueCat conviene darle a los productos de la suscripción también "sin_anuncios"; igual el código
// trata a viajero frecuente como sin anuncios por su cuenta.

import { t as tt } from './i18n.js';
export const CONFIG = {
  // IDs de prueba oficiales de Google (sirven en desarrollo sin cuenta). Cambiar por los reales antes de publicar.
  admob: {
    android: { banner: 'ca-app-pub-3940256099942544/6300978111', interstitial: 'ca-app-pub-3940256099942544/1033173712', rewarded: 'ca-app-pub-3940256099942544/5224354917' },
    ios: { banner: 'ca-app-pub-3940256099942544/2934735716', interstitial: 'ca-app-pub-3940256099942544/4411468910', rewarded: 'ca-app-pub-3940256099942544/1712485313' },
    testing: true, // false para producción
  },
  revenuecat: {
    // Clave de prueba (Test Store). Para producción: una clave pública por plataforma (goog_… / appl_…) desde el panel de RevenueCat.
    apiKey: { test: 'test_PGIWIvBmdBFGIAlJEzBdlmjrEZW', android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXX', ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXX' },
    usarClaveDePrueba: true,       // true mientras se prueba con el Test Store; false al publicar
    entNoAds: 'sin_anuncios', entVF: 'viajero_frecuente',
    // Identificadores de los paquetes dentro de la offering "default" (se arman en el panel de RevenueCat). El precio es orientativo (web).
    paquetes: [
      { id: '$rc_lifetime', tipo: 'noads', nombre: tt('pack.noads'), desc: tt('pack.noads.desc'), precio: 'US$ 3,99' },
      { id: '$rc_monthly', tipo: 'vf', nombre: tt('pack.monthly'), desc: tt('pack.vf.monthly.desc'), precio: 'US$ 2,99' },
      { id: '$rc_annual', tipo: 'vf', nombre: tt('pack.annual'), desc: tt('pack.vf.annual.desc'), precio: 'US$ 19,99', destacado: true },
    ],
  },
  intersticialCada: 3, intersticialMinSeg: 90,
  // Páginas legales (obligatorias para suscripciones: Apple 3.1.2 y Google Play). Cambiar al dominio propio al publicar.
  legal: {
    privacidad: 'https://game-orcin-ten-70.vercel.app/privacidad.html',
    terminos: 'https://game-orcin-ten-70.vercel.app/terminos.html',
    eulaApple: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  },
};
export const esIOS = () => window.Capacitor?.getPlatform?.() === 'ios';

const Q = new URLSearchParams(location.search);
const KEY = 'pv.noads', KEY_VF = 'pv.vf';
const nativo = () => !!(window.Capacitor?.isNativePlatform?.());
const plugin = n => window.Capacitor?.Plugins?.[n];
const plataforma = () => window.Capacitor?.getPlatform?.() === 'ios' ? 'ios' : 'android';
let noAds = localStorage.getItem(KEY) === '1' || localStorage.getItem('pv.pro') === '1', vf = localStorage.getItem(KEY_VF) === '1';
if (Q.has('gratis')) { noAds = vf = false; localStorage.removeItem(KEY); localStorage.removeItem(KEY_VF); localStorage.removeItem('pv.pro'); } // ?gratis: vuelve a la versión gratis (pruebas)
let pro = noAds || vf; // pro = sin anuncios (por compra única o por la suscripción)
let partidas = 0, ultimoInter = 0, adsListo = false, consentOpts = false;
const avisar = new Set(); // callbacks cuando cambia el estado PRO

// ── Anuncio simulado (web): cartel a pantalla completa con cuenta regresiva ──
function simulado(tipo, seg) {
  return new Promise(ok => {
    const d = document.createElement('div'); d.className = 'adSim';
    d.innerHTML = `<div class="adBox"><small>${tt('ad.space')} · ${tipo === 'rewarded' ? tt('ad.rewarded') : tt('ad.interstitial')}</small><b>${tt('ad.here')}</b><p>${tt('ad.sim')}</p><button disabled>${tt('ad.close')} · <span>${seg}</span></button></div>`;
    document.body.appendChild(d);
    const b = d.querySelector('button'), s = d.querySelector('span'); let t = seg;
    const iv = setInterval(() => { t--; s.textContent = t; if (t <= 0) { clearInterval(iv); b.disabled = false; b.textContent = tipo === 'rewarded' ? tt('ad.reward') : tt('ad.close'); } }, 1000);
    b.onclick = () => { d.remove(); ok(true); };
  });
}

export const Ads = {
  get enabled() { return !pro; },
  // Punto de entrada a «opciones de privacidad» que pide Google cuando hay formulario de consentimiento (UMP).
  get privacidadAds() { return nativo() && consentOpts; },
  async opcionesPrivacidad() { const A = plugin('AdMob'); try { await A?.showPrivacyOptionsForm?.(); } catch (e) { console.warn('privacy options', e); } },
  async init() {
    if (adsListo) return; adsListo = true;
    const A = plugin('AdMob'); if (!nativo() || !A) return;
    // 1) Consentimiento (UMP de Google: obligatorio para mostrar anuncios en el EEE, Reino Unido y Suiza).
    try { const c = await A.requestConsentInfo(); consentOpts = !!c?.isConsentFormAvailable; if (c?.isConsentFormAvailable && c.status === 'REQUIRED') await A.showConsentForm(); } catch (e) { console.warn('UMP', e); }
    // 2) iOS: permiso de seguimiento (ATT). Si no se pide y el SDK usa el IDFA, Apple rechaza (5.1.2). Sin permiso, los anuncios salen igual (no personalizados).
    if (esIOS()) try { const s = await A.trackingAuthorizationStatus(); if (s?.status === 'notDetermined') await A.requestTrackingAuthorization(); } catch (e) { console.warn('ATT', e); }
    try { await A.initialize({ initializeForTesting: CONFIG.admob.testing, testingDevices: [] }); } catch (e) { console.warn('AdMob init', e); }
  },
  // Banner abajo del inicio. En la web se muestra un marco de ejemplo (#adBanner) para ver el espacio.
  async banner(mostrar) {
    const slot = document.getElementById('adBanner');
    if (pro) { slot?.classList.remove('on'); mostrar = false; }
    const A = plugin('AdMob');
    if (nativo() && A) {
      try {
        if (mostrar) await A.showBanner({ adId: CONFIG.admob[plataforma()].banner, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0, isTesting: CONFIG.admob.testing });
        else await A.hideBanner();
      } catch (e) { console.warn('banner', e); }
      return;
    }
    slot?.classList.toggle('on', !!mostrar);
  },
  // Intersticial al perder: cada N partidas, con un mínimo de segundos entre uno y otro.
  async intersticialQuizas() {
    partidas++;
    if (pro || partidas % CONFIG.intersticialCada !== 0 || Date.now() - ultimoInter < CONFIG.intersticialMinSeg * 1000) return false;
    ultimoInter = Date.now();
    const A = plugin('AdMob');
    if (nativo() && A) {
      try { await A.prepareInterstitial({ adId: CONFIG.admob[plataforma()].interstitial, isTesting: CONFIG.admob.testing }); await A.showInterstitial(); return true; } catch (e) { console.warn('inter', e); return false; }
    }
    await simulado('interstitial', 3); return true;
  },
  // Video con recompensa. Devuelve true si el jugador lo vio entero (y hay que darle el premio).
  async recompensa(motivo) {
    const A = plugin('AdMob');
    if (nativo() && A) {
      try {
        await A.prepareRewardVideoAd({ adId: CONFIG.admob[plataforma()].rewarded, isTesting: CONFIG.admob.testing });
        const r = await A.showRewardVideoAd(); return !!r;
      } catch (e) { console.warn('rewarded', motivo, e); return false; }
    }
    return simulado('rewarded', 3);
  },
};

// ── RevenueCat ──
function setEstado(na, v) { const antes = noAds + '|' + vf; noAds = !!na; vf = !!v; pro = noAds || vf;
  localStorage.setItem(KEY, noAds ? '1' : '0'); localStorage.setItem(KEY_VF, vf ? '1' : '0'); localStorage.removeItem('pv.pro');
  if (pro) document.getElementById('adBanner')?.classList.remove('on'); if (antes !== noAds + '|' + vf) avisar.forEach(f => f(pro)); }
const setDesde = info => { const a = info?.entitlements?.active || {}; setEstado(!!a[CONFIG.revenuecat.entNoAds], !!a[CONFIG.revenuecat.entVF]); };
let offering = null; // offering actual (con precios reales de la tienda)

export const Iap = {
  paquetes: CONFIG.revenuecat.paquetes,
  get pro() { return pro; },          // sin anuncios (compra única o suscripción)
  get sinAnuncios() { return noAds; }, // compró el pago único
  get frecuente() { return vf; },      // viajero frecuente: vidas ilimitadas y +25% de monedas
  tiene(id) { const p = CONFIG.revenuecat.paquetes.find(x => x.id === id); return p?.tipo === 'vf' ? vf : pro; },
  onCambio(f) { avisar.add(f); },
  // Configura el SDK una sola vez al abrir la app y escucha cambios del cliente (renovaciones, reembolsos, otro dispositivo).
  async init() {
    const P = plugin('Purchases'); if (!nativo() || !P) return;
    try {
      const rc = CONFIG.revenuecat, apiKey = rc.usarClaveDePrueba ? rc.apiKey.test : rc.apiKey[plataforma()];
      await P.setLogLevel({ level: rc.usarClaveDePrueba ? 'DEBUG' : 'WARN' });
      await P.configure({ apiKey }); // sin appUserID: RevenueCat genera un id anónimo y lo guarda en el dispositivo
      await P.addCustomerInfoUpdateListener(({ customerInfo }) => setDesde(customerInfo));
      const { customerInfo } = await P.getCustomerInfo(); setDesde(customerInfo);
      await Iap.cargarOfertas();
    } catch (e) { console.warn('RevenueCat init', e); }
  },
  // Trae la offering "current" para mostrar precios reales en la tienda.
  async cargarOfertas() {
    const P = plugin('Purchases'); if (!nativo() || !P) return null;
    try { const { current } = await P.getOfferings(); offering = current || null; return offering; } catch (e) { console.warn('offerings', e); return null; }
  },
  // Precio del paquete tal como lo muestra la tienda (si la offering cargó); si no, el precio orientativo del CONFIG.
  precio(id) {
    const pk = offering?.availablePackages?.find(p => p.identifier === id);
    if (pk?.product?.priceString) return pk.product.priceString;
    // En la app nunca se muestra un precio inventado: si la tienda no respondió, va «…» (Apple/Google exigen el precio real de cada país)
    return nativo() ? '…' : CONFIG.revenuecat.paquetes.find(p => p.id === id)?.precio || '';
  },
  get legal() { return CONFIG.legal; },
  // Compra un paquete. Devuelve 'ok' | 'cancelado' | 'error' | 'solo-app'.
  async comprar(id) {
    const P = plugin('Purchases');
    if (nativo() && P) {
      try {
        if (!offering) await Iap.cargarOfertas();
        const pk = offering?.availablePackages?.find(p => p.identifier === id);
        if (!pk) return 'error';
        const { customerInfo } = await P.purchasePackage({ aPackage: pk });
        setDesde(customerInfo);
        return Iap.tiene(id) ? 'ok' : 'error';
      } catch (e) {
        if (e?.userCancelled || e?.code === '1' || /cancel/i.test(e?.message || '')) return 'cancelado';
        console.warn('compra', e); return 'error';
      }
    }
    if (!Q.has('debug')) return 'solo-app'; // web: sólo en modo prueba se concede, para revisar el flujo
    const pk = CONFIG.revenuecat.paquetes.find(x => x.id === id);
    if (pk?.tipo === 'vf') setEstado(noAds, true); else setEstado(true, vf); return 'ok';
  },
  // Paywall de RevenueCat (purchases-capacitor-ui). Si no está el plugin, la tienda del juego hace de paywall.
  async paywall() {
    const UI = plugin('RevenueCatUI'); if (!nativo() || !UI) return 'sin-ui';
    try {
      const { result } = await UI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: CONFIG.revenuecat.entVF });
      const P = plugin('Purchases'); const { customerInfo } = await P.getCustomerInfo(); setDesde(customerInfo);
      return result; // 'PURCHASED' | 'RESTORED' | 'CANCELLED' | 'NOT_PRESENTED' | 'ERROR'
    } catch (e) { console.warn('paywall', e); return 'ERROR'; }
  },
  // Customer Center: gestionar o cancelar la suscripción, pedir reembolso, restaurar. Sólo tiene sentido si el jugador es PRO.
  async centroCliente() {
    const UI = plugin('RevenueCatUI'); if (!nativo() || !UI) return false;
    try { await UI.presentCustomerCenter(); const P = plugin('Purchases'); const { customerInfo } = await P.getCustomerInfo(); setDesde(customerInfo); return true; }
    catch (e) { console.warn('customer center', e); return false; }
  },
  async restaurar() {
    const P = plugin('Purchases'); if (!nativo() || !P) return false;
    try { const { customerInfo } = await P.restorePurchases(); setDesde(customerInfo); return pro; } catch (e) { console.warn('restore', e); return false; }
  },
};
