// Catálogo de la compra: productos genéricos habituales del supermercado (sin marcas), por sección.
// La familia lo amplía con «Mis productos» (tabla saved_products).

export const SECTIONS = ['Fruta y verdura', 'Carne y pescado', 'Lácteos y huevos', 'Panadería', 'Despensa', 'Platos preparados', 'Congelados', 'Bebidas', 'Higiene personal', 'Limpieza y hogar', 'Otros'] as const
export type Section = (typeof SECTIONS)[number]

export const CATALOG: Record<Section, string[]> = {
  'Fruta y verdura':['Manzanas','Plátanos','Naranjas','Mandarinas','Peras','Uvas','Fresas','Kiwis','Melón','Sandía','Piña','Limones','Aguacates','Tomates','Lechuga','Canónigos','Espinacas frescas','Pepino','Pimiento rojo','Pimiento verde','Cebollas','Ajos','Patatas','Zanahorias','Calabacín','Berenjena','Brócoli','Coliflor','Calabaza','Judías verdes','Champiñones','Puerros','Apio','Perejil fresco','Boniato'],
  'Carne y pescado':['Pechuga de pollo','Muslos de pollo','Pollo entero','Pavo en filetes','Carne picada mixta','Carne picada de ternera','Filetes de ternera','Lomo de cerdo','Costillas de cerdo','Hamburguesas de vacuno','Salchichas frescas','Jamón serrano','Jamón cocido','Pechuga de pavo en lonchas','Chorizo','Merluza','Salmón','Bacalao','Dorada','Lubina','Sardinas','Boquerones','Gambas','Mejillones','Calamares','Sepia'],
  'Lácteos y huevos':['Leche entera','Leche semidesnatada','Leche desnatada','Yogures naturales','Yogures de sabores','Kéfir','Queso fresco','Queso en lonchas','Queso rallado','Queso curado','Mantequilla','Nata para cocinar','Huevos (docena)','Bebida de avena'],
  'Panadería':['Barra de pan','Pan integral','Pan de molde','Pan de molde integral','Pan rallado','Tostadas','Tortillas de trigo','Picos de pan'],
  'Despensa':['Arroz','Arroz integral','Macarrones','Espaguetis','Fideos','Lentejas','Garbanzos','Alubias','Garbanzos cocidos (bote)','Lentejas cocidas (bote)','Copos de avena','Cereales de desayuno','Harina','Azúcar','Sal','Aceite de oliva virgen extra','Aceite de girasol','Vinagre','Tomate frito','Tomate triturado','Atún en lata','Sardinas en lata','Caldo de pollo','Caldo de verduras','Especias variadas','Pimentón','Orégano','Café','Cacao en polvo','Infusiones','Miel','Mermelada','Frutos secos','Nueces','Galletas','Chocolate negro','Aceitunas'],
  'Congelados':['Guisantes congelados','Verduras para salteado','Espinacas congeladas','Judías verdes congeladas','Merluza congelada','Gambas congeladas','Varitas de pescado','Pizza congelada','Helado'],
  'Bebidas':['Agua','Agua con gas','Zumo de naranja','Refrescos','Cerveza','Vino'],
  'Higiene personal':['Gel de ducha','Champú','Acondicionador','Pasta de dientes','Cepillos de dientes','Desodorante','Jabón de manos','Crema hidratante','Protector solar','Maquinillas de afeitar','Compresas','Tampones','Bastoncillos','Pañuelos de papel'],
  'Limpieza y hogar':['Papel higiénico','Papel de cocina','Detergente','Suavizante','Lavavajillas a mano','Pastillas lavavajillas','Lejía','Limpiador multiusos','Limpiacristales','Friegasuelos','Estropajos','Bayetas','Bolsas de basura','Papel de aluminio','Film transparente','Papel de horno','Bolsas de congelación','Ambientador','Pilas'],
  'Otros':['Comida para mascotas','Velas de cumpleaños','Servilletas'],
  'Platos preparados': ['Tortilla de patatas', 'Gazpacho', 'Hummus', 'Ensaladilla rusa', 'Croquetas', 'Lasaña'],
}

/** Lo que casi siempre se compra: aparece como atajo encima de la lista. */
export const HABITUALES: [string, Section][] = [['Papel higiénico', 'Limpieza y hogar'], ['Gel de ducha', 'Higiene personal'], ['Champú', 'Higiene personal'], ['Pasta de dientes', 'Higiene personal'], ['Desodorante', 'Higiene personal'], ['Detergente', 'Limpieza y hogar'], ['Suavizante', 'Limpieza y hogar'], ['Lavavajillas', 'Limpieza y hogar'], ['Bolsas de basura', 'Limpieza y hogar'], ['Papel de cocina', 'Limpieza y hogar'], ['Café', 'Despensa'], ['Agua', 'Bebidas'], ['Leche', 'Lácteos y huevos'], ['Pan de molde', 'Panadería'], ['Fruta variada', 'Fruta y verdura']]
