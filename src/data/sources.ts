// Fuentes oficiales que usa la app: solo organismos de referencia (OMS, EFSA, AESAN/BEDCA)
// y los estudios revisados por pares de los métodos de cálculo (PubMed).
export type SourceGroup = { org: string; items: { title: string; url: string; use: string }[] }

export const SOURCES: SourceGroup[] = [
  {
    org: 'OMS · Organización Mundial de la Salud',
    items: [
      { title: 'Alimentación saludable', url: 'https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet', use: 'Equilibrio del menú' },
      { title: 'Actividad física', url: 'https://www.who.int/es/news-room/fact-sheets/detail/physical-activity', use: 'Minutos recomendados' },
      { title: 'Directrices sobre actividad física y hábitos sedentarios', url: 'https://www.who.int/es/publications/b/55501', use: 'Adultos y niños' },
      { title: 'Directriz sobre grasas saturadas y trans (2023)', url: 'https://www.who.int/publications/i/item/9789240073630', use: 'Grasa saturada' },
      { title: 'Obesidad y sobrepeso', url: 'https://www.who.int/es/news-room/fact-sheets/detail/obesity-and-overweight', use: 'IMC' },
      { title: 'Perímetro de cintura: informe de expertos', url: 'https://www.who.int/publications/i/item/9789241501491', use: 'Cintura' },
      { title: 'Referencia de crecimiento 5–19 años: IMC para la edad', url: 'https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age', use: 'IMC de los niños' },
    ],
  },
  {
    org: 'EFSA · Autoridad Europea de Seguridad Alimentaria',
    items: [
      { title: 'Valores dietéticos de referencia', url: 'https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values', use: 'Proteína y nutrientes' },
      { title: 'DRV Finder (buscador de valores de referencia)', url: 'https://multimedia.efsa.europa.eu/drvs/index.htm', use: 'Por edad y sexo' },
      { title: 'Necesidades medias de energía', url: 'https://www.efsa.europa.eu/en/press/news/130110', use: 'Calorías y actividad' },
      { title: 'Valores de referencia de hidratos de carbono y fibra (2010)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1462', use: 'Hidratos y fibra' },
      { title: 'Valores de referencia de grasas (2010)', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1461', use: 'Grasa' },
      { title: 'Valores de referencia de sodio (2019)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7009309/', use: 'Sal por edad' },
    ],
  },
  {
    org: 'AESAN · Agencia Española de Seguridad Alimentaria y Nutrición',
    items: [
      { title: 'Recomendaciones dietéticas saludables y sostenibles (PDF)', url: 'https://www.aesan.gob.es/dam/jcr:26812ed7-ae7f-496a-a0d4-94ba36c63dc9/RECOMENDACIONES_DIETETICAS.pdf', use: 'Raciones por semana' },
      { title: 'Composición de alimentos (BEDCA)', url: 'https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/subseccion/composicion_alimentos_BD.htm', use: 'Datos de los alimentos' },
    ],
  },
  {
    org: 'Métodos de cálculo (estudios científicos en PubMed, NIH)',
    items: [
      { title: 'Ecuación de Mifflin-St Jeor (gasto en reposo)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/', use: 'Metabolismo basal' },
      { title: 'Compendio de Actividades Físicas 2024 (MET)', url: 'https://pubmed.ncbi.nlm.nih.gov/38242596/', use: 'Gasto de cada deporte' },
    ],
  },
]
