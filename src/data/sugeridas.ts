import type { MealId } from '../lib/types'

/*
 * Recetas Sugeridas. Cantidades POR RACIÓN DE ADULTO, en gramos de parte comestible y en crudo.
 * Cada ingrediente apunta a un alimento de BEDCA (id) para calcular sus nutrientes.
 * Al añadirlas al recetario se guardan para 4 raciones.
 */
export type Sugerida = {
  key: string
  name: string
  icon: string
  meals: MealId[]
  minutes: number
  kids: boolean
  groups: string[]
  ing: [number, string, number][] // [id BEDCA, nombre, gramos por ración]
  steps: string[]
  why?: string
}

// Alimentos BEDCA usados (id → nombre en BEDCA):
const LENTEJA = 1065 // Lenteja, seca, cruda
const GARBANZO = 1020 // Garbanzo, seco, crudo
const ALUBIA = 899 // Alubia blanca, seca, cruda
const ARROZ = 2660 // Arroz
const PASTA = 1117 // Pasta alimenticia, cruda
const AVENA = 1010 // Avena, cruda
const AOVE = 2544 // Aceite de oliva virgen extra
const ATUN = 2133 // Atún, al natural
const NUEZ = 2201 // Nuez
const POLLO = 994 // Pollo, pechuga, con piel, crudo
const PAVO = 2288 // Pavo, pechuga, con piel, crudo
const TERNERA = 1029 // Ternera, solomillo, sin grasa, crudo
const CHORIZO = 2264 // Chorizo
const JAMON = 2273 // Jamón serrano
const MERLUZA = 2347 // Merluza fresca
const BACALAO = 2302 // Bacalao, crudo
const SALMON = 2626 // Salmón
const HUEVO = 2127 // Huevo de gallina fresco
const LECHE = 916 // Leche, semidesnatada, pasteurizada
const YOGUR = 1143 // Yogur, enriquecido, natural
const QUESO = 2507 // Queso fresco de burgos
const PAN_INT = 2163 // Pan integral
const PAN_RALL = 2171 // Pan rallado
const TOMATE = 2421 // Tomate
const CEBOLLA = 2381 // Cebolla
const ZANAHORIA = 2424 // Zanahoria, cruda
const PATATA = 2403 // Patata, cruda
const CALABACIN = 2376 // Calabacín
const PIMIENTO = 2409 // Pimiento rojo, crudo
const ESPINACA = 861 // Espinaca, picada, congelada, cruda
const JUDIA_V = 2198 // Judía verde, cruda
const BRECOL = 1177 // Brécol, crudo
const CALABAZA = 2378 // Calabaza, cruda
const PLATANO = 2245 // Plátano
const MANZANA = 2231 // Manzana
// Añadidos en la ampliación de Sugeridas
const LENTEJA_C = 1126 // Lenteja, en conserva
const GARBANZO_C = 2191 // Garbanzo, en conserva
const ALUBIA_PINTA = 2197 // Judía pinta
const GUISANTE = 1175 // Guisante, congelado, crudo
const EDAMAME = 1124 // Soja, fresca
const TOFU = 1121 // Tofu
const QUINOA = 1083 // Quinoa, cruda
const ARROZ_INT = 904 // Arroz integral, crudo
const PASTA_INT = 1074 // Pasta alimenticia, integral, cruda
const SEMOLA = 1084 // Sémola de trigo, cruda
const HARINA = 2677 // Harina de trigo
const HARINA_INT = 1113 // Harina de trigo, integral
const PAN_HAMB = 2174 // Pan, tipo hamburguesa
const BONIATO = 731 // Boniato, crudo
const POLLO_MUSLO = 993 // Pollo, muslo, con piel, crudo
const PAVO_FIAMBRE = 2287 // Pavo, fiambre, bajo en grasa
const JAMON_COC = 965 // Jamón cocido, categoría s/e
const CERDO_SOLOM = 1021 // Cerdo, solomillo, crudo
const CONEJO = 1162 // Conejo de granja, carne, cruda
const TERNERA_LOMO = 991 // Ternera, lomo, crudo, con grasa separable
const LUBINA = 2344 // Lubina
const DORADA = 815 // Dorada, cruda
const RAPE = 2623 // Rape, crudo
const MERLUZA_CONG = 825 // Merluza, congelada, cruda
const TRUCHA = 2636 // Trucha
const SARDINA = 2630 // Sardina
const LANGOSTINO = 2340 // Langostino
const GAMBA = 817 // Gamba roja, cruda
const MEJILLON = 2345 // Mejillon
const CALAMAR = 807 // Calamar, crudo
const SEPIA = 2635 // Sepia
const BACALAO_DES = 797 // Bacalao, salado, remojado, crudo
const YOGUR_GR = 2520 // Yogur griego
const KEFIR = 1168 // Kefir
const REQUESON = 2517 // Requesón
const CUAJADA = 2485 // Cuajada
const MOZZARELLA = 2510 // Queso mozzarella
const QUESO_TIERNO = 2516 // Queso tierno, genérico
const QUESO_RALL = 2513 // Queso rallado, genérico
const PARMESANO = 2512 // Queso parmesano
const ALMENDRA = 2182 // Almendra, tostada
const CREMA_CACAH = 979 // Crema de cacahuete
const PIPA_CALAB = 2204 // Pipa de calabaza
const SESAMO = 1127 // Sésamo, semilla
const TAHINI = 2567 // Pasta de sésamo
const TOMATE_TRIT = 2423 // Tomate, maduro, pelado y triturado, enlatado
const AJO = 2361 // Ajo
const PEREJIL = 2593 // Perejil, fresco
const COMINO = 2571 // Comino
const CHAMPI = 2384 // Champiñon
const BERENJENA = 2370 // Berenjena
const LECHUGA = 2399 // Lechuga
const PEPINO = 2407 // Pepino
const COLIFLOR = 859 // Coliflor, congelada, cruda
const PUERRO = 2411 // Puerro, crudo y congelado
const MAIZ = 879 // Maíz, en mazorca, congelado, crudo
const AGUACATE = 2216 // Aguacate
const LIMON = 937 // Zumo de limón, fresco
const KIWI = 2228 // Kiwi
const NARANJA = 2235 // Naranja
const MANDARINA = 2229 // Mandarina
const FRESA = 2225 // Fresa
const FRAMBUESA = 914 // Frambuesa, cruda
const PERA = 2241 // Pera
const DATIL = 2224 // Dátil
const PASAS = 2251 // Uva pasa
const MIEL = 2643 // Miel

