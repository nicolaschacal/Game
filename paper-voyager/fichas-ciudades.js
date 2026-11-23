// FICHAS DE CIUDAD: sólo datos. El dibujo sale del kit (kit-ciudades.js) y la paleta, la escala, la posición y las lomas
// delanteras se calculan solas (calibradas contra San Francisco). Guía completa en CIUDADES.md.
//
//   mundo / nombre / pais   textos de la fila (nombre = clave estable en español: no cambiarla, la usan rutas y traducciones)
//   color                   semilla de la paleta: el tono de las colinas del destino (se deriva bruma, colinas, suelo, pista)
//   paisaje                 'costa' | 'montana' | 'ciudad' | 'desierto' | 'selva' | 'nieve' (lomas, agua, edificios, horizonte, clima)
//   suelo                   (opcional) otro juego de suelo/pista: 'ciudad' | 'costa' | 'desierto' | 'montana' | 'selva' | 'nieve' | 'pueblo'
//   monumento               capas de piezas del kit, de atrás hacia adelante: [[pieza, pieza], [pieza]]
//   adornos                 los 3 adornos de costado (grande, chico, farol) de adornos.js
//   hora, clima, horizonte  (opcionales) por defecto salen del paisaje
//   composicion             (opcional) sobrescribe lo automático: { escala, x, tapar, agua, enAgua, edificios, laterales, fore, foreExtra }
//   paleta                  (opcional) sobrescribe colores sueltos: { fog, c1, c2, around, ground, hill }
import * as K from './kit-ciudades.js';
const { P, R, Ln, f1, luz, shade, farol } = K;

export const FICHAS = {};

// ── San Francisco (la REFERENCIA aprobada): Golden Gate completo, lomas de Marin y del Presidio delante. Sin agua: así quedó aprobado ──
FICHAS['San Francisco'] = {
  mundo: 'PUENTE', nombre: 'San Francisco', pais: 'EE.UU.', color: '#B0BCC8', paisaje: 'costa', suelo: 'ciudad', hora: 9.5,
  monumento: [[K.puenteColgante()]],
  composicion: { agua: false },
  adornos: ['cipres', 'tranviaSF', 'farolModerno'],
};

// ── Melbourne: estación Flinders Street. Fachada larga ocre con franjas crema y dos pisos de arcos, pabellón de entrada con la
// cúpula de cobre verde, torre del reloj en la punta y torrecita en la otra. Delante, la ciudad baja ──
{ const ocre = '#D6A866', crema = '#E9D3A6', cobre = '#86A890';
  FICHAS['Melbourne'] = {
    mundo: 'ESTACIÓN', nombre: 'Melbourne', pais: 'Australia', color: '#A4BED2', paisaje: 'ciudad', hora: 15,
    monumento: [
      [K.fachada({ x0: 10, x1: 112, y0: 74, c: ocre, pisos: [{ tipo: 'arcos', n: 10 }, { tipo: 'arcos', n: 10 }], sombra: 0 })],
      [K.torreReloj({ x: 19, w: 15, top: 26, c: ocre, cTecho: cobre, techo: 'cupula' }),
        K.fachada({ x0: 36, x1: 72, y0: 60, c: luz(ocre, .08), pisos: [{ tipo: 'ventanas', n: 4 }, { tipo: 'puertas', n: 3 }], sombra: .18 }),
        K.cupula({ x: 54, y: 50, w: 30, tipo: 'semi', c: cobre, tambor: 9, cTambor: crema }),
        K.torreReloj({ x: 104, w: 10, top: 54, c: ocre, cTecho: cobre, reloj: false })],
    ],
    composicion: { tapar: .2 },
    adornos: ['arbolUrbano', 'buzon', 'farolModerno'],
  };
}

// ── Ha Long: peñascos de caliza en tres capas (los de atrás más pálidos, con bruma) y el junco navegando en la bahía, metido en el agua ──
FICHAS['Ha Long'] = {
  mundo: 'BAHÍA', nombre: 'Ha Long', pais: 'Vietnam', color: '#9CC2B2', paisaje: 'costa', suelo: 'montana', hora: 10, horizonte: 'peak',
  monumento: [
    [K.karst({ x: 28, h: 70, w: 15, c: '#B9CBBE', veg: '#A9C0AC', seed: 1 }), K.karst({ x: 90, h: 84, w: 17, c: '#B4C8BA', veg: '#A4BCA7', seed: 2 })],
    [K.karst({ x: 56, h: 100, w: 17, c: '#95AE9C', veg: '#83A189', seed: 3 }), K.karst({ x: 112, h: 66, w: 12, c: '#9AB2A0', veg: '#88A68D', seed: 4 })],
    [K.karst({ x: 12, h: 56, w: 12, c: '#7F9C89', veg: '#6F8F78', seed: 5 }), K.karst({ x: 76, h: 46, w: 11, c: '#84A08D', veg: '#73937B', seed: 6 })],
  ],
  cAgua: '#A6C6C0',
  composicion: { tapar: .2, aguaAlto: 1.4, enAgua: ({ y0 }) => {
    const wl = y0 + 9, j = K.junco({ x: 66, y: wl, s: .62, c: '#86604C', vela: '#C49272' });
    // reflejo invertido y ondas: el barco está EN el agua, no pegado delante
    return { bajo: `<g opacity=".25" transform="translate(0 ${f1(2 * wl)}) scale(1 -1)">${j.f}</g>`, f: j.f, d: j.d + Ln(`M48 ${f1(wl + 1.6)} h12 M72 ${f1(wl + 2.4)} h12 M58 ${f1(wl + 4)} h9`, '#E6F1EE', 1, ' opacity=".9"') }; } },
  adornos: ['palmeraTropical', 'loto', 'farolPapel'],
};

