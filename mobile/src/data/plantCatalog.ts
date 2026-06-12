export type PlantCategory = 'Grass' | 'Forb' | 'Brush'
export type ForageValue = 'Bad' | 'Fair' | 'Good' | 'Great'

export interface PlantSpecies {
  id: string
  commonName: string
  scientificName: string
  category: PlantCategory
  /** Forage value for livestock & wildlife. */
  forageValue: ForageValue
  description: string
  imageUrl: string
  /** Extra search terms (traits, alternate names). */
  keywords: string[]
}

/**
 * Curated catalog of common North American rangeland plants. This backs the
 * identification interface: a search over name/trait keywords returns candidate
 * matches the user can confirm. A real image-recognition service (e.g. Pl@ntNet
 * or iNaturalist's vision API) could be swapped in behind `identifyPlants` by
 * mapping its results onto these species records.
 */
export const PLANT_CATALOG: PlantSpecies[] = [
  {
    id: 'blue-grama',
    commonName: 'Blue Grama',
    scientificName: 'Bouteloua gracilis',
    category: 'Grass',
    forageValue: 'Great',
    description:
      'Warm-season native bunchgrass with distinctive eyebrow-shaped seed heads. Highly palatable and very drought tolerant — excellent forage for cattle and wildlife.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Bouteloua_gracilis.jpg/330px-Bouteloua_gracilis.jpg',
    keywords: ['grama', 'warm season', 'bunchgrass', 'eyebrow', 'drought'],
  },
  {
    id: 'western-wheatgrass',
    commonName: 'Western Wheatgrass',
    scientificName: 'Pascopyrum smithii',
    category: 'Grass',
    forageValue: 'Good',
    description:
      'Cool-season native sod-forming grass with blue-green, ribbed leaves. Good forage value and a dependable producer on heavy clay soils.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Pascopyrum_smithii_NRCS-2.jpg/330px-Pascopyrum_smithii_NRCS-2.jpg',
    keywords: ['wheatgrass', 'cool season', 'sod', 'blue-green', 'clay'],
  },
  {
    id: 'cheatgrass',
    commonName: 'Cheatgrass',
    scientificName: 'Bromus tectorum',
    category: 'Grass',
    forageValue: 'Fair',
    description:
      'Invasive cool-season annual grass. Provides fair early-spring forage but quickly matures into sharp awns that are nearly worthless and a fire hazard.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bromus_tectorum_%E2%80%94_Flora_Batava_%E2%80%94_Volume_v13.jpg/330px-Bromus_tectorum_%E2%80%94_Flora_Batava_%E2%80%94_Volume_v13.jpg',
    keywords: ['cheat grass', 'downy brome', 'invasive', 'annual', 'awns'],
  },
  {
    id: 'big-sagebrush',
    commonName: 'Big Sagebrush',
    scientificName: 'Artemisia tridentata',
    category: 'Brush',
    forageValue: 'Fair',
    description:
      'Iconic silvery aromatic shrub with three-toothed leaves. Low value for cattle but critical cover and winter browse for sage-grouse, pronghorn, and deer.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Sagebrushsjc.jpg/330px-Sagebrushsjc.jpg',
    keywords: ['sage', 'sagebrush', 'shrub', 'aromatic', 'wildlife', 'browse'],
  },
  {
    id: 'fourwing-saltbush',
    commonName: 'Fourwing Saltbush',
    scientificName: 'Atriplex canescens',
    category: 'Brush',
    forageValue: 'Good',
    description:
      'Evergreen browse shrub with four-winged seeds. Nutritious year-round browse, holding protein into winter — good for livestock and wildlife.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Atriplex_canescens_habit.jpg/330px-Atriplex_canescens_habit.jpg',
    keywords: ['saltbush', 'chamiza', 'browse', 'shrub', 'evergreen', 'protein'],
  },
  {
    id: 'scarlet-globemallow',
    commonName: 'Scarlet Globemallow',
    scientificName: 'Sphaeralcea coccinea',
    category: 'Forb',
    forageValue: 'Good',
    description:
      'Low-growing native forb with orange-red blooms and grey, lobed leaves. Palatable and grazed by livestock, pronghorn, and small mammals.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Globemallow_%28Sphaeralcea_coccinea%29_%289471470335%29.jpg/330px-Globemallow_%28Sphaeralcea_coccinea%29_%289471470335%29.jpg',
    keywords: ['globemallow', 'mallow', 'forb', 'orange', 'wildflower'],
  },
  {
    id: 'purple-prairie-clover',
    commonName: 'Purple Prairie Clover',
    scientificName: 'Dalea purpurea',
    category: 'Forb',
    forageValue: 'Great',
    description:
      'Native legume forb with cone-shaped purple flower heads. High protein, nitrogen-fixing, and highly preferred by livestock and pollinators.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Dalea_purpurea_Arkansas.jpg/330px-Dalea_purpurea_Arkansas.jpg',
    keywords: ['clover', 'legume', 'forb', 'purple', 'nitrogen', 'pollinator'],
  },
  {
    id: 'alfalfa',
    commonName: 'Alfalfa',
    scientificName: 'Medicago sativa',
    category: 'Forb',
    forageValue: 'Great',
    description:
      'Deep-rooted perennial legume with purple flowers. One of the highest-quality forages available — excellent protein and energy for livestock.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/75_Medicago_sativa_L.jpg/330px-75_Medicago_sativa_L.jpg',
    keywords: ['alfalfa', 'lucerne', 'legume', 'hay', 'forb', 'protein'],
  },
  {
    id: 'broom-snakeweed',
    commonName: 'Broom Snakeweed',
    scientificName: 'Gutierrezia sarothrae',
    category: 'Forb',
    forageValue: 'Bad',
    description:
      'Low, broom-like half-shrub with tiny yellow flowers. An unpalatable increaser that can be toxic to livestock; abundance signals range in poor condition.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Gutierrezia_sarothrae_-_Robb_Hannawacker_01.jpg/330px-Gutierrezia_sarothrae_-_Robb_Hannawacker_01.jpg',
    keywords: ['snakeweed', 'broomweed', 'toxic', 'increaser', 'yellow'],
  },
  {
    id: 'rubber-rabbitbrush',
    commonName: 'Rubber Rabbitbrush',
    scientificName: 'Ericameria nauseosa',
    category: 'Brush',
    forageValue: 'Bad',
    description:
      'Rounded shrub with flexible stems and bright yellow late-season blooms. Generally unpalatable with low forage value, though it offers some wildlife cover.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Chrysothamnus_nauseosus_7991.jpg/330px-Chrysothamnus_nauseosus_7991.jpg',
    keywords: ['rabbitbrush', 'chamisa', 'shrub', 'yellow', 'unpalatable'],
  },
]

/**
 * Ranks catalog species against a free-text query (name, scientific name,
 * category, or trait keywords). An empty query returns the full catalog.
 */
export function identifyPlants(query: string): PlantSpecies[] {
  const q = query.trim().toLowerCase()
  if (!q) return PLANT_CATALOG

  const terms = q.split(/\s+/)
  const scored = PLANT_CATALOG.map((species) => {
    const haystack = [
      species.commonName,
      species.scientificName,
      species.category,
      species.forageValue,
      ...species.keywords,
    ]
      .join(' ')
      .toLowerCase()
    let score = 0
    for (const term of terms) {
      if (species.commonName.toLowerCase().includes(term)) score += 3
      else if (haystack.includes(term)) score += 1
    }
    return { species, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.species)
}
