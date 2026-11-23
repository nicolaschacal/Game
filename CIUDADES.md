# Fábrica de ciudades

Cómo se hace una ciudad de Paper Voyager sin dibujar SVG a ojo. Todo está calibrado contra **San Francisco**, la referencia aprobada:
monumento grande y legible, montañas lejanas detrás, lomas delanteras en la paleta del destino que tapan la base, tonos apagados de papel,
borde crema y sombra suave.

| Archivo | Qué tiene |
|---|---|
| `paper-voyager/fichas-ciudades.js` | Las **fichas**: sólo datos (nombre, país, color, paisaje, monumento armado con piezas, adornos). |
| `paper-voyager/kit-ciudades.js` | El **kit**: piezas de papel paramétricas, la paleta derivada, la composición automática y `fila(ficha)`. |
| `paper-voyager/destinos.js` | `TABLA`: las ciudades con ficha van como `fila(FICHAS['Nombre'])` en su lugar de siempre. |
| `scripts/qa-ciudades.py` | Control de calidad automático (capturas reales + reglas medibles + lámina). |
| `paper-voyager/galeria.js` | `index.html?galeria`: miniaturas del fondo real de cada ciudad, para revisar en el iPhone. |

## Agregar una ciudad en 3 pasos

### 1. Escribir la ficha

En `paper-voyager/fichas-ciudades.js` (ejemplo real, Capadocia):

```js
FICHAS['Capadocia'] = {
  mundo: 'GLOBOS', nombre: 'Capadocia', pais: 'Turquía',
  color: '#DCA78C',            // semilla de la paleta: el tono de las colinas del destino
  paisaje: 'desierto',         // costa | montana | ciudad | desierto | selva | nieve
  horizonte: 'peak', hora: 6.9,
  monumento: [                 // capas de atrás hacia adelante; cada capa es una hoja de papel con su borde crema
    [K.macizo({ x0: 2, x1: 118, alto: 44, c: '#E6CCB4' }), K.globo({ x: 24, y: 30, r: 8.5, c: '#C27A62', c2: '#E2C285' })],
    [K.chimenea({ x: 32, h: 68, w: 18, c: '#E0C2A2', sombrero: '#AC8E7A' }), K.chimenea({ x: 59, h: 84, w: 19, c: '#DDBE9C', sombrero: '#A48674' })],
    [K.chimenea({ x: 12, h: 44, w: 15, c: '#D4AE8C', sombrero: '#94786A' })],
  ],
  composicion: { tapar: .22 },  // opcional: qué fracción de la altura tapan las lomas (por defecto .395, la de San Francisco)
  adornos: ['cipres', 'rocaArena', 'farolDesierto'],
};
```

Después, en `TABLA` de `destinos.js`:

- **ciudad nueva** → agregar `fila(FICHAS['Nombre']),` **al final** (los índices guardados no cambian) y sus textos `dest.<índice>.place/country` en `paper-voyager/i18n/*.json`;
- **ciudad vieja que se migra** → reemplazar su fila por `fila(FICHAS['Nombre']),` **en el mismo lugar** (y borrar sus entradas de `LM_ESCALA`, `LM_X` y `FORE`).

No hay que poner escala, posición ni lomas: salen solas. Para verla: `index.html?preview=Nombre` (sin tildes ni mayúsculas, no guarda nada).

### 2. Correr el QA

```
python3 scripts/qa-ciudades.py                       # San Francisco + todas las fichas
python3 scripts/qa-ciudades.py --ciudades "Nombre"   # una sola (San Francisco va igual primero, como referencia)
```

Arma `www/`, lo sirve (no la raíz: three.js de unpkg está bloqueado por el proxy), abre cada ciudad con chromium (swiftshader, 390×844, DPR 2),
empieza la partida, saca la captura y mide. Deja `qa/galeria.png` (todas lado a lado, San Francisco primero), `qa/reporte.md`,
`qa/<ciudad>.png` y `qa/<ciudad>-mascaras.png` (magenta = monumento visible, rosa = tapado, celeste = lomas). Sale con código 1 si algo falla.

