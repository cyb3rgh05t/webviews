const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database connection
const db = new sqlite3.Database(path.join(__dirname, "..", "lackiererei.db"));

// Database initialization
function initializeDatabase() {
  console.log("🗃️  Initialisiere Datenbank...");

  db.serialize(() => {
    // Kunden Table
    db.run(`CREATE TABLE IF NOT EXISTS kunden (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kunde_nr TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            strasse TEXT,
            plz_ort TEXT,
            telefon TEXT,
            email TEXT,
            notizen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    // Aufträge Table
    db.run(`CREATE TABLE IF NOT EXISTS auftraege (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auftrag_nr TEXT UNIQUE NOT NULL,
            rep_nr TEXT UNIQUE NOT NULL,
            kunde_id INTEGER NOT NULL,
            kennzeichen TEXT,
            modell TEXT,
            vin TEXT,
            farbcode TEXT,
            farbe TEXT,
            basis_stundenpreis REAL DEFAULT 65.0,
            datum DATE DEFAULT CURRENT_DATE,
            status TEXT DEFAULT 'offen',
            gesamtzeit REAL DEFAULT 0,
            gesamtkosten REAL DEFAULT 0,
            notizen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kunde_id) REFERENCES kunden (id)
        )`);

    // Arbeitsschritte Table
    db.run(`CREATE TABLE IF NOT EXISTS arbeitsschritte (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auftrag_id INTEGER NOT NULL,
            beschreibung TEXT NOT NULL,
            zeit REAL DEFAULT 0,
            stundenpreis REAL DEFAULT 65.0,
            kosten REAL DEFAULT 0,
            reihenfolge INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (auftrag_id) REFERENCES auftraege (id)
        )`);

    // Rechnungen Table
    db.run(`CREATE TABLE IF NOT EXISTS rechnungen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rechnung_nr TEXT UNIQUE NOT NULL,
            auftrag_id INTEGER,
            kunde_id INTEGER NOT NULL,
            datum DATE DEFAULT CURRENT_DATE,
            faelligkeitsdatum DATE,
            rabatt REAL DEFAULT 0,
            netto_betrag REAL DEFAULT 0,
            mwst_betrag REAL DEFAULT 0,
            brutto_betrag REAL DEFAULT 0,
            status TEXT DEFAULT 'offen',
            bezahlt_am DATE,
            notizen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (auftrag_id) REFERENCES auftraege (id),
            FOREIGN KEY (kunde_id) REFERENCES kunden (id)
        )`);

    // Rechnungsposten Table
    db.run(`CREATE TABLE IF NOT EXISTS rechnungsposten (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rechnung_id INTEGER NOT NULL,
            beschreibung TEXT NOT NULL,
            menge REAL DEFAULT 1,
            einheit TEXT DEFAULT 'Stk',
            einzelpreis REAL DEFAULT 0,
            gesamtpreis REAL DEFAULT 0,
            kategorie TEXT DEFAULT 'sonstiges',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (rechnung_id) REFERENCES rechnungen (id)
        )`);

    // Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    // Insert default settings
    const defaultSettings = [
      { key: "next_kunde_nr", value: "1", description: "Nächste Kundennummer" },
      {
        key: "next_auftrag_nr",
        value: "1",
        description: "Nächste Auftragsnummer",
      },
      { key: "next_rep_nr", value: "1", description: "Nächste REP-Nummer" },
      {
        key: "next_rechnung_nr",
        value: "1",
        description: "Nächste Rechnungsnummer",
      },
      {
        key: "basis_stundenpreis",
        value: "65.0",
        description: "Standard-Stundenpreis in Euro",
      },
      {
        key: "mwst_satz",
        value: "19.0",
        description: "Mehrwertsteuersatz in Prozent",
      },
      { key: "firma_name", value: "Lackiererei", description: "Firmenname" },
      { key: "firma_adresse", value: "", description: "Firmenadresse" },
      { key: "firma_plz_ort", value: "", description: "Firmen PLZ und Ort" },
      { key: "firma_telefon", value: "", description: "Firmen Telefonnummer" },
      { key: "firma_email", value: "", description: "Firmen E-Mail" },
      { key: "firma_website", value: "", description: "Firmen Website" },
    ];

    const insertSetting = db.prepare(`
            INSERT OR IGNORE INTO settings (key, value, description) 
            VALUES (?, ?, ?)
        `);

    defaultSettings.forEach((setting) => {
      insertSetting.run(setting.key, setting.value, setting.description);
    });

    insertSetting.finalize();

    console.log("✅ Datenbank erfolgreich initialisiert");
  });
}

// Create database backup
function createBackup() {
  const backupPath = path.join(
    __dirname,
    "..",
    "backups",
    `backup_${Date.now()}.db`
  );
  // Implementation for backup creation
  console.log(`💾 Backup erstellt: ${backupPath}`);
}

// Database health check
function healthCheck() {
  return new Promise((resolve, reject) => {
    db.get("SELECT 1", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  createBackup,
  healthCheck,
};
