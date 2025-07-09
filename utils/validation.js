/**
 * Validierungsfunktionen für das Lackiererei Management System
 */

/**
 * Kunden-Daten validieren
 * @param {Object} kundeData - Die Kundendaten
 * @returns {Object} Validierungsergebnis
 */
function validateKunde(kundeData) {
  const errors = [];

  // Name ist Pflichtfeld
  if (!kundeData.name || kundeData.name.trim().length === 0) {
    errors.push("Name ist ein Pflichtfeld");
  } else if (kundeData.name.trim().length < 2) {
    errors.push("Name muss mindestens 2 Zeichen lang sein");
  } else if (kundeData.name.trim().length > 100) {
    errors.push("Name darf maximal 100 Zeichen lang sein");
  }

  // Prüfe auf Platzhalter-Texte
  if (
    kundeData.name &&
    kundeData.name.startsWith("[") &&
    kundeData.name.endsWith("]")
  ) {
    errors.push("Bitte echten Namen eingeben (keine Platzhalter)");
  }

  // E-Mail Format prüfen (optional)
  if (kundeData.email && kundeData.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(kundeData.email)) {
      errors.push("E-Mail-Format ist ungültig");
    }
  }

  // Telefonnummer Format prüfen (optional)
  if (kundeData.telefon && kundeData.telefon.trim().length > 0) {
    const phoneRegex = /^[\d\s\-\+\(\)\/]+$/;
    if (!phoneRegex.test(kundeData.telefon)) {
      errors.push("Telefonnummer enthält ungültige Zeichen");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Auftrags-Daten validieren
 * @param {Object} auftragData - Die Auftragsdaten
 * @returns {Object} Validierungsergebnis
 */
function validateAuftrag(auftragData) {
  const errors = [];

  // Kunde ist Pflichtfeld
  if (!auftragData.kunde_id || isNaN(auftragData.kunde_id)) {
    errors.push("Kunde muss ausgewählt werden");
  }

  // Kennzeichen ist Pflichtfeld
  if (!auftragData.kennzeichen || auftragData.kennzeichen.trim().length === 0) {
    errors.push("Kennzeichen ist ein Pflichtfeld");
  } else if (auftragData.kennzeichen.startsWith("[")) {
    errors.push("Bitte echtes Kennzeichen eingeben (keine Platzhalter)");
  }

  // Modell ist Pflichtfeld
  if (!auftragData.modell || auftragData.modell.trim().length === 0) {
    errors.push("Modell ist ein Pflichtfeld");
  } else if (auftragData.modell.startsWith("[")) {
    errors.push("Bitte echtes Modell eingeben (keine Platzhalter)");
  }

  // VIN Format prüfen (optional)
  if (auftragData.vin && auftragData.vin.trim().length > 0) {
    if (auftragData.vin.startsWith("[")) {
      errors.push("Bitte echte VIN eingeben (keine Platzhalter)");
    } else if (auftragData.vin.length !== 17) {
      errors.push("VIN muss genau 17 Zeichen lang sein");
    }
  }

  // Basis-Stundenpreis validieren
  if (auftragData.basis_stundenpreis !== undefined) {
    const preis = parseFloat(auftragData.basis_stundenpreis);
    if (isNaN(preis) || preis <= 0) {
      errors.push("Basis-Stundenpreis muss eine positive Zahl sein");
    } else if (preis > 1000) {
      errors.push("Basis-Stundenpreis scheint unrealistisch hoch");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Arbeitsschritt-Daten validieren
 * @param {Object} schrittData - Die Arbeitsschritt-Daten
 * @returns {Object} Validierungsergebnis
 */
function validateArbeitsschritt(schrittData) {
  const errors = [];

  // Beschreibung ist Pflichtfeld
  if (
    !schrittData.beschreibung ||
    schrittData.beschreibung.trim().length === 0
  ) {
    errors.push("Beschreibung ist ein Pflichtfeld");
  } else if (schrittData.beschreibung.startsWith("[")) {
    errors.push("Bitte echte Beschreibung eingeben (keine Platzhalter)");
  }

  // Zeit validieren
  if (schrittData.zeit !== undefined) {
    const zeit = parseFloat(schrittData.zeit);
    if (isNaN(zeit) || zeit < 0) {
      errors.push("Zeit muss eine positive Zahl oder 0 sein");
    } else if (zeit > 100) {
      errors.push("Zeit scheint unrealistisch hoch (über 100 Stunden)");
    }
  }

  // Stundenpreis validieren
  if (schrittData.stundenpreis !== undefined) {
    const preis = parseFloat(schrittData.stundenpreis);
    if (isNaN(preis) || preis < 0) {
      errors.push("Stundenpreis muss eine positive Zahl oder 0 sein");
    } else if (preis > 1000) {
      errors.push("Stundenpreis scheint unrealistisch hoch");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Rechnungs-Daten validieren
 * @param {Object} rechnungData - Die Rechnungsdaten
 * @returns {Object} Validierungsergebnis
 */
function validateRechnung(rechnungData) {
  const errors = [];

  // Kunde ist Pflichtfeld
  if (!rechnungData.kunde_id || isNaN(rechnungData.kunde_id)) {
    errors.push("Kunde muss ausgewählt werden");
  }

  // Rabatt validieren
  if (rechnungData.rabatt !== undefined) {
    const rabatt = parseFloat(rechnungData.rabatt);
    if (isNaN(rabatt) || rabatt < 0 || rabatt > 100) {
      errors.push("Rabatt muss zwischen 0 und 100 Prozent liegen");
    }
  }

  // Fälligkeitsdatum validieren
  if (rechnungData.faelligkeitsdatum) {
    const faelligkeitsdatum = new Date(rechnungData.faelligkeitsdatum);
    const heute = new Date();
    if (faelligkeitsdatum < heute) {
      errors.push("Fälligkeitsdatum sollte in der Zukunft liegen");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Rechnungsposten-Daten validieren
 * @param {Object} postenData - Die Rechnungsposten-Daten
 * @returns {Object} Validierungsergebnis
 */
function validateRechnungsposten(postenData) {
  const errors = [];

  // Beschreibung ist Pflichtfeld
  if (!postenData.beschreibung || postenData.beschreibung.trim().length === 0) {
    errors.push("Beschreibung ist ein Pflichtfeld");
  }

  // Menge validieren
  if (postenData.menge !== undefined) {
    const menge = parseFloat(postenData.menge);
    if (isNaN(menge) || menge <= 0) {
      errors.push("Menge muss eine positive Zahl sein");
    }
  }

  // Einzelpreis validieren
  if (postenData.einzelpreis !== undefined) {
    const preis = parseFloat(postenData.einzelpreis);
    if (isNaN(preis) || preis < 0) {
      errors.push("Einzelpreis muss eine positive Zahl oder 0 sein");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Firmen-Einstellungen validieren
 * @param {Object} firmaData - Die Firmendaten
 * @returns {Object} Validierungsergebnis
 */
function validateFirma(firmaData) {
  const errors = [];

  // Firmenname ist Pflichtfeld
  if (!firmaData.firma_name || firmaData.firma_name.trim().length === 0) {
    errors.push("Firmenname ist ein Pflichtfeld");
  }

  // E-Mail Format prüfen (optional)
  if (firmaData.firma_email && firmaData.firma_email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(firmaData.firma_email)) {
      errors.push("E-Mail-Format ist ungültig");
    }
  }

  // Website Format prüfen (optional)
  if (firmaData.firma_website && firmaData.firma_website.trim().length > 0) {
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(firmaData.firma_website)) {
      errors.push("Website muss mit http:// oder https:// beginnen");
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Allgemeine Sicherheitsprüfungen
 * @param {string} input - Der zu prüfende Text
 * @returns {boolean} True wenn sicher
 */
function isSafeInput(input) {
  if (typeof input !== "string") return true;

  // Prüfe auf gefährliche SQL-Zeichen
  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+SET/i,
    /--/,
    /;/,
    /<script/i,
    /javascript:/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Prüfe auf Platzhalter-Texte (wie im VBA-Code)
 * @param {Object} data - Die zu prüfenden Daten
 * @returns {Array} Array mit gefundenen Platzhaltern
 */
function checkForPlaceholders(data) {
  const placeholders = [];

  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "string" &&
      value.startsWith("[") &&
      value.endsWith("]")
    ) {
      placeholders.push({
        field: key,
        value: value,
        message: `${key} enthält noch Platzhalter-Text: ${value}`,
      });
    }
  }

  return placeholders;
}

/**
 * Validiere Zeitformat (Stunden als Dezimalzahl)
 * @param {string|number} zeit - Die Zeit
 * @returns {Object} Validierungsergebnis
 */
function validateTimeFormat(zeit) {
  const errors = [];
  const zeitNumber = parseFloat(zeit);

  if (isNaN(zeitNumber)) {
    errors.push("Zeit muss eine Zahl sein");
  } else if (zeitNumber < 0) {
    errors.push("Zeit kann nicht negativ sein");
  } else if (zeitNumber > 24) {
    errors.push("Zeit pro Arbeitsschritt sollte unter 24 Stunden liegen");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    value: zeitNumber,
  };
}

module.exports = {
  validateKunde,
  validateAuftrag,
  validateArbeitsschritt,
  validateRechnung,
  validateRechnungsposten,
  validateFirma,
  isSafeInput,
  checkForPlaceholders,
  validateTimeFormat,
};
