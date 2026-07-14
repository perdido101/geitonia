import type { ArchetypeDef, RegularDef } from './types';

// §5.4 — 10 archetypes + 8 named Regulars.
//
// shopWeights: which shops an archetype frequents, and how strongly.
// monthWeights: seasonality multiplier per month (absent month → 1). touristas is the
// only strongly seasonal archetype (≈0 outside summer), per §4.3/§4.6.

export const ARCHETYPES: Record<string, ArchetypeDef> = {
  pappous: {
    key: 'pappous', nameEL: 'Παππούς', nameEN: 'Grandpa',
    patienceDrainRate: 0.03, orderSize: [1, 1], tipMult: 0.8,
    shopWeights: { kafeneio: 3, fournos: 1.5, periptero: 1 },
    monthWeights: {}, assetPrefix: 'cu_pappous',
  },
  giagia: {
    key: 'giagia', nameEL: 'Γιαγιά', nameEN: 'Grandma',
    patienceDrainRate: 0.06, orderSize: [2, 3], tipMult: 1.2,
    shopWeights: { fournos: 3, kafeneio: 1.5, zacharoplasteio: 1.5, periptero: 1 },
    monthWeights: {}, assetPrefix: 'cu_giagia',
  },
  mathitis: {
    key: 'mathitis', nameEL: 'Μαθητής', nameEN: 'Student',
    patienceDrainRate: 0.12, orderSize: [1, 2], tipMult: 0.7,
    shopWeights: { souvlatzidiko: 3, periptero: 2, kafeneio: 1.5, zacharoplasteio: 1 },
    monthWeights: {}, assetPrefix: 'cu_mathitis',
  },
  taxitzis: {
    key: 'taxitzis', nameEL: 'Ταξιτζής', nameEN: 'Taxi driver',
    patienceDrainRate: 0.18, orderSize: [1, 1], tipMult: 1.0,
    shopWeights: { souvlatzidiko: 2.5, periptero: 2, kafeneio: 1.5 },
    monthWeights: {}, assetPrefix: 'cu_taxitzis',
  },
  ypallilos: {
    key: 'ypallilos', nameEL: 'Υπάλληλος', nameEN: 'Office worker',
    patienceDrainRate: 0.09, orderSize: [1, 2], tipMult: 1.0,
    shopWeights: { kafeneio: 2, fournos: 2, souvlatzidiko: 2, periptero: 1.5, zacharoplasteio: 1 },
    monthWeights: {}, assetPrefix: 'cu_ypallilos',
  },
  touristas: {
    key: 'touristas', nameEL: 'Τουρίστας', nameEN: 'Tourist',
    patienceDrainRate: 0.14, orderSize: [2, 3], tipMult: 2.0,
    shopWeights: { psarotaverna: 3, souvlatzidiko: 2, kafeneio: 1.5, zacharoplasteio: 1.5, mezedopoleio: 1.5, periptero: 1 },
    monthWeights: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0.5, 6: 2, 7: 3, 8: 2, 9: 1, 10: 0, 11: 0, 12: 0 },
    assetPrefix: 'cu_touristas',
  },
  mama: {
    key: 'mama', nameEL: 'Μαμά με παιδί', nameEN: 'Mother with child',
    patienceDrainRate: 0.05, orderSize: [3, 4], tipMult: 1.3,
    shopWeights: { fournos: 2, zacharoplasteio: 2, periptero: 1.5, souvlatzidiko: 1.5, kafeneio: 1 },
    monthWeights: {}, assetPrefix: 'cu_mama',
  },
  parea: {
    key: 'parea', nameEL: 'Νεαρή παρέα', nameEN: 'Group of friends',
    patienceDrainRate: 0.08, orderSize: [4, 4], tipMult: 1.4,
    shopWeights: { souvlatzidiko: 2.5, mezedopoleio: 2, psarotaverna: 1.5, kafeneio: 1.5 },
    monthWeights: {}, assetPrefix: 'cu_parea',
  },
  ergatis: {
    key: 'ergatis', nameEL: 'Εργάτης', nameEN: 'Laborer',
    patienceDrainRate: 0.07, orderSize: [1, 2], tipMult: 1.0,
    shopWeights: { kafeneio: 2, fournos: 2, souvlatzidiko: 2, periptero: 1.5 },
    monthWeights: {}, assetPrefix: 'cu_ergatis',
  },
  kyria_skylo: {
    key: 'kyria_skylo', nameEL: 'Κυρία με σκύλο', nameEN: 'Lady with dog',
    patienceDrainRate: 0.15, orderSize: [1, 1], tipMult: 0.6,
    shopWeights: { kafeneio: 1.5, fournos: 1.5, zacharoplasteio: 1.5, periptero: 1 },
    monthWeights: {}, assetPrefix: 'cu_kyria_skylo',
  },
};

export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

// All Regulars: patienceDrainRate 0.10, spawnChance 0.15. They pay 3× and failing them
// costs double. NOTE: §5.4 lists Θεία Βούλα ordering "frape + tiropita", but tiροπιτα is a
// Φούρνος recipe and her shop is the Καφενείο — that would fail data/validate (favoriteOrder
// must stay in the shop's pool), so her second item is a Καφενείο one (nescafe).

