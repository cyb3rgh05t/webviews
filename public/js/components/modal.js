/**
 * MODAL SYSTEM
 * Verwaltet alle Modals und deren Interaktionen
 */

class ModalSystem {
  constructor() {
    this.activeModals = new Map();
    this.modalStack = [];
    this.backdrop = null;

    this.init();
  }

  /**
   * Modal-System initialisieren
   */
  init() {
    this.createBackdrop();
    this.bindGlobalEvents();
  }

  /**
   * Backdrop erstellen
   */
  createBackdrop() {
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1040;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            backdrop-filter: blur(4px);
        `;
    document.body.appendChild(this.backdrop);
  }

  /**
   * Globale Events binden
   */
  bindGlobalEvents() {
    // Escape-Taste
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalStack.length > 0) {
        const topModal = this.modalStack[this.modalStack.length - 1];
        if (topModal.options.closeOnEscape) {
          this.hide(topModal.id);
        }
      }
    });

    // Backdrop-Click
    this.backdrop.addEventListener("click", (e) => {
      if (e.target === this.backdrop && this.modalStack.length > 0) {
        const topModal = this.modalStack[this.modalStack.length - 1];
        if (topModal.options.closeOnBackdropClick) {
          this.hide(topModal.id);
        }
      }
    });

    // Window resize
    window.addEventListener(
      "resize",
      Helpers.debounce(() => {
        this.updateModalPositions();
      }, 100)
    );
  }

  /**
   * Modal anzeigen
   * @param {string} title - Titel
   * @param {string|HTMLElement} content - Inhalt
   * @param {Object} options - Optionen
   * @returns {string} Modal-ID
   */
  show(title, content, options = {}) {
    const id = this.generateId();
    const modal = this.createModal(id, title, content, options);

    this.activeModals.set(id, modal);
    this.modalStack.push(modal);

    document.body.appendChild(modal.element);
    this.showBackdrop();

    // Animation
    requestAnimationFrame(() => {
      this.animateIn(modal);
    });

    // Auto-focus
    if (modal.options.autoFocus) {
      setTimeout(() => {
        this.focusFirstInput(modal.element);
      }, 350);
    }

    // Prevent body scroll
    this.preventBodyScroll();

    return id;
  }

  /**
   * Modal erstellen
   * @param {string} id - ID
   * @param {string} title - Titel
   * @param {string|HTMLElement} content - Inhalt
   * @param {Object} options - Optionen
   * @returns {Object} Modal-Objekt
   */
  createModal(id, title, content, options) {
    const defaultOptions = {
      size: "md", // 'sm', 'md', 'lg', 'xl', 'fullscreen'
      closeOnEscape: true,
      closeOnBackdropClick: true,
      showHeader: true,
      showFooter: true,
      showCloseButton: true,
      autoFocus: true,
      animation: "fade", // 'fade', 'slide', 'zoom'
      buttons: [],
      className: "",
      onShow: null,
      onHide: null,
      onConfirm: null,
      onCancel: null,
    };

    const finalOptions = { ...defaultOptions, ...options };

    const modal = {
      id,
      title,
      content,
      options: finalOptions,
      element: this.createElement(id, title, content, finalOptions),
      isVisible: false,
    };

    this.bindModalEvents(modal);
    return modal;
  }

  /**
   * Modal-Element erstellen
   * @param {string} id - ID
   * @param {string} title - Titel
   * @param {string|HTMLElement} content - Inhalt
   * @param {Object} options - Optionen
   * @returns {HTMLElement} Modal-Element
   */
  createElement(id, title, content, options) {
    const modal = document.createElement("div");
    modal.className = `modal modal-${options.size} ${options.className}`;
    modal.setAttribute("data-modal-id", id);
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1050;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
        `;

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.cssText = this.getModalContentStyles(options);

    let html = "";

    // Header
    if (options.showHeader) {
      html += `
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${
                      options.showCloseButton
                        ? '<button class="modal-close" type="button" aria-label="Schließen"><i class="fas fa-times"></i></button>'
                        : ""
                    }
                </div>
            `;
    }

    // Body
    html += '<div class="modal-body">';
    if (typeof content === "string") {
      html += content;
    } else {
      // Für HTMLElement wird später appendChild verwendet
      html += '<div class="modal-content-placeholder"></div>';
    }
    html += "</div>";

    // Footer
    if (options.showFooter && options.buttons.length > 0) {
      html += '<div class="modal-footer">';
      options.buttons.forEach((button) => {
        const btnClass = `btn ${button.className || "btn-secondary"}`;
        html += `<button type="button" class="${btnClass}" data-action="${button.action}">${button.text}</button>`;
      });
      html += "</div>";
    }

    modalContent.innerHTML = html;

    // HTMLElement-Content einfügen
    if (typeof content !== "string") {
      const placeholder = modalContent.querySelector(
        ".modal-content-placeholder"
      );
      if (placeholder && content instanceof HTMLElement) {
        placeholder.parentNode.replaceChild(content, placeholder);
      }
    }

    modal.appendChild(modalContent);
    return modal;
  }

