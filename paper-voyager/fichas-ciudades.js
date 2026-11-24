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
    composicion: { tapar: .2, solo: true }, // sin nada delante: la estación resalta sola
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

// ═════════════════════════ Tanda 2 ═════════════════════════

// ── Krabi: la torre de caliza de Railay / Ko Poda, alta y con sus chorreaduras naranjas, peñascos pálidos detrás y una barca de
// cola larga (con sus cintas de colores en la proa) navegando en el agua turquesa, con su reflejo. Caliza tibia: no es Ha Long ──
FICHAS['Krabi'] = {
  mundo: 'COSTA', nombre: 'Krabi', pais: 'Tailandia', color: '#94C6C2', paisaje: 'costa', suelo: 'costa', hora: 12, horizonte: 'peak',
  monumento: [
    [K.karst({ x: 24, h: 56, w: 13, c: '#CFC2AA', veg: '#AFC2A0', seed: 11 }), K.karst({ x: 101, h: 62, w: 13, c: '#CCBEA6', veg: '#AABE9C', seed: 12 })],
    [K.karst({ x: 64, h: 102, w: 21, c: '#C6AA8C', veg: '#7FA070', seed: 13, vetas: '#B97A52' })],
    [K.karst({ x: 13, h: 40, w: 11, c: '#B89C80', veg: '#6F9464', seed: 14, vetas: '#A8704E' }), K.karst({ x: 92, h: 34, w: 9, c: '#BCA084', veg: '#729666', seed: 15 })],
  ],
  cAgua: '#9CCCC6',
  composicion: { tapar: .2, aguaAlto: 1.35, enAgua: ({ y0 }) => {
    const wl = y0 + 8, b = K.colaLarga({ x: 40, y: wl, s: .62, c: '#94684C', toldo: '#CDB58C' });
    return { bajo: `<g opacity=".22" transform="translate(0 ${f1(2 * wl)}) scale(1 -1)">${b.f}</g>`, f: b.f, d: b.d + Ln(`M20 ${f1(wl + 1.8)} h10 M48 ${f1(wl + 2.6)} h12 M30 ${f1(wl + 4.2)} h8`, '#E8F4F0', 1, ' opacity=".9"') }; } },
  adornos: ['palmeraTropical', 'estrella', 'farolTiki'],
};

// ── Phi Phi: Maya Bay. Dos paredes de caliza enfrentadas que encierran la bahía (la de la izquierda con su cara en sombra, la de la
// derecha iluminada), el fondo de la bahía más pálido entre ellas y las barcas de cola larga fondeadas en el agua turquesa ──
FICHAS['Phi Phi'] = {
  mundo: 'ISLA', nombre: 'Phi Phi', pais: 'Tailandia', color: '#8CC8C8', paisaje: 'costa', suelo: 'costa', hora: 14, horizonte: 'peak',
  monumento: [
    [K.acantilado({ x0: 40, x1: 84, h: 58, c: '#CEC6B2', veg: '#AEC2A2', cara: 'der', seed: 21 })],
    [K.acantilado({ x0: 4, x1: 44, h: 98, c: '#B8A88E', veg: '#7E9E72', cara: 'der', seed: 22, vetas: '#A88A6A' }),
      K.acantilado({ x0: 80, x1: 116, h: 88, c: '#B2A48A', veg: '#7A986E', cara: 'izq', seed: 23, vetas: '#A08466' })],
  ],
  cAgua: '#94CCC8',
  composicion: { tapar: .2, aguaAlto: 1.3, enAgua: ({ y0 }) => {
    const wl = y0 + 7, a = K.colaLarga({ x: 42, y: wl, s: .46, c: '#8E644A', toldo: '#CDB58C' }), b = K.colaLarga({ x: 84, y: wl + 3, s: .52, c: '#9A6E50', toldo: '#D2BC94', dir: -1, cintas: ['#7FA8B0', '#C8705A'] });
    return { bajo: `<g opacity=".2" transform="translate(0 ${f1(2 * wl)}) scale(1 -1)">${a.f}</g><g opacity=".2" transform="translate(0 ${f1(2 * (wl + 3))}) scale(1 -1)">${b.f}</g>`, f: a.f + b.f, d: a.d + b.d + Ln(`M26 ${f1(wl + 2)} h9 M66 ${f1(wl + 6)} h12`, '#E8F4F0', 1, ' opacity=".9"') }; } },
  adornos: ['sombrilla', 'velero', 'farolTiki'],
};

// ── Hanói: lago Hoàn Kiếm. La Torre de la Tortuga (Tháp Rùa) en su islote y el puente rojo Thê Húc en arco; detrás, apagadas, las
// casas tubo del barrio viejo. El lago va delante (agua con brillos). Distinto de Hoi An (casas amarillas con farolitos) ──
{ const piedra = '#CDBE98', P2 = K.tonos(piedra), musgo = '#8E9A78';
  // Torre de la Tortuga: tres cuerpos que se angostan, arcos en el de abajo, óculo en el del medio y remate de techo curvo
  const torre = (x, b) => { const cuerpos = [[38, 26], [28, 17], [19, 12]]; let f = '', d = '', y = b;
    cuerpos.forEach(([w, h], i) => { f += K.R(x - w / 2, y - h, w, h + (i ? 1 : 0), piedra) + K.R(x - w / 2 - 1.6, y - h - 1.4, w + 3.2, 2.6, P2.luz);
      if (i === 0) [-11, 0, 11].map(dx => d += K.arco(x + dx - 3.8, y - h + 7, 7.6, h - 7, '#6E604E'));
      if (i === 1) d += K.C(x, y - h / 2, 3.2, '#6E604E') + K.arco(x - 11, y - h + 4, 4, h - 6, '#6E604E') + K.arco(x + 7, y - h + 4, 4, h - 6, '#6E604E');
      if (i === 2) d += K.arco(x - 2, y - h + 2.6, 4, h - 3.6, '#6E604E');
      d += K.R(x + w / 2 - w * .24, y - h, w * .24, h, P2.som, K.SOMBRA) + K.Ln(`M${x - w / 2 + 1.5} ${f1(y - h + 2)} q1 ${f1(h * .4)} 0 ${f1(h * .7)}`, musgo, 1.4, ' opacity=".5"'); y -= h + 1.4; });
    const r = K.techoTeja({ x0: x - 8, x1: x + 8, y: y + 1, alto: 7, c: '#9E7E62', vuelo: 3, curva: 2.6 }); f += r.f; d += r.d + K.R(x - .6, y - 9, 1.2, 4, '#9E7E62');
    return { f, d, box: [x - 21, y - 12, x + 21, 118] }; };
  const tubo = (x0, defs) => K.casas({ x0, defs, techo: 'teja', cTecho: '#BCA49A', balcon: false, farolitos: false, puertas: false, cPersiana: '#B4C0BA' });
  FICHAS['Hanói'] = {
    mundo: 'LAGO', nombre: 'Hanói', pais: 'Vietnam', color: '#A8C2B4', paisaje: 'costa', suelo: 'ciudad', hora: 15, horizonte: 'city', clima: 'leaves',
    monumento: [
      [tubo(2, [{ w: 12, h: 40, c: '#E2CFA8' }, { w: 11, h: 46, c: '#CFD6C4' }, { w: 12, h: 38, c: '#E4C6B4' }, { w: 11, h: 44, c: '#D8CCA8' }, { w: 12, h: 50, c: '#C8D2CC' },
        { w: 11, h: 40, c: '#E2CFA8' }, { w: 12, h: 46, c: '#DCC2B8' }, { w: 11, h: 42, c: '#CFD6C4' }, { w: 12, h: 48, c: '#E0CCA4' }, { w: 12, h: 40, c: '#D4C8B8' }])],
      [torre(84, 106), K.macizo({ x0: 60, x1: 110, base: 118, alto: 16, c: '#8FA486', ondas: 4, seed: 9 })],
      [K.puenteCurvo({ x0: 6, x1: 64, y: 92, alto: 9, c: '#B26E60', patas: 4 })],
    ],
    cAgua: '#A4C4BC',
    composicion: { tapar: .12, aguaAlto: .62, laterales: .8 },
    adornos: ['arbolUrbano', 'puesto', 'farolRojo'],
  };
}

