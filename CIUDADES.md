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
  además su fila en `GEO` de `viaje.js` (lat, lon, región; `1` si es remota), su pin al final de `pts` en `world-map.json` (mismo orden que `TABLA`;
  ≥ 55 unidades de los pines vecinos: a la escala del mapa en el teléfono un pin mide ~54) y, si corresponde, su lugar en una ruta de `ROUTES`;
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
| `karst` | peñasco de caliza con estratos, copa de selva y sombra; `vetas` = chorreaduras de color (la caliza naranja de Krabi) |
| `chimenea` | chimenea de hada con sombrero de basalto, surcos y cuevas |
| `macizo` | loma de roca de cumbre ondulada para unir piezas |
| `junco` | barco de velas de abanico con listones |
| `globo` | globo aerostático de gajos |
| `palmera` | palmera de tronco curvo |
| `agua` | lámina de agua de orilla irregular con brillos |
| `muro` | muro con puertas en arco (rojo con albardilla de teja) o de sillares (`piedra`, con `talud` de muralla de castillo); `pilastras` para cortar superficies grandes |
| `pabellon` | pabellón de madera de Asia oriental: columnas, celosías, friso pintado (`cBanda`) y uno o dos techos de teja curva |
| `tenshu` | torre de castillo japonés: pisos que se angostan, techos verdes, último piso oscuro con friso y shachihoko dorados; devuelve `.techos` |
| `hastial` | frontón triangular o curvo (`curvo`) para poner sobre un techo, en una capa de adelante |
| `escalinata` | escalinata-puente de piedra de frente con su ojo en arco (Bulguksa) |
| `puenteCurvo` | puente de madera en arco con baranda y patas al agua (Thê Húc) |
| `acantilado` | pared de caliza de laderas a plomo con selva en la cima; `cara` = lado de la pared que mira al centro; `vetas` |
| `colaLarga` | barca de cola larga tailandesa (proa levantada con cintas, toldo, caña del motor); `dir` = -1 la da vuelta |
| `baobab` | baobab de Grandidier: columna lisa y alta con copa corta de ramas gruesas y matas de hojas planas |
| `acacia` | acacia paraguas de la sabana: tronco en horqueta y copa ancha y chata en dos pisos |
| `jirafa` | jirafa de perfil con manchas poligonales; `cuello` > 0 la estira hacia adelante (comiendo de una acacia), `dir` = -1 la da vuelta |
| `volcan` | montaña de cumbre ancha casi plana con casquete de glaciares dentado (el Kibo) |
| `mesa` | montaña de cumbre plana: meseta a nivel, pared a plomo con canaletas (`pared` = fracción de la altura) y laderas de escombros |
| `nube` | nube larga y chata (mantel de Table Mountain, franja de nubes, bruma de una catarata): va en su propia capa, cruzada delante |
| `duna` | duna del Namib: lomo con hombro, cresta filosa en S, cara al sol y cara en sombra, ondas de viento |
| `arbolSeco` | árbol muerto de Deadvlei (sólo el tronco lleva borde grueso; las ramas, uno fino) |
| `cascada` | catarata ancha como CERRO: selva en el borde que baja por los costados (`laderas`), pared de basalto y cortinas de agua pintadas encima |
| `faro` | faro de torre ahusada con anillos de color (`bandas`), balcón y linterna con cúpula |
| `veranda` | edificio de galerías: pisos con corredor en sombra, columnas finas y barandas (Casa de las Maravillas) |
| `dhow` | velero del Índico de vela latina (va en el agua con `enAgua`, como el junco) |
| `morro` | domo de granito de laderas casi a plomo y cumbre redondeada (Pan de Azúcar, Morro da Urca), con estrías y manto de selva al pie (`verde`) |
| `teleferico` | cable doble en comba con una cabina, entre dos puntos (va sola en una capa de adelante; sin borde grueso) |
| `tepui` | meseta de arenisca partida en bloques por grietas, borde almenado redondeado, cornisa con selva, cumbre verde y laderas de selva; `muesca` = de dónde cae el agua |
| `chorro` | hilo de agua en caída libre que se abre en hebras y se deshace en bruma (sólo detalles, sin borde grueso) |
| `andenes` | terrazas incas en escalera (`lado` = de qué lado está el escalón más alto) con borde de pasto e hiladas de piedra |
| `ruinas` | casitas incas de piedra sin techo: hastiales en punta (`gablete`), puertas y nichos trapezoidales |
| `rama(x1, y1, x2, y2, w1, w2)` | ayuda: cuadrilátero ahusado para troncos y ramas |

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
- **No todo monumento necesita capas delante**: si ya resalta solo (Melbourne, la estación Flinders Street), va con `composicion: { solo: true }`: sin lomas, edificios ni agua delante; el QA no le exige base tapada.
- Melbourne era "un rectángulo naranja con cúpula, flotando": ahora es la estación entera (torre del reloj, pabellón con cúpula, arcadas) con la ciudad baja delante.
- **Cada pieza que debe verse por encima de otra va en su propia capa**: dentro de una capa todos los detalles (`d`) se pintan después de todas las formas (`f`), así que las ventanas o hiladas de una pieza de atrás se dibujan ENCIMA de la de adelante. Hastiales sobre los techos del castillo, la puerta delante de la galería, las escalinatas delante de la terraza: cada una en una capa nueva.
- **Ciudades vecinas, iconos distintos**: Hanói y Hoi An no pueden ser las dos "casas con farolitos" ni Krabi, Phi Phi y Ha Long "peñascos con barco". Hanói es el lago Hoàn Kiếm (torre de la Tortuga + puente rojo, casas tubo pálidas detrás); Krabi una sola torre de caliza tibia con vetas naranjas y una barca de cola larga; Phi Phi dos paredes enfrentadas que encierran la bahía; Ha Long, el bosque de peñascos verdes con el junco.
- **Si los adornos del costado tapan una parte clave, correr el monumento** con `composicion.centro` (unidades de mundo; San Francisco = 4.4): en Pekín el farol del costado derecho tapaba el tercer arco; con `centro: 3.2` y `escala: .8` se ven los tres.
- **Un rojo grande y liso sube el contraste contra el cielo**: el muro de la Ciudad Prohibida pasó el QA recién con el rojo aclarado hacia el papel (`#CA9482`) y pilastras + zócalo en sombra. Mejor rojo empolvado que bermellón.
- **Lo que define al monumento no puede quedar debajo de las lomas**: si la base ES el monumento (la terraza y las escalinatas de Bulguksa, la muralla del castillo de Osaka), subir la pieza para que las lomas tapen sólo el pie, o bajar `tapar`. Mirar la captura: el QA puede pasar con lo importante tapado.
- **La regla de base del QA tiene ruido** (±4 %: adornos y monedas que pasan): dejar margen (tapada ≥ 85 %), no quedarse en el borde.
- **Ninguna pieza puede terminar en un corte vertical en el borde del recuadro**: la primera catarata (pared de basalto rectangular de 0 a 120) se veía como una represa recortada; ahora es un cerro de selva que baja por los dos costados y la pared con el agua va pintada adentro. Igual con las dunas de los costados: si el pie cae en x = 120, que llegue en pendiente suave, no a plomo.
- **Una montaña con laderas a plomo se lee como una lápida**: Table Mountain recién se reconoció con la meseta angosta respecto del ancho total (laderas largas hasta el suelo), la pared baja (`pared: .26`) y los picos vecinos (Devil's Peak, Lion's Head) asomando con su propia forma. Mirar el orden real: desde la bahía, Devil's Peak a la izquierda y Lion's Head a la derecha.
- **Una duna con lados rectos es una pirámide** (y El Cairo ya tiene pirámides): lo que la hace duna es el lomo con hombro, la cresta en S y el corte de luz (mitad al sol, mitad en sombra, las dos visibles). Si la cresta queda pegada al borde, la cara al sol desaparece contra la bruma de la mañana.
- **El suelo del destino puede ser parte del monumento**: en Deadvlei la duna sube directo de la salina blanca; en vez de lomas delante, `solo: true` y `paleta: { around, ground, hill }` claros de arcilla. La salina es el piso de la escena, no un rectángulo dentro del dibujo.
- **Fauna y árboles chicos, metidos en la escena**: las jirafas de Nairobi van en la capa de adelante con las patas tapadas por las lomas y una comiendo de la acacia (`cuello: 1`); las acacias del Kilimanjaro, al pie de la montaña. Nunca sueltas flotando.
- **Sabana no es montaña**: Kilimanjaro, Nairobi y Madagascar van con lomas suaves (`paisaje: 'desierto'` con semilla de pasto dorado o tierra roja), aunque el monumento sea un volcán.
- **Ramas finas con borde crema grueso se funden en una mancha**: en árboles de ramas finas (baobab, árbol seco) el borde grueso va sólo en tronco y ramas principales; lo fino, en los detalles o con un borde de 1.6.
- **Nada de monumentos con derechos de imagen**: en Río no va la estatua del Cristo Redentor (tiene derechos de imagen); el Corcovado va como pico pálido sin estatua y el protagonista es el Pan de Azúcar con su teleférico.
- **Un tepui no es una caja**: la meseta lisa de `mesa` se leía como un bloque; `tepui` parte la pared en columnas, almena el borde y le pone selva en la cumbre y en la cornisa. Ojo con los adornos altos del costado: tapaban el pie y el QA de base fallaba.
- No le gustan los arbolitos de bolita ni una luna extra en el cielo.
- Quiere ver los destinos como se ven dentro del juego, no en maqueta aparte (por eso la galería usa el motor real).

## Pendiente

Usan ficha: San Francisco, Melbourne, Ha Long, Hoi An, Capadocia, Krabi, Phi Phi, Hanói, Osaka, Pekín, Busan, Gyeongju, Ciudad del Cabo, Madagascar, Kilimanjaro, Nairobi, Zanzíbar, Sossusvlei, Swakopmund, Cataratas Victoria, Estambul, Marrakech, Río de Janeiro, Salto Ángel, Montevideo, Cartagena, Machu Picchu, Busan, Reikiavik, Edimburgo y Lisboa. El resto sigue con su fila escrita a mano en `TABLA`
(con `LM_ESCALA`, `LM_X` y `FORE`) y se puede migrar de a una con el mismo procedimiento.
