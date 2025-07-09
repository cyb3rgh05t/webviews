/**
 * API-UTILITY KLASSE
 * Zentrale Verwaltung aller API-Aufrufe
 */

class APIClient {
  constructor() {
    this.baseURL = "/api";
    this.timeout = 10000; // 10 Sekunden
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 Sekunde
  }

  /**
   * HTTP GET Request
   */
  async get(endpoint, params = {}) {
    const url = this.buildURL(endpoint, params);
    return this.request(url, {
      method: "GET",
    });
  }

  /**
   * HTTP POST Request
   */
  async post(endpoint, data = {}) {
    const url = this.buildURL(endpoint);
    return this.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * HTTP PUT Request
   */
  async put(endpoint, data = {}) {
    const url = this.buildURL(endpoint);
    return this.request(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * HTTP DELETE Request
   */
  async delete(endpoint) {
    const url = this.buildURL(endpoint);
    return this.request(url, {
      method: "DELETE",
    });
  }

  /**
   * URL mit Parametern erstellen
   */
  buildURL(endpoint, params = {}) {
    let url = `${this.baseURL}${endpoint}`;

    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * HTTP Request mit Retry-Logik
   */
  async request(url, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Timeout hinzufügen
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            url
          );
        }

        // Erfolgreiche Antwort verarbeiten
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      } catch (error) {
        lastError = error;

        // Bei bestimmten Fehlern nicht retry
        if (
          error instanceof APIError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          throw error;
        }

        // Beim letzten Versuch nicht warten
        if (attempt < this.retryAttempts) {
          console.warn(
            `API Request fehlgeschlagen (Versuch ${attempt}/${this.retryAttempts}):`,
            error.message
          );
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * Delay-Hilfsfunktion
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Spezifische API-Methoden für das Lackiererei-System
   */

  // === KUNDEN ===
  async getKunden(search = "") {
    const params = search ? { search } : {};
    return this.get("/kunden", params);
  }

  async getKunde(id) {
    return this.get(`/kunden/${id}`);
  }

  async createKunde(kundeData) {
    return this.post("/kunden", kundeData);
  }

  async updateKunde(id, kundeData) {
    return this.put(`/kunden/${id}`, kundeData);
  }

  async deleteKunde(id) {
    return this.delete(`/kunden/${id}`);
  }

  async getKundenAuftraege(id) {
    return this.get(`/kunden/${id}/auftraege`);
  }

  async getKundenRechnungen(id) {
    return this.get(`/kunden/${id}/rechnungen`);
  }

  // === AUFTRÄGE ===
  async getAuftraege(filters = {}) {
    return this.get("/auftraege", filters);
  }

  async getAuftrag(id) {
    return this.get(`/auftraege/${id}`);
  }

  async createAuftrag(auftragData) {
    return this.post("/auftraege", auftragData);
  }

  async updateAuftrag(id, auftragData) {
    return this.put(`/auftraege/${id}`, auftragData);
  }

  async deleteAuftrag(id) {
    return this.delete(`/auftraege/${id}`);
  }

  async auftragZuRechnung(id) {
    return this.post(`/auftraege/${id}/zu-rechnung`);
  }

  async applySchnellZeiten(id, template) {
    return this.post(`/auftraege/${id}/schnell-zeiten`, { template });
  }

  async updateArbeitsschritt(id, schrittData) {
    return this.put(`/arbeitsschritte/${id}`, schrittData);
  }

  // === RECHNUNGEN ===
  async getRechnungen(filters = {}) {
    return this.get("/rechnungen", filters);
  }

  async getRechnung(id) {
    return this.get(`/rechnungen/${id}`);
  }

  async createRechnung(rechnungData) {
    return this.post("/rechnungen", rechnungData);
  }

  async updateRechnung(id, rechnungData) {
    return this.put(`/rechnungen/${id}`, rechnungData);
  }

  async deleteRechnung(id) {
    return this.delete(`/rechnungen/${id}`);
  }

  async applyRabatt(id, rabatt) {
    return this.put(`/rechnungen/${id}/rabatt`, { rabatt });
  }

  async markRechnungBezahlt(id) {
    return this.put(`/rechnungen/${id}/bezahlt`);
  }

  // === DASHBOARD ===
  async getDashboardStats() {
    return this.get("/dashboard/stats");
  }

  async getRecentActivities() {
    return this.get("/dashboard/activities");
  }

  // === SETTINGS ===
  async getSettings() {
    return this.get("/settings");
  }

  async updateSettings(settings) {
    return this.put("/settings", settings);
  }

  async getSetting(key) {
    return this.get(`/settings/${key}`);
  }

  async updateSetting(key, value) {
    return this.put(`/settings/${key}`, { value });
  }

  // === BACKUP & UTILITIES ===
  async createBackup() {
    return this.post("/admin/backup");
  }

  async healthCheck() {
    return this.get("/admin/health");
  }

  async getVersion() {
    return this.get("/admin/version");
  }
}

/**
 * Custom Error-Klasse für API-Fehler
 */
class APIError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.url = url;
  }
}

/**
 * API-Response-Wrapper für bessere Typisierung
 */
class APIResponse {
  constructor(data, status, headers) {
    this.data = data;
    this.status = status;
    this.headers = headers;
    this.success = status >= 200 && status < 300;
  }
}

/**
 * Globale API-Instanz erstellen
 */
const API = new APIClient();

// Globale Error-Handler für unbehandelte API-Fehler
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason instanceof APIError) {
    console.error("Unbehandelter API-Fehler:", event.reason);

    // Benutzerfreundliche Fehlermeldung anzeigen
    let message =
      "Ein Fehler bei der Kommunikation mit dem Server ist aufgetreten.";

    if (event.reason.status === 404) {
      message = "Die angeforderte Ressource wurde nicht gefunden.";
    } else if (event.reason.status === 401) {
      message = "Sie sind nicht berechtigt, diese Aktion auszuführen.";
    } else if (event.reason.status === 403) {
      message = "Zugriff verweigert.";
    } else if (event.reason.status >= 500) {
      message =
        "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
    }

    if (typeof Notification !== "undefined") {
      Notification.show(message, "error");
    }

    event.preventDefault();
  }
});

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = { API, APIClient, APIError, APIResponse };
}

// Logging für Development
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  console.log("🌐 API Client initialisiert");
  console.log("📡 Base URL:", API.baseURL);
}
