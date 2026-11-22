# Paper Voyager · Build your way

Runner de construcción en papel recortado: **Nilo** avanza solo y vos construís el camino de tiles por donde va a pasar, una fila por delante. No es un runner de swipe: el personaje no se mueve con el dedo, se mueve el camino.

## Probar

- **Juego:** `index.html` (en Vercel es la raíz del sitio). Three.js se carga desde CDN en la web; en la app va empaquetado.
- **Tiendas (iOS/Android):** ver [PUBLICAR.md](PUBLICAR.md). Capacitor, AdMob y RevenueCat ya están conectados.
- **Prototipos viejos:** `tile-runner.html`, `build-run.html` y `paper.js` (raíz) quedan en el repo como referencia; el build ya no los copia a `www/`, así que no entran en la app.
- Pruebas: `?debug` expone `window.__dbg`; `?debug&quick` genera un mundo corto; `?world=N` abre el destino N; `?lluvia` fuerza lluvia; `?hora=23` fija la hora.

## Dirección visual

Noche violeta, papel crema, coral, dorado, verdes suaves y geometría low-poly, con un pequeño viajero de papel.

## Construcción libre

Nilo corre solo; vos construís el camino **una fila por delante**. Esa fila objetivo queda abierta hasta que Nilo llega a su centro:

- **↑ Adelante:** el primer tile de la fila sigue el carril por donde sale Nilo.
- **← → Laterales:** mientras la fila esté abierta, podés extenderla hacia los costados (uno o varios carriles). Nilo se desliza sobre esos tiles, como un cambio de carril en Subway Surfers.
- **↖ ↗ Diagonal:** el primer tile de la fila también puede entrar un carril al costado.
- Se pueden encadenar: izquierda y después adelante, adelante y después derecha, diagonal y después lateral.
- **No se permite:** construir hacia atrás, sobre una piedra o fuera de la grilla. El preview dorado marca las casillas válidas.

Controles: mantener y arrastrar con el dedo (o mouse). En escritorio: mantener ↑/W para avanzar recto, ←/→ para lateral (o diagonal si la fila todavía está vacía), Q/E para diagonal.

## tramo de mar

- **Nilo**, el viajero de papel, es el personaje principal: gorra de aviador, anteojos de bronce y bufanda roja, con mochila. Ciclo de carrera de 6 cuadros visto de espaldas, saludo al arrancar y recorte de papel con la misma regla que el resto del juego.
- **Barco de papel**: al final de cada tramo de tierra hay un muelle y un barco estacionado. Al llegar, Nilo desaparece y navega el barco (vela que se hincha, cabeceo y estela).
- **El mar se construye con AGUA**: el mar profundo no es navegable; la ruta se traza con el tile de agua. En tierra se usa CAMINO. Dos botones grandes al alcance del pulgar.
- **Respiros**: muelle, puerto y playa ya están construidos y el camino sigue solo, para poder cambiar de tile con la misma mano.
- **Obstáculos de agua**: arrecifes, aletas y barriles que obligan a moverse; en tierra, rocas y tocones.
- **Premios**: monedas con racha y multiplicador (hasta x5), perlas en carriles de riesgo, bono por rozar obstáculos y por cada travesía, sonido, vibración y récord guardado.
- Cinco mares cada vez más largos y rápidos, con meta al final. El arte vive en `paper-voyager/runner-art.js`.

## cielo (reemplaza al puente)

Entre mares hay una cima con un globo de papel. Nilo sube solo el escalón (rampa ya hecha), monta el globo y vuela: el camino se traza con tiles de cielo flotantes, esquivando picos, nubes y nubarrones. Hay monedas y estrellas en el aire, y al final aterriza en otra cima con la bajada ya construida.

## versión nocturna (tren, mundos, tienda, sonido, rendimiento)

- **Tren de papel**: estación → tren → vías que se tienden solas con rieles y durmientes; vallas, cajas y rocas obligan a cambiar de vía. Es el vehículo más rápido.
- **Mundos encadenados**: al cruzar el torii se pasa al mundo siguiente (Pradera → Desierto → Nieve → Bosque…) conservando puntaje, monedas y racha. Cada mundo arranca más rápido y la velocidad sube de a poco dentro del mundo ("¡MÁS RÁPIDO!").
- **Economía**: las monedas se guardan en un monedero (localStorage). En el menú inicial se compran y eligen personajes: Nilo (el base), Sakura, Kitsu, Shinobi y Kami de Oro. El personaje también aparece a bordo del barco, el globo y el tren.
- **Sonido**: cada tile es una nota de una melodía pentatónica con el timbre del tramo (marimba en tierra, burbuja en agua, campanita en el cielo, clac-clac en las vías); monedas que suben de tono con la racha, silbato, zumbido al rozar, subida al acelerar.
- **Rendimiento**: solo se dibujan las filas cercanas (34 adelante, 7 atrás); lo que queda atrás se saca de la escena. La grilla es una línea tenue por fila y la resolución se limita a 1.5×.
- Pruebas: `?debug` expone `window.__dbg`; `?debug&quick` genera un mundo corto.

## GUI de papel, música y vías con curvas

