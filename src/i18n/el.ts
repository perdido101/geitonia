// Greek is the default locale (RULE 3). Flat key → value, no logic.

export const el: Record<string, string> = {
  'app.title': 'Γειτονιά',
  'app.subtitle': 'Μια συνοικία που ζει',

  // Common
  'common.money': 'Χρήματα',
  'common.debt': 'Χρέος',
  'common.reputation': 'Φήμη',
  'common.day': 'Ημέρα',
  'common.close': 'Κλείσιμο',
  'common.cancel': 'Άκυρο',
  'common.confirm': 'Εντάξει',
  'common.buy': 'Αγορά',
  'common.back': 'Πίσω',
  'common.locked': 'Κλειδωμένο',
  'common.yes': 'Ναι',
  'common.no': 'Όχι',

  // Settings / save
  'settings.language': 'Γλώσσα',
  'settings.language.el': 'Ελληνικά',
  'settings.language.en': 'Αγγλικά',
  'settings.sound': 'Ήχος',
  'settings.title': 'Ρυθμίσεις',
  'save.new': 'Νέο παιχνίδι',
  'save.saved': 'Αποθηκεύτηκε',
  'save.reset': 'Διαγραφή αποθήκευσης',
  'save.confirmReset': 'Σίγουρα; Θα χαθεί η πρόοδος.',

  // Title screen
  'title.play': 'Παίξε',
  'title.continue': 'Συνέχεια',
  'title.tagline': 'Κληρονόμησες ένα καφενείο.',

  // Map HUD & nodes
  'map.avgRep': 'Μέση φήμη',
  'map.settings': 'Ρυθμίσεις',
  'map.confirmOpen': 'Άνοιγμα βάρδιας;',
  'map.open': 'Άνοιξε',
  'map.upgrades': 'Αναβαθμίσεις',
  'map.poleitai': 'ΠΩΛΕΙΤΑΙ',
  'map.unlockReqRep': 'Φήμη {rep} στο {shop}',
  'map.unlockReqThree': 'Φήμη {rep} σε 3 μαγαζιά',
  'map.unlockCost': 'Κόστος: €{cost}',
  'map.unlockNow': 'Αγόρασε το μαγαζί',
  'map.recenter': 'Κέντραρε',

  // Shift
  'shift.time': 'Χρόνος',
  'shift.earned': 'Έσοδα',
  'shift.lastOrders': 'ΤΕΛΕΥΤΑΙΕΣ ΠΑΡΑΓΓΕΛΙΕΣ',
  'shift.pick': 'Διάλεξε',
  'shift.discardHint': 'Άγγιξε το κενό για απόρριψη',
  'shift.tapToCollect': 'Άγγιξε για συλλογή',
  'shift.holding': 'Κρατάς',
  'shift.regularArrived': 'Ήρθε τακτικός πελάτης!',

  // Πλατεία
  'plateia.title': 'Πλατεία',
  'plateia.chat': 'Κουβέντα',
  'plateia.chatted': 'Μιλήσατε ήδη σήμερα',
  'plateia.empty': 'Κανείς τακτικός δεν είναι εδώ ακόμα.',
  'plateia.repGain': '+{n} φήμη',

  // Λαϊκή
  'laiki.title': 'Λαϊκή αγορά',
  'laiki.closed': 'Η λαϊκή είναι κλειστή σήμερα.',
  'laiki.buy': 'Αγόρασε έκπτωση υλικών',
  'laiki.desc': 'Τα υλικά της επόμενης βάρδιας: 30% → 20% των εσόδων.',
  'laiki.bought': 'Η έκπτωση ενεργοποιήθηκε!',
  'laiki.price': 'Τιμή: €{price}',

  // Τράπεζα
  'trapeza.title': 'Τράπεζα',
  'trapeza.debt': 'Τρέχον χρέος',
  'trapeza.interest': 'Τόκος: 5% / μήνα',
  'trapeza.upcoming': 'Επόμενος λογαριασμός',
  'trapeza.rent': 'Ενοίκιο',
  'trapeza.efka': 'ΕΦΚΑ',
  'trapeza.borrow': 'Δανείσου',
  'trapeza.repay': 'Ξεπλήρωσε',
  'trapeza.borrow200': 'Δανείσου €{n}',
  'trapeza.repay200': 'Ξεπλήρωσε €{n}',

  // Εκκλησία / Σπίτι / Εφορία
  'ekklisia.title': 'Εκκλησία',
  'ekklisia.none': 'Ήσυχη μέρα στην εκκλησία.',
  'spiti.title': 'Το σπίτι σου',
  'spiti.sleep': 'Κοιμήσου',
  'spiti.roster': 'Τακτικοί πελάτες',
  'spiti.calendar': 'Ημερολόγιο',
  'spiti.save': 'Αποθήκευση',
  'eforia.title': 'Εφορία',
  'eforia.bill': 'Φόρος: €{n}',
  'eforia.desc': 'Ο φόρος βασίζεται στα συνολικά σου έσοδα.',
  'eforia.pay': 'Πλήρωσε τον φόρο',
  'eforia.paid': 'Ο φόρος πληρώθηκε.',

  // Shift summary
  'summary.title': 'Τέλος ημέρας',
  'summary.served': 'Σερβιρίστηκαν',
  'summary.left': 'Έφυγαν',
  'summary.revenue': 'Έσοδα',
  'summary.ingredients': 'Πρώτες ύλες',
  'summary.rent': 'Ενοίκιο',
  'summary.efka': 'ΕΦΚΑ',
  'summary.net': 'ΚΑΘΑΡΑ',
  'summary.repChange': 'Μεταβολή φήμης',
  'summary.newRegular': 'Νέος τακτικός: {name}',
  'summary.continue': 'Συνέχεια',

  // Upgrades
  'upgrade.title': 'Αναβαθμίσεις',
  'upgrade.tier': 'Επίπεδο {n}',
  'upgrade.maxed': 'Στο μέγιστο',
  'upgrade.cost': '€{cost}',
  'upgrade.speed': 'Ταχύτητα',
  'upgrade.capacity': 'Χωρητικότητα',
  'upgrade.quality': 'Ποιότητα',
  'upgrade.comfort': 'Άνεση',

  // Roster
  'roster.title': 'Τακτικοί πελάτες',
  'roster.served': 'Σερβιρίστηκε',
  'roster.failed': 'Απέτυχε',
  'roster.standing': 'Σχέση',
  'roster.favorite': 'Παραγγέλνει',
  'roster.lockedReq': 'Φήμη {rep} στο {shop}',
  'roster.locked': '???',

  // Calendar
  'calendar.title': 'Ημερολόγιο',
  'calendar.current': 'Τρέχων μήνας',
  'calendar.augustWarning': 'ΠΡΟΣΟΧΗ — Η ΓΕΙΤΟΝΙΑ ΑΔΕΙΑΖΕΙ',
  'calendar.event': 'Γεγονός',

  // Game over
  'gameover.title': 'ΤΕΛΟΣ',
  'gameover.desc': 'Το χρέος σε νίκησε.',
  'gameover.lifetime': 'Συνολικά έσοδα',
  'gameover.days': 'Ημέρες',
  'gameover.restart': 'Ξανά από την αρχή',

  // Onboarding tooltips
  'tut.tapBriki': 'Άγγιξε το μπρίκι για να φτιάξεις ελληνικό.',
  'tut.wait': 'Περίμενε να ετοιμαστεί...',
  'tut.collect': 'Άγγιξε το μπρίκι για να πάρεις τον καφέ.',
  'tut.serve': 'Άγγιξε τον πελάτη για να τον σερβίρεις.',
  'tut.welcome': 'Καλώς ήρθες στο καφενείο σου.',
};
