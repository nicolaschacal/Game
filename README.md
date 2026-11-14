# KANJŪ · Tile Trail

Prototipo jugable de un runner de construcción: el personaje avanza mientras el jugador interpreta el escenario y coloca tiles para transformar el mundo.

## Probar

Abrí \`index.html\` en un servidor estático (Vercel, GitHub Pages o similar). Three.js se carga desde CDN, por lo que necesita conexión a internet.

- **Inicio:** \`index.html\` abre el nuevo prototipo.
- **Prototipo:** \`tile-runner.html\`.
- **Versión anterior:** \`build-run.html\` conserva el experimento Build & Run.

## Mecánica del prototipo

- Movimiento automático hacia delante sobre una grilla 3D.
- Inventario táctil de puentes, agua, piedra y rampas.
- Selección de tile y colocación directa tocando las casillas iluminadas.
- Cuatro situaciones: río, barco suspendido, lava y desnivel.
- Recompensas por construir a tiempo, monedas y velocidad progresiva.
- Controles táctiles y teclado.

## Dirección visual

Inspirada en KANJŪ: noche violeta, papel crema, coral, dorado, verdes suaves y geometría low-poly con una pequeña criatura viajera.

Es un prototipo de mecánica y sensación, no una integración con el santuario ni con el progreso de la partida.

## Tile Runner (`kanjuu-demo.html`) · construcción libre

Hito corre solo; vos construís el camino **una fila por delante**. Esa fila objetivo queda abierta hasta que Hito llega a su centro:

- **↑ Adelante:** el primer tile de la fila sigue el carril por donde sale Hito.
- **← → Laterales:** mientras la fila esté abierta, podés extenderla hacia los costados (uno o varios carriles). Hito se desliza sobre esos tiles, como un cambio de carril en Subway Surfers.
- **↖ ↗ Diagonal:** el primer tile de la fila también puede entrar un carril al costado.
- Se pueden encadenar: izquierda y después adelante, adelante y después derecha, diagonal y después lateral.
- **No se permite:** construir hacia atrás, sobre una piedra o fuera de la grilla. El preview dorado marca las casillas válidas.

Controles: mantener y arrastrar con el dedo (o mouse). En escritorio: mantener ↑/W para avanzar recto, ←/→ para lateral (o diagonal si la fila todavía está vacía), Q/E para diagonal.

## Tile Runner · tramo de mar

- **Kami**, el viajero de papel, reemplaza a Hito: recorte original con sombrero de paja y bufanda, ciclo de carrera de 4 poses visto de espaldas y giro de papel al arrancar.
- **Barco de papel**: al final de cada tramo de tierra hay un muelle y un barco estacionado. Al llegar, Kami desaparece y navega el barco (vela que se hincha, cabeceo y estela).
- **El mar se construye con AGUA**: el mar profundo no es navegable; la ruta se traza con el tile de agua. En tierra se usa CAMINO. Dos botones grandes al alcance del pulgar.
- **Respiros**: muelle, puerto y playa ya están construidos y el camino sigue solo, para poder cambiar de tile con la misma mano.
- **Obstáculos de agua**: arrecifes, aletas y barriles que obligan a moverse; en tierra, rocas y tocones.
- **Premios**: monedas con racha y multiplicador (hasta x5), perlas en carriles de riesgo, bono por rozar obstáculos y por cada travesía, sonido, vibración y récord guardado.
- Cinco mares cada vez más largos y rápidos, con meta al final. El arte vive en `kanjuu-demo/runner-art.js`.

## Tile Runner · cielo (reemplaza al puente)

Entre mares hay una cima con un globo de papel. Kami sube solo el escalón (rampa ya hecha), monta el globo y vuela: el camino se traza con tiles de cielo flotantes, esquivando picos, nubes y nubarrones. Hay monedas y estrellas en el aire, y al final aterriza en otra cima con la bajada ya construida.

## Tile Runner · versión nocturna (tren, mundos, tienda, sonido, rendimiento)

- **Tren de papel**: estación → tren → vías que se tienden solas con rieles y durmientes; vallas, cajas y rocas obligan a cambiar de vía. Es el vehículo más rápido.
- **Mundos encadenados**: al cruzar el torii se pasa al mundo siguiente (Pradera → Desierto → Nieve → Bosque…) conservando puntaje, monedas y racha. Cada mundo arranca más rápido y la velocidad sube de a poco dentro del mundo ("¡MÁS RÁPIDO!").
- **Economía**: las monedas se guardan en un monedero (localStorage). En el menú inicial se compran y eligen personajes: Kami, Sakura, Kitsu, Shinobi y Kami de Oro. El personaje también aparece a bordo del barco, el globo y el tren.
- **Sonido**: cada tile es una nota de una melodía pentatónica con el timbre del tramo (marimba en tierra, burbuja en agua, campanita en el cielo, clac-clac en las vías); monedas que suben de tono con la racha, silbato, zumbido al rozar, subida al acelerar.
- **Rendimiento**: solo se dibujan las filas cercanas (34 adelante, 7 atrás); lo que queda atrás se saca de la escena. La grilla es una línea tenue por fila y la resolución se limita a 1.5×.
- Pruebas: `?debug` expone `window.__dbg`; `?debug&quick` genera un mundo corto.

## Tile Runner · GUI de papel, música y vías con curvas

- **GUI nueva**: piezas crema con borde de tinta y sombra dura, botones con volumen, tipografía Lilita One + Nunito. Inicio con logo, personaje en vivo con flechas, misión del día y barra inferior (Jugar · Tienda · Récords); HUD limpio con barra de avance y marcas de vehículos; tarjetas de revivir, caída y pausa; tienda con rarezas y pestañas.
- **Misión del día** (rota entre 4, premio ◉100) y **tus 5 mejores partidas**, guardadas en el dispositivo.
- **Música generada en vivo** (bajo, arpegio, bombo y platillo) que acelera con la carrera; un solo botón silencia música y efectos.
- **Vías con curvas**: cada tile de vía se pinta según por dónde entra y sale el tren (recta, curva lateral o diagonal).

## Tile Runner · inicio sin barra, mundos guardados y obstáculos vivos

- **Inicio**: sin barra inferior; Tienda y Récords son botones a los costados. Pantalla de carga con el logo.
- **Mundo guardado**: la partida retoma en el último mundo alcanzado (`kanjuu.run.world`); la etiqueta del mundo permite volver a uno anterior.
- **Dificultad por mundo**: la velocidad sube suave dentro del mundo y cada mundo arranca más rápido, con obstáculos más seguidos, más carriles cerrados y tramos más largos.
- **Obstáculos vivos** (desde el mundo 2): tiburones, nubarrones y gallinas en las vías van y vienen entre dos carriles; nunca pisan el carril seguro.
- **Jugo**: chispas y moneda que vuela al contador, líneas de velocidad, sacudida al chocar, papel picado al pasar de mundo o batir récord.
- **Música**: se quitó el bucle sintetizado. Si se agrega `kanjuu-demo/music.mp3`, suena en bucle y acompaña la velocidad.

## Tile Runner · escenario por mundo

El protagonista siempre tiende su propio camino de tierra; lo que cambia es el escenario. Cada mundo define el color del suelo sin construir, el material de cimas y llanuras, y un clima que cruza la pantalla: pétalos en la Pradera, viento de arena en el Desierto, nieve en la Nieve y hojas en el Bosque. El obstáculo vivo de las vías es una vagoneta suelta.

## Tile Runner · horizonte y luz por mundo

Cada mundo tiene suelo alrededor de la pista, horizonte de papel en capas (colinas, dunas o picos), sol, bruma que funde el fondo y recortes a los costados (cerezos, cactus, pinos nevados, cedros y hongos). La cámara va más baja para que se vea el horizonte y la luz es fija por mundo en vez de seguir la hora real.

## Tile Runner · ocho biomas y más velocidad

Los mundos rotan entre ocho biomas: Pradera, Desierto, Costa, Nieve, Bosque, Volcán, Bambú y Pueblo. Cada uno tiene su suelo, horizonte, recortes a los costados, clima (pétalos, arena, burbujas, nieve, hojas, brasas, hojas de bambú, farolitos) y luz. Desde el mundo 2 la velocidad base es más alta y la aceleración dentro del mundo crece con cada mundo (tope 3,8 filas/s).

## TILE RUN

El runner pasa a llamarse **TILE RUN** (logo, título y pantalla de carga); es un juego aparte de KANJŪ. Las claves de guardado conservan su prefijo para no perder el progreso.

Nuevo ítem **Congelar** (◉90): durante la carrera aparece un botón ❄ que detiene 8 segundos a los obstáculos que se mueven.
