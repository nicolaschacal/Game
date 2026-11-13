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