- **GUI nueva**: piezas crema con borde de tinta y sombra dura, botones con volumen, tipografía Lilita One + Nunito. Inicio con logo, personaje en vivo con flechas, misión del día y barra inferior (Jugar · Tienda · Récords); HUD limpio con barra de avance y marcas de vehículos; tarjetas de revivir, caída y pausa; tienda con rarezas y pestañas.
- **Misión del día** (rota entre 4, premio ◉100) y **tus 5 mejores partidas**, guardadas en el dispositivo.
- **Música generada en vivo** (bajo, arpegio, bombo y platillo) que acelera con la carrera; un solo botón silencia música y efectos.
- **Vías con curvas**: cada tile de vía se pinta según por dónde entra y sale el tren (recta, curva lateral o diagonal).

## inicio sin barra, mundos guardados y obstáculos vivos

- **Inicio**: sin barra inferior; Tienda y Récords son botones a los costados. Pantalla de carga con el logo.
- **Mundo guardado**: la partida retoma en el último mundo alcanzado (`pv.world`); la etiqueta del mundo permite volver a uno anterior.
- **Dificultad por mundo**: la velocidad sube suave dentro del mundo y cada mundo arranca más rápido, con obstáculos más seguidos, más carriles cerrados y tramos más largos.
- **Obstáculos vivos** (desde el mundo 2): tiburones, nubarrones y gallinas en las vías van y vienen entre dos carriles; nunca pisan el carril seguro.
- **Jugo**: chispas y moneda que vuela al contador, líneas de velocidad, sacudida al chocar, papel picado al pasar de mundo o batir récord.
- **Música**: se quitó el bucle sintetizado. Si se agrega `paper-voyager/music.mp3`, suena en bucle y acompaña la velocidad.

## escenario por mundo

El protagonista siempre tiende su propio camino de tierra; lo que cambia es el escenario. Cada mundo define el color del suelo sin construir, el material de cimas y llanuras, y un clima que cruza la pantalla: pétalos en la Pradera, viento de arena en el Desierto, nieve en la Nieve y hojas en el Bosque. El obstáculo vivo de las vías es una vagoneta suelta.

## horizonte y luz por mundo

Cada mundo tiene suelo alrededor de la pista, horizonte de papel en capas (colinas, dunas o picos), sol, bruma que funde el fondo y recortes a los costados (cerezos, cactus, pinos nevados, cedros y hongos). La cámara va más baja para que se vea el horizonte y la luz es fija por mundo en vez de seguir la hora real.

## ocho biomas y más velocidad

Los mundos rotan entre ocho biomas: Pradera, Desierto, Costa, Nieve, Bosque, Volcán, Bambú y Pueblo. Cada uno tiene su suelo, horizonte, recortes a los costados, clima (pétalos, arena, burbujas, nieve, hojas, brasas, hojas de bambú, farolitos) y luz. Desde el mundo 2 la velocidad base es más alta y la aceleración dentro del mundo crece con cada mundo (tope 3,8 filas/s).

## Nombre anterior y guardado

Antes el juego se llamaba Tile Run. Al abrirlo, el progreso de las claves viejas se copia a las claves `pv.*` y la clave vieja se borra (migración en `index.html`, al cargar el guardado).

Nuevo ítem **Congelar** (◉90): durante la carrera aparece un botón ❄ que detiene 8 segundos a los obstáculos que se mueven.

## Paper Voyager

El runner se llama **Paper Voyager** ("Build your way"). Logo en dos líneas con la tipografía del juego, cinta con el eslogan y un ícono de tile rojo con el barco de papel del juego (`paper-voyager/icon-512.png`, también versión 1024 para las tiendas).

## Destinos y monumentos
- Los 8 biomas ahora son destinos reales: Toscana, Merzouga, Río de Janeiro, Ushuaia, Banff, Reikiavik, Kioto y Hội An.
- Tocar la etiqueta del mundo abre **DESTINOS**, un mapa del mundo de papel que se desliza de lado. Muestra la ruta, un pin por destino (visitado, actual o bloqueado) y una tarjeta con el botón VIAJAR.
- Cada destino tiene su monumento de fondo (`LANDMARKS` en `runner-art.js`, campo `lm` en `THEMES`). Si borrás el `lm`, el monumento desaparece; para sumar uno, agregás el SVG y le ponés su id.
- El mapa sale de `paper-voyager/world-map.json`: la silueta de tierra y los 8 puntos ya proyectados.

## Viaje libre: viajeros, pasaportes, mapa, tienda y álbum

- **Primera vez**: elegís viajero (Mora · Buenos Aires, Nilo · Berlín, Ren · Kioto). Define tu ciudad de origen y tu primer pasaporte. Se guarda y no se vuelve a pedir (`seleccion.js`).
- **Rondas**: cada destino es una ronda; al llegar al aeropuerto volvés al mapa y elegís adónde ir. Pasaje según distancia real y conexiones; pasaportes regionales permanentes (`viaje.js`, reglas y números en `PLAN-viajes.md`).
- **Tienda** de 5 secciones: Viajeros, Pasaportes, Fotografía, Objetos y Récords (`tienda.js`).
- **Selfies y álbum**: la cámara polaroid de la pista da una selfie del destino (3 tomas por destino, 135 en total), que se ven y personalizan en el Álbum (`album.js`).
- Partidas anteriores migran solas: siguen como Nilo, con sus monedas, personajes, ítems y pasaportes de las regiones a las que ya habían llegado.
