// Display names for items (recipes carry only keys/assets). Content, so it lives in data.
// Station/shop/archetype/regular names live on their own defs (nameEL/nameEN).

export interface Label {
  el: string;
  en: string;
}

export const ITEM_LABELS: Record<string, Label> = {
  // Καφενείο
  ellinikos: { el: 'Ελληνικός', en: 'Greek coffee' },
  soda: { el: 'Σόδα', en: 'Soda' },
  nescafe: { el: 'Νεσκαφέ', en: 'Nescafé' },
  frape: { el: 'Φραπές', en: 'Frappé' },
  freddo_espresso: { el: 'Freddo espresso', en: 'Freddo espresso' },
  freddo_cappuccino: { el: 'Freddo cappuccino', en: 'Freddo cappuccino' },
  // Φούρνος
  koulouri: { el: 'Κουλούρι', en: 'Sesame ring' },
  kritsinia: { el: 'Κριτσίνια', en: 'Breadsticks' },
  psomi: { el: 'Ψωμί', en: 'Bread' },
  tiropita: { el: 'Τυρόπιτα', en: 'Cheese pie' },
  spanakopita: { el: 'Σπανακόπιτα', en: 'Spinach pie' },
  ladopsomo: { el: 'Λαδόψωμο', en: 'Oil bread' },
  bougatsa: { el: 'Μπουγάτσα', en: 'Bougatsa' },
  // Σουβλατζίδικο
  tzatziki: { el: 'Τζατζίκι', en: 'Tzatziki' },
  patates: { el: 'Πατάτες', en: 'Fries' },
  kalamaki: { el: 'Καλαμάκι', en: 'Skewer' },
  pita_souvlaki: { el: 'Πίτα σουβλάκι', en: 'Souvlaki pita' },
  pita_gyros: { el: 'Πίτα γύρο', en: 'Gyros pita' },
  pita_apola: { el: "Πίτα απ' όλα", en: 'Loaded pita' },
  merida_gyros: { el: 'Μερίδα γύρο', en: 'Gyros platter' },
  // Περίπτερο
  nero: { el: 'Νερό', en: 'Water' },
  frigania: { el: 'Φρυγανιές', en: 'Rusks' },
  gum: { el: 'Τσίχλα', en: 'Gum' },
  efimerida: { el: 'Εφημερίδα', en: 'Newspaper' },
  lachio: { el: 'Λαχείο', en: 'Lottery' },
  pagoto: { el: 'Παγωτό', en: 'Ice cream' },
  tsigara: { el: 'Τσιγάρα', en: 'Cigarettes' },
  // Ζαχαροπλαστείο
  loukoumades: { el: 'Λουκουμάδες', en: 'Loukoumades' },
  baklava: { el: 'Μπακλαβάς', en: 'Baklava' },
  kataifi: { el: 'Κανταΐφι', en: 'Kataifi' },
  profiterol: { el: 'Προφιτερόλ', en: 'Profiterole' },
  galaktoboureko: { el: 'Γαλακτομπούρεκο', en: 'Galaktoboureko' },
  ekmek: { el: 'Εκμέκ', en: 'Ekmek' },
  tourta: { el: 'Τούρτα', en: 'Cake' },
  // Ψαροταβέρνα
  ouzo_glass: { el: 'Ούζο', en: 'Ouzo' },
  horiatiki: { el: 'Χωριάτικη', en: 'Village salad' },
  gavros: { el: 'Γαύρος', en: 'Anchovies' },
  kalamaraki: { el: 'Καλαμαράκι', en: 'Squid' },
  htapodi: { el: 'Χταπόδι', en: 'Octopus' },
  barbouni: { el: 'Μπαρμπούνι', en: 'Red mullet' },
  tsipoura: { el: 'Τσιπούρα', en: 'Sea bream' },
  // Μεζεδοπωλείο
  karafaki: { el: 'Καραφάκι', en: 'Ouzo carafe' },
  fava: { el: 'Φάβα', en: 'Fava' },
  taramas: { el: 'Ταραμάς', en: 'Taramas' },
  melitzanosalata: { el: 'Μελιτζανοσαλάτα', en: 'Eggplant dip' },
  dolmadakia: { el: 'Ντολμαδάκια', en: 'Dolmades' },
  saganaki: { el: 'Σαγανάκι', en: 'Saganaki' },
  keftedakia: { el: 'Κεφτεδάκια', en: 'Meatballs' },
  pikilia: { el: 'Ποικιλία', en: 'Meze platter' },
};

export function itemLabel(itemKey: string): Label {
  return ITEM_LABELS[itemKey] ?? { el: itemKey, en: itemKey };
}