| Regla | Qué mide | Aprobado |
|---|---|---|
| borde | el recorte del monumento no toca los bordes de la pantalla | margen > 3 px |
| base | debajo del pie visible de cada columna del monumento hay una loma (no el final del dibujo) | tapada ≥ 70 %, expuesta ≤ 12 % |
| tamaño | área visible y ancho comparados con San Francisco | área 0.55×–1.6×, ancho ≥ 0.5× |
| pausa | cuánto del monumento queda bajo el botón de pausa | ≤ 3 % |
| color | saturación media y p90 del monumento | ≤ 0.55 / ≤ 0.96 |
| contraste | desvío de luminancia dentro del monumento, y diferencia con el fondo que lo rodea | ≤ 0.25 / ≤ 0.20 |
| plano | mayor zona lisa de un solo color con forma de rectángulo | no > 20 % del monumento con rect > 0.8 |
| consola | errores de consola en el inicio y en la partida | ninguno |

Los rangos de color y contraste se calibraron con `--calibrar` sobre las aprobadas (San Francisco, París, Londres, Moscú, Venecia, Chiang Mai).
Kioto queda afuera a propósito (0.286 / 0.268: estilo viejo de una sola capa, demasiado contraste para las ciudades nuevas).
Las viejas con suelo propio (Londres, Moscú, Venecia) fallan la regla de **base**: es exactamente el "rectángulo de suelo" que ya no se hace.

### 3. Revisar la galería

`index.html?galeria=fichas` en el teléfono (o `?galeria` para todas, `?galeria=borradores`, `?galeria=Melbourne,Hoi An`).
Dibuja el fondo real de cada ciudad con el mismo motor de la partida; tocar una la abre con `?preview=`.
**Pasar el QA no alcanza**: mirarla como un director de arte, al lado de San Francisco.

## El kit

Cada pieza devuelve `{ f, d, box }`: `f` = formas planas (reciben el borde crema), `d` = detalles finos encima, `box` = recuadro en el SVG 120×120.
Todas bajan hasta la base (y = 110–118, queda bajo el piso) **sin suelo propio**.

| Pieza | Para |
|---|---|
| `puenteColgante` | Golden Gate (con los valores por defecto reproduce San Francisco byte a byte) |
| `puenteArco` | puentes de piedra de n ojos |
| `torreReloj` | campanarios / torres de reloj; techo `cupula`, `aguja`, `pira` o `plano` |
| `cupula` | `semi` (semiesfera), `bulbo` (cebolla), `chapitel`; tambor con ventanas y linterna |
| `techoTeja` | techo de pagoda / teja curva con aleros levantados y tejas canal |
| `fachada` | bloque con pisos de `arcos`, `ventanas` o `puertas`, cornisa y bandas |
| `casas` | casas angostas con techo de teja o gablete, persianas, balcones y faroles de alero |
| `farolitos`, `farol` | guirnalda en comba / farolito suelto (van en detalles, sin borde grueso) |
| `karst` | peñasco de caliza con estratos, copa de selva y sombra |
| `chimenea` | chimenea de hada con sombrero de basalto, surcos y cuevas |
| `macizo` | loma de roca de cumbre ondulada para unir piezas |
| `junco` | barco de velas de abanico con listones |
| `globo` | globo aerostático de gajos |
| `palmera` | palmera de tronco curvo |
| `agua` | lámina de agua de orilla irregular con brillos |

Ayudas de color: `tono(c)` (filtro de papel: saturación ≤ .55, luz .34–.84), `tonos(c)` (luz / sombra / oscuro de una pieza), `mix`, `luz`, `shade`.
Primitivas: `P`, `R`, `C`, `Ln`, `arco`, `cut`, `cutFore`.

### Paleta derivada (`paleta(color, suelo)`)

Del color semilla se toma el tono y la saturación (acotada a .12–.5) y se fija la luz con los valores de San Francisco:
bruma = sat ×1.315, luz .933 · colina clara = sat ×1.09, luz .839 · colina oscura = sat, luz .737.
El suelo alrededor, la pista y el piso construido salen del tipo de suelo (`ciudad` usa los de pavimento; `costa`, `desierto`, `montana`, `selva`, `nieve`, `pueblo`).
Con la semilla de San Francisco (`#B0BCC8`) la regla da exactamente su paleta aprobada. Cualquier color se puede pisar con `paleta: { … }`.