// ── Osaka: el Castillo de Osaka. Torre blanca de cinco pisos que se angostan, techos verdes curvos con hastiales (uno curvo),
// el último piso oscuro con friso y shachihoko dorados, sobre su muralla de piedra en talud. Atardecer tibio, ciudad baja delante ──
{ const t = K.tenshu({ x: 60, y0: 82, anchos: [62, 52, 43, 34, 26], hp: 9.5, c: '#EDE6D8', cTecho: '#7FA096', oro: '#C9A65A', cAlto: '#56686A' }), T = t.techos;
  const g = (i, dx, k = .75, curvo = false) => K.hastial({ x: T[i].x + dx, y: T[i].y - T[i].alto * .2, w: T[i].w * .3 * k, h: T[i].alto * 1.25 * k, marco: '#7FA096', c: '#EDE6D8', oro: '#C9A65A', curvo });
  FICHAS['Osaka'] = {
    mundo: 'CASTILLO', nombre: 'Osaka', pais: 'Japón', color: '#C8B0A6', paisaje: 'ciudad', hora: 17, clima: 'petals',
    monumento: [
      [t],
      [g(0, -15, .6), g(0, 15, .6), g(1, 0, .85), g(2, 0, .75, true), g(3, 0, .6)],
      [K.muro({ x0: 20, x1: 100, y: 82, piedra: true, talud: 12, c: '#B8B0A0', seed: 6 })],
    ],
    composicion: { tapar: .16, solo: true }, // sin edificios bajos al pie: chocaban con los edificios grandes del fondo; la muralla apoya directo
    adornos: ['cerezo', 'expendedora', 'farolPiedra'],
  };
}

// ── Pekín: la Puerta del Meridiano de la Ciudad Prohibida. Muro rojo con sus tres arcos completos, pabellón de doble techo dorado
// arriba y dos pabellones laterales. Rojos y dorados apagados. Sin capas delante (solo): la puerta y los arcos se leen enteros ──
{ const rojo = '#C99482', oro = '#DCC290', verde = '#96B2A8';
  FICHAS['Pekín'] = {
    mundo: 'MURALLA', nombre: 'Pekín', pais: 'China', color: '#BC9C88', paisaje: 'ciudad', hora: 14.5, clima: 'lanterns',
    monumento: [
      [K.pabellon({ x0: 6, x1: 30, y: 58, c: rojo, cTecho: oro, cBanda: verde, columnas: 3, alto: 8, vuelo: 4 }), K.pabellon({ x0: 90, x1: 114, y: 58, c: rojo, cTecho: oro, cBanda: verde, columnas: 3, alto: 8, vuelo: 4 }),
        K.pabellon({ x0: 30, x1: 90, y: 50, c: rojo, cTecho: oro, cBanda: verde, columnas: 7, techos: 2, alto: 11, vuelo: 7, alto2: 10 })],
      [K.muro({ x0: 4, x1: 116, y: 72, c: '#CA9482', cTeja: oro, pilastras: 8, arcos: [{ x: 40, w: 11, h: 28 }, { x: 60, w: 13, h: 33 }, { x: 80, w: 11, h: 28 }] })],
    ],
    composicion: { solo: true, escala: .8, centro: 3.2 }, // un poco a la izquierda: el farol del costado derecho no tapa el tercer arco
    adornos: ['pino', 'rocaGris', 'farolRojo'],
  };
}

// ── Busan: la aldea cultural de Gamcheon vista desde el puerto. Un cerro verde en el centro con las casitas de colores fuertes
// trepando en hileras (techos planos de color, ventanitas, la escalera blanca en zigzag) y delante el puerto con barcos de pesca ──
{ const PAS = ['#EE9F8C', '#7FC0D8', '#F2CF62', '#9CCB7E', '#E59AC0', '#93A6E2', '#F4B46A'], TE = ['#3F8FB0', '#2F8F86', '#D2573E', '#6C6CB8', '#E0A040'];
  const fila = (y, x0, x1, seed, step) => { let f = '', i = seed;
    for (let x = x0; x < x1 - 2; x += step, i++) { const w = step - .7, top = y + ((i * 5) % 3) * 1.3, c = PAS[(i * 3) % PAS.length], te = TE[i % TE.length], Tc = K.tonos(c);
      f += K.R(x, top, w, 118 - top, c) + K.R(x - .6, top - 2.2, w + 1.2, 2.6, te)
        + K.R(x + w * .16, top + 3.6, w * .26, 3.2, '#4E5068', ' opacity=".75"') + K.R(x + w * .58, top + 3.6, w * .26, 3.2, '#4E5068', ' opacity=".75"')
        + K.R(x + w * .16, top + 3.6, w * .26, .8, '#FFFFFF', ' opacity=".5"') + K.R(x + w * .58, top + 3.6, w * .26, .8, '#FFFFFF', ' opacity=".5"')
        + K.R(x + w * .78, top, w * .22, 118 - top, Tc.som, ' opacity=".45"') + K.R(x, top + .4, w, 1, Tc.osc, ' opacity=".35"'); }
    return f; };
  const cerro = 'M-2 118 Q6 100 18 86 Q34 66 48 48 Q56 38 62 36 Q70 35 78 42 Q94 58 106 80 Q114 96 122 118Z';
  const pueblo = [fila(46, 50, 76, 1, 8.5), fila(58, 38, 88, 4, 9), fila(71, 26, 98, 7, 9.5), fila(85, 14, 108, 2, 10), fila(99, 2, 118, 3, 10.5)].join('')
    + Ln('M58 118 L60 110 L66 108 L68 99 L62 96 L64 86 L70 84 L72 74 L66 71 L68 62', '#FBF4E6', 2.2);
  FICHAS['Busan'] = {
    mundo: 'LADERA', nombre: 'Busan', pais: 'Corea del Sur', color: '#9CC0CE', paisaje: 'costa', suelo: 'pueblo', hora: 15.5, clima: 'petals', horizonte: 'peak',
    monumento: [
      [{ f: P(cerro, '#8FB48A'), d: `<clipPath id="bscerro"><path d="${cerro}"/></clipPath><g clip-path="url(#bscerro)">${pueblo}`
          + P('M62 36 Q70 35 78 42 Q94 58 106 80 Q114 96 122 118 L112 118 Q104 86 92 66 Q82 50 70 40Z', '#5F7E5C', ' opacity=".3"') + '</g>', box: [-2, 33, 122, 118] }],
    ],
    cAgua: '#8FBCCB',
    composicion: { tapar: .16, tamano: 1.05, aguaAlto: 1, enAgua: ({ y0 }) => {
      const wl = y0 + 8, barco = (x, c, s = 1, dir = 1) => P(`M${x - 7 * s} ${f1(wl)} L${x + 7 * s} ${f1(wl)} L${x + 5 * s * dir} ${f1(wl + 2.6 * s)} L${x - 5 * s} ${f1(wl + 2.6 * s)}Z`, c)
        + K.R(x - 2.6 * s - dir * 1.4 * s, wl - 4.2 * s, 4.6 * s, 4.2 * s, '#F2EEE6') + K.R(x - 2.2 * s - dir * 1.4 * s, wl - 3.4 * s, 1.6 * s, 1.4 * s, '#5A6A80')
        + Ln(`M${f1(x + 3 * s)} ${f1(wl)} V${f1(wl - 8 * s)}`, '#5E5864', .6) + Ln(`M${f1(x + 3 * s)} ${f1(wl - 7.6 * s)} L${f1(x + 7.4 * s)} ${f1(wl - .6)}`, '#5E5864', .4);
      const b = barco(34, '#D2573E', .9) + barco(84, '#3F8FB0', 1.05, -1);
      return { bajo: `<g opacity=".22" transform="translate(0 ${f1(2 * wl + 5)}) scale(1 -1)">${b}</g>`, f: b, d: Ln(`M20 ${f1(wl + 4)} h12 M66 ${f1(wl + 5)} h10 M96 ${f1(wl + 3.6)} h12`, '#E6F2F2', 1, ' opacity=".9"') }; } },
    adornos: ['cerezo', 'pagodita', 'farolPapel'],
  };
}

