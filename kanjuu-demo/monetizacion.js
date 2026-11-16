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
// Compras (RevenueCat): entitlement "paper_voyager_pro" = PRO: sin banner ni intersticiales (los recompensados
// quedan porque los elige el jugador) y +25% de monedas. Se vende como mensual, anual o de por vida.

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
    entitlement: 'paper_voyager_pro',
    // Identificadores de los paquetes dentro de la offering "default" (se arman en el panel de RevenueCat)
    paquetes: [
      { id: '$rc_monthly', nombre: 'Mensual', desc: 'PRO por un mes', icono: '☾', precio: 'US$ 1,99/mes' },
      { id: '$rc_annual', nombre: 'Anual', desc: 'PRO por un año · 2 meses gratis', icono: '☀', precio: 'US$ 9,99/año', destacado: true },
      { id: '$rc_lifetime', nombre: 'De por vida', desc: 'PRO para siempre, un solo pago', icono: '✈', precio: 'US$ 19,99' },
    ],
  },
  intersticialCada: 3, intersticialMinSeg: 90,
};

const Q = new URLSearchParams(location.search);
const KEY = 'kanjuu.run.pro';
const nativo = () => !!(window.Capacitor?.isNativePlatform?.());
const plugin = n => window.Capacitor?.Plugins?.[n];
const plataforma = () => window.Capacitor?.getPlatform?.() === 'ios' ? 'ios' : 'android';
let pro = localStorage.getItem(KEY) === '1';
let partidas = 0, ultimoInter = 0, adsListo = false;
const avisar = new Set(); // callbacks cuando cambia el estado PRO

// ── Anuncio simulado (web): cartel a pantalla completa con cuenta regresiva ──
function simulado(tipo, seg) {
  return new Promise(ok => {
    const d = document.createElement('div'); d.className = 'adSim';
    d.innerHTML = `<div class="adBox"><small>ESPACIO PUBLICITARIO · ${tipo === 'rewarded' ? 'VIDEO CON RECOMPENSA' : 'INTERSTICIAL'}</small><b>Acá va el anuncio</b><p>En la app se muestra AdMob. En la web es una simulación para probar el flujo.</p><button disabled>CERRAR · <span>${seg}</span></button></div>`;
    document.body.appendChild(d);
    const b = d.querySelector('button'), s = d.querySelector('span'); let t = seg;
    const iv = setInterval(() => { t--; s.textContent = t; if (t <= 0) { clearInterval(iv); b.disabled = false; b.textContent = tipo === 'rewarded' ? 'RECIBIR RECOMPENSA' : 'CERRAR'; } }, 1000);
    b.onclick = () => { d.remove(); ok(true); };
  });
}

export const Ads = {
  get enabled() { return !pro; },
  async init() {
    if (adsListo) return; adsListo = true;
    const A = plugin('AdMob'); if (!nativo() || !A) return;
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
function setPro(v) { const antes = pro; pro = !!v; localStorage.setItem(KEY, pro ? '1' : '0'); if (pro) document.getElementById('adBanner')?.classList.remove('on'); if (antes !== pro) avisar.forEach(f => f(pro)); }
const tieneEntitlement = info => !!info?.entitlements?.active?.[CONFIG.revenuecat.entitlement];
let offering = null; // offering actual (con precios reales de la tienda)

export const Iap = {
  paquetes: CONFIG.revenuecat.paquetes,
  get pro() { return pro; },
  onCambio(f) { avisar.add(f); },
  // Configura el SDK una sola vez al abrir la app y escucha cambios del cliente (renovaciones, reembolsos, otro dispositivo).
  async init() {
    const P = plugin('Purchases'); if (!nativo() || !P) return;
    try {
      const rc = CONFIG.revenuecat, apiKey = rc.usarClaveDePrueba ? rc.apiKey.test : rc.apiKey[plataforma()];
      await P.setLogLevel({ level: rc.usarClaveDePrueba ? 'DEBUG' : 'WARN' });
      await P.configure({ apiKey }); // sin appUserID: RevenueCat genera un id anónimo y lo guarda en el dispositivo
      await P.addCustomerInfoUpdateListener(({ customerInfo }) => setPro(tieneEntitlement(customerInfo)));
      const { customerInfo } = await P.getCustomerInfo(); setPro(tieneEntitlement(customerInfo));
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
    return pk?.product?.priceString || CONFIG.revenuecat.paquetes.find(p => p.id === id)?.precio || '';
  },
  // Compra un paquete. Devuelve 'ok' | 'cancelado' | 'error' | 'solo-app'.
  async comprar(id) {
    const P = plugin('Purchases');
    if (nativo() && P) {
      try {
        if (!offering) await Iap.cargarOfertas();
        const pk = offering?.availablePackages?.find(p => p.identifier === id);
        if (!pk) return 'error';
        const { customerInfo } = await P.purchasePackage({ aPackage: pk });
        setPro(tieneEntitlement(customerInfo));
        return pro ? 'ok' : 'error';
      } catch (e) {
        if (e?.userCancelled || e?.code === '1' || /cancel/i.test(e?.message || '')) return 'cancelado';
        console.warn('compra', e); return 'error';
      }
    }
    if (!Q.has('debug')) return 'solo-app'; // web: sólo en modo prueba se concede, para revisar el flujo
    setPro(true); return 'ok';
  },
  // Paywall de RevenueCat (purchases-capacitor-ui). Si no está el plugin, la tienda del juego hace de paywall.
  async paywall() {
    const UI = plugin('RevenueCatUI'); if (!nativo() || !UI) return 'sin-ui';
    try {
      const { result } = await UI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: CONFIG.revenuecat.entitlement });
      const P = plugin('Purchases'); const { customerInfo } = await P.getCustomerInfo(); setPro(tieneEntitlement(customerInfo));
      return result; // 'PURCHASED' | 'RESTORED' | 'CANCELLED' | 'NOT_PRESENTED' | 'ERROR'
    } catch (e) { console.warn('paywall', e); return 'ERROR'; }
  },
  // Customer Center: gestionar o cancelar la suscripción, pedir reembolso, restaurar. Sólo tiene sentido si el jugador es PRO.
  async centroCliente() {
    const UI = plugin('RevenueCatUI'); if (!nativo() || !UI) return false;
    try { await UI.presentCustomerCenter(); const P = plugin('Purchases'); const { customerInfo } = await P.getCustomerInfo(); setPro(tieneEntitlement(customerInfo)); return true; }
    catch (e) { console.warn('customer center', e); return false; }
  },
  async restaurar() {
    const P = plugin('Purchases'); if (!nativo() || !P) return false;
    try { const { customerInfo } = await P.restorePurchases(); setPro(tieneEntitlement(customerInfo)); return pro; } catch (e) { console.warn('restore', e); return false; }
  },
};
