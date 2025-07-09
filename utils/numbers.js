const { db } = require("../config/database");

/**
 * Nächste Nummer aus Settings abrufen
 * @param {string} key - Der Settings-Key (z.B. 'next_kunde_nr')
 * @returns {Promise<number>} Die nächste Nummer
 */
function getNextNumber(key) {
  return new Promise((resolve, reject) => {
    db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? parseInt(row.value) : 1);
      }
    });
  });
}

/**
 * Nächste Nummer in Settings aktualisieren
 * @param {string} key - Der Settings-Key
 * @param {number} value - Der neue Wert
 * @returns {Promise<void>}
 */
function updateNextNumber(key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
      [value.toString(), key],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Intelligente Nummern-Erhöhung (wie im VBA-Code)
 * @param {string} aktuelleNummer - Die aktuelle Nummer
 * @param {string} prefix - Der Präfix für die Nummer
 * @returns {string} Die nächste Nummer
 */
function generateNextNumber(aktuelleNummer, prefix) {
  let neueNummer;
  let zahlTeil;
  const aktuellerText = aktuelleNummer ? aktuelleNummer.toString() : "";

  // Prüfen ob Zelle leer ist
  if (aktuellerText === "" || aktuellerText === "0") {
    neueNummer = prefix + "001";
  } else {
    // Prüfen ob Prefix vorhanden ist
    if (aktuellerText.includes(prefix)) {
      // Format: "K-001" → "K-002"
      const parts = aktuellerText.split("-");
      if (parts.length === 2) {
        zahlTeil = parseInt(parts[1]) + 1;
        neueNummer = prefix + zahlTeil.toString().padStart(3, "0");
      } else {
        neueNummer = prefix + "001";
      }
    } else if (aktuellerText.includes("-")) {
      // Anderes Format mit Bindestrich: "2025-001" → "2025-002"
      const parts = aktuellerText.split("-");
      if (parts.length === 2) {
        zahlTeil = parseInt(parts[1]) + 1;
        neueNummer = parts[0] + "-" + zahlTeil.toString().padStart(3, "0");
      } else {
        neueNummer = prefix + "001";
      }
    } else {
      // Nur Zahl: "1" → "2"
      if (!isNaN(aktuellerText) && aktuellerText !== "") {
        zahlTeil = parseInt(aktuellerText) + 1;
        neueNummer = zahlTeil.toString();
      } else {
        // Fallback: Prefix verwenden
        neueNummer = prefix + "001";
      }
    }
  }

  return neueNummer;
}

/**
 * Rechnungsnummer für das aktuelle Jahr generieren
 * @param {number} nummer - Die laufende Nummer
 * @returns {string} Die Rechnungsnummer im Format R/2025-001
 */
function generateRechnungsnummer(nummer) {
  const jahr = new Date().getFullYear();
  return `R/${jahr}-${nummer.toString().padStart(3, "0")}`;
}

/**
 * Auftragsnummer generieren
 * @param {number} nummer - Die laufende Nummer
 * @returns {string} Die Auftragsnummer im Format A-001
 */
function generateAuftragsnummer(nummer) {
  return `A-${nummer.toString().padStart(3, "0")}`;
}

/**
 * REP-Nummer generieren
 * @param {number} nummer - Die laufende Nummer
 * @returns {string} Die REP-Nummer im Format REP-001
 */
function generateRepNummer(nummer) {
  return `REP-${nummer.toString().padStart(3, "0")}`;
}

/**
 * Kundennummer generieren
 * @param {number} nummer - Die laufende Nummer
 * @returns {string} Die Kundennummer im Format K-001
 */
function generateKundennummer(nummer) {
  return `K-${nummer.toString().padStart(3, "0")}`;
}

/**
 * Nummernformat validieren
 * @param {string} nummer - Die zu validierende Nummer
 * @param {string} expectedPrefix - Der erwartete Präfix
 * @returns {boolean} True wenn das Format korrekt ist
 */
function validateNumberFormat(nummer, expectedPrefix) {
  if (!nummer || typeof nummer !== "string") {
    return false;
  }

  // Für Rechnungsnummern (R/2025-001)
  if (expectedPrefix === "R/") {
    const pattern = /^R\/\d{4}-\d{3}$/;
    return pattern.test(nummer);
  }

  // Für andere Nummern (K-001, A-001, REP-001)
  const pattern = new RegExp(`^${expectedPrefix.replace("-", "\\-")}\\d{3}$`);
  return pattern.test(nummer);
}

/**
 * Nummern-Statistiken abrufen
 * @returns {Promise<Object>} Statistiken über alle Nummernkreise
 */
function getNumberStatistics() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT key, value FROM settings WHERE key LIKE "next_%"',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const stats = {};
          rows.forEach((row) => {
            const type = row.key.replace("next_", "").replace("_nr", "");
            stats[type] = {
              current: parseInt(row.value),
              next: parseInt(row.value) + 1,
            };
          });
          resolve(stats);
        }
      }
    );
  });
}

/**
 * Nummernkreis zurücksetzen (nur für Entwicklung/Tests)
 * @param {string} key - Der Settings-Key
 * @param {number} value - Der neue Startwert
 * @returns {Promise<void>}
 */
function resetNumberSequence(key, value = 1) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
      [value.toString(), key],
      (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`🔄 Nummernkreis ${key} auf ${value} zurückgesetzt`);
          resolve();
        }
      }
    );
  });
}

module.exports = {
  getNextNumber,
  updateNextNumber,
  generateNextNumber,
  generateRechnungsnummer,
  generateAuftragsnummer,
  generateRepNummer,
  generateKundennummer,
  validateNumberFormat,
  getNumberStatistics,
  resetNumberSequence,
};