// ── Gyeongju: el templo Bulguksa. La gran terraza de piedra con sus escalinatas-puente (Cheongungyo y Chilbogyo, con el ojo en
// arco), la galería y la puerta Jahamun arriba y el salón Daeungjeon detrás: madera roja, friso dancheong verde, tejas grises ──
{ const madera = '#B4705E', teja = '#8A8C92', danc = '#7FA294', piedra = '#CFC4AC';
  FICHAS['Gyeongju'] = {
    mundo: 'TEMPLO', nombre: 'Gyeongju', pais: 'Corea del Sur', color: '#A8BC9C', paisaje: 'montana', hora: 10.5, clima: 'petals',
    monumento: [
      [K.pabellon({ x0: 42, x1: 110, y: 40, c: madera, cTecho: teja, cBanda: danc, columnas: 5, alto: 15, vuelo: 8 })],
      [K.pabellon({ x0: 2, x1: 118, y: 58, c: madera, cTecho: teja, cBanda: danc, columnas: 14, alto: 7, vuelo: 4, celosia: false })],
      [K.pabellon({ x0: 14, x1: 52, y: 50, c: madera, cTecho: teja, cBanda: danc, columnas: 3, alto: 12, vuelo: 6 })],
      [K.muro({ x0: 4, x1: 116, y: 72, piedra: true, c: piedra, seed: 8, pilastras: 9 })],
      [K.escalinata({ x: 33, w: 13, y: 70, c: '#D8CEB8', ojo: .32 }), K.escalinata({ x: 87, w: 11, y: 74, c: '#D8CEB8', ojo: .34 })],
    ],
    composicion: { tapar: .26, tamano: .85, laterales: 1.2, solo: true }, // solo el templo, sin lomas delante
    adornos: ['pino', 'pagodita', 'farolPiedra'],
  };
}

// ═════════════════════════ Tanda 3: África austral ═════════════════════════
// Cinco rehechas en su lugar de siempre (Madagascar, Kilimanjaro, Nairobi, Zanzíbar, Ciudad del Cabo) y tres nuevas sobre la
// ruta overland Ciudad del Cabo → Namibia → Cataratas Victoria (Sossusvlei, Swakopmund, Cataratas Victoria). Iconos distintos entre
// vecinas: meseta con mantel de nube, volcán nevado, jirafas con la ciudad detrás, edificio de galerías con dhow, avenida de baobabs,
// duna roja con árboles muertos, faro de costa atlántica y cortinas de agua.

// ── Ciudad del Cabo: Table Mountain vista desde la bahía de la Mesa. La meseta larga y a nivel con su "mantel" de nube, Devil's Peak
// a la izquierda (más pálido, detrás) y Lion's Head a la derecha, con las casas de colores de Bo-Kaap pintadas en su falda (sin borde
// propio, como Gamcheon en Busan). Delante, la bahía ──
{ const BK = ['#D8A8B0', '#DCC58E', '#9FC2B4', '#AAB6D6', '#D9A58E', '#B8CC98', '#C6B0D2'];
  const diablo = { f: P('M0 118 Q4 96 10 78 Q14 64 19 54 Q21 51 23 54 Q27 64 32 70 Q38 74 44 76 L48 118Z', '#BCC4CE'),
    d: P('M19 54 Q21 51 23 54 Q27 64 32 70 Q38 74 44 76 L48 118 L34 118 Q28 82 19 54Z', '#9CA6B4', ' opacity=".45"') + Ln('M8 82 Q12 66 18 56', '#D6DCE2', 1.1, ' opacity=".8"'), box: [0, 51, 48, 118] };
  const leon = (() => { // Lion's Head (cono de cumbre redondeada) y el lomo de Signal Hill que baja hacia el mar
    const c = '#9EAAAC', T = K.tonos(c), s = 'M70 118 Q80 106 88 96 Q93 88 96 76 Q99 66 104 66 Q109 66 111 74 Q113 84 117 90 Q119 93 120 94 L120 118Z';
    let d = P('M104 66 Q109 66 111 74 Q113 84 117 90 Q119 93 120 94 L120 118 L112 118 Q110 98 107 82 Q106 72 104 66Z', T.som, ' opacity=".42"')
      + Ln('M93 86 Q96 74 102 68', T.luz, 1.2, ' opacity=".8"') + Ln('M97 77 L110 76 M93 86 L113 85', T.lin, .7, ' opacity=".35"');
    // Bo-Kaap: casitas de techo plano con pretil, en escalones sobre la falda; colores apagados hacia el papel
    [[76, 100, 3], [82, 95, 3], [88, 90, 2]].forEach(([x0, y, n], fi) => { for (let i = 0; i < n; i++) { const x = x0 + i * 4.6, yy = y + i * 1.1 + (i % 2) * .6, cc = K.mix(BK[(i * 3 + fi * 2) % BK.length], '#F2EBDF', .3), Tc = K.tonos(cc);
      d += R(x, yy, 4.3, 118 - yy, cc) + R(x - .2, yy - 1, 4.7, 1.2, Tc.osc, ' opacity=".7"') + R(x + .8, yy + 1.8, 1.1, 1.6, '#6E6A78', ' opacity=".7"') + R(x + 2.5, yy + 1.8, 1.1, 1.6, '#6E6A78', ' opacity=".7"') + R(x + 3.3, yy, 1, 118 - yy, Tc.som, ' opacity=".4"'); } });
    return { f: P(s, c), d, box: [70, 66, 120, 118] }; })();
  FICHAS['Ciudad del Cabo'] = {
    mundo: 'MESETA', nombre: 'Ciudad del Cabo', pais: 'Sudáfrica', color: '#A8B8C6', paisaje: 'costa', suelo: 'ciudad', hora: 11, clima: 'leaves', horizonte: 'peak',
    monumento: [
      [diablo],
      [K.mesa({ x0: 2, x1: 116, xa: 36, xb: 88, top: 50, c: '#A4AEBA', seed: 3, pared: .26 })],
      [K.nube({ x0: 37, x1: 87, y: 53, h: 4, c: '#F2F0EC', seed: 2, jorobas: 8 })],
      [leon],
    ],
    cAgua: '#A6C2CC',
    composicion: { tapar: .18, laterales: .9 },
    adornos: ['palmera', 'arbusto', 'farolMediterraneo'],
  };
}

// ── Madagascar: la Avenida de los Baobabs al atardecer. Baobabs de Grandidier (columnas lisas con la copa corta y plana) en tres
// capas que se alejan hacia el fondo, los de atrás más pálidos; tierra roja ──
FICHAS['Madagascar'] = {
  mundo: 'BAOBABS', nombre: 'Madagascar', pais: 'Avenida de los Baobabs', color: '#D8A48C', paisaje: 'desierto', hora: 17.2, clima: 'leaves', horizonte: 'dune',
  monumento: [
    [K.baobab({ x: 50, h: 52, w: 4, c: '#DCC2AE', hoja: '#B8BC9C', seed: 1, ramas: 5 }), K.baobab({ x: 70, h: 48, w: 3.8, c: '#DCC2AE', hoja: '#B8BC9C', seed: 2, ramas: 5 }),
      K.baobab({ x: 10, h: 54, w: 4.2, c: '#D8BEA8', hoja: '#B4B898', seed: 3, ramas: 5 }), K.baobab({ x: 112, h: 50, w: 4, c: '#D8BEA8', hoja: '#B4B898', seed: 4, ramas: 5 }),
      K.baobab({ x: 40, h: 44, w: 3.6, c: '#DEC6B2', hoja: '#BCC0A0', seed: 9, ramas: 4 }), K.baobab({ x: 94, h: 46, w: 3.6, c: '#DEC6B2', hoja: '#BCC0A0', seed: 10, ramas: 4 }),
      K.baobab({ x: 20, h: 40, w: 3.4, c: '#DEC6B2', hoja: '#BCC0A0', seed: 11, ramas: 4 }), K.baobab({ x: 78, h: 42, w: 3.4, c: '#DEC6B2', hoja: '#BCC0A0', seed: 12, ramas: 4 })],
    [K.baobab({ x: 60, h: 74, w: 5.4, c: '#CDAA90', hoja: '#9EAA82', seed: 5 }), K.baobab({ x: 102, h: 70, w: 5.2, c: '#CDAA90', hoja: '#9EAA82', seed: 6 })],
    [K.baobab({ x: 28, h: 104, w: 7.6, c: '#BE9478', hoja: '#8C9C70', seed: 7 }), K.baobab({ x: 84, h: 96, w: 7.2, c: '#C29A7E', hoja: '#8C9C70', seed: 8 })],
  ],
  composicion: { tapar: .24, tamano: .86, laterales: 1.3 },
  adornos: ['acacia', 'rocaArena', 'farolDesierto'], // sin el adorno 'baobab' (dos bolitas verdes: arbolito de bolita)
};

