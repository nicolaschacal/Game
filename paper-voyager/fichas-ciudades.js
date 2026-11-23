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

// ── Busan: la aldea cultural de Gamcheon. Casitas pastel de techo plano con sus azoteas de color, en hileras que suben la ladera
// (las de atrás más pálidas), con la escalera blanca que trepa entre ellas. Delante, la ciudad baja del puerto ──
{ const PAS = ['#D9AFAA', '#A9C9BE', '#DCC890', '#AEBCD6', '#D2B4C6', '#E2D4B8', '#B8CCA4'], TE = ['#7C9EB0', '#6E9E94', '#C48A6C', '#8E8EB4'];
  const fila = (y, x0, x1, pal, seed, step = 10.5) => { let f = '', d = '', i = seed;
    for (let x = x0; x < x1; x += step, i++) { const w = step - .6, top = y + ((i * 5) % 3) * 1.6 + (60 - x) * .14, c = K.mix(PAS[(i * 3) % PAS.length], '#F4EEE4', pal), te = K.mix(TE[i % TE.length], '#F4EEE4', pal), Tc = K.tonos(c);
      f += K.R(x, top, w, 118 - top, c) + K.R(x - .7, top - 2, w + 1.4, 2.4, te);
      d += K.R(x + w * .16, top + 3.4, w * .24, 3, '#6E6E80', ' opacity=".7"') + K.R(x + w * .58, top + 3.4, w * .24, 3, '#6E6E80', ' opacity=".7"') + K.R(x + w * .16, top + 9, w * .24, 3, '#6E6E80', ' opacity=".55"')
        + K.R(x + w * .78, top, w * .22, 118 - top, Tc.som, ' opacity=".4"') + K.R(x, top + .4, w, 1, Tc.osc, ' opacity=".3"'); }
    return { f, d, box: [x0 - 1, y - 6, x1 + 1, 118] }; };
  FICHAS['Busan'] = {
    mundo: 'LADERA', nombre: 'Busan', pais: 'Corea del Sur', color: '#A6BCC8', paisaje: 'ciudad', hora: 15.5, clima: 'petals', horizonte: 'peak',
    monumento: [
      [{ f: P('M0 118 L0 40 Q30 30 60 44 Q90 60 120 78 L120 118Z', '#A9BCA4'), d: '', box: [0, 34, 120, 118] }],
      [fila(38, 6, 58, .45, 1, 12.5)],
      [fila(52, 2, 86, .28, 4, 12.5)],
      [fila(67, 0, 110, .14, 7, 12.5), { f: '', d: Ln('M64 118 L66 110 L70 108 L72 100 L76 98 L78 90 L82 88 L84 80', '#FBF4E6', 2.2), box: [62, 78, 86, 118] }],
      [fila(84, 0, 120, 0, 2, 13)],
    ],
    composicion: { tapar: .26, tamano: .82, laterales: 1.2 },
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