### Composición automática (`componer`)

- **Escala**: el ancho del dibujo igual al del Golden Gate; si es más alto que ancho, el área de San Francisco sin pasar 1.12× su altura.
- **Posición**: centrado donde va el puente, sin pasar su borde derecho (así no se corta en pantalla).
- **Lomas (FORE)**: la plantilla es el FORE de San Francisco pasado a coordenadas del recuadro del dibujo (loma baja al centro, dos laterales,
  dos más cercanas y oscuras); la central sube hasta tapar `tapar` de la altura (por defecto .395, la de San Francisco).
- **Extras del paisaje**: `costa` agrega una lámina de agua con brillos entre el monumento y las lomas (las laterales crecen para tapar sus puntas; `enAgua` pone barcos o farolitos flotando con su reflejo); `ciudad` agrega una hilera continua de edificios bajos.
- Todo se puede sobrescribir en `composicion`: `escala`, `x`, `centro`, `tapar`, `laterales`, `agua`, `aguaAlto`, `aguaAncho`, `enAgua`, `edificios`, `edificiosAlto`, `fore`, `foreExtra`.

Con el Golden Gate, la composición automática devuelve exactamente lo aprobado (escala 1, `lmX` -0.8 y el mismo FORE).

## Reglas visuales

1. Una sola paleta apagada por ciudad; el monumento puede tener UN color de acento (el rojo del puente es el máximo aceptado).
2. Luz desde la izquierda: sombra a la derecha del mismo color oscurecido (hacia la tinta violácea `#3A2A3E`, no hacia negro) a opacidad .35–.5.
3. Profundidad con capas de papel: lo de atrás más pálido y con menos contraste; cada capa con su borde crema.
4. Nada de suelo propio: el pie lo tapan las lomas del destino.
5. Detalles finos (ventanas, tejas, surcos, brillos) en todas las superficies grandes: ningún rectángulo liso.
6. Los objetos chicos (barcos, faroles, globos) van metidos en la escena: en el agua con su reflejo, colgados de algo, entre las piezas.

## Lecciones del usuario

Lo que el usuario rechazó. Cada rechazo nuevo se anota acá.

- **Nada de alto contraste** (lo rechazó dos veces): los monumentos van integrados y apagados, medio mimetizados con el fondo.
- **Nada de cajas planas**: Hoi An eran cajas amarillas lisas; ahora es una hilera de casas con techos de teja, balcones y persianas.
- **Nada de objetos sueltos que no se integran**: el junco de Ha Long estaba flotando delante; ahora navega en el agua con su reflejo.
- **Nada cortado en el borde**: Melbourne y el puente de San Francisco se cortaban contra el borde derecho; la composición automática lo evita.
- **Las capas no siempre son montañas**: en una ciudad las capas de adelante y del fondo son perfiles de edificios, no lomas ni cordilleras. El tipo de capa sale del `paisaje` (tabla `LOMAS` en kit-ciudades.js: ciudad → `city`, montaña/nieve → `peak`, costa/desierto/selva → `dune`) y la ficha lo puede forzar con `composicion.lomas`. Antes de elegir el paisaje, preguntate qué hay realmente alrededor del monumento.
- Melbourne era "un rectángulo naranja con cúpula, flotando": ahora es la estación entera (torre del reloj, pabellón con cúpula, arcadas) con la ciudad baja delante.
- No le gustan los arbolitos de bolita ni una luna extra en el cielo.
- Quiere ver los destinos como se ven dentro del juego, no en maqueta aparte (por eso la galería usa el motor real).

## Pendiente

Sólo San Francisco, Melbourne, Ha Long, Hoi An y Capadocia usan ficha. El resto sigue con su fila escrita a mano en `TABLA`
(con `LM_ESCALA`, `LM_X` y `FORE`) y se puede migrar de a una con el mismo procedimiento.