// ── Kilimanjaro: el Kibo visto desde la sabana de Amboseli. Cumbre ancha y casi plana con el casquete de glaciares, el Mawenzi
// dentado a la izquierda, la franja de nubes que ciñe la montaña y dos acacias paraguas al pie. Sabana llana delante (lomas, no picos) ──
{ const mawenzi = { f: P('M0 118 L0 86 Q5 78 9 70 L12 62 L15 66 L18 56 L21 61 L24 54 L27 63 Q31 74 40 90 L46 118Z', '#B8B0C2'),
    d: P('M24 54 L27 63 Q31 74 40 90 L46 118 L34 118 Q30 88 24 54Z', '#9890A6', ' opacity=".45"') + P('M12 62 L15 66 L18 56 L21 61 L24 54 L23.4 60 L20.6 64 L18.4 61 L15.4 69 L12.6 66Z', '#EEF0F2', ' opacity=".85"'), box: [0, 54, 46, 118] };
  FICHAS['Kilimanjaro'] = {
    mundo: 'SABANA', nombre: 'Kilimanjaro', pais: 'Tanzania', color: '#CBB78E', paisaje: 'desierto', hora: 9.5, clima: 'leaves', horizonte: 'dune',
    monumento: [
      [mawenzi],
      [K.volcan({ x0: 0, x1: 120, xa: 42, xb: 92, top: 46, c: '#A49CB0', nieve: '#F0F1F2', bajaNieve: 11, seed: 2 })],
      [K.nube({ x0: 30, x1: 76, y: 84, h: 5, c: '#F2EEE6', seed: 4, jorobas: 5 }), K.nube({ x0: 84, x1: 116, y: 80, h: 4.5, c: '#F2EEE6', seed: 5, jorobas: 4 })],
      [K.acacia({ x: 24, h: 30, w: 15, c: '#7E6A58', copa: '#93A06E', seed: 1 }), K.acacia({ x: 98, h: 24, w: 11, c: '#7E6A58', copa: '#98A472', seed: 2 })],
    ],
    composicion: { tapar: .16 },
    adornos: ['acacia', 'mata', 'farolDesierto'],
  };
}

// ── Nairobi: el Parque Nacional de Nairobi, la única sabana con rascacielos detrás. Jirafas (una comiendo de la acacia) y,
// pálida al fondo, la ciudad con el Kenyatta International Convention Centre (torre cilíndrica con su sombrero) ──
{ const cd = '#C4C2CE', T = K.tonos(cd);
  const kicc = (() => { const x = 50, w = 6; // torre cilíndrica con aletas verticales, platillo y sombrero cónico arriba
    const f = R(x - w, 40, w * 2, 78, cd) + P(`M${x - w - 4} 40 L${x + w + 4} 40 L${x + w + 2} 36.6 L${x - w - 2} 36.6Z`, cd) + P(`M${x - w + 1} 36.8 L${x} 29 L${x + w - 1} 36.8Z`, K.shade(cd, .12));
    let d = ''; for (let i = 1; i < 6; i++) d += R(x - w + i * w * 2 / 6 - .35, 42, .7, 76, T.lin, ' opacity=".45"');
    for (let y = 46; y < 116; y += 4.5) d += R(x - w, y, w * 2, .7, T.luz, ' opacity=".6"');
    d += R(x + w * .3, 40, w * .7, 78, T.som, K.SOMBRA) + R(x - w - 4, 39.4, w * 2 + 8, .9, T.osc, ' opacity=".5"');
    return { f, d, box: [x - w - 4, 29, x + w + 4, 118] }; })();
  const torres = [[6, 24, 72, '#C8C6D0'], [26, 40, 58, '#C0C0CC'], [62, 76, 52, '#CACAD2'], [78, 92, 66, '#C2C2CC'], [96, 114, 76, '#CACAD2']]
    .map(([x0, x1, y0, c]) => K.fachada({ x0, x1, y0, c, pisos: Array.from({ length: Math.round((118 - y0) / 9) }, () => ({ tipo: 'ventanas', n: Math.round((x1 - x0) / 4) })), cornisa: true, sombra: .22 }));
  FICHAS['Nairobi'] = {
    mundo: 'SABANA', nombre: 'Nairobi', pais: 'Kenia', color: '#CDBB8C', paisaje: 'desierto', hora: 15, clima: 'leaves', horizonte: 'city',
    monumento: [
      [...torres, kicc],
      [K.acacia({ x: 94, h: 52, w: 24, c: '#7A6452', copa: '#8E9C68', seed: 3 })],
      [K.jirafa({ x: 76, s: .86, dir: 1, cuello: 1, c: '#D6AE7C', mancha: '#A47250' }), K.jirafa({ x: 34, s: .74, dir: -1, c: '#D9B482', mancha: '#A87652' })],
    ],
    composicion: { tapar: .14 },
    adornos: ['acacia', 'jirafa', 'farolDesierto'],
  };
}

// ── Zanzíbar: Stone Town desde el mar. La Casa de las Maravillas (Beit al-Ajaib): bloque blanco de cuatro pisos de galerías con
// columnas de hierro y su torre del reloj, palmeras a los lados y un dhow de vela latina navegando delante, con su reflejo ──
FICHAS['Zanzíbar'] = {
  mundo: 'ISLA', nombre: 'Zanzíbar', pais: 'Tanzania', color: '#9CC6C4', paisaje: 'costa', suelo: 'costa', hora: 16, clima: 'bubbles', horizonte: 'dune',
  monumento: [
    [K.palmera({ x: 12, h: 66, lean: 5, ct: '#9A8068', cf: '#7E9E76' }), K.palmera({ x: 110, h: 58, lean: -5, ct: '#9A8068', cf: '#7E9E76' })],
    [K.casas({ x0: 2, defs: [{ w: 13, h: 30, c: '#E2D6C2' }, { w: 11, h: 24, c: '#D8CCB8' }], techo: 'plano', balcon: false, farolitos: false, cPersiana: '#8A9C98' }),
      K.casas({ x0: 98, defs: [{ w: 11, h: 26, c: '#D8CCB8' }, { w: 11, h: 32, c: '#E2D6C2' }], techo: 'plano', balcon: false, farolitos: false, cPersiana: '#8A9C98' })],
    [K.veranda({ x0: 20, x1: 100, y0: 56, pisos: 3, c: '#ECE4D4', cSombra: '#8E9690', oSombra: .5, col: 16, wCol: 1.3 })],
    [K.torreReloj({ x: 60, w: 14, top: 26, c: '#E8E0D0', techo: 'plano', ventanas: true, yReloj: 40 })], // la torre del reloj sale de la fachada, al centro
  ],
  cAgua: '#A2CCCA',
  composicion: { tapar: .2, laterales: 1.25, aguaAlto: .95, enAgua: ({ y0 }) => {
    const wl = y0 + 9, b = K.dhow({ x: 86, y: wl, s: .5, c: '#8E6A50', vela: '#E8DECA' });
    return { bajo: `<g opacity=".22" transform="translate(0 ${f1(2 * wl)}) scale(1 -1)">${b.f}</g>`, f: b.f, d: b.d + Ln(`M66 ${f1(wl + 2)} h12 M90 ${f1(wl + 3.6)} h12 M30 ${f1(wl + 1)} h10`, '#E8F4F0', 1, ' opacity=".9"') }; } },
  adornos: ['palmeraTropical', 'estrella', 'farolTiki'],
};