export const SUGERIDAS: Sugerida[] = [
  { key: 'lentejas', name: 'Lentejas con verduras', icon: '🍲', meals: ['com', 'cen'], minutes: 45, kids: true, groups: ['legumbre', 'verdura'], ing: [[LENTEJA, 'Lentejas', 70], [PATATA, 'Patata', 60], [ZANAHORIA, 'Zanahoria', 40], [CEBOLLA, 'Cebolla', 30], [PIMIENTO, 'Pimiento', 20], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Sofríe cebolla, pimiento y zanahoria.', 'Añade lentejas, patata y agua; cuece 35 min a fuego medio.'] },
  { key: 'cocido', name: 'Cocido madrileño', icon: '🥘', meals: ['com'], minutes: 150, kids: true, groups: ['legumbre', 'roja', 'verdura'], ing: [[GARBANZO, 'Garbanzos', 70], [TERNERA, 'Ternera', 60], [CHORIZO, 'Chorizo', 15], [PATATA, 'Patata', 80], [ZANAHORIA, 'Zanahoria', 40]], steps: ['Remoja los garbanzos la noche antes.', 'Cuece carne y garbanzos 2 h; añade verdura y patata la última media hora.'] },
  { key: 'merluza', name: 'Merluza al horno con patatas', icon: '🐟', meals: ['com', 'cen'], minutes: 35, kids: true, groups: ['pescado', 'verdura'], ing: [[MERLUZA, 'Merluza', 150], [PATATA, 'Patata', 150], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Hornea patata y cebolla en láminas 20 min a 200 °C.', 'Coloca la merluza encima y hornea 12 min más.'] },
  { key: 'salmon', name: 'Salmón con arroz y calabacín', icon: '🍣', meals: ['com', 'cen'], minutes: 30, kids: true, groups: ['pescado', 'verdura'], ing: [[SALMON, 'Salmón', 120], [ARROZ, 'Arroz', 60], [CALABACIN, 'Calabacín', 100], [AOVE, 'Aceite de oliva virgen extra', 5]], steps: ['Cuece el arroz.', 'Saltea el calabacín y haz el salmón a la plancha.'] },
  { key: 'pollo', name: 'Pollo al horno con verduras', icon: '🍗', meals: ['com', 'cen'], minutes: 50, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 150], [PATATA, 'Patata', 120], [PIMIENTO, 'Pimiento', 50], [CEBOLLA, 'Cebolla', 40], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Trocea todo, aliña y hornea 40 min a 190 °C.'] },
  { key: 'tortilla', name: 'Tortilla de patatas con ensalada', icon: '🍳', meals: ['cen', 'com'], minutes: 40, kids: true, groups: ['huevo', 'verdura'], ing: [[HUEVO, 'Huevos', 100], [PATATA, 'Patata', 120], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 15], [TOMATE, 'Tomate', 100]], steps: ['Confita patata y cebolla en poco aceite.', 'Mezcla con el huevo batido y cuaja.', 'Acompaña con tomate aliñado.'] },
  { key: 'crema', name: 'Crema de calabacín y huevo duro', icon: '🥣', meals: ['cen'], minutes: 30, kids: true, groups: ['verdura', 'verdura', 'huevo'], ing: [[CALABACIN, 'Calabacín', 250], [PATATA, 'Patata', 60], [CEBOLLA, 'Cebolla', 30], [QUESO, 'Queso fresco', 20], [HUEVO, 'Huevo', 60], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece calabacín, patata y cebolla 20 min.', 'Tritura con el queso fresco.', 'Sirve con huevo duro picado.'] },
  { key: 'macarrones', name: 'Macarrones con tomate y atún', icon: '🍝', meals: ['com'], minutes: 25, kids: true, groups: ['pescado', 'verdura'], ing: [[PASTA, 'Macarrones', 80], [TOMATE, 'Tomate', 120], [ATUN, 'Atún al natural', 50], [CEBOLLA, 'Cebolla', 20], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece la pasta.', 'Haz un tomate casero con cebolla y mezcla con el atún.'] },
  { key: 'garbanzos', name: 'Garbanzos con espinacas', icon: '🥬', meals: ['com', 'cen'], minutes: 25, kids: false, groups: ['legumbre', 'verdura'], ing: [[GARBANZO, 'Garbanzos', 70], [ESPINACA, 'Espinacas', 120], [CEBOLLA, 'Cebolla', 20], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Sofríe la cebolla, añade espinacas y garbanzos cocidos.', 'Rehoga 10 min con pimentón y comino.'] },
  { key: 'arrozpollo', name: 'Arroz con pollo y verduras', icon: '🍚', meals: ['com'], minutes: 40, kids: true, groups: ['blanca', 'verdura'], ing: [[ARROZ, 'Arroz', 70], [POLLO, 'Pechuga de pollo', 80], [PIMIENTO, 'Pimiento', 40], [ZANAHORIA, 'Zanahoria', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Dora el pollo y la verdura.', 'Añade el arroz y el caldo; 18 min.'] },
  { key: 'albondigas', name: 'Albóndigas de ternera en salsa de tomate', icon: '🧆', meals: ['com'], minutes: 50, kids: true, groups: ['roja', 'verdura'], ing: [[TERNERA, 'Ternera picada', 120], [TOMATE, 'Tomate', 100], [CEBOLLA, 'Cebolla', 30], [PAN_RALL, 'Pan rallado', 15], [HUEVO, 'Huevo', 15], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Forma las albóndigas con carne, pan y huevo.', 'Dóralas y cuécelas 20 min en la salsa de tomate.'] },
  { key: 'judias', name: 'Judías verdes con patata y huevo', icon: '🫛', meals: ['cen', 'com'], minutes: 25, kids: true, groups: ['verdura', 'verdura', 'huevo'], ing: [[JUDIA_V, 'Judías verdes', 200], [PATATA, 'Patata', 100], [HUEVO, 'Huevo', 60], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece judías y patata 15 min.', 'Sirve con huevo duro y un chorrito de aceite.'] },
  { key: 'bacalao', name: 'Bacalao con tomate y pimiento', icon: '🐟', meals: ['com', 'cen'], minutes: 30, kids: true, groups: ['pescado', 'verdura'], ing: [[BACALAO, 'Bacalao fresco', 150], [TOMATE, 'Tomate', 120], [PIMIENTO, 'Pimiento', 40], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Haz un sofrito de cebolla, pimiento y tomate.', 'Añade el bacalao en trozos y cuece 8 min tapado.'] },
  { key: 'alubias', name: 'Alubias blancas con verduras', icon: '🫘', meals: ['com'], minutes: 90, kids: true, groups: ['legumbre', 'verdura'], ing: [[ALUBIA, 'Alubias blancas', 70], [ZANAHORIA, 'Zanahoria', 40], [PIMIENTO, 'Pimiento', 30], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Remoja las alubias la noche antes.', 'Cuécelas con la verdura 1 h a fuego lento.'] },
  { key: 'pavo', name: 'Pavo a la plancha con arroz y brécol', icon: '🥦', meals: ['com', 'cen'], minutes: 25, kids: true, groups: ['blanca', 'verdura'], ing: [[PAVO, 'Pechuga de pavo', 130], [ARROZ, 'Arroz', 60], [BRECOL, 'Brécol', 150], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece el arroz y el brécol al vapor.', 'Haz el pavo a la plancha.'] },
  { key: 'cremacalabaza', name: 'Crema de calabaza y zanahoria', icon: '🎃', meals: ['cen'], minutes: 30, kids: true, groups: ['verdura', 'verdura'], ing: [[CALABAZA, 'Calabaza', 200], [ZANAHORIA, 'Zanahoria', 80], [PATATA, 'Patata', 60], [CEBOLLA, 'Cebolla', 30], [QUESO, 'Queso fresco', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece todo 20 min.', 'Tritura con el queso fresco.'] },
  // Desayunos, media mañana y meriendas
  { key: 'lecheavena', name: 'Leche con avena y plátano', icon: '🥛', meals: ['des'], minutes: 5, kids: true, groups: ['fruta', 'lacteo'], ing: [[LECHE, 'Leche semidesnatada', 250], [AVENA, 'Copos de avena', 40], [PLATANO, 'Plátano', 60]], steps: ['Mezcla y sirve.'] },
  { key: 'tostada', name: 'Tostada integral con tomate y aceite + leche', icon: '🍞', meals: ['des'], minutes: 5, kids: true, groups: ['lacteo'], ing: [[PAN_INT, 'Pan integral', 60], [TOMATE, 'Tomate', 50], [AOVE, 'Aceite de oliva virgen extra', 5], [LECHE, 'Leche semidesnatada', 200]], steps: ['Tuesta el pan, añade tomate rallado y un hilo de aceite.'] },
  { key: 'yogur', name: 'Yogur con manzana y nueces', icon: '🍎', meals: ['mer', 'des'], minutes: 3, kids: true, groups: ['fruta', 'lacteo'], ing: [[YOGUR, 'Yogur natural', 125], [MANZANA, 'Manzana', 100], [NUEZ, 'Nueces', 15]], steps: ['Trocea la manzana y mezcla.'] },
  { key: 'bocjamon', name: 'Bocadillo de jamón', icon: '🥪', meals: ['mm', 'mer'], minutes: 3, kids: true, groups: ['roja'], ing: [[PAN_INT, 'Pan integral', 60], [JAMON, 'Jamón serrano', 25], [TOMATE, 'Tomate', 20]], steps: ['Pan con tomate y jamón. Envuelto, aguanta bien en la mochila.'] },
  { key: 'frutaqueso', name: 'Fruta y queso fresco', icon: '🧀', meals: ['mm', 'mer'], minutes: 2, kids: true, groups: ['fruta', 'lacteo'], ing: [[MANZANA, 'Manzana', 150], [QUESO, 'Queso fresco', 40]], steps: ['En un táper pequeño para el cole.'] },
  { key: 'boctortilla', name: 'Bocadillo de tortilla francesa', icon: '🥖', meals: ['mm', 'mer'], minutes: 8, kids: true, groups: ['huevo'], ing: [[PAN_INT, 'Pan integral', 60], [HUEVO, 'Huevo', 50], [AOVE, 'Aceite de oliva virgen extra', 3]], steps: ['Tortilla de un huevo en pan integral.'] },
  // Ideas pensadas para los niños
  { key: 'hamblentejas', name: 'Hamburguesas de lentejas', icon: '🍔', meals: ['cen', 'com'], minutes: 30, kids: true, groups: ['legumbre', 'verdura'], ing: [[LENTEJA, 'Lentejas', 60], [ZANAHORIA, 'Zanahoria', 30], [CEBOLLA, 'Cebolla', 20], [PAN_RALL, 'Pan rallado', 10], [HUEVO, 'Huevo', 15], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Tritura lentejas cocidas con zanahoria y cebolla.', 'Forma hamburguesas y hazlas a la plancha.'], why: 'Una forma fácil de que los niños coman legumbre.' },
  { key: 'pisto', name: 'Pisto con huevo', icon: '🍅', meals: ['cen'], minutes: 35, kids: true, groups: ['verdura', 'verdura', 'huevo'], ing: [[CALABACIN, 'Calabacín', 120], [PIMIENTO, 'Pimiento', 60], [TOMATE, 'Tomate', 120], [CEBOLLA, 'Cebolla', 40], [HUEVO, 'Huevo', 60], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Pocha la verdura a fuego lento 25 min.', 'Cuaja un huevo encima.'], why: 'Dos raciones de verdura en una cena rápida.' },
  { key: 'nuggets', name: 'Nuggets caseros de pollo al horno', icon: '🍗', meals: ['cen', 'com'], minutes: 30, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 120], [PAN_RALL, 'Pan rallado', 20], [HUEVO, 'Huevo', 15], [AOVE, 'Aceite de oliva virgen extra', 5], [PATATA, 'Patata', 100]], steps: ['Reboza tiras de pollo en huevo y pan rallado.', 'Hornea 15 min a 200 °C con patata en gajos.'], why: 'Sustituye a los nuggets ultraprocesados.' },
  { key: 'papillote', name: 'Salmón en papillote con verduras', icon: '🐟', meals: ['cen'], minutes: 25, kids: true, groups: ['pescado', 'verdura', 'verdura'], ing: [[SALMON, 'Salmón', 120], [ZANAHORIA, 'Zanahoria', 50], [CALABACIN, 'Calabacín', 80], [PATATA, 'Patata', 100], [AOVE, 'Aceite de oliva virgen extra', 5]], steps: ['Cierra salmón y verdura en papel de horno.', 'Hornea 18 min a 200 °C.'], why: 'Pescado azul sin olores ni fritura.' },
  // ── Ampliación: comidas y cenas ──
  // Pescado
  { key: 'lubina', name: 'Lubina al horno con patata y pimiento', icon: '🐟', meals: ['com', 'cen'], minutes: 35, kids: true, groups: ['pescado', 'verdura'], ing: [[LUBINA, 'Lubina', 160], [PATATA, 'Patata', 150], [PIMIENTO, 'Pimiento rojo', 70], [CEBOLLA, 'Cebolla', 40], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Hornea patata, pimiento y cebolla en láminas 20 min a 200 °C.', 'Pon la lubina abierta encima y hornea 12 min más.'] },
  { key: 'dorada', name: 'Dorada a la espalda con ensalada', icon: '🐟', meals: ['com', 'cen'], minutes: 30, kids: true, groups: ['pescado', 'verdura'], ing: [[DORADA, 'Dorada', 170], [PATATA, 'Patata', 120], [LECHUGA, 'Lechuga', 60], [TOMATE, 'Tomate', 100], [AJO, 'Ajo', 3], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Hornea la patata en rodajas 15 min a 200 °C.', 'Añade la dorada abierta y hornea 10 min; riega con ajo dorado en el aceite.', 'Sirve con lechuga y tomate.'] },
  { key: 'trucha', name: 'Trucha al horno con verduras', icon: '🐟', meals: ['com', 'cen'], minutes: 35, kids: true, groups: ['pescado', 'verdura'], ing: [[TRUCHA, 'Trucha', 170], [CALABACIN, 'Calabacín', 100], [ZANAHORIA, 'Zanahoria', 50], [PATATA, 'Patata', 100], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Hornea las verduras en dados 20 min a 200 °C.', 'Añade la trucha y hornea 12 min.'], why: 'Pescado azul suave y sin apenas espinas en filetes.' },
  { key: 'sardinas', name: 'Sardinas al horno con ensalada', icon: '🐟', meals: ['com', 'cen'], minutes: 25, kids: false, groups: ['pescado', 'verdura'], ing: [[SARDINA, 'Sardinas limpias', 150], [PATATA, 'Patata', 120], [TOMATE, 'Tomate', 100], [LECHUGA, 'Lechuga', 40], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Hornea la patata 15 min.', 'Añade las sardinas y hornea 8 min a 220 °C.', 'Sirve con ensalada.'], why: 'Pescado azul barato y rico en omega-3.' },
  { key: 'merluzaverde', name: 'Merluza en salsa verde con guisantes', icon: '🐟', meals: ['com', 'cen'], minutes: 30, kids: true, groups: ['pescado', 'verdura'], ing: [[MERLUZA_CONG, 'Merluza (congelada)', 160], [GUISANTE, 'Guisantes', 60], [PATATA, 'Patata', 100], [AJO, 'Ajo', 3], [PEREJIL, 'Perejil', 2], [HARINA, 'Harina', 5], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Cuece la patata en rodajas 12 min.', 'Dora el ajo, añade la harina y un poco de agua con perejil.', 'Mete la merluza y los guisantes y cuece 8 min.'] },
  { key: 'albondigasmerluza', name: 'Albóndigas de merluza en tomate con arroz', icon: '🧆', meals: ['com', 'cen'], minutes: 40, kids: true, groups: ['pescado', 'verdura'], ing: [[MERLUZA_CONG, 'Merluza (congelada)', 130], [HUEVO, 'Huevo', 15], [PAN_RALL, 'Pan rallado', 12], [TOMATE_TRIT, 'Tomate triturado', 100], [CEBOLLA, 'Cebolla', 30], [ARROZ, 'Arroz', 50], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Pica la merluza y mézclala con huevo y pan rallado.', 'Forma bolitas, dóralas y cuécelas 10 min en tomate con cebolla.', 'Sirve con arroz blanco.'], why: 'Pescado blanco en un formato que gusta a los niños.' },
  { key: 'brochetarape', name: 'Brochetas de rape y langostinos con arroz', icon: '🍤', meals: ['com', 'cen'], minutes: 30, kids: true, groups: ['pescado', 'verdura'], ing: [[RAPE, 'Rape', 100], [LANGOSTINO, 'Langostinos pelados', 60], [PIMIENTO, 'Pimiento rojo', 60], [CEBOLLA, 'Cebolla', 40], [ARROZ, 'Arroz', 60], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece el arroz.', 'Ensarta rape, langostinos, pimiento y cebolla.', 'Hazlas a la plancha 6–8 min.'] },
  { key: 'arrozmarisco', name: 'Arroz caldoso de sepia y gambas', icon: '🥘', meals: ['com'], minutes: 40, kids: true, groups: ['pescado', 'verdura'], ing: [[ARROZ, 'Arroz', 70], [SEPIA, 'Sepia', 70], [GAMBA, 'Gambas peladas', 50], [MEJILLON, 'Mejillones (sin concha)', 40], [TOMATE_TRIT, 'Tomate triturado', 50], [PIMIENTO, 'Pimiento rojo', 40], [CEBOLLA, 'Cebolla', 20], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Sofríe cebolla, pimiento y la sepia en trozos.', 'Añade tomate, arroz y el triple de agua; 16 min.', 'Agrega gambas y mejillones los últimos 3 min.'] },
  { key: 'mejillones', name: 'Mejillones en salsa de tomate con pan', icon: '🦪', meals: ['cen'], minutes: 20, kids: false, groups: ['pescado', 'verdura'], ing: [[MEJILLON, 'Mejillones (sin concha)', 140], [TOMATE_TRIT, 'Tomate triturado', 100], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 6], [PAN_INT, 'Pan integral', 50]], steps: ['Abre los mejillones al vapor (unos 600 g con concha por persona).', 'Haz un tomate con cebolla y mézclalos.', 'Acompaña con pan para mojar.'], why: 'Muy rico en hierro.' },
  { key: 'calabacinatun', name: 'Calabacín relleno de atún gratinado', icon: '🥒', meals: ['cen'], minutes: 35, kids: true, groups: ['pescado', 'verdura', 'verdura'], ing: [[CALABACIN, 'Calabacín', 200], [ATUN, 'Atún al natural', 60], [TOMATE_TRIT, 'Tomate triturado', 60], [CEBOLLA, 'Cebolla', 30], [MOZZARELLA, 'Mozzarella', 25], [AOVE, 'Aceite de oliva virgen extra', 6]], steps: ['Vacía el calabacín y hornéalo 15 min.', 'Sofríe cebolla, la pulpa y el tomate; mezcla con el atún.', 'Rellena, cubre con mozzarella y gratina 8 min.'] },
  { key: 'pizzaatun', name: 'Pizza casera integral de atún y verduras', icon: '🍕', meals: ['cen'], minutes: 45, kids: true, groups: ['pescado', 'verdura', 'lacteo'], ing: [[HARINA_INT, 'Harina integral', 70], [TOMATE_TRIT, 'Tomate triturado', 60], [MOZZARELLA, 'Mozzarella', 50], [ATUN, 'Atún al natural', 40], [CHAMPI, 'Champiñones', 40], [PIMIENTO, 'Pimiento rojo', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Masa: harina, agua templada, levadura y aceite; reposa 30 min.', 'Estira, cubre con tomate, verdura, atún y mozzarella.', 'Hornea 12 min a 230 °C.'], why: 'Pizza de viernes sin ultraprocesados; que los niños pongan los ingredientes.' },
  // Legumbre
  { key: 'ensgarbanzos', name: 'Ensalada de garbanzos con atún y huevo', icon: '🥗', meals: ['com', 'cen'], minutes: 15, kids: true, groups: ['legumbre', 'pescado', 'huevo', 'verdura'], ing: [[GARBANZO_C, 'Garbanzos cocidos (bote)', 130], [ATUN, 'Atún al natural', 50], [HUEVO, 'Huevo', 50], [TOMATE, 'Tomate', 100], [PIMIENTO, 'Pimiento rojo', 40], [CEBOLLA, 'Cebolla', 20], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Enjuaga los garbanzos.', 'Mezcla con verdura picada, atún y huevo duro; aliña.'], why: 'Legumbre fría para el verano o para llevar.' },
  { key: 'enslentejas', name: 'Ensalada de lentejas con huevo y verduras', icon: '🥗', meals: ['com', 'cen'], minutes: 15, kids: true, groups: ['legumbre', 'huevo', 'verdura'], ing: [[LENTEJA_C, 'Lentejas cocidas (bote)', 160], [HUEVO, 'Huevo', 50], [TOMATE, 'Tomate', 80], [PEPINO, 'Pepino', 50], [PIMIENTO, 'Pimiento rojo', 30], [CEBOLLA, 'Cebolla', 15], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Enjuaga las lentejas.', 'Mezcla con la verdura picada y el huevo duro; aliña.'] },
  { key: 'lentejasarroz', name: 'Lentejas con arroz y verduras', icon: '🍲', meals: ['com'], minutes: 45, kids: true, groups: ['legumbre', 'verdura'], ing: [[LENTEJA, 'Lentejas', 60], [ARROZ, 'Arroz', 25], [ZANAHORIA, 'Zanahoria', 40], [CEBOLLA, 'Cebolla', 30], [PIMIENTO, 'Pimiento rojo', 30], [TOMATE_TRIT, 'Tomate triturado', 50], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Sofríe la verdura y el tomate.', 'Añade lentejas y agua; 25 min.', 'Echa el arroz y cuece 15 min más.'], why: 'Legumbre + cereal: proteína vegetal más completa.' },
  { key: 'potaje', name: 'Potaje de garbanzos, espinacas y bacalao', icon: '🍲', meals: ['com'], minutes: 120, kids: true, groups: ['legumbre', 'pescado', 'verdura'], ing: [[GARBANZO, 'Garbanzos', 60], [BACALAO_DES, 'Bacalao desalado', 70], [ESPINACA, 'Espinacas', 100], [CEBOLLA, 'Cebolla', 30], [HUEVO, 'Huevo', 25], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Remoja los garbanzos la noche antes y cuécelos 1 h 30 min.', 'Añade sofrito, espinacas y el bacalao en trozos; 10 min.', 'Sirve con huevo duro picado.'] },
  { key: 'alubiascalamar', name: 'Alubias blancas con calamares', icon: '🫘', meals: ['com'], minutes: 90, kids: true, groups: ['legumbre', 'pescado', 'verdura'], ing: [[ALUBIA, 'Alubias blancas', 60], [CALAMAR, 'Calamar', 80], [CEBOLLA, 'Cebolla', 30], [PIMIENTO, 'Pimiento rojo', 30], [TOMATE_TRIT, 'Tomate triturado', 40], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Remoja las alubias y cuécelas 1 h.', 'Sofríe la verdura con el calamar en anillas.', 'Junta todo y cuece 15 min.'] },
  { key: 'chili', name: 'Chili de alubias rojas con ternera y arroz', icon: '🌶️', meals: ['com'], minutes: 60, kids: true, groups: ['legumbre', 'roja', 'verdura'], ing: [[ALUBIA_PINTA, 'Alubias rojas', 60], [TERNERA, 'Ternera picada magra', 70], [TOMATE_TRIT, 'Tomate triturado', 100], [PIMIENTO, 'Pimiento rojo', 40], [CEBOLLA, 'Cebolla', 30], [MAIZ, 'Maíz dulce', 30], [ARROZ, 'Arroz', 40], [COMINO, 'Comino', 1], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece las alubias remojadas (o usa un bote).', 'Dora la carne con cebolla y pimiento, añade tomate, comino y alubias; 20 min.', 'Sirve con arroz.'], why: 'Sin picante para los niños: el pimentón dulce da el color.' },
  { key: 'cuscus', name: 'Cuscús con verduras y garbanzos', icon: '🍛', meals: ['com', 'cen'], minutes: 25, kids: true, groups: ['legumbre', 'verdura'], ing: [[SEMOLA, 'Cuscús', 60], [GARBANZO_C, 'Garbanzos cocidos (bote)', 100], [CALABACIN, 'Calabacín', 80], [ZANAHORIA, 'Zanahoria', 50], [CEBOLLA, 'Cebolla', 30], [COMINO, 'Comino', 1], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Saltea la verdura en dados con comino.', 'Añade los garbanzos.', 'Hidrata el cuscús con el mismo peso de agua caliente 5 min y mezcla.'] },
  { key: 'ensquinoa', name: 'Ensalada de quinoa con garbanzos y queso', icon: '🥗', meals: ['com', 'cen'], minutes: 20, kids: false, groups: ['legumbre', 'verdura', 'lacteo'], ing: [[QUINOA, 'Quinoa', 50], [GARBANZO_C, 'Garbanzos cocidos (bote)', 80], [TOMATE, 'Tomate', 80], [PEPINO, 'Pepino', 60], [PIMIENTO, 'Pimiento rojo', 30], [QUESO, 'Queso fresco', 30], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Lava la quinoa y cuécela 12 min.', 'Mezcla en frío con todo lo demás y aliña.'] },
  { key: 'tofu', name: 'Salteado de tofu con verduras y arroz', icon: '🥢', meals: ['com', 'cen'], minutes: 25, kids: false, groups: ['legumbre', 'verdura'], ing: [[TOFU, 'Tofu firme', 150], [ARROZ, 'Arroz', 60], [BRECOL, 'Brécol', 80], [ZANAHORIA, 'Zanahoria', 40], [PIMIENTO, 'Pimiento rojo', 40], [SESAMO, 'Sésamo', 5], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece el arroz.', 'Dora el tofu en dados.', 'Saltea la verdura, junta con el tofu y espolvorea sésamo.'] },
  // Carne
  { key: 'pollocurry', name: 'Pollo al curry suave con arroz integral', icon: '🍛', meals: ['com', 'cen'], minutes: 40, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 140], [ARROZ_INT, 'Arroz integral', 60], [CEBOLLA, 'Cebolla', 40], [PIMIENTO, 'Pimiento rojo', 50], [YOGUR, 'Yogur natural', 60], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece el arroz integral (unos 30 min).', 'Dora el pollo con cebolla y pimiento y una cucharadita de curry suave.', 'Apaga el fuego y mezcla con el yogur.'] },
  { key: 'pollolimon', name: 'Pollo al limón con cuscús y verduras', icon: '🍋', meals: ['com', 'cen'], minutes: 25, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 130], [SEMOLA, 'Cuscús', 60], [CALABACIN, 'Calabacín', 80], [PIMIENTO, 'Pimiento rojo', 40], [LIMON, 'Zumo de limón', 10], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Marca el pollo en tiras y riégalo con limón.', 'Saltea la verdura.', 'Hidrata el cuscús 5 min y mezcla.'] },
  { key: 'polloalmendras', name: 'Pollo en salsa de almendras con judías verdes', icon: '🍗', meals: ['com'], minutes: 35, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 140], [ALMENDRA, 'Almendras', 15], [CEBOLLA, 'Cebolla', 30], [AJO, 'Ajo', 3], [ARROZ, 'Arroz', 50], [JUDIA_V, 'Judías verdes', 100], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Dora el pollo; sofríe cebolla y ajo.', 'Tritura las almendras con un poco de agua y añádelas; 10 min.', 'Acompaña con arroz y judías verdes cocidas.'] },
  { key: 'muslosboniato', name: 'Muslos de pollo al horno con boniato', icon: '🍠', meals: ['com', 'cen'], minutes: 50, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO_MUSLO, 'Muslos de pollo', 160], [BONIATO, 'Boniato', 150], [CEBOLLA, 'Cebolla', 40], [PIMIENTO, 'Pimiento rojo', 50], [AOVE, 'Aceite de oliva virgen extra', 6]], steps: ['Quita la piel a los muslos.', 'Hornea todo 40 min a 200 °C con romero.'] },
  { key: 'hamburpollo', name: 'Hamburguesa casera de pollo con ensalada', icon: '🍔', meals: ['cen', 'com'], minutes: 25, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo picada', 130], [CEBOLLA, 'Cebolla', 20], [PAN_RALL, 'Pan rallado', 10], [HUEVO, 'Huevo', 15], [PAN_HAMB, 'Pan de hamburguesa', 60], [LECHUGA, 'Lechuga', 40], [TOMATE, 'Tomate', 80], [AOVE, 'Aceite de oliva virgen extra', 5]], steps: ['Mezcla pollo picado, cebolla, huevo y pan rallado.', 'Forma la hamburguesa y hazla a la plancha.', 'Monta con lechuga y tomate.'], why: 'Hamburguesa sin aditivos: pide en carnicería la pechuga picada.' },
  { key: 'pastapollo', name: 'Pasta con pollo y brócoli', icon: '🍝', meals: ['com'], minutes: 25, kids: true, groups: ['blanca', 'verdura'], ing: [[PASTA, 'Pasta', 80], [POLLO, 'Pechuga de pollo', 100], [BRECOL, 'Brécol', 120], [AJO, 'Ajo', 3], [PARMESANO, 'Parmesano', 8], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece la pasta y el brécol juntos (el brécol, los últimos 4 min).', 'Saltea el pollo con ajo.', 'Mezcla y espolvorea parmesano.'] },
  { key: 'paella', name: 'Paella de pollo y verduras', icon: '🥘', meals: ['com'], minutes: 45, kids: true, groups: ['blanca', 'verdura'], ing: [[ARROZ, 'Arroz', 70], [POLLO_MUSLO, 'Contramuslo de pollo', 90], [JUDIA_V, 'Judías verdes', 60], [PIMIENTO, 'Pimiento rojo', 40], [TOMATE, 'Tomate', 40], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Dora el pollo sin piel; añade judías, pimiento y tomate rallado.', 'Agrega el arroz y el doble y medio de agua con azafrán; 18 min.'] },
  { key: 'sopapollo', name: 'Sopa de pollo con fideos y verduras', icon: '🍜', meals: ['cen'], minutes: 40, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 80], [PASTA, 'Fideos', 30], [ZANAHORIA, 'Zanahoria', 50], [PUERRO, 'Puerro', 40], [CEBOLLA, 'Cebolla', 20], [HUEVO, 'Huevo', 25]], steps: ['Cuece el pollo con la verdura 30 min y desmenúzalo.', 'Añade los fideos 5 min.', 'Sirve con huevo duro picado.'], why: 'Cena ligera de invierno con caldo casero sin sal añadida.' },
  { key: 'lasana', name: 'Lasaña de pollo y espinacas', icon: '🍝', meals: ['com'], minutes: 60, kids: true, groups: ['blanca', 'verdura', 'lacteo'], ing: [[PASTA, 'Placas de lasaña', 60], [POLLO, 'Pechuga de pollo', 80], [ESPINACA, 'Espinacas', 80], [CHAMPI, 'Champiñones', 50], [TOMATE_TRIT, 'Tomate triturado', 60], [LECHE, 'Leche semidesnatada', 80], [HARINA, 'Harina', 8], [QUESO_RALL, 'Queso rallado', 15], [AOVE, 'Aceite de oliva virgen extra', 6]], steps: ['Sofríe pollo picado, champiñón y espinacas con el tomate.', 'Bechamel ligera: harina tostada en el aceite + leche.', 'Monta capas, cubre con bechamel y queso y hornea 25 min a 190 °C.'] },
  { key: 'conejo', name: 'Conejo guisado con verduras', icon: '🍖', meals: ['com'], minutes: 60, kids: true, groups: ['blanca', 'verdura'], ing: [[CONEJO, 'Conejo', 150], [PATATA, 'Patata', 100], [ZANAHORIA, 'Zanahoria', 50], [CEBOLLA, 'Cebolla', 40], [CHAMPI, 'Champiñones', 50], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Dora el conejo troceado.', 'Añade la verdura y agua; cuece tapado 45 min.'], why: 'Carne blanca muy magra.' },
  { key: 'pechugaensalada', name: 'Pechuga a la plancha con patata y ensalada', icon: '🥗', meals: ['com', 'cen'], minutes: 25, kids: true, groups: ['blanca', 'verdura'], ing: [[POLLO, 'Pechuga de pollo', 160], [PATATA, 'Patata', 150], [LECHUGA, 'Lechuga', 60], [TOMATE, 'Tomate', 100], [AOVE, 'Aceite de oliva virgen extra', 10]], steps: ['Cuece o asa la patata.', 'Haz la pechuga a la plancha.', 'Sirve con ensalada aliñada.'], why: 'Plato sencillo tras el entreno.' },
  { key: 'bowlpavo', name: 'Bol de quinoa con pavo, aguacate y tomate', icon: '🥙', meals: ['com'], minutes: 25, kids: false, groups: ['blanca', 'verdura'], ing: [[PAVO, 'Pechuga de pavo', 120], [QUINOA, 'Quinoa', 50], [AGUACATE, 'Aguacate', 50], [TOMATE, 'Tomate', 100], [PEPINO, 'Pepino', 60], [AOVE, 'Aceite de oliva virgen extra', 6]], steps: ['Cuece la quinoa 12 min.', 'Haz el pavo a la plancha en tiras.', 'Monta el bol con la verdura y el aguacate.'] },
  { key: 'solomillocerdo', name: 'Solomillo de cerdo con boniato asado', icon: '🥩', meals: ['com', 'cen'], minutes: 40, kids: true, groups: ['roja', 'verdura'], ing: [[CERDO_SOLOM, 'Solomillo de cerdo', 140], [BONIATO, 'Boniato', 150], [PIMIENTO, 'Pimiento rojo', 60], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Asa boniato, pimiento y cebolla 30 min a 200 °C.', 'Marca el solomillo entero y termínalo 12 min en el horno.'] },
  { key: 'salteadoternera', name: 'Salteado de ternera con verduras y arroz', icon: '🥩', meals: ['com'], minutes: 25, kids: true, groups: ['roja', 'verdura'], ing: [[TERNERA_LOMO, 'Ternera en tiras', 120], [ARROZ, 'Arroz', 60], [PIMIENTO, 'Pimiento rojo', 60], [CALABACIN, 'Calabacín', 80], [CEBOLLA, 'Cebolla', 40], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Cuece el arroz.', 'Saltea la ternera a fuego fuerte 2 min y resérvala.', 'Saltea la verdura, junta todo.'], why: 'Ternera: buena fuente de hierro para niños deportistas.' },
  { key: 'bolonesa', name: 'Espaguetis integrales a la boloñesa', icon: '🍝', meals: ['com'], minutes: 40, kids: true, groups: ['roja', 'verdura'], ing: [[PASTA_INT, 'Espaguetis integrales', 80], [TERNERA, 'Ternera picada magra', 90], [TOMATE_TRIT, 'Tomate triturado', 120], [ZANAHORIA, 'Zanahoria', 30], [CEBOLLA, 'Cebolla', 30], [QUESO_RALL, 'Queso rallado', 8], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Sofríe cebolla y zanahoria muy picadas, añade la carne.', 'Agrega el tomate y cuece 20 min.', 'Mezcla con la pasta y un poco de queso.'], why: 'La zanahoria picada "desaparece" en la salsa.' },
  { key: 'berenjenas', name: 'Berenjenas rellenas de carne', icon: '🍆', meals: ['com', 'cen'], minutes: 50, kids: true, groups: ['roja', 'verdura', 'verdura'], ing: [[BERENJENA, 'Berenjena', 200], [TERNERA, 'Ternera picada magra', 80], [TOMATE_TRIT, 'Tomate triturado', 60], [CEBOLLA, 'Cebolla', 30], [QUESO_RALL, 'Queso rallado', 15], [AOVE, 'Aceite de oliva virgen extra', 8]], steps: ['Asa las berenjenas partidas 20 min y vacíalas.', 'Sofríe cebolla, carne, la pulpa y el tomate.', 'Rellena, pon queso y gratina 10 min.'] },
  { key: 'guisantesjamon', name: 'Guisantes con jamón y huevo', icon: '🫛', meals: ['cen', 'com'], minutes: 20, kids: true, groups: ['verdura', 'huevo', 'roja'], ing: [[GUISANTE, 'Guisantes', 180], [JAMON, 'Jamón serrano', 20], [CEBOLLA, 'Cebolla', 30], [HUEVO, 'Huevo', 60], [AOVE, 'Aceite de oliva virgen extra', 6]], steps: ['Rehoga la cebolla y el jamón en taquitos.', 'Añade los guisantes congelados y un poco de agua; 10 min.', 'Cuaja el huevo encima o sírvelo cocido.'] },
  // Huevo y cenas de verdura
  { key: 'tortillacalabacin', name: 'Tortilla de calabacín y cebolla', icon: '🍳', meals: ['cen'], minutes: 25, kids: true, groups: ['huevo', 'verdura'], ing: [[HUEVO, 'Huevos', 120], [CALABACIN, 'Calabacín', 150], [CEBOLLA, 'Cebolla', 30], [AOVE, 'Aceite de oliva virgen extra', 8], [PAN_INT, 'Pan integral', 30]], steps: ['Pocha calabacín y cebolla.', 'Mezcla con el huevo batido y cuaja.'] },
  { key: 'tortillaespinacas', name: 'Tortilla de espinacas y queso fresco', icon: '🍳', meals: ['cen'], minutes: 20, kids: true, groups: ['huevo', 'verdura', 'lacteo'], ing: [[HUEVO, 'Huevos', 110], [ESPINACA, 'Espinacas', 120], [QUESO, 'Queso fresco', 30], [AOVE, 'Aceite de oliva virgen extra', 6], [PAN_INT, 'Pan integral', 40]], steps: ['Saltea las espinacas.', 'Añade el huevo batido y el queso en dados; cuaja.'] },
  { key: 'revueltogambas', name: 'Revuelto de champiñones y gambas', icon: '🍤', meals: ['cen'], minutes: 15, kids: true, groups: ['huevo', 'pescado', 'verdura'], ing: [[HUEVO, 'Huevos', 110], [CHAMPI, 'Champiñones', 120], [GAMBA, 'Gambas peladas', 50], [AJO, 'Ajo', 3], [AOVE, 'Aceite de oliva virgen extra', 8], [PAN_INT, 'Pan integral', 40]], steps: ['Saltea ajo, champiñones y gambas.', 'Añade los huevos y remueve a fuego suave.'] },
  { key: 'coliflor', name: 'Coliflor gratinada con huevo duro', icon: '🥦', meals: ['cen'], minutes: 35, kids: true, groups: ['verdura', 'verdura', 'huevo', 'lacteo'], ing: [[COLIFLOR, 'Coliflor', 250], [LECHE, 'Leche semidesnatada', 100], [HARINA, 'Harina', 10], [QUESO_RALL, 'Queso rallado', 15], [HUEVO, 'Huevo', 60], [AOVE, 'Aceite de oliva virgen extra', 5]], steps: ['Cuece la coliflor 10 min.', 'Bechamel ligera con aceite, harina y leche.', 'Cubre la coliflor y el huevo duro, pon queso y gratina.'] },
  { key: 'gazpacho', name: 'Gazpacho con huevo duro y jamón', icon: '🍅', meals: ['cen', 'com'], minutes: 15, kids: true, groups: ['verdura', 'verdura', 'huevo'], ing: [[TOMATE, 'Tomate', 250], [PEPINO, 'Pepino', 50], [PIMIENTO, 'Pimiento rojo', 30], [AJO, 'Ajo', 2], [PAN_INT, 'Pan integral', 20], [AOVE, 'Aceite de oliva virgen extra', 10], [HUEVO, 'Huevo', 50], [JAMON, 'Jamón serrano', 15]], steps: ['Tritura tomate, pepino, pimiento, ajo, pan y aceite; enfría.', 'Sirve con huevo duro y jamón picados.'], why: 'Verdura cruda en verano, con poca sal.' },
  // ── Ampliación: desayunos ──
  { key: 'porridge', name: 'Porridge de avena con yogur griego y fresas', icon: '🥣', meals: ['des'], minutes: 10, kids: true, groups: ['lacteo', 'fruta'], ing: [[AVENA, 'Copos de avena', 40], [LECHE, 'Leche semidesnatada', 200], [YOGUR_GR, 'Yogur griego', 60], [FRESA, 'Fresas', 80]], steps: ['Cuece la avena en la leche 4 min.', 'Sirve con yogur griego y fresas.'] },
  { key: 'tortitas', name: 'Tortitas de avena, plátano y huevo', icon: '🥞', meals: ['des', 'mer'], minutes: 15, kids: true, groups: ['huevo', 'fruta', 'lacteo'], ing: [[AVENA, 'Copos de avena', 40], [HUEVO, 'Huevo', 60], [PLATANO, 'Plátano', 80], [LECHE, 'Leche semidesnatada', 50], [YOGUR, 'Yogur natural', 60], [AOVE, 'Aceite de oliva virgen extra', 3]], steps: ['Tritura avena, huevo, plátano y leche.', 'Haz tortitas pequeñas en sartén con unas gotas de aceite.', 'Sirve con yogur natural.'], why: 'Sin azúcar añadido: el dulzor lo pone el plátano.' },
  { key: 'tostadaaguacate', name: 'Tostada con aguacate y huevo + naranja', icon: '🥑', meals: ['des'], minutes: 10, kids: true, groups: ['huevo', 'fruta'], ing: [[PAN_INT, 'Pan integral', 60], [AGUACATE, 'Aguacate', 40], [HUEVO, 'Huevo', 60], [NARANJA, 'Naranja', 150]], steps: ['Tuesta el pan y unta el aguacate.', 'Pon encima un huevo a la plancha o cocido.', 'Naranja entera de postre.'] },
  { key: 'tostadapavo', name: 'Tostada con tomate, pavo y queso fresco + leche', icon: '🍞', meals: ['des'], minutes: 5, kids: true, groups: ['lacteo', 'blanca'], ing: [[PAN_INT, 'Pan integral', 60], [TOMATE, 'Tomate', 40], [PAVO_FIAMBRE, 'Pechuga de pavo (fiambre)', 30], [QUESO, 'Queso fresco', 30], [LECHE, 'Leche semidesnatada', 200]], steps: ['Tostada con tomate rallado, pavo y queso fresco.', 'Un vaso de leche.'], why: 'Elige pavo con más del 90 % de carne.' },
  { key: 'bolyogur', name: 'Bol de yogur griego con frutos rojos y almendras', icon: '🍓', meals: ['des', 'mer'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[YOGUR_GR, 'Yogur griego', 125], [FRAMBUESA, 'Frambuesas', 60], [FRESA, 'Fresas', 60], [AVENA, 'Copos de avena', 20], [ALMENDRA, 'Almendras', 10]], steps: ['Mezcla y sirve. Las frambuesas congeladas valen.'] },
  { key: 'revueltodes', name: 'Huevos revueltos con tostada y kiwi', icon: '🍳', meals: ['des'], minutes: 8, kids: true, groups: ['huevo', 'fruta'], ing: [[HUEVO, 'Huevos', 110], [PAN_INT, 'Pan integral', 50], [AOVE, 'Aceite de oliva virgen extra', 4], [KIWI, 'Kiwi', 100]], steps: ['Revuelve los huevos a fuego suave.', 'Acompaña con tostada y kiwi.'] },
  { key: 'tostadacacahuete', name: 'Tostada con crema de cacahuete y plátano + leche', icon: '🍌', meals: ['des', 'mer'], minutes: 5, kids: true, groups: ['lacteo', 'fruta'], ing: [[PAN_INT, 'Pan integral', 50], [CREMA_CACAH, 'Crema de cacahuete 100 %', 15], [PLATANO, 'Plátano', 60], [LECHE, 'Leche semidesnatada', 200]], steps: ['Unta la crema de cacahuete y pon el plátano en rodajas.', 'Un vaso de leche.'], why: 'Busca crema de cacahuete sin azúcar ni aceite de palma.' },
  { key: 'batidokefir', name: 'Batido de kéfir, plátano y avena', icon: '🥤', meals: ['des', 'mer'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[KEFIR, 'Kéfir', 200], [PLATANO, 'Plátano', 80], [AVENA, 'Copos de avena', 20], [CREMA_CACAH, 'Crema de cacahuete 100 %', 10]], steps: ['Tritura todo y sirve frío.'] },
  // ── Ampliación: media mañana (para la mochila) ──
  { key: 'bocpavo', name: 'Bocadillo integral de pavo y queso', icon: '🥪', meals: ['mm', 'mer'], minutes: 3, kids: true, groups: ['blanca', 'lacteo'], ing: [[PAN_INT, 'Pan integral', 60], [PAVO_FIAMBRE, 'Pechuga de pavo (fiambre)', 30], [QUESO_TIERNO, 'Queso tierno', 20], [TOMATE, 'Tomate', 20]], steps: ['Pan con tomate, pavo y queso. Envuelto aguanta la mañana.'] },
  { key: 'bocatun', name: 'Bocadillo de atún con tomate', icon: '🥖', meals: ['mm', 'mer'], minutes: 3, kids: true, groups: ['pescado'], ing: [[PAN_INT, 'Pan integral', 60], [ATUN, 'Atún al natural', 40], [TOMATE, 'Tomate', 30], [AOVE, 'Aceite de oliva virgen extra', 3]], steps: ['Pan con tomate rallado, atún escurrido y un hilo de aceite.'] },
  { key: 'mandarinaalmendras', name: 'Mandarinas y un puñado de almendras', icon: '🍊', meals: ['mm', 'mer'], minutes: 1, kids: true, groups: ['fruta'], ing: [[MANDARINA, 'Mandarinas', 150], [ALMENDRA, 'Almendras', 20]], steps: ['Dos mandarinas y unas 15 almendras en una bolsita.'], why: 'Frutos secos enteros, a partir de 5 años (AESAN); antes, molidos.' },
  { key: 'magdalenas', name: 'Magdalenas de avena y plátano sin azúcar', icon: '🧁', meals: ['mm', 'mer', 'des'], minutes: 35, kids: true, groups: ['fruta'], ing: [[AVENA, 'Copos de avena', 30], [PLATANO, 'Plátano', 50], [HUEVO, 'Huevo', 25], [LECHE, 'Leche semidesnatada', 30], [PASAS, 'Pasas', 10], [AOVE, 'Aceite de oliva virgen extra', 4]], steps: ['Tritura avena, plátano, huevo, leche y aceite con levadura.', 'Añade pasas, reparte en moldes y hornea 20 min a 180 °C.', 'Ración = 2 magdalenas; se congelan bien.'], why: 'Alternativa casera a la bollería del cole.' },
  { key: 'barritas', name: 'Barritas de avena, dátiles y cacahuete', icon: '🍫', meals: ['mm', 'mer'], minutes: 20, kids: true, groups: [], ing: [[AVENA, 'Copos de avena', 30], [DATIL, 'Dátiles', 20], [CREMA_CACAH, 'Crema de cacahuete 100 %', 10]], steps: ['Tritura los dátiles con la crema de cacahuete.', 'Mezcla con la avena, aplana en una bandeja y enfría 1 h en la nevera.', 'Corta en barritas.'], why: 'Energía para el recreo o antes del entreno de fútbol.' },
  { key: 'sandwichjamon', name: 'Sándwich integral de jamón cocido y queso', icon: '🥪', meals: ['mm', 'mer'], minutes: 3, kids: true, groups: ['roja', 'lacteo'], ing: [[PAN_INT, 'Pan integral de molde', 50], [JAMON_COC, 'Jamón cocido', 30], [QUESO_TIERNO, 'Queso tierno', 20], [TOMATE, 'Tomate', 30]], steps: ['Monta el sándwich con rodajas finas de tomate.'], why: 'Elige jamón cocido "extra" (sin féculas añadidas).' },
  // ── Ampliación: meriendas ──
  { key: 'batidofresas', name: 'Batido de leche con fresas y plátano', icon: '🍓', meals: ['mer', 'des'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[LECHE, 'Leche semidesnatada', 200], [FRESA, 'Fresas', 100], [PLATANO, 'Plátano', 50]], steps: ['Tritura todo; sin azúcar.'] },
  { key: 'hummus', name: 'Hummus con palitos de zanahoria y pepino', icon: '🥕', meals: ['mer'], minutes: 10, kids: true, groups: ['verdura'], ing: [[GARBANZO_C, 'Garbanzos cocidos (bote)', 80], [TAHINI, 'Tahini (pasta de sésamo)', 10], [LIMON, 'Zumo de limón', 5], [AOVE, 'Aceite de oliva virgen extra', 5], [ZANAHORIA, 'Zanahoria', 60], [PEPINO, 'Pepino', 60]], steps: ['Tritura garbanzos, tahini, limón, aceite y un poco de agua.', 'Sirve con bastones de zanahoria y pepino.'] },
  { key: 'edamame', name: 'Edamame con mandarina', icon: '🫛', meals: ['mer'], minutes: 6, kids: true, groups: ['legumbre', 'fruta'], ing: [[EDAMAME, 'Edamame (congelado)', 120], [MANDARINA, 'Mandarina', 100]], steps: ['Cuece el edamame 5 min, escúrrelo y sírvelo sin sal.', 'Que los niños desgranen las vainas.'] },
  { key: 'yogurkiwi', name: 'Yogur con kiwi y pipas de calabaza', icon: '🥝', meals: ['mer', 'des'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[YOGUR, 'Yogur natural', 125], [KIWI, 'Kiwi', 100], [PIPA_CALAB, 'Pipas de calabaza peladas', 10]], steps: ['Trocea el kiwi y mezcla.'] },
  { key: 'requeson', name: 'Requesón con pera, miel y nueces', icon: '🍐', meals: ['mer', 'des'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[REQUESON, 'Requesón', 125], [PERA, 'Pera', 120], [MIEL, 'Miel', 8], [NUEZ, 'Nueces', 10]], steps: ['Pera en dados sobre el requesón, un hilo de miel y nueces.'] },
  { key: 'cuajada', name: 'Cuajada con miel y nueces', icon: '🍮', meals: ['mer'], minutes: 2, kids: true, groups: ['lacteo'], ing: [[CUAJADA, 'Cuajada', 130], [MIEL, 'Miel', 8], [NUEZ, 'Nueces', 10]], steps: ['Una cucharadita de miel y nueces picadas por encima.'] },
  { key: 'batidocacahuete', name: 'Batido de leche, plátano y cacahuete (tras el deporte)', icon: '🥛', meals: ['mer', 'des'], minutes: 3, kids: true, groups: ['lacteo', 'fruta'], ing: [[LECHE, 'Leche semidesnatada', 300], [PLATANO, 'Plátano', 100], [CREMA_CACAH, 'Crema de cacahuete 100 %', 15]], steps: ['Tritura y toma en la hora siguiente al entreno.'], why: 'Proteína e hidratos para recuperar tras crossfit, pádel o fútbol. Para los niños, medio vaso.' },
]

export const SUG_SERVINGS = 4
