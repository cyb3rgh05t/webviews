/**
 * NOTIFICATION SYSTEM
 * Verwaltet Toast-Benachrichtigungen und Meldungen
 */

class NotificationSystem {
  constructor() {
    this.notifications = new Map();
    this.queue = [];
    this.maxVisible = Config.ui.notifications.maxVisible;
    this.autoHide = Config.ui.notifications.autoHide;
    this.autoHideDelay = Config.ui.notifications.autoHideDelay;
    this.position = Config.ui.notifications.position;

    this.init();
  }

  /**
   * Notification-System initialisieren
   */
  init() {
    this.createContainer();
    this.bindEvents();
  }

  /**
   * Container für Notifications erstellen
   */
  createContainer() {
    let container = document.getElementById("notification-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      container.className = "notification-container";
      container.style.cssText = this.getContainerStyles();
      document.body.appendChild(container);
    }
  }

  /**
   * Container-Styles basierend auf Position
   * @returns {string} CSS-Styles
   */
  getContainerStyles() {
    const baseStyles = `
            position: fixed;
            z-index: ${Config.ui.zIndex?.notification || 1000};
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 420px;
            width: 100%;
        `;

    const positionStyles = {
      "top-right": "top: 20px; right: 20px; align-items: flex-end;",
      "top-left": "top: 20px; left: 20px; align-items: flex-start;",
      "bottom-right": "bottom: 20px; right: 20px; align-items: flex-end;",
      "bottom-left": "bottom: 20px; left: 20px; align-items: flex-start;",
      "top-center":
        "top: 20px; left: 50%; transform: translateX(-50%); align-items: center;",
      "bottom-center":
        "bottom: 20px; left: 50%; transform: translateX(-50%); align-items: center;",
    };

    return (
      baseStyles +
      (positionStyles[this.position] || positionStyles["top-right"])
    );
  }