// ═════════════ Nuevas: ruta overland Ciudad del Cabo → Namibia → Cataratas Victoria ═════════════

// ── Sossusvlei: Deadvlei al amanecer. La gran duna roja (Big Daddy) con la cresta filosa en S, una cara al sol y la otra en sombra;
// detrás dunas más pálidas y delante los árboles muertos de acacia sobre la salina blanca. Solo: la salina es el suelo mismo
// (paleta: suelo claro de arcilla), sin lomas delante: en Deadvlei la duna sube directo desde la salina ──
FICHAS['Sossusvlei'] = {
  mundo: 'DUNAS', nombre: 'Sossusvlei', pais: 'Namibia', color: '#D8BCA4', paisaje: 'desierto', hora: 9, clima: 'sand', horizonte: 'dune',
  paleta: { around: '#E6DCCB', ground: '#EDE4D4', hill: '#D2C4AE' },
  monumento: [
    [K.duna({ x0: 0, x1: 84, xc: 56, top: 60, c: '#DEA684', seed: 1 }), K.duna({ x0: 64, x1: 120, xc: 98, top: 58, c: '#DEA684', seed: 2 })],
    [K.duna({ x0: 4, x1: 118, xc: 82, top: 32, c: '#D6885A', sombra: '#A86450', seed: 3 })],
    [K.arbolSeco({ x: 28, h: 46, c: '#6E5852', seed: 1 }), K.arbolSeco({ x: 76, h: 34, c: '#725C56', seed: 2, abre: .85 }), K.arbolSeco({ x: 104, h: 24, c: '#76605A', seed: 3 })],
  ],
  composicion: { solo: true, tamano: 1.08 },
  adornos: ['duna', 'rocaArena', 'farolDesierto'],
};

// ── Swakopmund: la costa del Atlántico donde el Namib llega al mar. El faro blanco de punta roja (1902), la torre del Woermannhaus
// y las casas coloniales alemanas de hastial, palmeras; delante el Atlántico frío y gris-verde ──
{ const casa = (x, w, h, c, tc = '#B48A78') => K.casas({ x0: x, defs: [{ w, h, c }], techo: 'gablete', cTecho: tc, balcon: false, farolitos: false, cPersiana: '#8A9AA4' });
  FICHAS['Swakopmund'] = {
    mundo: 'COSTA', nombre: 'Swakopmund', pais: 'Namibia', color: '#B4C2C4', paisaje: 'costa', suelo: 'costa', hora: 11, clima: 'bubbles', horizonte: 'dune',
    monumento: [
      [K.torreReloj({ x: 26, w: 11, top: 32, c: '#E2D2B4', techo: 'pira', cTecho: '#A88474', reloj: false })],
      [casa(4, 16, 40, '#E6D8BC'), casa(32, 20, 34, '#DCCCB4', '#A07C6C'), K.faro({ x: 72, w: 14, top: 12, c: '#EEE8DE', banda: '#C08070', bandas: [[0, .1]] }),
        K.palmera({ x: 98, h: 50, lean: -4, ct: '#9A8068', cf: '#869E7A' }), casa(104, 14, 26, '#E2D4BC')],
    ],
    cAgua: '#A8C0C0',
    composicion: { tapar: .18, laterales: 1.1, aguaAlto: .6 },
    adornos: ['palmera', 'velero', 'farolMediterraneo'],
  };
}

// ── Cataratas Victoria (Mosi-oa-Tunya, "el humo que truena"): la pared de basalto con las cortinas de agua separadas por
// promontorios, selva en el borde y la columna de bruma que sube del cañón con un arco iris tenue ──
{ const bruma = K.nube({ x0: 14, x1: 106, y: 108, h: 13, c: '#ECEEEA', seed: 7, jorobas: 7 });
  bruma.d += Ln('M22 104 Q60 56 98 104', '#D8B8A8', 1.4, ' opacity=".45"') + Ln('M25 104 Q60 60 95 104', '#D8D4A8', 1.4, ' opacity=".45"') + Ln('M28 104 Q60 64 92 104', '#A8C4C8', 1.4, ' opacity=".4"');
  FICHAS['Cataratas Victoria'] = {
    mundo: 'CATARATAS', nombre: 'Cataratas Victoria', pais: 'Zimbabue', color: '#9DB89A', paisaje: 'selva', hora: 13, clima: 'leaves', horizonte: 'dune',
    monumento: [
      [K.cascada({ x0: 0, x1: 120, top: 48, c: '#A89A8C', agua: '#E6ECEC', veg: '#86A276', cortinas: [[24, 52], [58, 82], [88, 98]], seed: 1, laderas: .19 })],
      [bruma],
    ],
    composicion: { tapar: .2, tamano: .84 },
    adornos: ['liana', 'helecho', 'farolSelva'],
  };
}

// ── Estambul: Santa Sofía desde el Cuerno de Oro. Cúpula central chata de plomo sobre su tambor de ventanas, dos semicúpulas
// a los costados, cupulitas en las esquinas, el cuerpo de piedra rosada con dos pisos de arcos y cuatro minaretes "lápiz"
// (los dos de afuera más altos y atrás). Delante, el agua del Bósforo. Rosa empolvado, no ladrillo: integrado con la bruma ──
{ const piedra = '#D6B4A4', piedra2 = '#CDA898', plomo = '#9AA4B2', blanco = '#E4D8CC';
  FICHAS['Estambul'] = {
    mundo: 'CÚPULAS', nombre: 'Estambul', pais: 'Turquía', color: '#C4AA9C', paisaje: 'costa', hora: 15.5, clima: 'leaves',
    monumento: [
      [K.minarete({ x: 9, w: 5, top: 12, c: blanco, cTecho: plomo, balcones: 2 }), K.minarete({ x: 111, w: 5, top: 12, c: blanco, cTecho: plomo, balcones: 2 })],
      [K.cupula({ x: 36, y: 62, w: 30, tipo: 'semi', c: plomo, costillas: 4, linterna: false }), K.cupula({ x: 84, y: 62, w: 30, tipo: 'semi', c: plomo, costillas: 4, linterna: false }),
        K.cupula({ x: 60, y: 46, w: 46, tipo: 'semi', c: plomo, tambor: 8, cTambor: piedra2, costillas: 8 })],
      [K.fachada({ x0: 18, x1: 102, y0: 64, c: piedra, pisos: [{ tipo: 'arcos', n: 9 }, { tipo: 'arcos', n: 7 }], sombra: .2 })],
      [K.cupula({ x: 26, y: 64, w: 13, tipo: 'semi', c: plomo, costillas: 3 }), K.cupula({ x: 94, y: 64, w: 13, tipo: 'semi', c: plomo, costillas: 3 }),
        K.minarete({ x: 19, w: 4.4, top: 26, c: blanco, cTecho: plomo, balcones: 1 }), K.minarete({ x: 101, w: 4.4, top: 26, c: blanco, cTecho: plomo, balcones: 1 })],
    ],
    cAgua: '#A8BCC4',
    composicion: { tapar: .26 },
    adornos: ['cipres', 'columna', 'farolMediterraneo'],
  };
}