export const REGULARS: Record<string, RegularDef> = {
  thanasis: {
    key: 'thanasis', nameEL: 'Κυρ-Θανάσης', nameEN: 'Old man Thanasis',
    shopKey: 'kafeneio', repThreshold: 30, spawnChance: 0.15,
    favoriteOrder: ['ellinikos'], patienceDrainRate: 0.1,
    personalityEL: 'Σαράντα χρόνια σε αυτό το καφενείο. Διαβάζει την εφημερίδα. Σε κρίνει σιωπηλά.',
    personalityEN: 'Forty years in this kafeneio. Reads the paper. Judges you in silence.',
    assetPrefix: 'rg_thanasis',
  },
  mitsos: {
    key: 'mitsos', nameEL: 'Ο Μήτσος ο ταξιτζής', nameEN: 'Mitsos the cabbie',
    shopKey: 'souvlatzidiko', repThreshold: 40, spawnChance: 0.15,
    favoriteOrder: ['pita_apola'], patienceDrainRate: 0.1,
    personalityEL: 'Διπλοπαρκαρισμένος απ’ έξω. Πάντα. Με τη μηχανή αναμμένη.',
    personalityEN: 'Double-parked outside. Always. Engine running.',
    assetPrefix: 'rg_mitsos',
  },
  roula: {
    key: 'roula', nameEL: 'Δεσποινίς Ρούλα', nameEN: 'Miss Roula',
    shopKey: 'fournos', repThreshold: 45, spawnChance: 0.15,
    favoriteOrder: ['bougatsa'], patienceDrainRate: 0.1,
    personalityEL: 'Δασκάλα. Διορθώνει τα ελληνικά σου. Αφήνει καλό φιλοδώρημα αν είσαι ευγενικός.',
    personalityEN: 'Teacher. Corrects your Greek. Tips well if you are polite.',
    assetPrefix: 'rg_roula',
  },
  voula: {
    key: 'voula', nameEL: 'Θεία Βούλα', nameEN: 'Aunt Voula',
    shopKey: 'kafeneio', repThreshold: 50, spawnChance: 0.15,
    favoriteOrder: ['frape', 'nescafe'], patienceDrainRate: 0.1,
    personalityEL: 'Ξέρει τα πάντα για τον καθένα. Θα το πει στη μάνα σου.',
    personalityEN: 'Knows everything about everyone. Will tell your mother.',
    assetPrefix: 'rg_voula',
  },
  spyros: {
    key: 'spyros', nameEL: 'Ο Σπύρος', nameEN: 'Spyros',
    shopKey: 'psarotaverna', repThreshold: 50, spawnChance: 0.15,
    favoriteOrder: ['ouzo_glass', 'gavros'], patienceDrainRate: 0.1,
    personalityEL: 'Ψαράς. Σου φέρνει την καλή ψαριά — αν η φήμη σου είναι ψηλά.',
    personalityEN: 'Fisherman. Brings you the good catch — if your rep is high.',
    assetPrefix: 'rg_spyros',
  },
  panagiotis: {
    key: 'panagiotis', nameEL: 'Ο Παναγιώτης', nameEN: 'Panagiotis',
    shopKey: 'mezedopoleio', repThreshold: 55, spawnChance: 0.15,
    favoriteOrder: ['karafaki', 'pikilia'], patienceDrainRate: 0.1,
    personalityEL: 'Έχει τρία κτίρια. Παραπονιέται για το ενοίκιο ούτως ή άλλως.',
    personalityEN: 'Owns three buildings. Complains about rent anyway.',
    assetPrefix: 'rg_panagiotis',
  },
  eleni: {
    key: 'eleni', nameEL: 'Η Ελένη', nameEN: 'Eleni',
    shopKey: 'kafeneio', repThreshold: 60, spawnChance: 0.15,
    favoriteOrder: ['freddo_cappuccino'], patienceDrainRate: 0.1,
    personalityEL: 'Έχει το κομμωτήριο δίπλα. Η μόνη σου πραγματική σύμμαχος.',
    personalityEN: 'Runs the salon next door. Your only real ally.',
    assetPrefix: 'rg_eleni',
  },
  kostas: {
    key: 'kostas', nameEL: 'Ο Κώστας ο Εφοριακός', nameEN: 'Kostas the taxman',
    shopKey: 'kafeneio', repThreshold: 70, spawnChance: 0.15,
    favoriteOrder: ['ellinikos'], patienceDrainRate: 0.1,
    personalityEL: 'Εφορία. Εμφανίζεται τον Απρίλιο. Δυσοίωνος.',
    personalityEN: 'Tax office. Appears in April. Ominous.',
    assetPrefix: 'rg_kostas',
  },
};

export const REGULAR_KEYS = Object.keys(REGULARS);

export function regularsForShop(shopKey: string): RegularDef[] {
  return REGULAR_KEYS.map((k) => REGULARS[k]).filter((rg) => rg.shopKey === shopKey);
}
