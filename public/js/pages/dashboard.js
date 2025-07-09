/**
 * DASHBOARD PAGE
 * Hauptseite mit Übersicht und Statistiken
 */

class DashboardPage {
  constructor(data) {
    this.data = data;
    this.refreshInterval = null;
    this.charts = {};
    this.widgets = new Map();

    this.init();
  }

  /**
   * Dashboard initialisieren
   */
  init() {
    this.setupAutoRefresh();
  }

  /**
   * Dashboard rendern
   * @param {Object} params - URL-Parameter
   */
  async render(params = {}) {
    const content = document.getElementById("app-content");
    if (!content) return;

    try {
      // Loading anzeigen
      content.innerHTML = this.getLoadingHTML();

      // Aktuelle Daten laden
      await this.loadDashboardData();

      // Dashboard-HTML generieren
      content.innerHTML = this.generateDashboardHTML();

      // Komponenten initialisieren
      this.initializeComponents();

      // Event Listeners binden
      this.bindEvents();
    } catch (error) {
      console.error("Fehler beim Rendern des Dashboards:", error);
      content.innerHTML = this.getErrorHTML(error);
    }
  }

  /**
   * Dashboard-Daten laden
   */
  async loadDashboardData() {
    try {
      // Statistiken laden
      this.stats = await this.calculateStatistics();

      // Letzte Aktivitäten laden
      this.activities = await this.getRecentActivities();

      // Charts-Daten laden
      this.chartsData = await this.getChartsData();
    } catch (error) {
      console.error("Fehler beim Laden der Dashboard-Daten:", error);
      throw error;
    }
  }