// ── Marrakech: la Kutubía al atardecer, alta y rojiza, con su linterna y el yamur dorado; a los costados palmeras y la muralla de
// tierra de la medina con sus almenas, y detrás las sierras del fondo de la escena. Rojo de tierra apagado, no ladrillo vivo ──
{ const tierra = '#C9906C', tierra2 = '#BC8462';
  FICHAS['Marrakech'] = {
    mundo: 'ZOCO', nombre: 'Marrakech', pais: 'Marruecos', color: '#D4A27C', paisaje: 'desierto', hora: 16.5, clima: 'leaves',
    monumento: [
      [K.palmera({ x: 24, h: 58, lean: 4, ct: '#9A7A5A', cf: '#7E9A6C' }), K.palmera({ x: 98, h: 54, lean: -5, ct: '#9A7A5A', cf: '#7E9A6C' }), K.palmera({ x: 86, h: 42, lean: 4, ct: '#9A7A5A', cf: '#86A274' })],
      [K.alminar({ x: 58, w: 26, top: 10, c: tierra, cFriso: '#7EA294', cOro: '#D2AA58' })],
      [K.muro({ x0: 4, x1: 116, y: 86, c: tierra2, pilastras: 6, arcos: [{ x: 30, w: 10, h: 18 }, { x: 88, w: 10, h: 18 }] })],
    ],
    composicion: { tapar: .2 },
    adornos: ['palmera', 'rocaArena', 'farolDesierto'],
  };
}

// ── Río de Janeiro: el Pan de Azúcar desde la bahía de Botafogo. El domo de granito alto e inclinado, el Morro da Urca más bajo
// y verde a su izquierda, el teleférico colgando entre las dos cumbres y detrás el pico del Corcovado, pálido y SIN estatua
// (la estatua tiene derechos de imagen: el pico se lee solo). Delante el agua de la bahía con un velero ──
{ const roca = '#B6ACAA', roca2 = '#ACA6A8', verde = '#7E9E78';
  const corcovado = (() => { const c = '#B4C2C2', T = K.tonos(c);
    const s = 'M0 118 C3 98 9 76 15 58 Q19 46 22 43 Q25 45 28 53 C34 68 46 80 60 88 L62 118Z';
    const d = P('M22.5 43.5 Q25 45 28 53 C34 68 46 80 60 88 L62 118 L40 118 Q32 84 22.5 43.5Z', T.som, ' opacity=".4"')
      + P('M0 118 C2 106 4 96 7 86 Q20 90 32 84 C42 88 52 92 61 96 L62 118Z', K.mix(verde, c, .45), ' opacity=".7"')
      + Ln('M8 84 Q12 64 19 48', T.luz, 1.1, ' opacity=".8"');
    return { f: P(s, c), d, box: [0, 42, 62, 118] }; })();
  FICHAS['Río de Janeiro'] = {
    mundo: 'COSTA', nombre: 'Río de Janeiro', pais: 'Brasil', color: '#9CC2BE', paisaje: 'costa', hora: 15, clima: 'bubbles', horizonte: 'peak',
    monumento: [
      [corcovado],
      [K.morro({ x: 38, w: 21, top: 66, lean: 2, c: roca2, veg: verde, verde: .6, seed: 2 })],
      [K.morro({ x: 84, w: 28, top: 26, lean: 4, c: roca, veg: verde, verde: .24, seed: 3 })],
      [K.teleferico({ a: [40, 66.2], b: [86, 26.4], comba: 5, t: .42 })],
    ],
    cAgua: '#A4C8C8',
    composicion: { tapar: .2, laterales: 1.1, enAgua: ({ y0 }) => {
      const wl = y0 + 8, x = 60, hull = `M${x - 5} ${f1(wl)} L${x + 6} ${f1(wl)} L${x + 4} ${f1(wl + 2)} L${x - 3.6} ${f1(wl + 2)}Z`,
        vela = `M${x} ${f1(wl - .5)} L${x} ${f1(wl - 12)} L${x + 5.4} ${f1(wl - .8)}Z M${x - .6} ${f1(wl - 1)} L${x - .6} ${f1(wl - 9)} L${x - 4.4} ${f1(wl - 1)}Z`;
      const b = P(hull, '#8E7A6E') + P(vela, '#F0EADF');
      return { bajo: `<g opacity=".22" transform="translate(0 ${f1(2 * wl + 4)}) scale(1 -1)">${b}</g>`, f: b, d: Ln(`M${x} ${f1(wl - 12)} V${f1(wl)}`, '#6E6264', .5) + Ln(`M40 ${f1(wl + 3)} h10 M74 ${f1(wl + 4)} h12`, '#EAF4F2', 1, ' opacity=".9"') }; } },
    adornos: ['palmeraTropical', 'sombrilla', 'farolTiki'],
  };
}

// ── Salto Ángel (Kerepakupai Merú): el Auyán-tepui, una meseta de arenisca rosada de paredes a plomo, con el hilo de agua más alto
// del mundo cayendo del borde y deshaciéndose en bruma antes de tocar la selva. Detrás, otro tepui más pálido; delante, la selva ──
FICHAS['Salto Ángel'] = {
  mundo: 'SELVA', nombre: 'Salto Ángel', pais: 'Venezuela', color: '#8EB486', paisaje: 'selva', hora: 10, clima: 'leaves', horizonte: 'peak',
  monumento: [
    [K.tepui({ x0: 0, x1: 62, xa: 10, xb: 44, top: 58, pie: 84, c: '#BEB6B4', veg: '#9AB492', seed: 4, bloques: 4 })],
    [K.tepui({ x0: 8, x1: 120, xa: 30, xb: 102, top: 32, pie: 82, c: '#AE9890', veg: '#7E9E70', muesca: 58, seed: 6, bloques: 7 })],
    [K.chorro({ x: 58, top: 37, fin: 88, w: 1.6, deriva: 2.4, seed: 2 })],
    [K.nube({ x0: 36, x1: 86, y: 94, h: 9, c: '#EEF0EC', seed: 5, jorobas: 6 })],
    [K.macizo({ x0: 0, x1: 120, alto: 24, c: '#7EA270', ondas: 9, seed: 3 })],
  ],
  composicion: { tapar: .22, tamano: .8, laterales: 1.25 },
  adornos: ['liana', 'monstera', 'farolSelva'],
};

// ── Montevideo: el Palacio Salvo sobre la plaza Independencia. Bloque ancho de oficinas, la torre que se angosta en dos
// cuerpos y el remate con su cúpula-faro; delante la Rambla y el Río de la Plata, color dulce de leche ──
{ const piedra = '#D6CAB2', piedra2 = '#CFC2A8';
  FICHAS['Montevideo'] = {
    mundo: 'RAMBLA', nombre: 'Montevideo', pais: 'Uruguay', color: '#A9C0D2', paisaje: 'costa', suelo: 'ciudad', hora: 17, clima: 'leaves', horizonte: 'city',
    monumento: [
      [K.torreReloj({ x: 60, w: 15, top: 0, c: luz(piedra, .04), cTecho: '#A89C86', techo: 'cupula', reloj: false })],
      [K.fachada({ x0: 46, x1: 74, y0: 26, c: piedra2, pisos: Array.from({ length: 9 }, () => ({ tipo: 'ventanas', n: 4 })), sombra: .26 }),
        K.torreReloj({ x: 46, w: 7, top: 18, c: piedra2, cTecho: '#A89C86', techo: 'cupula', reloj: false, ventanas: false }),
        K.torreReloj({ x: 74, w: 7, top: 18, c: piedra2, cTecho: '#A89C86', techo: 'cupula', reloj: false, ventanas: false })],
      [K.fachada({ x0: 28, x1: 92, y0: 66, c: piedra, pisos: [{ tipo: 'ventanas', n: 8 }, { tipo: 'ventanas', n: 8 }, { tipo: 'ventanas', n: 8 }, { tipo: 'arcos', n: 8 }], sombra: .2 }),
        K.hastial({ x: 60, y: 64, w: 14, h: 5, c: luz(piedra, .1), marco: '#B4A88E', oro: '#C9A65A' })],
    ],
    cAgua: '#C2B392',
    composicion: { tapar: .18, aguaAlto: .9 },
    adornos: ['castano', 'quiosco', 'farolEuropeo'],
  };
}

