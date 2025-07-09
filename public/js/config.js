/**
 * FRONTEND CONFIGURATION
 * Zentrale Konfiguration für die Frontend-Anwendung
 */

const Config = {
  // API-Konfiguration
  api: {
    baseURL: "/api",
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // App-Einstellungen
  app: {
    name: "Lackiererei Pro",
    version: "1.0.0",
    developer: "Development Team",
    buildDate: new Date().toISOString(),
    environment:
      window.location.hostname === "localhost" ? "development" : "production",
  },

  // UI-Einstellungen
  ui: {
    // Notification-Einstellungen
    notifications: {
      autoHide: true,
      autoHideDelay: 5000,
      position: "top-right",
      maxVisible: 3,
    },

    // Modal-Einstellungen
    modals: {
      closeOnBackdropClick: true,
      closeOnEscape: true,
      animation: "fade",
      animationDuration: 300,
    },

    // Tabellen-Einstellungen
    tables: {
      defaultPageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      showPagination: true,
      showSearch: true,
      showFilters: true,
    },

    // Sidebar-Einstellungen
    sidebar: {
      collapsible: true,
      defaultCollapsed: false,
      autoCollapseOnMobile: true,
      persistState: true,
    },

    // Theme-Einstellungen
    theme: {
      mode: "dark", // 'light', 'dark', 'auto'
      primaryColor: "#3b82f6",
      accentColor: "#10b981",
      warningColor: "#f59e0b",
      dangerColor: "#ef4444",
    },
  },

  // Daten-Einstellungen
  data: {
    // Auto-refresh Intervalle (in ms)
    autoRefresh: {
      dashboard: 30000, // 30 Sekunden
      auftraege: 60000, // 1 Minute
      rechnungen: 60000, // 1 Minute
      kunden: 300000, // 5 Minuten
    },

    // Cache-Einstellungen
    cache: {
      enabled: true,
      defaultTTL: 300000, // 5 Minuten
      maxSize: 100, // Max Anzahl gecachte Items
      prefix: "lackiererei_",
    },

    // Validierung
    validation: {
      realTimeValidation: true,
      showInlineErrors: true,
      debounceDelay: 300,
    },
  },

  // Feature Flags
  features: {
    // Experimentelle Features
    enableDarkMode: true,
    enableAutoSave: true,
    enableOfflineMode: false,
    enablePushNotifications: false,
    enableAdvancedSearch: true,
    enableExport: true,
    enableImport: false,
    enableBulkOperations: true,

    // Modulspezifische Features
    auftraege: {
      enableTimeTracking: true,
      enableTemplates: true,
      enableDuplication: true,
      enableStatusHistory: false,
    },

    rechnungen: {
      enableAutoGeneration: true,
      enableDiscounts: true,
      enableTaxCalculation: true,
      enablePaymentTracking: true,
    },

    kunden: {
      enableHistory: true,
      enableNotes: true,
      enableTags: false,
      enableMerging: false,
    },
  },

  // Debugging & Development
  debug: {
    enabled: window.location.hostname === "localhost",
    logLevel: "info", // 'error', 'warn', 'info', 'debug'
    showPerformanceMetrics: false,
    enableDevTools: true,
    mockAPI: false,
  },

  // Lokalisierung
  localization: {
    defaultLanguage: "de",
    supportedLanguages: ["de", "en"],
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
    currencyFormat: {
      currency: "EUR",
      locale: "de-DE",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    numberFormat: {
      locale: "de-DE",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },

  // Performance-Einstellungen
  performance: {
    // Lazy Loading
    lazyLoading: {
      enabled: true,
      threshold: 100, // px vor dem Viewport
      rootMargin: "50px",
    },

    // Virtualisierung für große Listen
    virtualization: {
      enabled: true,
      threshold: 100, // Items ab denen virtualisiert wird
      itemHeight: 50, // Durchschnittliche Item-Höhe
    },

    // Debouncing
    debounce: {
      search: 300,
      input: 300,
      resize: 100,
      scroll: 50,
    },
  },

  // Keyboard Shortcuts
  shortcuts: {
    enabled: true,
    keymap: {
      // Navigation
      "ctrl+1": {
        action: "navigate",
        target: "dashboard",
        description: "Dashboard öffnen",
      },
      "ctrl+2": {
        action: "navigate",
        target: "auftraege",
        description: "Aufträge öffnen",
      },
      "ctrl+3": {
        action: "navigate",
        target: "rechnungen",
        description: "Rechnungen öffnen",
      },
      "ctrl+4": {
        action: "navigate",
        target: "kunden",
        description: "Kunden öffnen",
      },
      "ctrl+5": {
        action: "navigate",
        target: "einstellungen",
        description: "Einstellungen öffnen",
      },

      // Aktionen
      "ctrl+n": {
        action: "create",
        target: "auftrag",
        description: "Neuer Auftrag",
      },
      "ctrl+shift+n": {
        action: "create",
        target: "kunde",
        description: "Neuer Kunde",
      },
      "ctrl+r": { action: "refresh", description: "Daten aktualisieren" },
      "ctrl+f": { action: "search", description: "Suchen" },
      escape: { action: "close", description: "Modals schließen" },

      // Bearbeitung
      "ctrl+s": { action: "save", description: "Speichern" },
      "ctrl+z": { action: "undo", description: "Rückgängig" },
      "ctrl+y": { action: "redo", description: "Wiederholen" },
    },
  },

  // URLs & Routing
  routes: {
    // Seiten-Routes
    dashboard: "/",
    auftraege: "/auftraege",
    rechnungen: "/rechnungen",
    kunden: "/kunden",
    einstellungen: "/einstellungen",

    // API-Endpoints
    api: {
      kunden: "/api/kunden",
      auftraege: "/api/auftraege",
      rechnungen: "/api/rechnungen",
      dashboard: "/api/dashboard",
      settings: "/api/settings",
    },
  },

  // Error Handling
  errorHandling: {
    showUserFriendlyMessages: true,
    logErrors: true,
    sendErrorReports: false,
    retryFailedRequests: true,
    offlineSupport: false,
  },

  // Storage
  storage: {
    prefix: "lackiererei_",
    useCookies: false,
    useLocalStorage: true,
    useSessionStorage: true,
    encryptSensitiveData: false,
  },

  // Accessibility
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderSupport: true,
    keyboardNavigation: true,
    focusVisible: true,
  },

  // Security
  security: {
    sanitizeInput: true,
    validateCSRF: false,
    encryptLocalData: false,
    sessionTimeout: 3600000, // 1 Stunde in ms
    lockScreenAfterInactivity: false,
  },

  // Integration
  integrations: {
    email: {
      enabled: false,
      provider: "smtp",
    },
    export: {
      enabled: true,
      formats: ["pdf", "xlsx", "csv"],
    },
    backup: {
      enabled: true,
      autoBackup: false,
      interval: 86400000, // 24 Stunden
    },
  },
};

// Environment-spezifische Überschreibungen
if (Config.app.environment === "development") {
  Config.debug.enabled = true;
  Config.debug.logLevel = "debug";
  Config.api.timeout = 30000;
  Config.data.autoRefresh.dashboard = 10000; // Schnellere Updates in Dev
}

// Browser-spezifische Anpassungen
if (navigator.userAgent.includes("Mobile")) {
  Config.ui.sidebar.defaultCollapsed = true;
  Config.ui.tables.defaultPageSize = 10;
  Config.performance.virtualization.threshold = 50;
}

// Feature Detection und Fallbacks
if (!("IntersectionObserver" in window)) {
  Config.performance.lazyLoading.enabled = false;
}

if (!("localStorage" in window)) {
  Config.storage.useLocalStorage = false;
  Config.data.cache.enabled = false;
}

// Frozen Config für Unveränderlichkeit in Production
if (Config.app.environment === "production") {
  Object.freeze(Config);
}

// Global verfügbar machen
window.Config = Config;

// Logging für Development
if (Config.debug.enabled) {
  console.log("🔧 Configuration loaded:", Config);
  console.log("🌐 Environment:", Config.app.environment);
  console.log("🎨 Theme:", Config.ui.theme.mode);
  console.log(
    "🚀 Features enabled:",
    Object.keys(Config.features).filter((key) => Config.features[key])
  );
}

// Export für Module
if (typeof module !== "undefined" && module.exports) {
  module.exports = Config;
}
