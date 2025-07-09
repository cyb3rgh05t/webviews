/**
 * NAVIGATION COMPONENT
 * Verwaltet die Sidebar-Navigation und das Routing
 */

class Navigation {
  constructor() {
    this.currentPage = "dashboard";
    this.isCollapsed = false;
    this.isMobileMenuOpen = false;
    this.badges = new Map(); // Für Benachrichtigungen/Zähler

    this.init();
  }

  /**
   * Navigation initialisieren
   */
  init() {
    this.loadNavigationState();
    this.bindEvents();
    this.updateBadges();

    // Auto-Update der Badges
    setInterval(() => this.updateBadges(), 30000);
  }

  /**
   * Navigation-Menü rendern
   */
  render() {
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;

    navMenu.innerHTML = this.generateNavigationHTML();
    this.bindNavigationEvents();
    this.highlightCurrentPage();
  }

  /**
   * Generiert das Navigation-HTML
   * @returns {string} HTML-String
   */
  generateNavigationHTML() {
    const menuItems = [
      {
        id: "dashboard",
        icon: "fas fa-chart-bar",
        text: "Dashboard",
        badge: null,
        shortcut: "Strg+1",
      },
      {
        id: "auftraege",
        icon: "fas fa-clipboard-list",
        text: "Aufträge",
        badge: this.badges.get("auftraege"),
        shortcut: "Strg+2",
      },
      {
        id: "rechnungen",
        icon: "fas fa-file-invoice",
        text: "Rechnungen",
        badge: this.badges.get("rechnungen"),
        shortcut: "Strg+3",
      },
      {
        id: "kunden",
        icon: "fas fa-users",
        text: "Kunden",
        badge: this.badges.get("kunden"),
        shortcut: "Strg+4",
      },
    ];

    const additionalItems = [
      {
        id: "einstellungen",
        icon: "fas fa-cog",
        text: "Einstellungen",
        badge: null,
        shortcut: "Strg+5",
      },
    ];

    let html = "";

    // Haupt-Navigation
    menuItems.forEach((item) => {
      html += this.generateNavItem(item);
    });

    // Trenner
    html += '<div class="nav-section"></div>';

    // Zusätzliche Items
    additionalItems.forEach((item) => {
      html += this.generateNavItem(item);
    });

    // Benutzer-Bereich (falls implementiert)
    if (Config.features.enableUserManagement) {
      html += this.generateUserSection();
    }

    return html;
  }

  /**
   * Generiert ein Navigation-Item
   * @param {Object} item - Item-Daten
   * @returns {string} HTML für das Item
   */
  generateNavItem(item) {
    const badgeHTML = item.badge
      ? `<span class="nav-badge">${item.badge}</span>`
      : "";

    const isActive = this.currentPage === item.id ? "active" : "";

    return `
            <li class="nav-item">
                <a href="#" class="nav-link ${isActive}" 
                   data-page="${item.id}" 
                   title="${item.text} (${item.shortcut})">
                    <i class="${item.icon}"></i>
                    <span class="nav-text">${item.text}</span>
                    ${badgeHTML}
                </a>
            </li>
        `;
  }

  /**
   * Generiert den Benutzer-Bereich
   * @returns {string} HTML für Benutzer-Bereich
   */
  generateUserSection() {
    return `
            <div class="nav-section">
                <div class="nav-section-title">Benutzer</div>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-action="profile">
                        <i class="fas fa-user"></i>
                        <span class="nav-text">Profil</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-action="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span class="nav-text">Abmelden</span>
                    </a>
                </li>
            </div>
        `;
  }

