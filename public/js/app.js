/**
 * LACKIEREREI MANAGEMENT SYSTEM
 * Haupt-Anwendungslogik
 */

class LackierereiApp {
  constructor() {
    this.currentPage = "dashboard";
    this.isLoading = false;
    this.data = {
      kunden: [],
      auftraege: [],
      rechnungen: [],
      settings: {},
    };

    this.init();
  }

  /**
   * Anwendung initialisieren
   */
  async init() {
    try {
      this.showLoading(true);

      // Event Listeners registrieren
      this.setupEventListeners();

      // Navigation initialisieren
      this.initNavigation();

      // Initiale Daten laden
      await this.loadInitialData();

      // Dashboard anzeigen
      await this.navigateToPage("dashboard");

      this.showLoading(false);

      console.log("🎨 Lackiererei Management System gestartet");
    } catch (error) {
      console.error("Fehler beim Initialisieren:", error);
      Notification.show("Fehler beim Starten der Anwendung", "error");
      this.showLoading(false);
    }
  }

  /**
   * Event Listeners einrichten
   */
  setupEventListeners() {
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        this.toggleMobileMenu();
      });
    }

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Window Events
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Vor dem Verlassen der Seite warnen wenn ungespeicherte Änderungen
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  /**
   * Navigation initialisieren
   */
  initNavigation() {
    const navigation = new Navigation();
    navigation.render();

    // Navigation Event Listener
    document.addEventListener("navigate", (e) => {
      this.navigateToPage(e.detail.page, e.detail.params);
    });
  }

  /**
   * Initiale Daten laden
   */
  async loadInitialData() {
    try {
      // Parallel alle Daten laden
      const [kunden, auftraege, rechnungen] = await Promise.all([
        API.get("/kunden"),
        API.get("/auftraege"),
        API.get("/rechnungen"),
      ]);

      this.data.kunden = kunden;
      this.data.auftraege = auftraege;
      this.data.rechnungen = rechnungen;

      // Settings laden
      this.data.settings = (await API.get("/settings")) || {};
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      throw error;
    }
  }

  /**
   * Zu einer Seite navigieren
   */
  async navigateToPage(page, params = {}) {
    try {
      this.showLoading(true);

      // Aktuelle Seite verlassen
      this.cleanupCurrentPage();

      this.currentPage = page;

      // Entsprechende Seiten-Klasse laden
      let pageInstance;

      switch (page) {
        case "dashboard":
          pageInstance = new DashboardPage(this.data);
          break;

        case "kunden":
          pageInstance = new KundenPage(this.data);
          break;

        case "auftraege":
          pageInstance = new AuftraegePage(this.data);
          break;

        case "rechnungen":
          pageInstance = new RechnungenPage(this.data);
          break;

        case "einstellungen":
          pageInstance = new EinstellungenPage(this.data);
          break;

        default:
          throw new Error(`Unbekannte Seite: ${page}`);
      }

      // Seite rendern
      await pageInstance.render(params);

      // URL aktualisieren (ohne Reload)
      this.updateURL(page, params);

      this.showLoading(false);
    } catch (error) {
      console.error(`Fehler beim Laden der Seite ${page}:`, error);
      Notification.show(`Fehler beim Laden der Seite`, "error");
      this.showLoading(false);
    }
  }

  /**
   * Aktuelle Seite aufräumen
   */
  cleanupCurrentPage() {
    // Event Listeners entfernen
    const content = document.getElementById("app-content");
    if (content) {
      // Alle Event Listeners der aktuellen Seite entfernen
      content.innerHTML = "";
    }

    // Offene Modals schließen
    Modal.closeAll();
  }

  /**
   * Daten aktualisieren
   */
  async refreshData(type = "all") {
    try {
      if (type === "all" || type === "kunden") {
        this.data.kunden = await API.get("/kunden");
      }

      if (type === "all" || type === "auftraege") {
        this.data.auftraege = await API.get("/auftraege");
      }

      if (type === "all" || type === "rechnungen") {
        this.data.rechnungen = await API.get("/rechnungen");
      }

      // Aktuelle Seite neu rendern
      await this.navigateToPage(this.currentPage);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Daten:", error);
      Notification.show("Fehler beim Aktualisieren der Daten", "error");
    }
  }

  /**
   * Mobile Menu umschalten
   */
  toggleMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("open");
    }
  }

  /**
   * Keyboard Shortcuts verarbeiten
   */
  handleKeyboardShortcuts(e) {
    // Escape - Modals schließen
    if (e.key === "Escape") {
      Modal.closeAll();
      return;
    }

    // Strg+N - Neuer Auftrag
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      this.createNewAuftrag();
      return;
    }

    // Strg+R - Daten aktualisieren
    if (e.ctrlKey && e.key === "r") {
      e.preventDefault();
      this.refreshData();
      return;
    }

    // Strg+1-5 - Navigation
    if (e.ctrlKey && e.key >= "1" && e.key <= "5") {
      e.preventDefault();
      const pages = [
        "dashboard",
        "auftraege",
        "rechnungen",
        "kunden",
        "einstellungen",
      ];
      const pageIndex = parseInt(e.key) - 1;
      if (pages[pageIndex]) {
        this.navigateToPage(pages[pageIndex]);
      }
      return;
    }
  }

  /**
   * Window Resize verarbeiten
   */
  handleResize() {
    // Mobile Menu schließen bei Größenänderung
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.remove("open");
      }
    }
  }

  /**
   * Ungespeicherte Änderungen prüfen
   */
  hasUnsavedChanges() {
    // Hier könnten unsaved changes geprüft werden
    return false;
  }

  /**
   * Loading Overlay anzeigen/verstecken
   */
  showLoading(show) {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      overlay.style.display = show ? "flex" : "none";
    }
    this.isLoading = show;
  }

  /**
   * URL aktualisieren ohne Reload
   */
  updateURL(page, params = {}) {
    const url = new URL(window.location);
    url.searchParams.set("page", page);

    // Parameter hinzufügen
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.set(key, params[key]);
      }
    });

    window.history.pushState({ page, params }, "", url);
  }

  /**
   * Neuen Auftrag erstellen (Shortcut)
   */
  async createNewAuftrag() {
    if (this.currentPage !== "auftraege") {
      await this.navigateToPage("auftraege");
    }

    // Modal öffnen
    setTimeout(() => {
      const event = new CustomEvent("open-auftrag-modal");
      document.dispatchEvent(event);
    }, 100);
  }

  /**
   * Globale Error Handler
   */
  handleError(error, context = "") {
    console.error(`Fehler${context ? " in " + context : ""}:`, error);

    let message = "Ein unerwarteter Fehler ist aufgetreten";

    if (error.message) {
      message = error.message;
    }

    Notification.show(message, "error");
  }

  /**
   * App-Status abrufen
   */
  getStatus() {
    return {
      currentPage: this.currentPage,
      isLoading: this.isLoading,
      dataLoaded: {
        kunden: this.data.kunden.length > 0,
        auftraege: this.data.auftraege.length > 0,
        rechnungen: this.data.rechnungen.length > 0,
      },
    };
  }
}

// App-Instanz erstellen und global verfügbar machen
let app;

// DOM bereit
document.addEventListener("DOMContentLoaded", () => {
  app = new LackierereiApp();
});

// Browser Navigation (Zurück/Vor Buttons)
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.page && app) {
    app.navigateToPage(e.state.page, e.state.params || {});
  }
});

// Global verfügbare Funktionen
window.LackierereiApp = {
  getInstance: () => app,
  navigateTo: (page, params) => app?.navigateToPage(page, params),
  refreshData: (type) => app?.refreshData(type),
  getStatus: () => app?.getStatus(),
};

// Development Helper
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  window.DEV = {
    app: () => app,
    api: API,
    helpers: Helpers,
    notification: Notification,
    modal: Modal,
  };

  console.log("🔧 Development Tools verfügbar unter window.DEV");
}
