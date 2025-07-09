/**
 * FRONTEND HELPER FUNCTIONS
 * Sammlung nützlicher Hilfsfunktionen für das Frontend
 */

const Helpers = {
  // === DATE & TIME UTILITIES ===

  /**
   * Formatiert ein Datum für die Anzeige
   * @param {Date|string} date - Datum
   * @param {string} format - Format ('short', 'long', 'datetime', 'time')
   * @returns {string} Formatiertes Datum
   */
  formatDate(date, format = "short") {
    if (!date) return "-";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "Ungültiges Datum";

    const options = {
      short: { day: "2-digit", month: "2-digit", year: "numeric" },
      long: { day: "2-digit", month: "long", year: "numeric" },
      datetime: {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
      time: { hour: "2-digit", minute: "2-digit" },
    };

    return d.toLocaleDateString("de-DE", options[format] || options.short);
  },

  /**
   * Berechnet die Differenz zwischen zwei Daten
   * @param {Date|string} date1 - Erstes Datum
   * @param {Date|string} date2 - Zweites Datum (optional, default: heute)
   * @returns {Object} Differenz in verschiedenen Einheiten
   */
  dateDiff(date1, date2 = new Date()) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2 - d1);

    return {
      milliseconds: diffMs,
      seconds: Math.floor(diffMs / 1000),
      minutes: Math.floor(diffMs / (1000 * 60)),
      hours: Math.floor(diffMs / (1000 * 60 * 60)),
      days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
      weeks: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)),
      months: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)),
      years: Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
    };
  },

  /**
   * Menschenlesbare Zeitangabe ("vor 2 Stunden")
   * @param {Date|string} date - Datum
   * @returns {string} Relative Zeitangabe
   */
  timeAgo(date) {
    const diff = this.dateDiff(date);

    if (diff.years > 0)
      return `vor ${diff.years} Jahr${diff.years !== 1 ? "en" : ""}`;
    if (diff.months > 0)
      return `vor ${diff.months} Monat${diff.months !== 1 ? "en" : ""}`;
    if (diff.weeks > 0)
      return `vor ${diff.weeks} Woche${diff.weeks !== 1 ? "n" : ""}`;
    if (diff.days > 0)
      return `vor ${diff.days} Tag${diff.days !== 1 ? "en" : ""}`;
    if (diff.hours > 0)
      return `vor ${diff.hours} Stunde${diff.hours !== 1 ? "n" : ""}`;
    if (diff.minutes > 0)
      return `vor ${diff.minutes} Minute${diff.minutes !== 1 ? "n" : ""}`;
    return "gerade eben";
  },

  // === NUMBER & CURRENCY UTILITIES ===

  /**
   * Formatiert eine Zahl als Währung
   * @param {number} amount - Betrag
   * @param {string} currency - Währung (default: EUR)
   * @returns {string} Formatierter Betrag
   */
  formatCurrency(amount, currency = "EUR") {
    if (isNaN(amount)) return "-";

    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Formatiert eine Zahl
   * @param {number} number - Zahl
   * @param {number} decimals - Anzahl Dezimalstellen
   * @returns {string} Formatierte Zahl
   */
  formatNumber(number, decimals = 2) {
    if (isNaN(number)) return "-";

    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  },

  /**
   * Formatiert Arbeitszeit (Stunden)
   * @param {number} hours - Stunden als Dezimalzahl
   * @returns {string} Formatierte Zeit
   */
  formatHours(hours) {
    if (isNaN(hours) || hours === 0) return "0 Std";

    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (m === 0) return `${h} Std`;
    return `${h}:${m.toString().padStart(2, "0")} Std`;
  },

  /**
   * Berechnet Prozentsatz
   * @param {number} part - Teil
   * @param {number} total - Gesamt
   * @returns {number} Prozentsatz
   */
  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  // === STRING UTILITIES ===

  /**
   * Kapitalisiert den ersten Buchstaben
   * @param {string} str - String
   * @returns {string} Kapitalisierter String
   */
  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Kürzt einen String und fügt "..." hinzu
   * @param {string} str - String
   * @param {number} maxLength - Maximale Länge
   * @returns {string} Gekürzter String
   */
  truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  },

  /**
   * Erstellt Initialen aus einem Namen
   * @param {string} name - Name
   * @returns {string} Initialen
   */
  initials(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  },

  /**
   * Slug aus String erstellen
   * @param {string} str - String
   * @returns {string} Slug
   */
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
        return map[match];
      })
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  },

  // === VALIDATION UTILITIES ===

  /**
   * Validiert E-Mail-Adresse
   * @param {string} email - E-Mail
   * @returns {boolean} Gültig
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validiert Telefonnummer
   * @param {string} phone - Telefonnummer
   * @returns {boolean} Gültig
   */
  isValidPhone(phone) {
    const regex = /^[\d\s\-\+\(\)\/]+$/;
    return regex.test(phone) && phone.replace(/[^\d]/g, "").length >= 6;
  },

  /**
   * Validiert deutsche PLZ
   * @param {string} zip - PLZ
   * @returns {boolean} Gültig
   */
  isValidZip(zip) {
    const regex = /^\d{5}$/;
    return regex.test(zip);
  },

  /**
   * Prüft ob String ein Platzhalter ist
   * @param {string} str - String
   * @returns {boolean} Ist Platzhalter
   */
  isPlaceholder(str) {
    return typeof str === "string" && str.startsWith("[") && str.endsWith("]");
  },

  // === DOM UTILITIES ===

  /**
   * Erstellt ein DOM-Element mit Attributen
   * @param {string} tag - Tag-Name
   * @param {Object} attributes - Attribute
   * @param {string} content - Inhalt
   * @returns {Element} DOM-Element
   */
  createElement(tag, attributes = {}, content = "") {
    const element = document.createElement(tag);

    Object.keys(attributes).forEach((key) => {
      if (key === "className") {
        element.className = attributes[key];
      } else if (key === "dataset") {
        Object.keys(attributes[key]).forEach((dataKey) => {
          element.dataset[dataKey] = attributes[key][dataKey];
        });
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    if (content) {
      element.innerHTML = content;
    }

    return element;
  },

  /**
   * Entfernt alle Child-Elemente
   * @param {Element} element - Element
   */
  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  /**
   * Prüft ob Element im Viewport ist
   * @param {Element} element - Element
   * @returns {boolean} Im Viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // === EVENT UTILITIES ===

  /**
   * Debounce-Funktion
   * @param {Function} func - Funktion
   * @param {number} wait - Wartezeit in ms
   * @returns {Function} Debounced Funktion
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle-Funktion
   * @param {Function} func - Funktion
   * @param {number} limit - Limit in ms
   * @returns {Function} Throttled Funktion
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // === STORAGE UTILITIES ===

  /**
   * Setzt einen Wert in Local Storage
   * @param {string} key - Schlüssel
   * @param {*} value - Wert
   */
  setStorage(key, value) {
    try {
      const prefixedKey = Config.storage.prefix + key;
      const serializedValue = JSON.stringify({
        value: value,
        timestamp: Date.now(),
        version: Config.app.version,
      });
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },

  /**
   * Holt einen Wert aus Local Storage
   * @param {string} key - Schlüssel
   * @param {*} defaultValue - Default-Wert
   * @returns {*} Wert
   */
  getStorage(key, defaultValue = null) {
    try {
      const prefixedKey = Config.storage.prefix + key;
      const item = localStorage.getItem(prefixedKey);

      if (!item) return defaultValue;

      const parsed = JSON.parse(item);

      // Prüfe Alter des Cache-Eintrags
      if (Config.data.cache.enabled && Config.data.cache.defaultTTL) {
        const age = Date.now() - parsed.timestamp;
        if (age > Config.data.cache.defaultTTL) {
          this.removeStorage(key);
          return defaultValue;
        }
      }

      return parsed.value;
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return defaultValue;
    }
  },

  /**
   * Entfernt einen Wert aus Local Storage
   * @param {string} key - Schlüssel
   */
  removeStorage(key) {
    try {
      const prefixedKey = Config.storage.prefix + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  },

  /**
   * Leert den kompletten App-Storage
   */
  clearStorage() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(Config.storage.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  },

  // === UTILITY FUNCTIONS ===

  /**
   * Generiert eine zufällige ID
   * @param {number} length - Länge
   * @returns {string} Zufällige ID
   */
  generateId(length = 8) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Deep Clone eines Objekts
   * @param {*} obj - Objekt
   * @returns {*} Kopie
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item));
    if (typeof obj === "object") {
      const cloned = {};
      Object.keys(obj).forEach((key) => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  /**
   * Merge von Objekten
   * @param {Object} target - Ziel-Objekt
   * @param {...Object} sources - Quell-Objekte
   * @returns {Object} Gemergtes Objekt
   */
  merge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      });
    }

    return this.merge(target, ...sources);
  },

  /**
   * Prüft ob Wert ein Objekt ist
   * @param {*} item - Wert
   * @returns {boolean} Ist Objekt
   */
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  },

  /**
   * Wartet eine bestimmte Zeit
   * @param {number} ms - Millisekunden
   * @returns {Promise} Promise
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Downloadet Daten als Datei
   * @param {string} data - Daten
   * @param {string} filename - Dateiname
   * @param {string} type - MIME-Type
   */
  downloadFile(data, filename, type = "text/plain") {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Kopiert Text in die Zwischenablage
   * @param {string} text - Text
   * @returns {Promise<boolean>} Erfolgreich
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback für ältere Browser
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  },

  // === STATUS UTILITIES ===

  /**
   * Holt die passende Status-CSS-Klasse
   * @param {string} status - Status
   * @returns {string} CSS-Klasse
   */
  getStatusClass(status) {
    const statusMap = {
      offen: "status-offen",
      bearbeitung: "status-bearbeitung",
      abgeschlossen: "status-abgeschlossen",
      storniert: "status-storniert",
      bezahlt: "status-bezahlt",
      ueberfaellig: "status-ueberfaellig",
    };

    return statusMap[status] || "status-offen";
  },

  /**
   * Holt den Status-Text
   * @param {string} status - Status
   * @returns {string} Status-Text
   */
  getStatusText(status) {
    const statusMap = {
      offen: "Offen",
      bearbeitung: "In Bearbeitung",
      abgeschlossen: "Abgeschlossen",
      storniert: "Storniert",
      bezahlt: "Bezahlt",
      ueberfaellig: "Überfällig",
    };

    return statusMap[status] || status;
  },

  // === ERROR HANDLING ===

  /**
   * Behandelt Fehler einheitlich
   * @param {Error} error - Fehler
   * @param {string} context - Kontext
   */
  handleError(error, context = "") {
    const errorInfo = {
      message: error.message || "Unbekannter Fehler",
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (Config.debug.enabled) {
      console.error("Error handled:", errorInfo);
    }

    // An Error-Handler weiterleiten falls vorhanden
    if (window.app && typeof window.app.handleError === "function") {
      window.app.handleError(error, context);
    }
  },
};

// Global verfügbar machen
window.Helpers = Helpers;

// Development Tools
if (Config.debug.enabled) {
  console.log(
    "🛠️ Helpers loaded with",
    Object.keys(Helpers).length,
    "functions"
  );
}

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = Helpers;
}
