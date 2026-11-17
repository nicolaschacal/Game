# Viajes libres · plan y contrato técnico

## Cómo está hoy (antes de esta actualización)
- Todo el juego vive en `index.html` (un `<script type="module">`): genera el nivel, corre la partida y dibuja el menú, la tienda, récords y el mapa. Las pantallas se cambian con `location.reload()`.
- Guardado: helper `store` → `localStorage` con prefijo `pv.` (`wallet`, `owned`, `skin`, `items`, `prog`, `word`, `world`, `maxWorld`, `best`, `tops`, `mute`).
- Progresión lineal: `stage` = destino (+ vueltas). Al llegar al aeropuerto `nextWorld()` guarda `world+1` y encadena el siguiente destino en la misma partida (`sessionStorage pv.carry`). La dificultad salía del índice del destino.
- Mapa (`#mapPanel`, `world-map.json`): pins por destino; sólo se podía volver a destinos ya alcanzados.
- Coleccionable: la cámara polaroid de la pista era la "letra" de la palabra del día (300 monedas + 1 revivir al completarla).

## Economía medida (45 destinos)
- Cada ronda tiene ≈195 monedas en la pista (medido en destinos 1, 10, 20, 30, 40 y 45); un jugador normal junta ≈80–110. Con Doble, más.
- Cofre (70 % de las rondas): valor esperado ≈93 monedas o un ítem.
- Misiones: al cumplir las tres, 150 × nivel (crece sin tope: ver riesgos).
- Ítems: Revivir 120 · Escudo 80 · Doble 100 · Congelar 90. Revivir en la partida: 120 × (revivires + 1).
- Personajes: 150 / 400 / 800 / 2000. PRO: +25 % al guardar monedas. Anuncio recompensado: monedas ×2 al perder.
- Resultado: una ronda completada deja ≈150–200 monedas; una perdida, ≈40–80.

## Reglas nuevas (paper-voyager/viaje.js)
- **Tarifa** = 10 + 1 por cada 90 km (gran círculo con coordenadas reales) + 10 si cambia de región + 15 si el destino es remoto (islas/confines), redondeado a 5, mínimo 15. Quedarse es gratis.
  Montevideo → Buenos Aires 15 · Río 30 · Cartagena 70 · Madrid 130. Máximo del mapa: 255.
- **Pasaportes** = 300 + 30 × destinos de la región (redondeo a 50): América 650 (12) · Europa 800 (16) · África 400 (4) · Asia 650 (11) · Oceanía 350 (2). Permanentes. El viajero elegido trae el de su región.
- Regiones: Petra y Dubái → Asia; Estambul y Moscú → Europa; Marrakech → África; Isla de Pascua → Oceanía (Polinesia), para que Oceanía no tenga un solo destino.
- **Dificultad** según rondas completadas (no según la ciudad): empezar en Buenos Aires o Kioto es igual de amable.
- **Selfies**: 3 tomas por destino (Llegada, Paseo, Recuerdo) = 135. Una cámara por ronda. Primera vez +25; repetida +10. Completar la primera toma de todos los destinos de una región: +300 y un revivir (reemplaza el premio de la palabra del día).
- Con ≈150 netas por ronda: un viaje regional cuesta 1/5 a 1/3 de lo que se gana; un pasaporte, 3–5 rondas; un cosmético de fotografía, 1–3 rondas.

## Migración
- `pv.trip` nuevo. Si no existe y hay datos viejos (`world`, `maxWorld`, `wallet` o `best`): viajero Nilo, destino actual = `world % 45`, rondas = `maxWorld`, y pasaportes de todas las regiones de los destinos ya alcanzados (más Europa). Nunca se les pide elegir.
- No se borra ni renombra ninguna clave vieja. `word` queda sin uso.

## Contrato para los módulos de UI
`index.html` arma un objeto `ctx` y se lo pasa a cada módulo:
```
ctx = {
  store, V,                 // V = módulo viaje.js completo (T, ALBUM, PHOTO, REGIONS, TRAVELERS, PHOTO_ITEMS, SOUVENIRS, funciones…)
  wallet,                   // getter: monedas actuales
  buy(price, name) → bool,  // cobra; si no alcanza hace sonido/toast "TE FALTAN…" y devuelve false
  addCoins(n),
  owned, saveOwned(),       // ids de SKINS que tiene
  skinId, setSkin(id),      // getter + setter (guarda)
  stock, saveStock(), ITEMS,
  SKINS, artFor,            // de runner-art.js
  DESTINOS,
  SFX,                      // tap, buy, nope, win, prize, stamp, whoosh, chest
  pop(text, cls), confetti(), toast(text), buzz(pattern),
  refresh(),                // redibuja chips de monedas y el inicio
  tops(),                   // récords guardados (array)
  drawRecords(el),          // dibuja los récords actuales dentro de el (igual que el panel RÉCORDS)
  Iap,                      // paquetes PRO
}
```
Estilo: usar las clases y variables CSS existentes de `index.html` (`.panel`, `.head`, `.btn`, `.btn.green`, `.btn.plain`, `.chip`, `.round`, `.price`, `.tabs`, `--ink`, `--cream`, `--paper`, `--gold`, Lilita One + Nunito, borde de tinta 2.5px, sombra dura `0 4px 0 var(--ink)`). Cada módulo inyecta su propio `<style>` una sola vez. Arte papercut: SVG con contorno crema grueso (`stroke:#FFF4DC`, `stroke-linejoin:round`) y rellenos planos, como `runner-art.js`.

| Módulo | Exporta |
|---|---|
| `seleccion.js` | `showTravelerPick(ctx, onDone)` — pantalla de primera vez |
| `tienda.js` | `openShop(ctx, tab?)` — tienda de 5 secciones dentro de `#shop` |
| `album.js` | `openAlbum(ctx)`, `selfieHTML(i, shot, look?)`, `photoPreview(id)`, `selfieReveal(ctx, i, res)` |

## Etapas
1. Núcleo (viaje.js) + integración en index.html: ronda → mapa, mapa con tarifas/pasaportes, dificultad, origen por viajero, pasaporte del color de la región en el festejo.
2. Pantalla de elección de viajero (seleccion.js) + arte provisorio de Mora y Ren (se reemplaza cuando llegue el definitivo).
3. Tienda (tienda.js). 4. Álbum y selfies (album.js). 5. Pruebas con navegador headless (partida nueva, partida vieja migrada, recarga).

## Riesgos y pendientes
- Recompensa de misiones 150 × nivel sin tope: a nivel 10 da 1500 por set. No la toqué (pediste no reducir sin analizar); sugerencia: tope en nivel 8 (1200).
- Monedas x2 por anuncio: una vez por partida, está bien.
- Arte de Mora y Ren: provisorio hasta que llegue el de la otra tarea.