// ── Cartagena: la Torre del Reloj, puerta amarilla de tres arcos en la muralla con su torre de campana encima; detrás, casas
// coloniales de colores con balcones de madera; delante la muralla de piedra coralina ──
{ const am = '#E6BF62', casasC = ['#E2876C', '#6FA6C4', '#EEB458', '#C97CA0', '#8DBA8A'];
  const casa = (x0, defs) => K.casas({ x0, techo: 'plano', cPersiana: '#7A5A44', farolitos: ['#E0B050', '#E0B050'], defs: defs.map(([w, h, i]) => ({ w, h, c: casasC[i], pisos: 2 })) });
  FICHAS['Cartagena'] = {
    mundo: 'MURALLA', nombre: 'Cartagena', pais: 'Colombia', color: '#E9C98E', paisaje: 'costa', suelo: 'pueblo', hora: 16, clima: 'bubbles',
    monumento: [
      [casa(0, [[20, 52, 0], [18, 46, 1]]), casa(82, [[18, 48, 2], [20, 54, 3]])],
      [K.torreReloj({ x: 60, w: 18, top: 10, c: am, cTecho: '#D49A46', techo: 'cupula' })],
      [K.fachada({ x0: 40, x1: 80, y0: 62, c: am, pisos: [{ tipo: 'puertas', n: 3 }], sombra: .2 }), K.hastial({ x: 60, y: 60, w: 20, h: 6, c: luz(am, .12), marco: '#C99A46', oro: '#B8463A' })],
      [K.muro({ x0: 0, x1: 40, y: 92, c: '#C9B790', piedra: true, talud: 3, seed: 3 }), K.muro({ x0: 80, x1: 120, y: 92, c: '#C9B790', piedra: true, talud: 3, seed: 5 })],
    ],
    cAgua: '#98C8C4',
    composicion: { tapar: .18 },
    adornos: ['palmeraTropical', 'arbustoTropical', 'farolEuropeo'],
  };
}

const machu = { pico(d, box, c, veg, verde) { // pico de laderas a plomo: roca gris arriba, manto de selva que sube por las laderas, luz a la izquierda
  const T = K.tonos(c), [x0, y0, x1, y1] = box, yv = y1 - (y1 - y0) * verde, id = 'hp' + Math.round(x0 * 7 + y0);
  let g = P(`M${x0 - 2} ${y1} L${x0 - 2} ${yv + 4} Q${(x0 + x1) / 2 - 8} ${yv - 8} ${(x0 + x1) / 2} ${yv - 2} Q${(x0 + x1) / 2 + 10} ${yv + 4} ${x1 + 2} ${yv - 6} L${x1 + 2} ${y1}Z`, veg)
    + P(`M${(x0 + x1) / 2 + 4} ${y0} L${x1 + 2} ${y0} L${x1 + 2} ${y1} L${(x0 + x1) / 2 + 14} ${y1}Z`, T.som, ' opacity=".35"');
  for (let i = 0; i < 6; i++) { const xx = x0 + (x1 - x0) * (.3 + i * .08), yy = y0 + (y1 - y0) * (.12 + (i % 3) * .1); g += Ln(`M${f1(xx)} ${f1(yy)} q1 8 -.6 ${f1(10 + i)}`, T.osc, .7, ' opacity=".4"'); }
  for (let i = 0; i < 7; i++) { const xx = x0 + (x1 - x0) * (.18 + i * .11), yy = yv + 6 + (i % 3) * 7; g += P(`M${f1(xx)} ${f1(yy + 3)} q2.2 -5 4.6 0Z`, K.tonos(veg).luz, ' opacity=".55"'); }
  return { f: P(d, c), d: `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${g}</g>`, box }; } };

// ── Machu Picchu: el Huayna Picchu, pico de laderas a plomo con selva, y otro cerro pálido detrás; delante la
// ciudadela: andenes en escalera y casitas de piedra sin techo con sus hastiales ──
FICHAS['Machu Picchu'] = {
  mundo: 'ANDES', nombre: 'Machu Picchu', pais: 'Perú', color: '#A8C8B0', paisaje: 'montana', hora: 9, clima: 'leaves', horizonte: 'peak',
  monumento: [
    [machu.pico('M60 118 C70 96 82 70 92 52 Q98 42 102 40 Q107 42 112 54 C118 72 124 96 128 118Z', [60, 40, 128, 118], '#B4C6B6', '#A2BC9E', .7)],
    [machu.pico('M30 118 C38 98 48 70 58 44 Q62 30 66 20 Q69 12 72 13 Q75 15 78 24 Q81 34 84 44 C90 66 98 94 106 118Z', [30, 12, 106, 118], '#8E9C8A', '#6E9660', .72)],
    [K.macizo({ x0: 0, x1: 120, alto: 40, c: '#86AA70', ondas: 4, seed: 6 })],
    [K.andenes({ x0: 0, x1: 66, n: 5, alto: 6.4, paso: 8, c: '#BDB19C', veg: '#8DB070', seed: 2 }),
      K.ruinas({ base: 92, defs: [{ x: 64, w: 16, h: 11, gablete: true }, { x: 82, w: 22, h: 9 }, { x: 106, w: 13, h: 12, gablete: true }], c: '#C6BAA4', seed: 3 })],
  ],
  composicion: { tapar: .18 },
  adornos: ['pino', 'llama', 'farolMontana'],
};

// ── Reikiavik: la Hallgrímskirkja, iglesia de hormigón que imita columnas de basalto bajando en escalera a los dos lados de
// la torre; delante, casitas de chapa de colores con techos a dos aguas; nieve y frío ──
{ const hormigon = '#C9C6BE', T = K.tonos(hormigon);
  const iglesia = (() => { const cx = 60, base = 118, cols = [[4, 34], [4, 42], [4, 52], [4, 62], [4, 72]];
    let s = `M${cx - 7} ${base} L${cx - 7} 26 L${cx - 2} 10 L${cx} 2 L${cx + 2} 10 L${cx + 7} 26 L${cx + 7} ${base}Z`, d = '';
    [-1, 1].forEach(sg => { let x = cx + sg * 7; cols.forEach(([w, top]) => { const x2 = x + sg * w; s += ` M${f1(Math.min(x, x2))} ${base} L${f1(Math.min(x, x2))} ${top} L${f1(Math.max(x, x2))} ${top} L${f1(Math.max(x, x2))} ${base}Z`;
      d += Ln(`M${f1(x2)} ${top + 1} V${base}`, T.osc, .7, ' opacity=".45"') + R(Math.min(x, x2), top, w, 1.2, T.luz, ' opacity=".8"'); x = x2; }); });
    d += R(cx + 1, 10, 6, 108, T.som, ' opacity=".35"') + R(cx + 7, 34, 20, 84, T.som, ' opacity=".18"')
      + `<circle cx="${cx}" cy="32" r="3" fill="${T.osc}"/><circle cx="${cx}" cy="32" r="2.2" fill="#F2EFE8"/>` + Ln(`M${cx} 32 v-1.6 M${cx} 32 h1.2`, '#4E4A52', .5)
      + [44, 54, 64].map(y => R(cx - 2, y, 4, 6, T.osc, ' opacity=".7"')).join('') + P(`M${cx - 4} 118 L${cx - 4} 104 Q${cx} 98 ${cx + 4} 104 L${cx + 4} 118Z`, T.osc, ' opacity=".7"')
      + Ln(`M${cx} 2 V-3 M${cx - 1.6} -1.4 H${cx + 1.6}`, '#8A8680', .7);
    return { f: P(s, hormigon), d, box: [cx - 27, -3, cx + 27, base] }; })();
  const casa = (x0, defs) => K.casas({ x0, techo: 'gablete', cPersiana: '#F2EEE6', farolitos: ['#F2D07A', '#F2D07A'], defs: defs.map(([w, h, c, ct]) => ({ w, h, c, cTecho: ct, pisos: 1 })) });
  FICHAS['Reikiavik'] = {
    mundo: 'HIELO', nombre: 'Reikiavik', pais: 'Islandia', color: '#B4CAD8', paisaje: 'nieve', hora: 11, clima: 'snow', horizonte: 'peak',
    monumento: [
      [iglesia],
      [casa(2, [[16, 28, '#C9503C', '#4E5A66'], [14, 22, '#E6B84A', '#4E5A66']]), casa(88, [[14, 24, '#5E8FB4', '#3E4650'], [16, 30, '#7FAE8A', '#4E5A66']])],
    ],
    composicion: { tapar: .25, tamano: .9 },
    adornos: ['pinoNevado', 'rocaLava', 'farolNieve'],
  };
}

