import type { DialogueSet } from './types';
import { REGULAR_KEYS } from './customers';

// §5.6 — per Regular: greeting, served_happy, left_angry, plateia_idle.
// Placeholder Greek — the writing is a separate pass. Every line marked TODO.

export const DIALOGUE: Record<string, DialogueSet> = {
  thanasis: {
    greeting: 'Έναν ελληνικό, μέτριο. Όπως πάντα.', // TODO: write properly
    servedHappy: 'Α, μπράβο. Ξέρεις να τον φτιάχνεις.', // TODO: write properly
    leftAngry: 'Σαράντα χρόνια έρχομαι εδώ. Ντροπή.', // TODO: write properly
    plateiaIdle: 'Κάτσε, διάβασε την εφημερίδα μαζί μου.', // TODO: write properly
  },
  mitsos: {
    greeting: 'Γρήγορα, είμαι διπλοπαρκαρισμένος!', // TODO: write properly
    servedHappy: 'Έλα ντε! Αυτό θα πει σέρβις.', // TODO: write properly
    leftAngry: 'Έφυγα, με πήρε ο τροχονόμος!', // TODO: write properly
    plateiaIdle: 'Είδες κίνηση σήμερα; Χάλια η πόλη.', // TODO: write properly
  },
  roula: {
    greeting: 'Μία μπουγάτσα, παρακαλώ. Με ύψιλον.', // TODO: write properly
    servedHappy: 'Πολύ ωραία. Και ευγενικός κιόλας.', // TODO: write properly
    leftAngry: 'Απαράδεκτο. Θα το σημειώσω.', // TODO: write properly
    plateiaIdle: 'Ξέρεις πώς γράφεται το «καλημέρα»;', // TODO: write properly
  },
  voula: {
    greeting: 'Έναν φραπέ κι έναν νεσκαφέ, χρυσό μου.', // TODO: write properly
    servedHappy: 'Να σου πω τι έγινε με την κυρα-Λένη...', // TODO: write properly
    leftAngry: 'Θα το πω στη μάνα σου, να ξέρεις.', // TODO: write properly
    plateiaIdle: 'Άκουσες τα νέα της γειτονιάς;', // TODO: write properly
  },
  spyros: {
    greeting: 'Ένα ουζάκι κι έναν γαύρο, νεαρέ.', // TODO: write properly
    servedHappy: 'Την άλλη φορά σου φέρνω την καλή ψαριά.', // TODO: write properly
    leftAngry: 'Πάει, χάλασε το ούζο μου.', // TODO: write properly
    plateiaIdle: 'Η θάλασσα ήταν αγριεμένη σήμερα.', // TODO: write properly
  },
  panagiotis: {
    greeting: 'Ένα καραφάκι και μια ποικιλία.', // TODO: write properly
    servedHappy: 'Καλά τα λες. Παρ’ όλα τα ενοίκια.', // TODO: write properly
    leftAngry: 'Με τέτοιες τιμές; Άσε με ήσυχο.', // TODO: write properly
    plateiaIdle: 'Ανέβηκαν πάλι τα ενοίκια, τα ξέρεις;', // TODO: write properly
  },
  eleni: {
    greeting: 'Έναν freddo cappuccino, σε παρακαλώ.', // TODO: write properly
    servedHappy: 'Τέλειος. Πέρνα από το κομμωτήριο.', // TODO: write properly
    leftAngry: 'Κρίμα, σε είχα για καλύτερο.', // TODO: write properly
    plateiaIdle: 'Αν χρειαστείς κάτι, ξέρεις πού είμαι.', // TODO: write properly
  },
  kostas: {
    greeting: 'Έναν ελληνικό. Και τα βιβλία σου εντάξει;', // TODO: write properly
    servedHappy: 'Ωραία. Όλα νόμιμα, βλέπω.', // TODO: write properly
    leftAngry: 'Θα τα ξαναπούμε. Επισήμως.', // TODO: write properly
    plateiaIdle: 'Ο Απρίλης πλησιάζει, να το θυμάσαι.', // TODO: write properly
  },
};

export function dialogueFor(regularKey: string): DialogueSet {
  const d = DIALOGUE[regularKey];
  if (!d) throw new Error(`No dialogue for regular: ${regularKey}`);
  return d;
}

// Sanity at module load in dev — every regular has a dialogue set.
if (import.meta.env?.DEV) {
  for (const k of REGULAR_KEYS) {
    if (!DIALOGUE[k]) console.warn(`Missing dialogue for regular ${k}`);
  }
}
