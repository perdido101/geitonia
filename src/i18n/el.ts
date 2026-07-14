// Greek is the default locale (RULE 3). Flat key → value. No logic here.
// Real content lands as later phases add UI; Phase 0 only needs the shell strings.

export const el: Record<string, string> = {
  'app.title': 'Γειτονιά',
  'app.subtitle': 'Μια συνοικία που ζει',
  'app.tagline': 'Το σκελετό στήθηκε. Ώρα να χτίσουμε τη γειτονιά.',

  'phase.0.status': 'Φάση 0 — Σκαλωσιά έτοιμη',
  'phase.0.booted': 'Η εφαρμογή ξεκίνησε.',
  'phase.0.saved': 'Το σύστημα αποθήκευσης λειτουργεί.',
  'phase.0.speaks': 'Μιλάει Ελληνικά.',
  'phase.0.placeholders': 'Σχεδιάζει placeholder για κάθε asset.',

  'settings.language': 'Γλώσσα',
  'settings.language.el': 'Ελληνικά',
  'settings.language.en': 'Αγγλικά',

  'save.new': 'Νέο παιχνίδι',
  'save.saved': 'Αποθηκεύτηκε',
  'save.reset': 'Διαγραφή αποθήκευσης',
  'save.day': 'Ημέρα',

  'common.money': 'Χρήματα',
  'common.debt': 'Χρέος',
  'common.reputation': 'Φήμη',
};