// ── Edimburgo: el castillo sobre su peñón de basalto. Roca oscura de paredes a plomo a la izquierda y ladera verde a la
// derecha; arriba, la muralla de sillares con talud, la torre del homenaje y las casas de piedra con techos de pizarra ──
{ const piedra = '#B4AEA2', piz = '#5E6470';
  const penon = (() => { const s = 'M2 118 C6 104 10 92 14 80 Q18 72 26 70 L96 68 Q104 70 110 80 C114 92 118 106 120 118Z', T = K.tonos('#6E7A70');
    const d = P('M60 69 L96 68 Q104 70 110 80 C114 92 118 106 120 118 L70 118 Q66 92 60 69Z', '#7E9A6E', ' opacity=".85"')
      + [[16, 84], [22, 96], [30, 80], [40, 92], [50, 76]].map(([x, y]) => Ln(`M${x} ${y} l2 14`, T.osc, .8, ' opacity=".5"')).join('')
      + Ln('M14 80 Q18 72 26 70', T.luz, 1.2, ' opacity=".7"');
    return { f: P(s, '#6E7A70'), d, box: [2, 68, 120, 118] }; })();
  FICHAS['Edimburgo'] = {
    mundo: 'CASTILLO', nombre: 'Edimburgo', pais: 'Escocia', color: '#A8BCB2', paisaje: 'montana', hora: 13, clima: 'leaves', horizonte: 'peak',
    monumento: [
      [K.casas({ x0: 30, techo: 'gablete', cTecho: piz, cPersiana: '#5E6470', farolitos: ['#E0C070', '#E0C070'], defs: [{ w: 18, h: 30, c: piedra, pisos: 2, farol: false }, { w: 22, h: 24, c: K.mix(piedra, '#8E887C', .3), pisos: 2, farol: false }, { w: 16, h: 32, c: piedra, pisos: 2, farol: false }], base: 72, puertas: false }),
        K.torreReloj({ x: 96, w: 13, top: 22, base: 72, c: K.mix(piedra, '#8E887C', .2), techo: 'plano', reloj: false })],
      [penon],
      [K.muro({ x0: 18, x1: 104, y: 60, base: 74, c: piedra, piedra: true, talud: 2, seed: 6 })],
    ],
    composicion: { tapar: .18, tamano: .92 },
    adornos: ['pino', 'rocaGris', 'farolEuropeo'],
  };
}

// ── Lisboa: la Torre de Belém sobre el Tajo. Baluarte bajo con arcos y almenas, la torre manuelina de piedra clara con sus
// balcones y garitas de cúpula en las esquinas; delante el agua del río con un velero ──
{ const piedra = '#E6D9BE', cup = '#CFC2A4';
  FICHAS['Lisboa'] = {
    mundo: 'COSTA', nombre: 'Lisboa', pais: 'Portugal', color: '#9CC6DA', paisaje: 'costa', hora: 15, clima: 'bubbles',
    monumento: [
      [K.fachada({ x0: 44, x1: 76, y0: 26, c: piedra, pisos: [{ tipo: 'arcos', n: 2 }, { tipo: 'ventanas', n: 3 }, { tipo: 'arcos', n: 3 }, { tipo: 'ventanas', n: 3 }, { tipo: 'ventanas', n: 3 }], sombra: .24 }),
        K.torreReloj({ x: 44, w: 6, top: 14, base: 30, c: piedra, cTecho: cup, techo: 'cupula', reloj: false, ventanas: false }),
        K.torreReloj({ x: 76, w: 6, top: 14, base: 30, c: piedra, cTecho: cup, techo: 'cupula', reloj: false, ventanas: false })],
      [K.fachada({ x0: 24, x1: 96, y0: 80, c: luz(piedra, .04), pisos: [{ tipo: 'arcos', n: 9 }], sombra: .2 }),
        K.torreReloj({ x: 24, w: 7, top: 68, base: 84, c: piedra, cTecho: cup, techo: 'cupula', reloj: false, ventanas: false }),
        K.torreReloj({ x: 96, w: 7, top: 68, base: 84, c: piedra, cTecho: cup, techo: 'cupula', reloj: false, ventanas: false })],
    ],
    cAgua: '#8FBFD2',
    composicion: { tapar: .22, tamano: .92 },
    adornos: ['pinoParasol', 'velero', 'farolMediterraneo'],
  };
}

// ── Amán: la Ciudadela sobre su colina, con las dos columnas que quedan del Templo de Hércules y la cúpula del palacio omeya;
// en la ladera, las casas cúbicas de piedra blanca con sus tanques de agua en las azoteas ──
{ const caliza = '#E4D4B2', Tc = K.tonos(caliza), cerro = '#CFB07E';
  const columnas = (() => { let f = '', d = '';
    [[64, 6], [78, 10]].forEach(([x, top]) => { const w = 7;
      f += R(x - w / 2, top + 4, w, 62 - top - 4, caliza) + R(x - w / 2 - 1.6, top, w + 3.2, 4.4, caliza) + R(x - w / 2 - 1.2, 60, w + 2.4, 3, caliza);
      for (let k = 1; k < 3; k++) d += Ln(`M${f1(x - w / 2 + k * w / 3)} ${top + 5} V60`, Tc.som, .6, ' opacity=".6"');
      d += R(x + w * .15, top + 4, w * .35, 56 - top, Tc.som, ' opacity=".35"') + R(x - w / 2 - 1.6, top + 3.2, w + 3.2, 1, Tc.osc, ' opacity=".4"');
      for (let y = top + 14; y < 58; y += 11) d += Ln(`M${f1(x - w / 2)} ${y} h${w}`, Tc.osc, .5, ' opacity=".4"'); });
    f += P('M58 10 L86 12 L86 16 L60 15Z', caliza); d += Ln('M58 13.2 L86 15', Tc.osc, .5, ' opacity=".5"');
    return { f, d, box: [56, 6, 88, 63] }; })();
  const casas = (() => { let f = '', i = 0;
    [[100, 6, 112], [92, 4, 116], [84, 2, 118]].forEach(([y, x0, x1]) => { for (let x = x0; x < x1 - 4; i++) { const w = 9 + (i * 7) % 5, top = y - ((i * 5) % 3) * 2.2, c = K.mix(caliza, ['#F2EBDD', '#E2D4BA', '#EDE3CF'][i % 3], .5);
      f += R(x, top, w - .6, 118 - top, c) + R(x + w * .2, top + 3, 2.2, 2.6, '#7A6E62') + R(x + w * .55, top + 3, 2.2, 2.6, '#7A6E62') + R(x + w - 3, top, 2.4, 118 - top, K.tonos(c).som, ' opacity=".4"')
        + (i % 3 === 0 ? `<ellipse cx="${f1(x + w * .45)}" cy="${f1(top - 1.6)}" rx="2.2" ry="1.4" fill="#5E6E80"/>` : ''); x += w; } });
    return f; })();
  const colina = 'M-2 118 Q8 96 26 82 Q44 70 60 64 L92 62 Q106 68 114 84 Q120 100 122 118Z';
  FICHAS['Amán'] = {
    mundo: 'CIUDADELA', nombre: 'Amán', pais: 'Jordania', color: '#E2C8A0', paisaje: 'desierto', hora: 16.5, clima: 'leaves', horizonte: 'dune',
    monumento: [
      [K.cupula({ x: 38, y: 66, w: 20, tipo: 'semi', c: '#C9B48E', tambor: 6, cTambor: caliza, linterna: false, costillas: 3 })],
      [columnas],
      [{ f: P(colina, cerro), d: `<clipPath id="amcol"><path d="${colina}"/></clipPath><g clip-path="url(#amcol)">${casas}</g>`, box: [-2, 62, 122, 118] }],
    ],
    composicion: { tapar: .2, tamano: .95 },
    adornos: ['palmera', 'rocaArena', 'farolDesierto'],
  };
}
