# Paper Voyager · Guía para publicar en App Store y Google Play

El repo ya trae el proyecto nativo de Capacitor (`android/` e `ios/`), los íconos y splash generados, three.js empaquetado sin CDN, AdMob y RevenueCat conectados con IDs de prueba. Lo que queda es trabajo de cuentas y claves, no de código.

## 0. Requisitos en tu máquina

- Node 20+, `npm install` en la raíz.
- **Android:** Android Studio (Ladybug o más nuevo) con SDK 36 instalado.
- **iOS:** una Mac con Xcode 26 (iOS 26 SDK, obligatorio en App Store desde abril 2026) y CocoaPods (`sudo gem install cocoapods`).

## 0.1 Estado del empaquetado (verificado)

- `npm run build` y `npx cap sync` corren sin errores (iOS: el paso `pod install` y `xcodebuild` se saltan en Linux; hacelos en la Mac).
- Fuentes Lilita One, Nunito y Yuji Syuku (recortada a los 2 caracteres del nobori de Kioto) viven en `assets/fonts/` y el build las copia a `www/fonts/` y reemplaza el `<link>` de Google Fonts: la app funciona sin internet. **Si agregás kanji nuevos al juego, regenerá `YujiSyuku-subset.ttf`** (fonttools `pyftsubset` con los caracteres nuevos) o se verán con la fuente de respaldo.
- Íconos/splash: `npm run assets` lee `assets/icon.png`, `assets/splash.png`, `assets/splash-dark.png`. Para elegir entre las variantes icon-A / icon-B, copiá la elegida a `assets/icon.png` (1024x1024) y corré `npm run assets`.
- `capacitor.config.json`: cambiá `appId` (hoy `com.nicolaschacal.papervoyager`) ANTES de publicar y, si lo cambiás, también `applicationId`/`namespace` en `android/app/build.gradle` y el Bundle Identifier en Xcode.

## 1. Flujo diario

```bash
npm run build        # arma www/ (copia el juego + three.js local)
npx cap sync         # copia www/ y los plugins a android/ e ios/
npm run android      # abre Android Studio
npm run ios          # abre Xcode (primero: cd ios/App && pod install)
```

Para probar en el teléfono sin tiendas: Android Studio → Run; Xcode → elegí tu iPhone → Run (hace falta cuenta de Apple Developer para firmar).

Versión: `android/app/build.gradle` (`versionCode`, `versionName`) y en Xcode (Target App → General → Version / Build). Subí `versionCode`/Build en cada envío.

## 2. Publicidad (AdMob)

Hoy el juego usa los **IDs de prueba oficiales de Google**: muestran anuncios de prueba y no generan ingresos ni te pueden bloquear la cuenta. Cambiarlos es lo último.