// ── Hội An: hilera de casas-tienda amarillas de teja (dos alturas, unas delante de otras), persianas, balcones de madera y
// guirnaldas de farolitos de seda; delante el río Thu Bồn con farolitos flotando ──
{ const am = ['#DDB45E', '#D4A653', '#E2C07A', '#CF9F55', '#DAB066', '#D8A85A'];
  const casa = (x, w, h, i, o = {}) => K.casas({ x0: x, defs: [{ w, h, c: am[i % am.length], ...o }], cTecho: '#8E5C48', cPersiana: i % 2 ? '#6E968A' : '#7C93A6' });
  FICHAS['Hoi An'] = {
    mundo: 'FAROLES', nombre: 'Hoi An', pais: 'Vietnam', color: '#D9A88A', paisaje: 'costa', suelo: 'pueblo', hora: 18.8, clima: 'lanterns',
    monumento: [
      [casa(10, 30, 68, 1, { pisos: 2, farol: false }), casa(46, 30, 74, 3, { pisos: 2, farol: false }), casa(82, 30, 66, 5, { pisos: 2, farol: false })],
      [casa(0, 24, 40, 0, { pisos: 1 }), casa(36, 20, 36, 2, { pisos: 1 }), casa(68, 24, 42, 4, { pisos: 1 }), casa(103, 17, 36, 1, { pisos: 1 }),
        K.farolitos({ x0: 6, x1: 114, y: 56, y1: 58, comba: 3, n: 8, colores: ['#C85A40', '#D9A040', '#B8607A', '#C87A44'] })],
    ],
    cAgua: '#B9C6B4',
    composicion: { escala: .9, tapar: .17, aguaAlto: .85, enAgua: ({ y0 }) => ({ f: '', d: [[24, 6, '#C85A40'], [46, 10, '#D9A040'], [70, 7, '#B8607A'], [92, 11, '#C85A40']].map(([x, dy, c]) =>
      `<ellipse cx="${x}" cy="${f1(y0 + dy + 2)}" rx="3.6" ry="1" fill="${luz(c, .4)}" opacity=".6"/>` + P(`M${x - 2.4} ${f1(y0 + dy)} h4.8 l-1 2 h-2.8Z`, '#7A5A44') + `<ellipse cx="${x}" cy="${f1(y0 + dy - 1.8)}" rx="2" ry="2.2" fill="${c}"/>`).join('') }) },
    adornos: ['bambu', 'loto', 'farolSeda'],
  };
}

// ── Capadocia: chimeneas de hada con su sombrero de basalto en tres capas (atrás más pálidas) y globos al amanecer entre ellas ──
FICHAS['Capadocia'] = {
  mundo: 'GLOBOS', nombre: 'Capadocia', pais: 'Turquía', color: '#DCA78C', paisaje: 'desierto', horizonte: 'peak', hora: 6.9,
  monumento: [
    [K.macizo({ x0: 2, x1: 118, alto: 44, c: '#E6CCB4', seed: 3 }), K.globo({ x: 24, y: 30, r: 8.5, c: '#C27A62', c2: '#E2C285' }), K.globo({ x: 70, y: 14, r: 6, c: '#8696AE', c2: '#E8D6B4' }), K.globo({ x: 98, y: 34, r: 5, c: '#D2A458', c2: '#C27A62' })],
    [K.chimenea({ x: 32, h: 68, w: 18, c: '#E0C2A2', sombrero: '#AC8E7A', cuevas: 2, seed: 1 }), K.chimenea({ x: 59, h: 84, w: 19, c: '#DDBE9C', sombrero: '#A48674', cuevas: 3, seed: 2 }),
      K.chimenea({ x: 87, h: 70, w: 18, c: '#E0C2A2', sombrero: '#AC8E7A', cuevas: 2, seed: 3 })],
    [K.chimenea({ x: 12, h: 44, w: 15, c: '#D4AE8C', sombrero: '#94786A', cuevas: 1, seed: 4 }), K.chimenea({ x: 73, h: 42, w: 14, c: '#D6B08E', sombrero: '#96796A', cuevas: 1, seed: 5 }),
      K.chimenea({ x: 108, h: 48, w: 14, c: '#D4AE8C', sombrero: '#94786A', cuevas: 2, seed: 6 })],
  ],
  composicion: { tapar: .22 },
  adornos: ['cipres', 'rocaArena', 'farolDesierto'],
};
