# Revisión para App Store y Google Play — Paper Voyager

Revisión hecha sobre el repo (nov. 2026), siguiendo el checklist público de la skill
[`app-store-review`](https://github.com/ElxMaj/app-store-review-skill) (guías de Apple verificadas a oct. 2026)
y las políticas de Google Play. No se pudo correr su escáner automático ni compilar la app nativa desde la nube:
lo que depende del build real queda como **REVISAR A MANO**.

Leyenda: **BLOQUEA** = rechazo seguro si no se arregla · **RIESGO** = puede traer rechazo · **A MANO** = verificar en Xcode / consolas · **OK** = cumple.

---

## 1. Bloqueantes antes de subir

| # | Tienda | Qué | Estado |
|---|---|---|---|
| 1 | Ambas | IDs de prueba de AdMob en `Info.plist` (`GADApplicationIdentifier`) y `AndroidManifest.xml` (`APPLICATION_ID`), y `CONFIG.admob.testing = true` | **BLOQUEA** → poner los reales |
| 2 | Ambas | RevenueCat con clave de prueba (`usarClaveDePrueba: true`) | **BLOQUEA** → claves `appl_…` / `goog_…` |
| 3 | Ambas | Productos creados y con los mismos IDs: `pack_inicio` (paquete `starter`), `sin_anuncios` (`$rc_lifetime`), `viajero_frecuente` (`$rc_monthly`, `$rc_annual`, mismo grupo de suscripción) | **A MANO** |
| 4 | Ambas | `privacidad.html` y `terminos.html` con nombre y correo reales, publicadas en un dominio propio, y `CONFIG.legal` apuntando ahí | **BLOQUEA** |
| 5 | Apple | URL de **Soporte** obligatoria en App Store Connect (página con forma de contacto o correo) | **BLOQUEA** → hace falta el sitio |
| 6 | Ambas | Clima real: Open-Meteo gratis prohíbe uso comercial (app con anuncios/suscripción) | **BLOQUEA (licencia)** → plan pago o cambiar proveedor |
| 7 | Apple | Build con Xcode 26 y SDK de iOS 26 o superior (exigido desde abr. 2026). Capacitor 7 compila, pero conviene probar el archivo final | **A MANO** |
| 8 | Google | Cuenta personal nueva: prueba cerrada con 12+ testers durante 14 días seguidos | **BLOQUEA** el pase a producción |

## 2. Privacidad y permisos (Apple 5.1 · Google Datos del usuario)

- **OK** Permiso de seguimiento (ATT) y consentimiento de Google (UMP) se piden al iniciar, en ese orden; sin permiso el juego funciona igual.
- **OK** Textos de permiso en `Info.plist` (seguimiento y ubicación) explican para qué y que es opcional.
- **RIESGO** Esos textos están **solo en español**; el juego está en 8 idiomas. Agregar `InfoPlist.strings` por idioma (en, pt, fr, de, it, ja, ko).
- **RIESGO** El clima usa `navigator.geolocation` dentro del WebView: en iOS puede salir un segundo cartel raro tipo «localhost quiere usar tu ubicación». Pasar al plugin `@capacitor/geolocation`.
- **OK** El permiso de ubicación se pide solo cuando el jugador prende «clima real» (en contexto).
- **A MANO** Informe de privacidad de Xcode (Product › Archive › Generate Privacy Report): confirmar que AdMob, RevenueCat y Capacitor traen sus manifiestos `PrivacyInfo.xcprivacy`. La app en sí no usa APIs de «motivo requerido».
- **RIESGO** `SKAdNetworkItems` tiene un solo identificador; Google pide la lista completa en Info.plist.
- **A MANO** Etiquetas de privacidad (App Store) y formulario de Seguridad de los datos (Google), declarar:
  - Identificador de dispositivo / publicidad (AdMob) → seguimiento si el jugador acepta ATT.
  - Ubicación aproximada (clima, opcional, no se guarda en servidor; se manda a Open-Meteo).
  - Historial de compras (RevenueCat).
  - Datos de diagnóstico de los SDK (AdMob/RevenueCat).
- **OK** No hay cuentas ni login → no aplica borrar cuenta ni Sign in with Apple.
- **OK** No hay contenido generado por usuarios ni chat.

## 3. Compras y suscripción (Apple 3.1 · Google Pagos)

- **OK** Todo lo digital se vende por compra dentro de la app (RevenueCat → StoreKit / Google Play Billing).
- **OK** Pantalla de suscripción: precio, período, renovación automática, cómo cancelar y enlaces a Términos (EULA de Apple en iOS) y Privacidad.
- **OK** Botón «Restaurar compras» y «Gestionar suscripción».
- **OK** En la app nativa los precios salen de la tienda; nunca un precio escrito a mano.
- **OK** Texto del anual corregido («ahorrás más del 40%», antes decía «2 meses de regalo», que no era cierto).
- **OK** Probabilidades de cofres: el cofre de oro semanal de Viajero frecuente es un premio al azar que viene con una compra → se publican las probabilidades en la tienda y en los términos (Apple 3.1.1 y Google lo exigen).
- **OK** Las monedas se ganan jugando; el Pack de inicio trae monedas pero los cofres nunca se venden directo.
- **RIESGO** Viajero frecuente debe dar valor continuo (Apple 3.1.2): vidas ilimitadas, sin anuncios, +25% monedas y cofre semanal → cumple. Si se suma un traje exclusivo mensual, mejor.
- **A MANO** Capturas del paywall para la revisión de cada producto en App Store Connect.

## 4. Anuncios

- **OK** Videos con recompensa siempre opcionales y con el premio dicho antes.
- **OK** Intersticial solo al tocar «otra vez» / «inicio», nunca durante la carrera ni de sorpresa (Google prohíbe anuncios que aparecen inesperadamente).
- **OK** Opción «Privacidad de anuncios» cuando Google la requiere (UMP).
- **RIESGO** Público: declarar **13+** y no «Diseñado para familias» / categoría Niños. El arte es tierno; si se declara para menores de 13, AdMob debe ir en modo infantil y cambian muchas reglas.

## 5. Contenido, diseño y funcionamiento (Apple 2.1, 4.2, 4.3, 2.5)

- **OK** Es un juego completo con contenido propio (no es una web empaquetada): 4.2 no aplica.
- **RIESGO** 4.3 «spam» en categorías saturadas (corredores): el arte papercut, los destinos reales y las historias lo diferencian. Mostrar eso en capturas y descripción.
- **OK** No descarga código: todo el juego va dentro del paquete (`webDir: www`, sin `server.url`).
- **OK** Modos de prueba (`?rico`, `?debug`, `?gratis`, `?vidas`) dependen de la URL; en la app nativa no se pueden activar.
- **A MANO** iPad: el proyecto declara iPhone **y** iPad (`TARGETED_DEVICE_FAMILY = 1,2`). Apple lo va a probar en iPad y pide capturas de iPad. Opciones: probar bien en iPad o dejar solo iPhone (`= 1`).
- **A MANO** Funciona sin internet / con red lenta (sin pantallas en blanco), en IPv6, y en el modelo más chico soportado.
- **OK** Mínimo iOS 14 (Apple exige que apunte a iOS 13+).

## 6. Google Play específico

- **OK** `targetSdkVersion = 36` (obligatorio para apps nuevas desde el 31/08/2026).
- **OK** Permiso `AD_ID` declarado (necesario con AdMob en Android 13+).
- **A MANO** Compatibilidad con páginas de 16 KB (Android 15+): revisar el aviso en Play Console tras subir el AAB.
- **A MANO** Cuestionario de clasificación (IARC): marcar compras dentro de la app, anuncios y premios aleatorios.
- **A MANO** Declaración de anuncios = sí. Declaración de público objetivo = 13+.
- **A MANO** Unión Europea (DSA): declararte «comerciante» (tu dirección y correo quedan públicos en la ficha).

## 7. Ficha de la tienda (Apple 2.3)

- **A MANO** Nombre, subtítulo y palabras clave sin precios ni «gratis», sin nombres de otros juegos.
- **A MANO** Capturas del juego real (iPhone 6,9" obligatoria; iPad si se deja iPad).
- **A MANO** Clasificación por edad con el cuestionario nuevo de Apple (anuncios, compras, premios aleatorios).
- **A MANO** Notas para el revisor: «No requiere cuenta. Las compras se pueden probar con sandbox. El clima real es opcional y pide ubicación.»

## 8. Lo que necesitás del sitio web

| Página | Apple | Google |
|---|---|---|
| Política de privacidad | Obligatoria | Obligatoria |
| Soporte / contacto | **Obligatoria** (Support URL) | Correo de contacto obligatorio (el sitio es opcional) |
| Términos de uso | Requerido para suscripciones (o EULA estándar de Apple) | Recomendado |
| Página del juego (marketing) | Opcional | Opcional |

Ya existen `privacidad.html` y `terminos.html`; faltan la página de soporte y una portada simple del juego, en un dominio propio.