1. Creá la app en [admob.google.com](https://admob.google.com) (una para Android, otra para iOS).
2. Creá tres bloques por plataforma: **Banner**, **Intersticial** y **Recompensado**.
3. Pegá los IDs en `paper-voyager/monetizacion.js` → `CONFIG.admob.android / ios`, y poné `testing: false`.
4. ID de aplicación (`ca-app-pub-XXXX~YYYY`):
   - Android: `android/app/src/main/AndroidManifest.xml` → `com.google.android.gms.ads.APPLICATION_ID`.
   - iOS: `ios/App/App/Info.plist` → `GADApplicationIdentifier`.
5. iOS pide permiso de seguimiento (ATT). El texto ya está en `NSUserTrackingUsageDescription`; si querés pedirlo, llamá `AdMob.requestTrackingAuthorization()` antes de `initialize` (está documentado en el plugin). Sin seguimiento los anuncios se muestran igual, menos personalizados.
6. Si vas a mostrar anuncios en Europa: en AdMob activá el mensaje de consentimiento (UMP); el plugin lo soporta con `AdMob.requestConsentInfo()` + `showConsentForm()`.

Dónde aparece cada anuncio en el juego:

| Espacio | Cuándo | Código |
|---|---|---|
| Banner | Pantalla de inicio, abajo | `Ads.banner(true/false)` |
| Intersticial | Al perder, cada 3 partidas, mínimo 90 s entre uno y otro | `Ads.intersticialQuizas()` |
| Recompensado | Revivir gratis · Monedas x2 al perder · Un cofre extra | `Ads.recompensa(motivo)` |

En la **web** los tres se ven como carteles simulados (así se puede probar el flujo en Vercel). En la app se reemplazan solos por AdMob. Los jugadores PRO no ven banner ni intersticiales; los recompensados quedan porque los eligen ellos.

## 3. Compras (RevenueCat)

La app ya está configurada con tu clave de prueba `test_PGIWIvBmdBFGIAlJEzBdlmjrEZW` (Test Store: compras simuladas, sin pasar por las tiendas). El entitlement es **`paper_voyager_pro`**.

### 3.1 En el panel de RevenueCat

1. **Productos** (Products): creá tres, con los mismos identificadores en Google Play y App Store Connect:
   - `monthly` · suscripción mensual
   - `yearly` · suscripción anual
   - `lifetime` · compra única (no consumible)
2. **Entitlement** `paper_voyager_pro`: asociá los tres productos.
3. **Offering** `default` con tres paquetes: `$rc_monthly` → monthly, `$rc_annual` → yearly, `$rc_lifetime` → lifetime. Marcala como *current*.
4. **Paywall**: en Paywalls, creá uno para la offering `default` (plantilla a gusto). El botón "★ HACETE PRO" de la tienda lo abre con `presentPaywallIfNeeded`.
5. **Customer Center**: en Customer Center, activá la configuración por defecto. Cuando el jugador es PRO, el botón "GESTIONAR SUSCRIPCIÓN" lo abre (cancelar, cambiar de plan, reembolso, restaurar).
6. **Claves**: Project settings → API keys. Copiá la pública de Google (`goog_…`) y la de Apple (`appl_…`) a `CONFIG.revenuecat.apiKey` en `monetizacion.js` y poné `usarClaveDePrueba: false`.

### 3.2 En las tiendas

- **Google Play Console** → Monetización → Productos: creá `lifetime` (producto gestionado) y `monthly` / `yearly` (suscripciones, con un plan base cada una). Conectá Play con RevenueCat (cuenta de servicio, está en la guía de RevenueCat).
- **App Store Connect** → In-App Purchases: `lifetime` (Non-Consumable), `monthly` y `yearly` (Auto-Renewable, mismo grupo). Cargá la clave de In-App Purchase (.p8) en RevenueCat.
- Los precios orientativos que muestra la tienda del juego (`CONFIG.revenuecat.paquetes[].precio`) se reemplazan solos por los reales cuando la offering carga.

### 3.3 Cómo está implementado (`paper-voyager/monetizacion.js`)

- `Iap.init()` al abrir: `Purchases.configure({ apiKey })`, `addCustomerInfoUpdateListener` (renovaciones, reembolsos, otro dispositivo) y `getCustomerInfo()` para saber si ya es PRO. Sin `appUserID`: RevenueCat crea un id anónimo y lo guarda; si más adelante agregás login, llamá `Purchases.logIn({ appUserID })`.
- `Iap.cargarOfertas()` → `getOfferings().current` para precios reales.
- `Iap.comprar(id)` → `purchasePackage`; distingue cancelación (`userCancelled`) de error, y vuelve a chequear el entitlement en el `customerInfo` que devuelve.
- `Iap.paywall()` → `RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier })`.
- `Iap.centroCliente()` → `RevenueCatUI.presentCustomerCenter()`.
- `Iap.restaurar()` → `restorePurchases()` (Apple lo exige como botón visible).
- El estado PRO se guarda en el dispositivo para arrancar rápido, pero la verdad siempre es el `customerInfo` del SDK.

Qué da PRO en el juego: sin banner ni intersticiales y +25 % de monedas al guardar cada partida. Si querés sumar más (un personaje exclusivo, por ejemplo), `Iap.pro` ya está disponible en todo `index.html`.

## 4. Google Play

1. Cuenta de desarrollador (US$ 25, una vez). Las cuentas personales nuevas deben hacer una **prueba cerrada con 12 testers durante 14 días** antes de poder publicar en producción.
2. Firmá la app: Android Studio → Build → Generate Signed Bundle (crea un keystore y **guardalo con la contraseña**; sin él no se puede actualizar la app). Subí el `.aab`.
3. Target API 36 (ya está en `android/variables.gradle`); es obligatorio para apps nuevas desde el 31 de agosto de 2026.
4. Ficha: nombre, descripción corta/larga, ícono 512, feature graphic 1024×500, 4+ capturas de teléfono, clasificación de contenido (cuestionario IARC), declaración de anuncios ("sí, contiene anuncios"), **Data safety** (AdMob recoge ID de publicidad; ubicación aproximada sólo si el jugador activa el clima; RevenueCat guarda el id anónimo de compra) y la URL de política de privacidad (ver punto 6).
5. Compras: completá el perfil de pagos del Play Console antes de crear productos.

## 5. App Store

1. Apple Developer Program (US$ 99/año). Si facturás menos de US$ 1M al año, inscribite en el **Small Business Program** (comisión 15 % en vez de 30 %).
2. `cd ios/App && pod install`, abrí `App.xcworkspace`, elegí tu Team en Signing. Archive → Distribute → App Store Connect.
3. Capabilities necesarias: In-App Purchase (se agrega sola con RevenueCat).
4. App Store Connect: ficha, capturas 6.9" y 6.5" (y iPad si la dejás universal), categoría Juegos, clasificación por edades, **App Privacy** (anuncios → "Identifiers / Advertising data", compras → "Purchase history", ubicación aproximada opcional), URL de privacidad.
5. Revisión: Apple pide que las suscripciones muestren precio, duración y un enlace a Términos y Privacidad en el paywall; el paywall de RevenueCat ya los incluye si cargás las URLs en el panel.

## 6. Política de privacidad

`privacidad.html` en este repo es un borrador listo para publicar en Vercel (`https://<tu-dominio>/privacidad.html`). Revisalo y completá tu nombre y correo de contacto. No es asesoramiento legal.

## 7. Lo que todavía no está

- **i18n**: listo en 8 idiomas (es, en, pt, fr, de, it, ja, ko). Las fichas de las tiendas todavía hay que escribirlas.
- **Música**: las pistas van en `paper-voyager/audio/` (menu.mp3, run.mp3); el build avisa si faltan.
- **IDs reales** de AdMob y RevenueCat (puntos 2 y 3).
- **Probar en teléfonos reales**: sonido, vibración (en iOS va por Haptics), rendimiento del WebGL en gama baja, y los flujos de compra con cuentas de prueba (License testers en Play, Sandbox testers en App Store Connect).
- **Capturas y textos de las fichas**.

## 8. Checklist de aprobación (revisado nov. 2026)
- [ ] `CONFIG.admob.testing = false` e IDs reales de AdMob (también `GADApplicationIdentifier` en Info.plist y `APPLICATION_ID` en AndroidManifest).
- [ ] `CONFIG.revenuecat.usarClaveDePrueba = false` y claves `appl_…` / `goog_…`.
- [ ] RevenueCat: entitlement `pack_inicio` (no consumible, paquete personalizado `starter`) y entitlements `sin_anuncios` (producto no consumible, paquete `$rc_lifetime`) y `viajero_frecuente` (suscripciones `$rc_monthly` y `$rc_annual`, mismo grupo de suscripción en App Store Connect).
- [ ] `privacidad.html` y `terminos.html`: completar nombre y correo, publicarlas en el dominio propio y actualizar `CONFIG.legal`.
- [ ] App Store Connect: URL de privacidad, enlace al EULA estándar de Apple en la descripción (o EULA propio), capturas del paywall para la revisión de las compras.
- [ ] Clima real: Open-Meteo gratis es sólo para uso NO comercial; con anuncios/suscripción hace falta su plan comercial o cambiar de proveedor.
- [ ] AdMob: activar el mensaje de consentimiento (UMP/GDPR) y el de ATT en la consola de AdMob → «Privacidad y mensajes». El código ya los pide al iniciar.
- [ ] Lista completa de `SKAdNetworkItems` de Google en Info.plist (hoy hay una sola).
- [ ] Público objetivo: declarar 13+ (no «Familias»/«Kids»), o pasar AdMob a anuncios para niños.
- [ ] Google Play (cuenta personal nueva): prueba cerrada con 12+ testers durante 14 días seguidos antes de pedir producción.
- [ ] DSA (Unión Europea): declarar estado de «comerciante» en ambas tiendas.