  /**
   * Modal-Content-Styles abrufen
   * @param {Object} options - Optionen
   * @returns {string} CSS-Styles
   */
  getModalContentStyles(options) {
    const sizeMap = {
      sm: "max-width: 400px;",
      md: "max-width: 600px;",
      lg: "max-width: 900px;",
      xl: "max-width: 1200px;",
      fullscreen: "max-width: 95vw; max-height: 95vh;",
    };

    return `
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            width: 100%;
            ${sizeMap[options.size] || sizeMap.md}
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
  }

  /**
   * Modal-Events binden
   * @param {Object} modal - Modal-Objekt
   */
  bindModalEvents(modal) {
    const element = modal.element;

    // Close Button
    const closeBtn = element.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hide(modal.id);
      });
    }

    // Footer Buttons
    const footerBtns = element.querySelectorAll(
      ".modal-footer button[data-action]"
    );
    footerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        this.handleButtonClick(modal, action);
      });
    });

    // Form Submission
    const forms = element.querySelectorAll("form");
    forms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit(modal, form);
      });
    });
  }

  /**
   * Button-Click verarbeiten
   * @param {Object} modal - Modal-Objekt
   * @param {string} action - Action
   */
  handleButtonClick(modal, action) {
    const button = modal.options.buttons.find((btn) => btn.action === action);

    if (button && typeof button.handler === "function") {
      const result = button.handler(modal);

      // Promise-Support
      if (result instanceof Promise) {
        this.setModalLoading(modal.id, true);
        result
          .then((shouldClose) => {
            this.setModalLoading(modal.id, false);
            if (shouldClose !== false) {
              this.hide(modal.id);
            }
          })
          .catch((error) => {
            this.setModalLoading(modal.id, false);
            console.error("Modal button handler error:", error);
          });
      } else if (result !== false) {
        this.hide(modal.id);
      }
    } else {
      // Standard-Actions
      switch (action) {
        case "confirm":
          if (modal.options.onConfirm) {
            modal.options.onConfirm(modal);
          }
          this.hide(modal.id);
          break;
        case "cancel":
          if (modal.options.onCancel) {
            modal.options.onCancel(modal);
          }
          this.hide(modal.id);
          break;
        default:
          this.hide(modal.id);
      }
    }
  }

  /**
   * Form-Submit verarbeiten
   * @param {Object} modal - Modal-Objekt
   * @param {HTMLFormElement} form - Form
   */
  handleFormSubmit(modal, form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (modal.options.onConfirm) {
      const result = modal.options.onConfirm(data, modal);

      if (result instanceof Promise) {
        this.setModalLoading(modal.id, true);
        result
          .then((shouldClose) => {
            this.setModalLoading(modal.id, false);
            if (shouldClose !== false) {
              this.hide(modal.id);
            }
          })
          .catch((error) => {
            this.setModalLoading(modal.id, false);
            console.error("Modal form submit error:", error);
          });
      } else if (result !== false) {
        this.hide(modal.id);
      }
    }
  }

  /**
   * Modal verstecken
   * @param {string} id - Modal-ID
   */
  hide(id) {
    const modal = this.activeModals.get(id);
    if (!modal || !modal.isVisible) return;

    // onHide callback
    if (modal.options.onHide) {
      modal.options.onHide(modal);
    }

    // Animation
    this.animateOut(modal, () => {
      // Element entfernen
      if (modal.element.parentNode) {
        modal.element.parentNode.removeChild(modal.element);
      }

      // Aus Maps/Arrays entfernen
      this.activeModals.delete(id);
      const stackIndex = this.modalStack.findIndex((m) => m.id === id);
      if (stackIndex !== -1) {
        this.modalStack.splice(stackIndex, 1);
      }

      // Backdrop verwalten
      if (this.modalStack.length === 0) {
        this.hideBackdrop();
        this.restoreBodyScroll();
      }
    });
  }

  /**
   * Alle Modals schließen
   */
  hideAll() {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach((id) => this.hide(id));
  }

  /**
   * Modal-Loading-State setzen
   * @param {string} id - Modal-ID
   * @param {boolean} loading - Loading-State
   */
  setModalLoading(id, loading) {
    const modal = this.activeModals.get(id);
    if (!modal) return;

    const footerBtns = modal.element.querySelectorAll(".modal-footer button");
    const closeBtn = modal.element.querySelector(".modal-close");

    if (loading) {
      footerBtns.forEach((btn) => {
        btn.disabled = true;
        if (btn.dataset.action === "confirm") {
          btn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Wird verarbeitet...';
        }
      });
      if (closeBtn) closeBtn.disabled = true;
    } else {
      footerBtns.forEach((btn) => {
        btn.disabled = false;
        const originalButton = modal.options.buttons.find(
          (b) => b.action === btn.dataset.action
        );
        if (originalButton) {
          btn.innerHTML = originalButton.text;
        }
      });
      if (closeBtn) closeBtn.disabled = false;
    }
  }

  /**
   * Modal-Content aktualisieren
   * @param {string} id - Modal-ID
   * @param {string|HTMLElement} content - Neuer Inhalt
   */
  updateContent(id, content) {
    const modal = this.activeModals.get(id);
    if (!modal) return;

    const bodyEl = modal.element.querySelector(".modal-body");
    if (bodyEl) {
      if (typeof content === "string") {
        bodyEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        bodyEl.innerHTML = "";
        bodyEl.appendChild(content);
      }
    }
  }

  /**
   * Modal-Titel aktualisieren
   * @param {string} id - Modal-ID
   * @param {string} title - Neuer Titel
   */
  updateTitle(id, title) {
    const modal = this.activeModals.get(id);
    if (!modal) return;

    const titleEl = modal.element.querySelector(".modal-title");
    if (titleEl) {
      titleEl.textContent = title;
    }
    modal.title = title;
  }

  /**
   * Animation In
   * @param {Object} modal - Modal
   */
  animateIn(modal) {
    const element = modal.element;
    modal.isVisible = true;

    element.style.visibility = "visible";

    if (modal.options.animation === "slide") {
      element.style.transform = "translateY(-50px)";
      element.style.opacity = "0";
      requestAnimationFrame(() => {
        element.style.transition =
          "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        element.style.transform = "translateY(0)";
        element.style.opacity = "1";
      });
    } else if (modal.options.animation === "zoom") {
      element.style.transform = "scale(0.8)";
      element.style.opacity = "0";
      requestAnimationFrame(() => {
        element.style.transition =
          "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        element.style.transform = "scale(1)";
        element.style.opacity = "1";
      });
    } else {
      // Default fade
      requestAnimationFrame(() => {
        element.style.transition = "all 0.3s ease";
        element.style.opacity = "1";
      });
    }

    // onShow callback
    if (modal.options.onShow) {
      setTimeout(() => {
        modal.options.onShow(modal);
      }, 350);
    }
  }

  /**
   * Animation Out
   * @param {Object} modal - Modal
   * @param {Function} callback - Callback
   */
  animateOut(modal, callback) {
    const element = modal.element;
    modal.isVisible = false;

    element.style.transition = "all 0.2s ease";

    if (modal.options.animation === "slide") {
      element.style.transform = "translateY(-50px)";
    } else if (modal.options.animation === "zoom") {
      element.style.transform = "scale(0.8)";
    }

    element.style.opacity = "0";

    setTimeout(callback, 200);
  }

  /**
   * Backdrop anzeigen
   */
  showBackdrop() {
    this.backdrop.style.visibility = "visible";
    requestAnimationFrame(() => {
      this.backdrop.style.opacity = "1";
    });
  }

  /**
   * Backdrop verstecken
   */
  hideBackdrop() {
    this.backdrop.style.opacity = "0";
    setTimeout(() => {
      this.backdrop.style.visibility = "hidden";
    }, 300);
  }

  /**
   * Body-Scroll verhindern
   */
  preventBodyScroll() {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = this.getScrollbarWidth() + "px";
  }

  /**
   * Body-Scroll wiederherstellen
   */
  restoreBodyScroll() {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  /**
   * Scrollbar-Breite ermitteln
   * @returns {number} Scrollbar-Breite
   */
  getScrollbarWidth() {
    const div = document.createElement("div");
    div.style.cssText =
      "width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;";
    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarWidth;
  }

  /**
   * Erstes Input-Element fokussieren
   * @param {HTMLElement} element - Element
   */
  focusFirstInput(element) {
    const firstInput = element.querySelector("input, textarea, select, button");
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Modal-Positionen aktualisieren
   */
  updateModalPositions() {
    // Wird bei Window-Resize aufgerufen
    // Hier könnten spezielle Positioning-Updates implementiert werden
  }

  /**
   * Eindeutige ID generieren
   * @returns {string} ID
   */
  generateId() {
    return (
      "modal_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // === VORGEFERTIGTE MODAL-TYPEN ===

  /**
   * Confirm-Dialog
   * @param {string} title - Titel
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {Promise<boolean>} User-Entscheidung
   */
  confirm(title, message, options = {}) {
    return new Promise((resolve) => {
      const defaultOptions = {
        size: "sm",
        buttons: [
          {
            text: "Abbrechen",
            action: "cancel",
            className: "btn-secondary",
            handler: () => resolve(false),
          },
          {
            text: "Bestätigen",
            action: "confirm",
            className: "btn-primary",
            handler: () => resolve(true),
          },
        ],
      };

      this.show(title, `<p>${message}</p>`, { ...defaultOptions, ...options });
    });
  }

  /**
   * Alert-Dialog
   * @param {string} title - Titel
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {Promise<void>}
   */
  alert(title, message, options = {}) {
    return new Promise((resolve) => {
      const defaultOptions = {
        size: "sm",
        buttons: [
          {
            text: "OK",
            action: "confirm",
            className: "btn-primary",
            handler: () => resolve(),
          },
        ],
      };

      this.show(title, `<p>${message}</p>`, { ...defaultOptions, ...options });
    });
  }

  /**
   * Prompt-Dialog
   * @param {string} title - Titel
   * @param {string} message - Nachricht
   * @param {string} defaultValue - Default-Wert
   * @param {Object} options - Optionen
   * @returns {Promise<string|null>} User-Eingabe
   */
  prompt(title, message, defaultValue = "", options = {}) {
    return new Promise((resolve) => {
      const inputId = "prompt_input_" + Date.now();
      const content = `
                <div class="form-group">
                    <label for="${inputId}" class="form-label">${message}</label>
                    <input type="text" id="${inputId}" class="form-input" value="${defaultValue}" autofocus>
                </div>
            `;

      const defaultOptions = {
        size: "sm",
        buttons: [
          {
            text: "Abbrechen",
            action: "cancel",
            className: "btn-secondary",
            handler: () => resolve(null),
          },
          {
            text: "OK",
            action: "confirm",
            className: "btn-primary",
            handler: (modal) => {
              const input = modal.element.querySelector(`#${inputId}`);
              resolve(input ? input.value : null);
            },
          },
        ],
      };

      this.show(title, content, { ...defaultOptions, ...options });
    });
  }

  /**
   * Loading-Modal
   * @param {string} message - Nachricht
   * @param {Object} options - Optionen
   * @returns {string} Modal-ID
   */
  loading(message = "Wird geladen...", options = {}) {
    const content = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-accent mb-lg"></i>
                <p>${message}</p>
            </div>
        `;

    const defaultOptions = {
      size: "sm",
      showHeader: false,
      showFooter: false,
      closeOnEscape: false,
      closeOnBackdropClick: false,
    };

    return this.show("", content, { ...defaultOptions, ...options });
  }

  /**
   * Status abrufen
   * @returns {Object} Status
   */
  getStatus() {
    return {
      activeModals: this.activeModals.size,
      modalStack: this.modalStack.length,
      topModal:
        this.modalStack.length > 0
          ? this.modalStack[this.modalStack.length - 1].id
          : null,
    };
  }
}

// Globale Instanz erstellen
const Modal = new ModalSystem();

// Global verfügbar machen
window.Modal = Modal;

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = ModalSystem;
}

// Development Logging
if (Config.debug.enabled) {
  console.log("🪟 Modal System initialized");
}