  /**
   * Events binden
   */
  bindEvents() {
    // Escape-Taste zum Schließen aller Notifications
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearAll();
      }
    });

    // Window focus für Auto-Hide Resume
    window.addEventListener("focus", () => {
      this.resumeAutoHide();
    });

    window.addEventListener("blur", () => {
      this.pauseAutoHide();
    });
  }

  /**
   * Notification anzeigen
   * @param {string} message - Nachricht
   * @param {string} type - Typ ('success', 'error', 'warning', 'info')
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  show(message, type = "info", options = {}) {
    const id = this.generateId();

    const notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
      ...this.getDefaultOptions(),
      ...options,
    };

    // Zur Queue hinzufügen wenn zu viele sichtbar
    if (this.notifications.size >= this.maxVisible) {
      this.queue.push(notification);
      return id;
    }

    this.notifications.set(id, notification);
    this.renderNotification(notification);

    // Auto-Hide Timer
    if (notification.autoHide) {
      this.setAutoHideTimer(id, notification.autoHideDelay);
    }

    return id;
  }

  /**
   * Success-Notification
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  success(message, options = {}) {
    return this.show(message, "success", options);
  }

  /**
   * Error-Notification
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  error(message, options = {}) {
    return this.show(message, "error", {
      autoHide: false,
      ...options,
    });
  }

  /**
   * Warning-Notification
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  warning(message, options = {}) {
    return this.show(message, "warning", options);
  }

  /**
   * Info-Notification
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  info(message, options = {}) {
    return this.show(message, "info", options);
  }

  /**
   * Loading-Notification
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  loading(message, options = {}) {
    return this.show(message, "loading", {
      autoHide: false,
      showClose: false,
      ...options,
    });
  }

  /**
   * Progress-Notification
   * @param {string} message - Nachricht
   * @param {number} progress - Fortschritt (0-100)
   * @param {Object} options - Optionen
   * @returns {string} Notification-ID
   */
  progress(message, progress = 0, options = {}) {
    return this.show(message, "progress", {
      autoHide: false,
      progress: Math.max(0, Math.min(100, progress)),
      ...options,
    });
  }

  /**
   * Notification aktualisieren
   * @param {string} id - Notification-ID
   * @param {Object} updates - Updates
   */
  update(id, updates) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    Object.assign(notification, updates);

    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      this.updateNotificationElement(element, notification);
    }
  }

  /**
   * Notification schließen
   * @param {string} id - Notification-ID
   */
  hide(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      this.animateOut(element, () => {
        element.remove();
        this.notifications.delete(id);
        this.processQueue();
      });
    }
  }

  /**
   * Alle Notifications schließen
   */
  clearAll() {
    this.notifications.forEach((notification, id) => {
      this.hide(id);
    });
    this.queue = [];
  }

  /**
   * Notifications eines Typs schließen
   * @param {string} type - Typ
   */
  clearByType(type) {
    this.notifications.forEach((notification, id) => {
      if (notification.type === type) {
        this.hide(id);
      }
    });
  }

  /**
   * Notification rendern
   * @param {Object} notification - Notification-Daten
   */
  renderNotification(notification) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const element = this.createNotificationElement(notification);

    // Animation je nach Position
    if (this.position.includes("top")) {
      container.appendChild(element);
    } else {
      container.insertBefore(element, container.firstChild);
    }

    // Animate In
    requestAnimationFrame(() => {
      this.animateIn(element);
    });

    // Event Listeners
    this.bindNotificationEvents(element, notification);
  }

  /**
   * Notification-Element erstellen
   * @param {Object} notification - Notification-Daten
   * @returns {HTMLElement} Notification-Element
   */
  createNotificationElement(notification) {
    const element = document.createElement("div");
    element.className = `notification notification-${notification.type}`;
    element.setAttribute("data-notification-id", notification.id);
    element.style.pointerEvents = "auto";

    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
      loading: "fas fa-spinner fa-spin",
      progress: "fas fa-tasks",
    };

    const icon = iconMap[notification.type] || iconMap.info;

    let content = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-message">
                    ${notification.message}
                </div>
        `;

    // Close Button
    if (notification.showClose) {
      content += `
                <button class="notification-close" type="button" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            `;
    }

    content += "</div>";

    // Progress Bar
    if (notification.type === "progress") {
      content += `
                <div class="notification-progress">
                    <div class="progress-bar" style="width: ${notification.progress}%"></div>
                </div>
            `;
    }

    // Actions
    if (notification.actions && notification.actions.length > 0) {
      content += '<div class="notification-actions">';
      notification.actions.forEach((action) => {
        content += `
                    <button class="notification-action-btn" data-action="${action.id}">
                        ${action.label}
                    </button>
                `;
      });
      content += "</div>";
    }

    element.innerHTML = content;
    return element;
  }

  /**
   * Notification-Element aktualisieren
   * @param {HTMLElement} element - Element
   * @param {Object} notification - Notification-Daten
   */
  updateNotificationElement(element, notification) {
    const messageEl = element.querySelector(".notification-message");
    if (messageEl) {
      messageEl.textContent = notification.message;
    }

    const progressBar = element.querySelector(".progress-bar");
    if (progressBar && notification.progress !== undefined) {
      progressBar.style.width = `${notification.progress}%`;
    }

    // Typ-Klasse aktualisieren
    element.className = `notification notification-${notification.type}`;
  }

  /**
   * Event-Listener für Notification binden
   * @param {HTMLElement} element - Element
   * @param {Object} notification - Notification-Daten
   */
  bindNotificationEvents(element, notification) {
    // Close Button
    const closeBtn = element.querySelector(".notification-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hide(notification.id);
      });
    }

    // Action Buttons
    const actionBtns = element.querySelectorAll(".notification-action-btn");
    actionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const actionId = btn.dataset.action;
        const action = notification.actions.find((a) => a.id === actionId);

        if (action && typeof action.handler === "function") {
          action.handler(notification);

          if (action.closeOnClick !== false) {
            this.hide(notification.id);
          }
        }
      });
    });

    // Click to dismiss (optional)
    if (notification.clickToDismiss) {
      element.addEventListener("click", (e) => {
        if (
          !e.target.closest(".notification-close, .notification-action-btn")
        ) {
          this.hide(notification.id);
        }
      });
    }

    // Hover Pause (für Auto-Hide)
    if (notification.autoHide) {
      element.addEventListener("mouseenter", () => {
        this.pauseAutoHideTimer(notification.id);
      });

      element.addEventListener("mouseleave", () => {
        this.resumeAutoHideTimer(notification.id);
      });
    }
  }

  /**
   * Auto-Hide Timer setzen
   * @param {string} id - Notification-ID
   * @param {number} delay - Verzögerung in ms
   */
  setAutoHideTimer(id, delay) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.autoHideTimer = setTimeout(() => {
      this.hide(id);
    }, delay);
  }

  /**
   * Auto-Hide Timer pausieren
   * @param {string} id - Notification-ID
   */
  pauseAutoHideTimer(id) {
    const notification = this.notifications.get(id);
    if (!notification || !notification.autoHideTimer) return;

    clearTimeout(notification.autoHideTimer);
    notification.remainingTime =
      notification.autoHideDelay - (Date.now() - notification.timestamp);
  }

  /**
   * Auto-Hide Timer fortsetzen
   * @param {string} id - Notification-ID
   */
  resumeAutoHideTimer(id) {
    const notification = this.notifications.get(id);
    if (!notification || !notification.remainingTime) return;

    notification.autoHideTimer = setTimeout(() => {
      this.hide(id);
    }, notification.remainingTime);
  }

  /**
   * Alle Auto-Hide Timer pausieren
   */
  pauseAutoHide() {
    this.notifications.forEach((notification, id) => {
      if (notification.autoHide) {
        this.pauseAutoHideTimer(id);
      }
    });
  }

  /**
   * Alle Auto-Hide Timer fortsetzen
   */
  resumeAutoHide() {
    this.notifications.forEach((notification, id) => {
      if (notification.autoHide && notification.remainingTime) {
        this.resumeAutoHideTimer(id);
      }
    });
  }

  /**
   * Queue verarbeiten
   */
  processQueue() {
    if (this.queue.length > 0 && this.notifications.size < this.maxVisible) {
      const notification = this.queue.shift();
      this.notifications.set(notification.id, notification);
      this.renderNotification(notification);

      if (notification.autoHide) {
        this.setAutoHideTimer(notification.id, notification.autoHideDelay);
      }
    }
  }

  /**
   * Animate In
   * @param {HTMLElement} element - Element
   */
  animateIn(element) {
    element.style.transform = this.position.includes("right")
      ? "translateX(100%)"
      : "translateX(-100%)";
    element.style.opacity = "0";

    requestAnimationFrame(() => {
      element.style.transition =
        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      element.style.transform = "translateX(0)";
      element.style.opacity = "1";
    });
  }

  /**
   * Animate Out
   * @param {HTMLElement} element - Element
   * @param {Function} callback - Callback
   */
  animateOut(element, callback) {
    element.style.transition = "all 0.2s ease-in";
    element.style.transform = this.position.includes("right")
      ? "translateX(100%)"
      : "translateX(-100%)";
    element.style.opacity = "0";

    setTimeout(callback, 200);
  }

  /**
   * Default-Optionen abrufen
   * @returns {Object} Default-Optionen
   */
  getDefaultOptions() {
    return {
      autoHide: this.autoHide,
      autoHideDelay: this.autoHideDelay,
      showClose: true,
      clickToDismiss: false,
      actions: [],
    };
  }

  /**
   * Eindeutige ID generieren
   * @returns {string} ID
   */
  generateId() {
    return (
      "notification_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Status abrufen
   * @returns {Object} Status
   */
  getStatus() {
    return {
      visible: this.notifications.size,
      queued: this.queue.length,
      maxVisible: this.maxVisible,
      position: this.position,
    };
  }

  /**
   * Konfiguration aktualisieren
   * @param {Object} config - Neue Konfiguration
   */
  updateConfig(config) {
    if (config.maxVisible !== undefined) {
      this.maxVisible = config.maxVisible;
    }

    if (config.autoHide !== undefined) {
      this.autoHide = config.autoHide;
    }

    if (config.autoHideDelay !== undefined) {
      this.autoHideDelay = config.autoHideDelay;
    }

    if (config.position !== undefined) {
      this.position = config.position;
      this.updateContainerPosition();
    }
  }

  /**
   * Container-Position aktualisieren
   */
  updateContainerPosition() {
    const container = document.getElementById("notification-container");
    if (container) {
      container.style.cssText = this.getContainerStyles();
    }
  }
}

// Globale Instanz erstellen
const Notification = new NotificationSystem();

// Global verfügbar machen
window.Notification = Notification;

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = NotificationSystem;
}

// Development Logging
if (Config.debug.enabled) {
  console.log("🔔 Notification System initialized");
}