  /**
   * Statistiken berechnen
   * @returns {Object} Statistiken
   */
  async calculateStatistics() {
    const stats = {
      auftraege: {
        total: this.data.auftraege?.length || 0,
        offen: 0,
        bearbeitung: 0,
        abgeschlossen: 0,
        heute: 0,
      },
      rechnungen: {
        total: this.data.rechnungen?.length || 0,
        offen: 0,
        bezahlt: 0,
        ueberfaellig: 0,
        heute: 0,
      },
      kunden: {
        total: this.data.kunden?.length || 0,
        neue_7d: 0,
        neue_30d: 0,
        aktive: 0,
      },
      umsatz: {
        heute: 0,
        woche: 0,
        monat: 0,
        jahr: 0,
        offen: 0,
      },
    };

    // Aktuelle Daten
    const heute = new Date();
    const wocheStart = new Date(heute.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monatStart = new Date(heute.getFullYear(), heute.getMonth(), 1);
    const jahrStart = new Date(heute.getFullYear(), 0, 1);

    // Aufträge analysieren
    if (this.data.auftraege) {
      this.data.auftraege.forEach((auftrag) => {
        const auftragDatum = new Date(auftrag.created_at);

        // Status zählen
        switch (auftrag.status) {
          case "offen":
            stats.auftraege.offen++;
            break;
          case "bearbeitung":
            stats.auftraege.bearbeitung++;
            break;
          case "abgeschlossen":
            stats.auftraege.abgeschlossen++;
            break;
        }

        // Heute erstellt
        if (this.isSameDay(auftragDatum, heute)) {
          stats.auftraege.heute++;
        }
      });
    }

    // Rechnungen analysieren
    if (this.data.rechnungen) {
      this.data.rechnungen.forEach((rechnung) => {
        const rechnungDatum = new Date(rechnung.created_at);
        const bruttoBetrag = rechnung.brutto_betrag || 0;

        // Status zählen
        switch (rechnung.status) {
          case "offen":
            stats.rechnungen.offen++;
            stats.umsatz.offen += bruttoBetrag;
            break;
          case "bezahlt":
            stats.rechnungen.bezahlt++;
            break;
          case "ueberfaellig":
            stats.rechnungen.ueberfaellig++;
            stats.umsatz.offen += bruttoBetrag;
            break;
        }

        // Heute erstellt
        if (this.isSameDay(rechnungDatum, heute)) {
          stats.rechnungen.heute++;
          stats.umsatz.heute += bruttoBetrag;
        }

        // Zeitraum-Umsätze (nur bezahlte Rechnungen)
        if (rechnung.status === "bezahlt") {
          if (rechnungDatum >= wocheStart) {
            stats.umsatz.woche += bruttoBetrag;
          }
          if (rechnungDatum >= monatStart) {
            stats.umsatz.monat += bruttoBetrag;
          }
          if (rechnungDatum >= jahrStart) {
            stats.umsatz.jahr += bruttoBetrag;
          }
        }
      });
    }

    // Kunden analysieren
    if (this.data.kunden) {
      const siebenTageAgo = new Date(heute.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dreissigTageAgo = new Date(
        heute.getTime() - 30 * 24 * 60 * 60 * 1000
      );

      this.data.kunden.forEach((kunde) => {
        const kundeDatum = new Date(kunde.created_at);

        // Neue Kunden
        if (kundeDatum >= siebenTageAgo) {
          stats.kunden.neue_7d++;
        }
        if (kundeDatum >= dreissigTageAgo) {
          stats.kunden.neue_30d++;
        }

        // Aktive Kunden (mit Aufträgen in den letzten 90 Tagen)
        const hatAktiveAuftraege = this.data.auftraege?.some(
          (auftrag) =>
            auftrag.kunde_id === kunde.id &&
            new Date(auftrag.created_at) >=
              new Date(heute.getTime() - 90 * 24 * 60 * 60 * 1000)
        );

        if (hatAktiveAuftraege) {
          stats.kunden.aktive++;
        }
      });
    }

    return stats;
  }

  /**
   * Letzte Aktivitäten abrufen
   * @returns {Array} Aktivitäten
   */
  async getRecentActivities() {
    const activities = [];

    // Letzte Aufträge
    if (this.data.auftraege) {
      this.data.auftraege.slice(0, 5).forEach((auftrag) => {
        activities.push({
          type: "auftrag",
          icon: "fas fa-clipboard-list",
          title: `Auftrag ${auftrag.rep_nr}`,
          description: `${auftrag.kunde_name} - ${auftrag.kennzeichen}`,
          amount: auftrag.gesamtkosten,
          timestamp: auftrag.created_at,
          status: auftrag.status,
          link: `auftraege?id=${auftrag.id}`,
        });
      });
    }

    // Letzte Rechnungen
    if (this.data.rechnungen) {
      this.data.rechnungen.slice(0, 5).forEach((rechnung) => {
        activities.push({
          type: "rechnung",
          icon: "fas fa-file-invoice",
          title: `Rechnung ${rechnung.rechnung_nr}`,
          description: rechnung.kunde_name,
          amount: rechnung.brutto_betrag,
          timestamp: rechnung.created_at,
          status: rechnung.status,
          link: `rechnungen?id=${rechnung.id}`,
        });
      });
    }

    // Nach Datum sortieren
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, 10);
  }

  /**
   * Charts-Daten vorbereiten
   * @returns {Object} Charts-Daten
   */
  async getChartsData() {
    const heute = new Date();
    const letzten12Monate = [];

    // Letzte 12 Monate generieren
    for (let i = 11; i >= 0; i--) {
      const monat = new Date(heute.getFullYear(), heute.getMonth() - i, 1);
      letzten12Monate.push({
        monat: monat.toLocaleDateString("de-DE", {
          month: "short",
          year: "2-digit",
        }),
        jahr: monat.getFullYear(),
        monatNr: monat.getMonth() + 1,
        auftraege: 0,
        umsatz: 0,
      });
    }

    // Daten für Charts sammeln
    if (this.data.auftraege) {
      this.data.auftraege.forEach((auftrag) => {
        const auftragDatum = new Date(auftrag.created_at);
        const monatIndex = letzten12Monate.findIndex(
          (m) =>
            m.jahr === auftragDatum.getFullYear() &&
            m.monatNr === auftragDatum.getMonth() + 1
        );

        if (monatIndex !== -1) {
          letzten12Monate[monatIndex].auftraege++;
        }
      });
    }

    if (this.data.rechnungen) {
      this.data.rechnungen.forEach((rechnung) => {
        if (rechnung.status === "bezahlt") {
          const rechnungDatum = new Date(rechnung.created_at);
          const monatIndex = letzten12Monate.findIndex(
            (m) =>
              m.jahr === rechnungDatum.getFullYear() &&
              m.monatNr === rechnungDatum.getMonth() + 1
          );

          if (monatIndex !== -1) {
            letzten12Monate[monatIndex].umsatz += rechnung.brutto_betrag || 0;
          }
        }
      });
    }

    return {
      monatlich: letzten12Monate,
      statusVerteilung: this.getStatusDistribution(),
      topKunden: this.getTopKunden(),
    };
  }

  /**
   * Dashboard-HTML generieren
   * @returns {string} HTML
   */
  generateDashboardHTML() {
    return `
            <div class="dashboard">
                ${this.generateHeaderHTML()}
                ${this.generateStatsHTML()}
                ${this.generateChartsHTML()}
                ${this.generateActivitiesHTML()}
                ${this.generateQuickActionsHTML()}
            </div>
        `;
  }

  /**
   * Header-HTML generieren
   * @returns {string} HTML
   */
  generateHeaderHTML() {
    const greetingTime = this.getGreetingTime();

    return `
            <div class="dashboard-header">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="dashboard-title">
                            ${greetingTime} 👋
                        </h1>
                        <p class="dashboard-subtitle">
                            Hier ist Ihre Übersicht für ${Helpers.formatDate(new Date(), "long")}
                        </p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="new-auftrag-quick">
                            <i class="fas fa-plus"></i>
                            Neuer Auftrag
                        </button>
                        <button class="btn btn-secondary" id="refresh-dashboard">
                            <i class="fas fa-sync"></i>
                            Aktualisieren
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Statistiken-HTML generieren
   * @returns {string} HTML
   */
  generateStatsHTML() {
    return `
            <div class="stats-section">
                <div class="stats-grid">
                    <div class="stat-card animate-fadeIn" style="animation-delay: 0.1s">
                        <div class="stat-icon blue">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${this.stats.auftraege.offen}</div>
                            <div class="stat-label">Offene Aufträge</div>
                            <div class="stat-change ${this.stats.auftraege.heute > 0 ? "positive" : ""}">
                                ${this.stats.auftraege.heute > 0 ? "+" : ""}${this.stats.auftraege.heute} heute
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fadeIn" style="animation-delay: 0.2s">
                        <div class="stat-icon green">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${this.stats.rechnungen.offen}</div>
                            <div class="stat-label">Offene Rechnungen</div>
                            <div class="stat-change">
                                ${Helpers.formatCurrency(this.stats.umsatz.offen)} offen
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fadeIn" style="animation-delay: 0.3s">
                        <div class="stat-icon yellow">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${this.stats.kunden.total}</div>
                            <div class="stat-label">Kunden gesamt</div>
                            <div class="stat-change ${this.stats.kunden.neue_7d > 0 ? "positive" : ""}">
                                +${this.stats.kunden.neue_7d} diese Woche
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fadeIn" style="animation-delay: 0.4s">
                        <div class="stat-icon red">
                            <i class="fas fa-euro-sign"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">${Helpers.formatCurrency(this.stats.umsatz.monat)}</div>
                            <div class="stat-label">Monatsumsatz</div>
                            <div class="stat-change">
                                ${Helpers.formatCurrency(this.stats.umsatz.heute)} heute
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Charts-HTML generieren
   * @returns {string} HTML
   */
  generateChartsHTML() {
    return `
            <div class="charts-section">
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="card-header">
                            <h3 class="card-title">Umsatzentwicklung</h3>
                            <select class="chart-filter" id="umsatz-filter">
                                <option value="12m">Letzte 12 Monate</option>
                                <option value="6m">Letzte 6 Monate</option>
                                <option value="3m">Letzte 3 Monate</option>
                            </select>
                        </div>
                        <div class="chart-container">
                            <canvas id="umsatz-chart" height="200"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="card-header">
                            <h3 class="card-title">Auftragsstatus</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="status-chart" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Aktivitäten-HTML generieren
   * @returns {string} HTML
   */
  generateActivitiesHTML() {
    const activitiesHTML = this.activities
      .map(
        (activity) => `
            <div class="activity-item" data-link="${activity.link}">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-meta">
                        <span class="activity-time">${Helpers.timeAgo(activity.timestamp)}</span>
                        <span class="activity-status status-${activity.status}">${Helpers.getStatusText(activity.status)}</span>
                    </div>
                </div>
                <div class="activity-amount">
                    ${activity.amount ? Helpers.formatCurrency(activity.amount) : ""}
                </div>
            </div>
        `
      )
      .join("");

    return `
            <div class="activities-section">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Letzte Aktivitäten</h3>
                        <a href="#auftraege" class="btn btn-sm btn-outline">Alle anzeigen</a>
                    </div>
                    <div class="activities-list">
                        ${activitiesHTML || '<p class="text-muted text-center p-lg">Keine Aktivitäten vorhanden</p>'}
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Quick Actions HTML generieren
   * @returns {string} HTML
   */
  generateQuickActionsHTML() {
    return `
            <div class="quick-actions-section">
                <h3>Häufige Aktionen</h3>
                <div class="quick-actions-grid">
                    <div class="quick-action-card" data-action="new-auftrag">
                        <div class="quick-action-icon">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="quick-action-title">Neuer Auftrag</div>
                        <div class="quick-action-description">Auftrag anlegen</div>
                    </div>
                    
                    <div class="quick-action-card" data-action="new-kunde">
                        <div class="quick-action-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="quick-action-title">Neuer Kunde</div>
                        <div class="quick-action-description">Kunde hinzufügen</div>
                    </div>
                    
                    <div class="quick-action-card" data-action="ueberfaellige-rechnungen">
                        <div class="quick-action-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="quick-action-title">Überfällige Rechnungen</div>
                        <div class="quick-action-description">${this.stats.rechnungen.ueberfaellig} überfällig</div>
                    </div>
                    
                    <div class="quick-action-card" data-action="backup">
                        <div class="quick-action-icon">
                            <i class="fas fa-download"></i>
                        </div>
                        <div class="quick-action-title">Backup erstellen</div>
                        <div class="quick-action-description">Daten sichern</div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Komponenten initialisieren
   */
  initializeComponents() {
    // Charts initialisieren
    this.initializeCharts();

    // Auto-Refresh Badge aktualisieren
    this.updateRefreshBadge();
  }

  /**
   * Charts initialisieren
   */
  initializeCharts() {
    // TODO: Chart-Implementierung mit Chart.js oder ähnlichem
    // Hier würde die Chart-Bibliothek initialisiert werden
    console.log("Charts würden hier initialisiert werden");
  }

  /**
   * Event Listeners binden
   */
  bindEvents() {
    // Refresh Button
    const refreshBtn = document.getElementById("refresh-dashboard");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.refreshDashboard();
      });
    }

    // Quick Actions
    const quickActionCards = document.querySelectorAll(
      ".quick-action-card[data-action]"
    );
    quickActionCards.forEach((card) => {
      card.addEventListener("click", () => {
        const action = card.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Aktivitäten-Links
    const activityItems = document.querySelectorAll(
      ".activity-item[data-link]"
    );
    activityItems.forEach((item) => {
      item.addEventListener("click", () => {
        const link = item.dataset.link;
        this.navigateFromActivity(link);
      });
    });

    // Schneller Auftrag
    const newAuftragBtn = document.getElementById("new-auftrag-quick");
    if (newAuftragBtn) {
      newAuftragBtn.addEventListener("click", () => {
        this.handleQuickAction("new-auftrag");
      });
    }
  }

  /**
   * Quick Action verarbeiten
   * @param {string} action - Action
   */
  handleQuickAction(action) {
    switch (action) {
      case "new-auftrag":
        if (window.navigation) {
          window.navigation.navigateTo("auftraege");
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("open-auftrag-modal"));
          }, 100);
        }
        break;

      case "new-kunde":
        if (window.navigation) {
          window.navigation.navigateTo("kunden");
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("open-kunde-modal"));
          }, 100);
        }
        break;

      case "ueberfaellige-rechnungen":
        if (window.navigation) {
          window.navigation.navigateTo("rechnungen", {
            filter: "ueberfaellig",
          });
        }
        break;

      case "backup":
        this.createBackup();
        break;

      default:
        console.warn("Unknown quick action:", action);
    }
  }

  /**
   * Navigation von Aktivität
   * @param {string} link - Link
   */
  navigateFromActivity(link) {
    const [page, params] = link.split("?");
    const urlParams = new URLSearchParams(params || "");
    const paramObj = Object.fromEntries(urlParams);

    if (window.navigation) {
      window.navigation.navigateTo(page, paramObj);
    }
  }

  /**
   * Dashboard aktualisieren
   */
  async refreshDashboard() {
    try {
      Notification.info("Dashboard wird aktualisiert...");

      // Daten neu laden
      if (window.app) {
        await window.app.refreshData();
        this.data = window.app.data;
      }

      // Dashboard neu rendern
      await this.render();

      Notification.success("Dashboard aktualisiert!");
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
      Notification.error("Fehler beim Aktualisieren des Dashboards");
    }
  }

  /**
   * Auto-Refresh einrichten
   */
  setupAutoRefresh() {
    if (Config.data.autoRefresh.dashboard > 0) {
      this.refreshInterval = setInterval(() => {
        if (document.visibilityState === "visible") {
          this.refreshDashboard();
        }
      }, Config.data.autoRefresh.dashboard);
    }
  }

  /**
   * Backup erstellen
   */
  async createBackup() {
    try {
      Notification.loading("Backup wird erstellt...");

      // TODO: Backup-API aufrufen
      await Helpers.sleep(2000); // Simulation

      Notification.success("Backup erfolgreich erstellt!");
    } catch (error) {
      console.error("Fehler beim Backup:", error);
      Notification.error("Fehler beim Erstellen des Backups");
    }
  }

  /**
   * Hilfsfunktionen
   */
  getGreetingTime() {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  getStatusDistribution() {
    // TODO: Status-Verteilung für Pie Chart
    return {};
  }

  getTopKunden() {
    // TODO: Top-Kunden nach Umsatz
    return [];
  }

  updateRefreshBadge() {
    // TODO: Auto-Refresh-Badge anzeigen
  }

  /**
   * Loading-HTML
   * @returns {string} HTML
   */
  getLoadingHTML() {
    return `
            <div class="dashboard-loading">
                <div class="loading-spinner">
                    <i class="fas fa-spray-can fa-spin text-4xl text-accent mb-lg"></i>
                    <p>Dashboard wird geladen...</p>
                </div>
            </div>
        `;
  }

  /**
   * Error-HTML
   * @param {Error} error - Fehler
   * @returns {string} HTML
   */
  getErrorHTML(error) {
    return `
            <div class="dashboard-error">
                <div class="error-state">
                    <div class="error-state-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="error-state-title">Fehler beim Laden des Dashboards</div>
                    <div class="error-state-description">
                        ${error.message || "Ein unbekannter Fehler ist aufgetreten"}
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-refresh"></i>
                        Seite neu laden
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Cleanup beim Verlassen der Seite
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Charts cleanup
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });

    this.widgets.clear();
  }
}

// Event für Dashboard-spezifische Aktionen
document.addEventListener("open-auftrag-modal", () => {
  if (window.Modal) {
    // TODO: Auftrag-Modal öffnen
    console.log("Auftrag-Modal würde geöffnet werden");
  }
});

document.addEventListener("open-kunde-modal", () => {
  if (window.Modal) {
    // TODO: Kunde-Modal öffnen
    console.log("Kunde-Modal würde geöffnet werden");
  }
});

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = DashboardPage;
}
