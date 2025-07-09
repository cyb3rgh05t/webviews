# 🎨 Lackiererei Management System

Ein modernes, webbasiertes Verwaltungssystem für Lackierereien mit eleganter Dark Mode Oberfläche. Basierend auf Ihrem VBA-Code, aber als vollständige Web-Anwendung mit **modularer Architektur** implementiert.

## 🏗️ Projektstruktur

```
lackiererei-system/
│
├── 📁 config/                 # Konfigurationsdateien
│   └── database.js           # Datenbankinitialisierung
│
├── 📁 routes/                 # API-Routen (modular)
│   ├── kunden.js             # Kunden-Endpoints
│   ├── auftraege.js          # Auftrags-Endpoints
│   ├── rechnungen.js         # Rechnungs-Endpoints
│   ├── dashboard.js          # Dashboard-Endpoints
│   └── settings.js           # Einstellungs-Endpoints
│
├── 📁 models/                 # Datenbankmodelle
│   ├── kunden.js             # Kunden-Datenbanklogik
│   ├── auftraege.js          # Auftrags-Datenbanklogik
│   ├── rechnungen.js         # Rechnungs-Datenbanklogik
│   └── arbeitsschritte.js    # Arbeitsschritt-Datenbanklogik
│
├── 📁 utils/                  # Hilfsfunktionen
│   ├── numbers.js            # Nummernverwaltung (wie VBA)
│   ├── validation.js         # Validierungsfunktionen
│   ├── templates.js          # Schnell-Zeiten Templates
│   └── helpers.js            # Allgemeine Hilfsfunktionen
│
├── 📁 public/                 # Frontend-Dateien
│   ├── index.html            # Haupt-HTML-Datei
│   │
│   ├── 📁 css/               # Stylesheets (modular)
│   │   ├── variables.css     # CSS-Variablen & Design System
│   │   ├── base.css          # Grundstyles
│   │   ├── components.css    # UI-Komponenten
│   │   ├── layout.css        # Layout & Grid
│   │   └── responsive.css    # Mobile/Responsive
│   │
│   └── 📁 js/                # JavaScript (modular)
│       ├── app.js            # Haupt-App-Logik
│       ├── config.js         # Frontend-Konfiguration
│       │
│       ├── 📁 utils/         # Frontend-Utilities
│       │   ├── api.js        # API-Client
│       │   ├── helpers.js    # Hilfsfunktionen
│       │   └── validation.js # Frontend-Validierung
│       │
│       ├── 📁 components/    # UI-Komponenten
│       │   ├── navigation.js # Navigation
│       │   ├── modal.js      # Modal-System
│       │   ├── table.js      # Tabellen-Komponente
│       │   └── notification.js # Benachrichtigungen
│       │
│       └── 📁 pages/         # Seiten-Logik
│           ├── dashboard.js  # Dashboard
│           ├── kunden.js     # Kunden-Verwaltung
│           ├── auftraege.js  # Auftrags-Verwaltung
│           ├── rechnungen.js # Rechnungs-Verwaltung
│           └── einstellungen.js # Einstellungen
│
├── 📁 scripts/               # Utility-Scripts
│   ├── setup.js             # Ersteinrichtung
│   ├── backup.js            # Backup-Erstellung
│   ├── migrate.js           # Datenbank-Migration
│   └── seed.js              # Testdaten
│
├── 📁 tests/                 # Tests
│   ├── unit/                # Unit-Tests
│   └── integration/         # Integrationstests
│
├── server.js                # Haupt-Server
├── package.json             # Node.js-Abhängigkeiten
├── .env.example             # Umgebungsvariablen-Vorlage
└── README.md               # Diese Anleitung
```

## ✨ Features (wie im VBA-Code)

### 🔧 Auftragsmanagement

- **Neuer Auftrag erstellen** - `NeuerAuftrag()` → Modular in `/routes/auftraege.js`
- **Automatische REP-Nummer** - `NaechsteNummer()` → `/utils/numbers.js`
- **Standard-Arbeitsschritte** - `StandardArbeitsschritte()` → Templates
- **Schnell-Zeiten** - `SchnellZeitenAuftrag()` → 5 Templates verfügbar
- **Kundendaten-Management** - `KundendatenAendern()` → Vollständig portiert

### 💰 Rechnungsmanagement

- **Auftrag zu Rechnung** - `AuftragZurRechnung()` → API-Endpoint
- **Rabatt-System** - `Rabatt5/10/15Prozent()` → Frontend-Buttons
- **Automatische Berechnung** - MwSt, Netto, Brutto
- **Rechnungsnummern** - `R/2025-001` Format beibehalten

### 👥 Kundenverwaltung

- **Intelligente Nummern** - `K-001` Format wie im VBA
- **Adressverwaltung** - `KundenadresseAendern()` → Modular
- **Platzhalter-Prüfung** - `KundendatenValidierung()` → Vollständig

## 🚀 Installation & Setup

### 1. **Projekt klonen/erstellen**

```bash
mkdir lackiererei-system
cd lackiererei-system
```

### 2. **Dateien erstellen**

Erstellen Sie die Projektstruktur und kopieren Sie die Artifacts:

- `server.js` (Haupt-Server)
- `package.json` (Abhängigkeiten)
- Alle Dateien aus den Artifacts in entsprechende Ordner

### 3. **Abhängigkeiten installieren**

```bash
npm install
```

### 4. **Entwicklungsumgebung** (optional)

```bash
npm install --save-dev
```

### 5. **Starten**

```bash
# Produktionsmodus
npm start

# Entwicklungsmodus (Auto-Reload)
npm run dev
```

**Öffnen:** `http://localhost:3000`

## 🎯 Entwicklung & Erweiterung

### Neue Route hinzufügen

```javascript
// 1. Route erstellen: routes/meine-route.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Meine Route" });
});

module.exports = router;

// 2. In server.js registrieren
app.use("/api/meine-route", require("./routes/meine-route"));
```

### Neues Model erstellen

```javascript
// models/mein-model.js
const { db } = require("../config/database");

class MeinModel {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM meine_tabelle", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = MeinModel;
```

### Neue Frontend-Seite

```javascript
// public/js/pages/meine-seite.js
class MeineSeitePage {
  constructor(data) {
    this.data = data;
  }

  async render(params = {}) {
    const content = document.getElementById("app-content");
    content.innerHTML = `<h2>Meine Seite</h2>`;
  }
}
```

## 🛠️ API-Endpoints

### Kunden

- `GET /api/kunden` - Alle Kunden
- `POST /api/kunden` - Neuer Kunde
- `PUT /api/kunden/:id` - Kunde bearbeiten
- `DELETE /api/kunden/:id` - Kunde löschen

### Aufträge

- `GET /api/auftraege` - Alle Aufträge
- `POST /api/auftraege` - Neuer Auftrag
- `GET /api/auftraege/:id` - Auftrag-Details
- `POST /api/auftraege/:id/zu-rechnung` - Zu Rechnung konvertieren
- `POST /api/auftraege/:id/schnell-zeiten` - Template anwenden

### Rechnungen

- `GET /api/rechnungen` - Alle Rechnungen
- `PUT /api/rechnungen/:id/rabatt` - Rabatt anwenden
- `PUT /api/rechnungen/:id/bezahlt` - Als bezahlt markieren

## 🔧 Konfiguration

### Umgebungsvariablen (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_PATH=./lackiererei.db

# App Settings
APP_NAME="Lackiererei Pro"
DEFAULT_STUNDENPREIS=65.0
```

### Settings anpassen

```javascript
// Via API
PUT /api/settings
{
    "basis_stundenpreis": "75.0",
    "firma_name": "Meine Lackiererei"
}
```

## 🧪 Tests ausführen

```bash
# Alle Tests
npm test

# Nur Unit-Tests
npm run test:unit

# Nur Integration-Tests
npm run test:integration
```

## 📦 Backup & Restore

```bash
# Backup erstellen
npm run backup

# Testdaten einfügen
npm run seed
```

## 🌟 Vorteile der modularen Struktur

### ✅ **Wartbarkeit**

- **Kleine Dateien** - Jede Datei hat einen klaren Zweck
- **Logische Trennung** - Frontend/Backend/Utils getrennt
- **Einfache Navigation** - Schnell die richtige Datei finden

### ✅ **Erweiterbarkeit**

- **Neue Features** - Einfach neue Module hinzufügen
- **Team-Entwicklung** - Mehrere Entwickler können parallel arbeiten
- **Plugin-System** - Erweiterungen ohne Core-Änderungen

### ✅ **Performance**

- **Lazy Loading** - Nur benötigte Module laden
- **Caching** - Bessere Browser-Cache-Nutzung
- **Minifizierung** - Einzelne Dateien optimierbar

### ✅ **Testing**

- **Unit-Tests** - Jedes Modul einzeln testbar
- **Mocking** - Abhängigkeiten einfach mocken
- **Coverage** - Bessere Test-Abdeckung

## 🔄 Migration vom VBA-Code

| **VBA-Funktion**           | **Neue Struktur**                      | **Datei**             |
| -------------------------- | -------------------------------------- | --------------------- |
| `NeuerAuftrag()`           | POST /api/auftraege                    | `routes/auftraege.js` |
| `NaechsteNummer()`         | `generateNextNumber()`                 | `utils/numbers.js`    |
| `KundendatenAendern()`     | PUT /api/kunden/:id                    | `routes/kunden.js`    |
| `AuftragZurRechnung()`     | POST /api/auftraege/:id/zu-rechnung    | `routes/auftraege.js` |
| `SchnellZeitenAuftrag()`   | POST /api/auftraege/:id/schnell-zeiten | `utils/templates.js`  |
| `KundendatenValidierung()` | `validateKunde()`                      | `utils/validation.js` |

## 📈 Nächste Schritte

1. **Setup ausführen** - `npm install && npm start`
2. **Erste Daten eingeben** - Kunden und Aufträge erstellen
3. **Anpassungen vornehmen** - Firmen-Settings konfigurieren
4. **Features erweitern** - Neue Module nach Bedarf hinzufügen

**Die modulare Struktur macht Ihr System zukunftssicher und professionell! 🚀**
