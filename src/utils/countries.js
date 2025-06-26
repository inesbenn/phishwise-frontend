// src/utils/countries.js
import countriesList from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import emojiFlags from 'emoji-flags';

// Charger les noms en français
countriesList.registerLocale(frLocale);

// Générer le tableau dynamique et trier par nom
export const countries = Object.entries(countriesList.getNames('fr'))
  .map(([code, name]) => ({
    code: code.toLowerCase(),
    name,
    flag: emojiFlags.countryCode(code)?.emoji || ''
  }))
  .sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique par nom