  /**
   * Event-Listener für Navigation binden
   */
  bindNavigationEvents() {
    const navLinks = document.querySelectorAll(".nav-link[data-page]");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
          this.navigateTo(page);
        }
      });
    });

    // Action-Links (Profile, Logout, etc.)
    const actionLinks = document.querySelectorAll(".nav-link[data-action]");
    actionLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const action = link.dataset.action;
        this.handleAction(action);
      });
    });
  }

  /**
   * Allgemeine Events binden
   */
  bindEvents() {
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", () => {
        this.toggleMobileMenu();
      });
    }

    // Sidebar Toggle (Desktop)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this.toggleSidebar();
      }
    });

    // Click outside to close mobile menu
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar");
      const mobileToggle = document.getElementById("mobile-menu-toggle");

      if (
        this.isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        this.closeMobileMenu();
      }
    });

    // Window resize handler
    window.addEventListener(
      "resize",
      Helpers.debounce(() => {
        this.handleResize();
      }, 100)
    );

    // Browser navigation (back/forward)
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.page) {
        this.currentPage = e.state.page;
        this.highlightCurrentPage();
        this.dispatchNavigationEvent(e.state.page, e.state.params || {});
      }
    });
  }

  /**
   * Zu einer Seite navigieren
   * @param {string} page - Seiten-ID
   * @param {Object} params - Parameter
   */
  navigateTo(page, params = {}) {
    if (page === this.currentPage && Object.keys(params).length === 0) {
      return; // Bereits auf der Seite
    }

    // Vorherige Seite merken
    const previousPage = this.currentPage;
    this.currentPage = page;

    // Mobile Menu schließen
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }

    // Navigation highlighten
    this.highlightCurrentPage();

    // URL aktualisieren
    this.updateURL(page, params);

    // Navigation-Event senden
    this.dispatchNavigationEvent(page, params, previousPage);

    // Speichere Navigation-State
    this.saveNavigationState();

    // Analytics (falls implementiert)
    this.trackPageView(page, params);
  }

  /**
   * Aktuelle Seite highlighten
   */
  highlightCurrentPage() {
    const navLinks = document.querySelectorAll(".nav-link[data-page]");

    navLinks.forEach((link) => {
      const page = link.dataset.page;
      if (page === this.currentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /**
   * Mobile Menu umschalten
   */
  toggleMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Mobile Menu öffnen
   */
  openMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.add("open");
      this.isMobileMenuOpen = true;
      document.body.style.overflow = "hidden"; // Scroll verhindern
    }
  }

  /**
   * Mobile Menu schließen
   */
  closeMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
      this.isMobileMenuOpen = false;
      document.body.style.overflow = ""; // Scroll wieder ermöglichen
    }
  }

  /**
   * Sidebar umschalten (Desktop)
   */
  toggleSidebar() {
    if (window.innerWidth <= 768) return; // Nur auf Desktop

    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      this.isCollapsed = !this.isCollapsed;
      sidebar.classList.toggle("collapsed", this.isCollapsed);
      this.saveNavigationState();
    }
  }

  /**
   * Window Resize verarbeiten
   */
  handleResize() {
    if (window.innerWidth > 768) {
      // Desktop: Mobile Menu schließen
      this.closeMobileMenu();

      // Auto-collapse wiederherstellen
      if (Config.ui.sidebar.autoCollapseOnMobile && this.isCollapsed) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
          sidebar.classList.add("collapsed");
        }
      }
    } else {
      // Mobile: Sidebar erweitern
      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.remove("collapsed");
      }
    }
  }

  /**
   * Actions verarbeiten (Profile, Logout, etc.)
   * @param {string} action - Action-Name
   */
  handleAction(action) {
    switch (action) {
      case "profile":
        this.openProfileModal();
        break;
      case "logout":
        this.handleLogout();
        break;
      case "help":
        this.openHelpModal();
        break;
      case "about":
        this.openAboutModal();
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }

  /**
   * Badges/Benachrichtigungen aktualisieren
   */
  async updateBadges() {
    try {
      // Offene Aufträge
      if (window.app && window.app.data.auftraege) {
        const offeneAuftraege = window.app.data.auftraege.filter(
          (a) => a.status === "offen"
        ).length;
        this.setBadge("auftraege", offeneAuftraege || null);
      }

      // Offene Rechnungen
      if (window.app && window.app.data.rechnungen) {
        const offeneRechnungen = window.app.data.rechnungen.filter(
          (r) => r.status === "offen"
        ).length;
        this.setBadge("rechnungen", offeneRechnungen || null);
      }

      // Neue Kunden (letzte 7 Tage)
      if (window.app && window.app.data.kunden) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const neueKunden = window.app.data.kunden.filter(
          (k) => new Date(k.created_at) > sevenDaysAgo
        ).length;
        this.setBadge("kunden", neueKunden || null);
      }
    } catch (error) {
      console.warn("Failed to update badges:", error);
    }
  }

  /**
   * Badge setzen
   * @param {string} page - Seiten-ID
   * @param {number|null} count - Anzahl (null = kein Badge)
   */
  setBadge(page, count) {
    if (count && count > 0) {
      this.badges.set(page, count > 99 ? "99+" : count.toString());
    } else {
      this.badges.delete(page);
    }

    // Badge im DOM aktualisieren
    const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (navLink) {
      const existingBadge = navLink.querySelector(".nav-badge");
      if (existingBadge) {
        existingBadge.remove();
      }

      if (count && count > 0) {
        const badgeHTML = `<span class="nav-badge">${count > 99 ? "99+" : count}</span>`;
        navLink.insertAdjacentHTML("beforeend", badgeHTML);
      }
    }
  }

  /**
   * URL aktualisieren
   * @param {string} page - Seiten-ID
   * @param {Object} params - Parameter
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

    // State für Browser-Navigation
    const state = { page, params };
    window.history.pushState(state, "", url);
  }

  /**
   * Navigation-Event senden
   * @param {string} page - Seiten-ID
   * @param {Object} params - Parameter
   * @param {string} previousPage - Vorherige Seite
   */
  dispatchNavigationEvent(page, params = {}, previousPage = null) {
    const event = new CustomEvent("navigate", {
      detail: {
        page,
        params,
        previousPage,
        timestamp: Date.now(),
      },
    });

    document.dispatchEvent(event);
  }

  /**
   * Navigation-State speichern
   */
  saveNavigationState() {
    if (Config.ui.sidebar.persistState) {
      const state = {
        currentPage: this.currentPage,
        isCollapsed: this.isCollapsed,
        timestamp: Date.now(),
      };

      Helpers.setStorage("navigation_state", state);
    }
  }

  /**
   * Navigation-State laden
   */
  loadNavigationState() {
    if (Config.ui.sidebar.persistState) {
      const state = Helpers.getStorage("navigation_state");

      if (state) {
        this.isCollapsed = state.isCollapsed || false;

        // URL-Parameter prüfen für initiale Seite
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromURL = urlParams.get("page");

        if (pageFromURL) {
          this.currentPage = pageFromURL;
        } else {
          this.currentPage = state.currentPage || "dashboard";
        }
      }
    }

    // Sidebar-State anwenden
    const sidebar = document.getElementById("sidebar");
    if (sidebar && this.isCollapsed && window.innerWidth > 768) {
      sidebar.classList.add("collapsed");
    }
  }

  /**
   * Profil-Modal öffnen
   */
  openProfileModal() {
    // TODO: Implementierung des Profil-Modals
    console.log("Profile modal not yet implemented");
  }

  /**
   * Logout verarbeiten
   */
  handleLogout() {
    if (confirm("Möchten Sie sich wirklich abmelden?")) {
      // TODO: Logout-Logik implementieren
      console.log("Logout not yet implemented");
    }
  }

  /**
   * Hilfe-Modal öffnen
   */
  openHelpModal() {
    // TODO: Hilfe-Modal implementieren
    console.log("Help modal not yet implemented");
  }

  /**
   * About-Modal öffnen
   */
  openAboutModal() {
    const aboutHTML = `
            <div class="text-center">
                <i class="fas fa-spray-can text-4xl text-accent mb-lg"></i>
                <h3>${Config.app.name}</h3>
                <p class="text-muted mb-lg">Version ${Config.app.version}</p>
                <p class="text-sm text-muted">
                    Entwickelt von ${Config.app.developer}<br>
                    Build: ${Helpers.formatDate(Config.app.buildDate, "datetime")}
                </p>
            </div>
        `;

    if (window.Modal) {
      Modal.show("Über die Anwendung", aboutHTML, {
        size: "sm",
        showFooter: false,
      });
    }
  }

  /**
   * Page View tracken (für Analytics)
   * @param {string} page - Seiten-ID
   * @param {Object} params - Parameter
   */
  trackPageView(page, params = {}) {
    if (Config.debug.enabled) {
      console.log("📊 Page view:", { page, params, timestamp: new Date() });
    }

    // Hier könnte Analytics-Code eingefügt werden
    // z.B. Google Analytics, Matomo, etc.
  }

  /**
   * Keyboard Navigation
   * @param {KeyboardEvent} e - Keyboard Event
   */
  handleKeyboardNavigation(e) {
    // Prüfe ob Modals offen sind
    if (document.querySelector(".modal.active")) return;

    // Prüfe ob Input-Feld fokussiert ist
    if (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA"
    )
      return;

    if (e.ctrlKey) {
      const keyMap = {
        1: "dashboard",
        2: "auftraege",
        3: "rechnungen",
        4: "kunden",
        5: "einstellungen",
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        this.navigateTo(keyMap[e.key]);
      }
    }
  }

  /**
   * Status abrufen
   * @returns {Object} Navigation-Status
   */
  getStatus() {
    return {
      currentPage: this.currentPage,
      isCollapsed: this.isCollapsed,
      isMobileMenuOpen: this.isMobileMenuOpen,
      badges: Object.fromEntries(this.badges),
      timestamp: Date.now(),
    };
  }

  /**
   * Navigation zurücksetzen
   */
  reset() {
    this.currentPage = "dashboard";
    this.isCollapsed = false;
    this.isMobileMenuOpen = false;
    this.badges.clear();

    this.closeMobileMenu();
    this.highlightCurrentPage();
    this.saveNavigationState();
  }
}

// Keyboard Navigation global binden
document.addEventListener("keydown", (e) => {
  if (window.navigation) {
    window.navigation.handleKeyboardNavigation(e);
  }
});

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = Navigation;
}
