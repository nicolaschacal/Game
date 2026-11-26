# Revisión para App Store y Google Play — Paper Voyager

> **Segunda pasada (25/11/2026):** revisada otra vez contra las reglas de la skill
> [`safaiyeh/app-store-review-skill`](https://github.com/safaiyeh/app-store-review-skill) (guías de Apple al 08/06/2026,
> secciones 1 a 5 completas) y las políticas de Google Play. Cambios de esta pasada al final, en la sección 9.

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
| 6 | Ambas | ~~Clima real con Open-Meteo~~ → reemplazado por un interruptor día/noche, sin ubicación ni servicios externos | **OK** |
| 7 | Apple | Build con Xcode 26 y SDK de iOS 26 o superior (exigido desde abr. 2026). Capacitor 7 compila, pero conviene probar el archivo final | **A MANO** |
| 8 | Google | Cuenta personal nueva: prueba cerrada con 12+ testers durante 14 días seguidos | **BLOQUEA** el pase a producción |

## 2. Privacidad y permisos (Apple 5.1 · Google Datos del usuario)

- **OK** Permiso de seguimiento (ATT) y consentimiento de Google (UMP) se piden al iniciar, en ese orden; sin permiso el juego funciona igual.
- **OK** El texto del permiso de seguimiento explica para qué es y que es opcional.
- **OK** El texto del permiso de seguimiento está traducido a los 8 idiomas (`InfoPlist.strings` en `es/en/pt/fr/de/it/ja/ko.lproj`).
- **OK** El juego ya no usa ubicación: se quitaron el permiso de iOS y `ACCESS_COARSE_LOCATION` de Android.
- **A MANO** Informe de privacidad de Xcode (Product › Archive › Generate Privacy Report): confirmar que AdMob, RevenueCat y Capacitor traen sus manifiestos `PrivacyInfo.xcprivacy`. La app en sí no usa APIs de «motivo requerido».
- **RIESGO** `SKAdNetworkItems` tiene un solo identificador; Google pide la lista completa en Info.plist.
- **A MANO** Etiquetas de privacidad (App Store) y formulario de Seguridad de los datos (Google), declarar:
  - Identificador de dispositivo / publicidad (AdMob) → seguimiento si el jugador acepta ATT.
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
- **OK** Solo iPhone (`TARGETED_DEVICE_FAMILY = 1`): no hacen falta capturas de iPad. En iPad corre en modo compatibilidad.
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

## 9. Segunda pasada — qué se agregó o corrigió

| Guía | Hallazgo | Estado |
|---|---|---|
| Apple 1.5 · Google contacto | La app tiene que tener una forma fácil de contactarte | **OK** Ajustes ahora tiene «Soporte · Privacidad · Términos»; nueva `soporte.html` (completar correo) |
| Apple 5.1.1(i) | Política de privacidad accesible dentro de la app | **OK** en Ajustes y en la tienda (PRO) |
| Apple 2.5.19 | Funciones ocultas: los modos de prueba por URL (`?rico`, `?debug`, `?vidas`, `?gratis`) | **OK** En la app nativa se borran los parámetros al abrir: no hay nada escondido para el revisor |
| Apple 2.1 | Apple revisa también en iPad (iPad Air) aunque la app sea solo iPhone: la abre en modo compatibilidad | **A MANO** Abrirla una vez en un iPad o en el simulador y ver que se juega bien |
| Apple 2.1(b) | Todas las compras visibles y funcionando para el revisor | **A MANO** Probar en sandbox: Pack de inicio, Sin anuncios, Mensual, Anual, Restaurar |
| Apple 3.1.1 | Monedas compradas no pueden vencer | **OK** las monedas no vencen |
| Apple 3.1.1 | Probabilidades de premios al azar | **OK** cofre de oro detallado |
| Apple 3.1.2 | Mensual y anual en el mismo grupo para no suscribirse dos veces | **A MANO** al crear los productos |
| Apple 2.5.18 | Los anuncios deben poder denunciarse | **OK** AdMob muestra su ícono de AdChoices para eso |
| Apple 2.3.2 | La descripción de la tienda debe avisar que hay compras | **A MANO** al escribir la ficha |
| Apple 4.2 | No ser «una web empaquetada» | **OK** juego completo empaquetado + funciones nativas (compras, anuncios, vibración, splash) |
| Apple 4.7 | Juegos HTML5 descargados | **No aplica**: todo el juego viene dentro de la app |
| Apple 1.3 / Google Familias | Público infantil | **Decisión** declarar 13+ y no categoría Niños |
| Google Datos del usuario | Ya no se usa ubicación | **OK** formulario de Seguridad de datos: solo ID de publicidad (AdMob), compras (RevenueCat), diagnóstico de SDK |
| Google Política de anuncios | Intersticiales solo en pausas naturales, nunca al abrir la app ni durante el juego | **OK** |
| Google Pagos | Todo por Google Play Billing (RevenueCat) | **OK** |
| Google Suscripciones | Oferta clara + cómo cancelar | **OK** |

### Lista final, en orden

1. Completar nombre y correo en `privacidad.html`, `terminos.html` y `soporte.html`; publicar el sitio en dominio propio y actualizar `CONFIG.legal`.
2. Cuentas: Apple Developer y Google Play (si podés, de empresa: evita los 12 testers).
3. AdMob: app + bloques reales → IDs en `Info.plist`, `AndroidManifest.xml` y `monetizacion.js`; `testing: false`; mensajes de privacidad (UMP y ATT) activos; lista completa de `SKAdNetworkItems`.
4. Tiendas + RevenueCat: `pack_inicio`, `sin_anuncios`, `viajero_frecuente` (mensual y anual) → claves reales, `usarClaveDePrueba: false`.
5. Build: Xcode 26 → Archive → informe de privacidad → TestFlight. Android: AAB → prueba cerrada.
6. Probar compras en sandbox y abrir la app en iPad (modo compatibilidad).
7. Fichas: capturas de iPhone 6,9", descripción que mencione las compras, clasificación por edad, etiquetas de privacidad / Seguridad de datos, notas para el revisor.
