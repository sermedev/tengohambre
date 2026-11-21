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
]

export const SUG_SERVINGS = 4
