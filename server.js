const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./lackiererei.db");

// Initialize database tables
db.serialize(() => {
  // Kunden Table
  db.run(`CREATE TABLE IF NOT EXISTS kunden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kunde_nr TEXT UNIQUE,
        name TEXT NOT NULL,
        strasse TEXT,
        plz_ort TEXT,
        telefon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Aufträge Table
  db.run(`CREATE TABLE IF NOT EXISTS auftraege (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        auftrag_nr TEXT UNIQUE,
        rep_nr TEXT UNIQUE,
        kunde_id INTEGER,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kunde_id) REFERENCES kunden (id)
    )`);

  // Arbeitsschritte Table
  db.run(`CREATE TABLE IF NOT EXISTS arbeitsschritte (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        auftrag_id INTEGER,
        beschreibung TEXT,
        zeit REAL DEFAULT 0,
        stundenpreis REAL DEFAULT 65.0,
        kosten REAL DEFAULT 0,
        reihenfolge INTEGER,
        FOREIGN KEY (auftrag_id) REFERENCES auftraege (id)
    )`);

  // Rechnungen Table
  db.run(`CREATE TABLE IF NOT EXISTS rechnungen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rechnung_nr TEXT UNIQUE,
        auftrag_id INTEGER,
        kunde_id INTEGER,
        datum DATE DEFAULT CURRENT_DATE,
        rabatt REAL DEFAULT 0,
        netto_betrag REAL DEFAULT 0,
        mwst_betrag REAL DEFAULT 0,
        brutto_betrag REAL DEFAULT 0,
        status TEXT DEFAULT 'offen',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (auftrag_id) REFERENCES auftraege (id),
        FOREIGN KEY (kunde_id) REFERENCES kunden (id)
    )`);

  // Rechnungsposten Table
  db.run(`CREATE TABLE IF NOT EXISTS rechnungsposten (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rechnung_id INTEGER,
        beschreibung TEXT,
        menge REAL,
        einheit TEXT,
        einzelpreis REAL,
        gesamtpreis REAL,
        kategorie TEXT,
        FOREIGN KEY (rechnung_id) REFERENCES rechnungen (id)
    )`);

  // Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

  // Insert default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('next_kunde_nr', '1'),
        ('next_auftrag_nr', '1'),
        ('next_rep_nr', '1'),
        ('next_rechnung_nr', '1'),
        ('basis_stundenpreis', '65.0'),
        ('firma_name', 'Lackiererei'),
        ('firma_adresse', ''),
        ('firma_plz_ort', ''),
        ('firma_telefon', '')
    `);
});

// Helper functions
function generateNextNumber(prefix, currentNumber) {
  const num = parseInt(currentNumber) + 1;
  return prefix + num.toString().padStart(3, "0");
}

function getNextNumber(key) {
  return new Promise((resolve, reject) => {
    db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? parseInt(row.value) : 1);
    });
  });
}

function updateNextNumber(key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE settings SET value = ? WHERE key = ?",
      [value.toString(), key],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Routes

// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Routes

// Get all customers
app.get("/api/kunden", (req, res) => {
  db.all("SELECT * FROM kunden ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Create new customer
app.post("/api/kunden", async (req, res) => {
  try {
    const nextNum = await getNextNumber("next_kunde_nr");
    const kunde_nr = "K-" + nextNum.toString().padStart(3, "0");

    const { name, strasse, plz_ort, telefon } = req.body;

    db.run(
      "INSERT INTO kunden (kunde_nr, name, strasse, plz_ort, telefon) VALUES (?, ?, ?, ?, ?)",
      [kunde_nr, name, strasse, plz_ort, telefon],
      async function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
        } else {
          await updateNextNumber("next_kunde_nr", nextNum + 1);
          res.json({ id: this.lastID, kunde_nr });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all aufträge
app.get("/api/auftraege", (req, res) => {
  const sql = `
        SELECT a.*, k.name as kunde_name, k.kunde_nr
        FROM auftraege a
        LEFT JOIN kunden k ON a.kunde_id = k.id
        ORDER BY a.created_at DESC
    `;

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Create new auftrag
app.post("/api/auftraege", async (req, res) => {
  try {
    const nextRepNum = await getNextNumber("next_rep_nr");
    const nextAuftragNum = await getNextNumber("next_auftrag_nr");

    const rep_nr = "A-" + nextRepNum.toString().padStart(3, "0");
    const auftrag_nr = "AU-" + nextAuftragNum.toString().padStart(3, "0");

    const {
      kunde_id,
      kennzeichen,
      modell,
      vin,
      farbcode,
      farbe,
      basis_stundenpreis,
    } = req.body;

    db.run(
      `INSERT INTO auftraege (auftrag_nr, rep_nr, kunde_id, kennzeichen, modell, vin, farbcode, farbe, basis_stundenpreis)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auftrag_nr,
        rep_nr,
        kunde_id,
        kennzeichen,
        modell,
        vin,
        farbcode,
        farbe,
        basis_stundenpreis || 65.0,
      ],
      async function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
        } else {
          await updateNextNumber("next_rep_nr", nextRepNum + 1);
          await updateNextNumber("next_auftrag_nr", nextAuftragNum + 1);

          // Add standard Arbeitsschritte
          const standardArbeitsschritte = [
            "Demontage/Vorbereitung",
            "Schleifen/Spachteln",
            "Grundierung",
            "Zwischenschliff",
            "Basislack",
            "Klarlack",
            "Polieren/Finish",
            "Montage",
          ];

          const auftragId = this.lastID;
          standardArbeitsschritte.forEach((schritt, index) => {
            db.run(
              "INSERT INTO arbeitsschritte (auftrag_id, beschreibung, reihenfolge) VALUES (?, ?, ?)",
              [auftragId, schritt, index + 1]
            );
          });

          res.json({ id: auftragId, rep_nr, auftrag_nr });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get auftrag with arbeitsschritte
app.get("/api/auftraege/:id", (req, res) => {
  const auftragId = req.params.id;

  // Get auftrag details
  const auftragSql = `
        SELECT a.*, k.name as kunde_name, k.kunde_nr, k.strasse, k.plz_ort, k.telefon
        FROM auftraege a
        LEFT JOIN kunden k ON a.kunde_id = k.id
        WHERE a.id = ?
    `;

  db.get(auftragSql, [auftragId], (err, auftrag) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!auftrag) {
      res.status(404).json({ error: "Auftrag not found" });
    } else {
      // Get arbeitsschritte
      db.all(
        "SELECT * FROM arbeitsschritte WHERE auftrag_id = ? ORDER BY reihenfolge",
        [auftragId],
        (err, arbeitsschritte) => {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({ ...auftrag, arbeitsschritte });
          }
        }
      );
    }
  });
});

// Update arbeitsschritt
app.put("/api/arbeitsschritte/:id", (req, res) => {
  const { zeit, stundenpreis, beschreibung } = req.body;
  const kosten = zeit * stundenpreis;

  db.run(
    "UPDATE arbeitsschritte SET zeit = ?, stundenpreis = ?, kosten = ?, beschreibung = ? WHERE id = ?",
    [zeit, stundenpreis, kosten, beschreibung, req.params.id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        // Update auftrag totals
        updateAuftragTotals(req.body.auftrag_id);
        res.json({ changes: this.changes });
      }
    }
  );
});

// Update auftrag totals
function updateAuftragTotals(auftragId) {
  db.get(
    "SELECT SUM(zeit) as gesamtzeit, SUM(kosten) as gesamtkosten FROM arbeitsschritte WHERE auftrag_id = ?",
    [auftragId],
    (err, totals) => {
      if (!err && totals) {
        db.run(
          "UPDATE auftraege SET gesamtzeit = ?, gesamtkosten = ? WHERE id = ?",
          [totals.gesamtzeit || 0, totals.gesamtkosten || 0, auftragId]
        );
      }
    }
  );
}

// Convert auftrag to rechnung
app.post("/api/auftraege/:id/zu-rechnung", async (req, res) => {
  try {
    const auftragId = req.params.id;
    const nextRechnungNum = await getNextNumber("next_rechnung_nr");
    const rechnung_nr = "R/2025-" + nextRechnungNum.toString().padStart(3, "0");

    // Get auftrag details
    db.get(
      `SELECT a.*, k.id as kunde_id FROM auftraege a 
             LEFT JOIN kunden k ON a.kunde_id = k.id WHERE a.id = ?`,
      [auftragId],
      (err, auftrag) => {
        if (err || !auftrag) {
          res.status(400).json({ error: "Auftrag not found" });
          return;
        }

        // Create rechnung
        db.run(
          `INSERT INTO rechnungen (rechnung_nr, auftrag_id, kunde_id, netto_betrag, mwst_betrag, brutto_betrag)
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            rechnung_nr,
            auftragId,
            auftrag.kunde_id,
            auftrag.gesamtkosten,
            auftrag.gesamtkosten * 0.19,
            auftrag.gesamtkosten * 1.19,
          ],
          async function (err) {
            if (err) {
              res.status(400).json({ error: err.message });
            } else {
              await updateNextNumber("next_rechnung_nr", nextRechnungNum + 1);

              // Add arbeitszeit as first position
              db.run(
                `INSERT INTO rechnungsposten (rechnung_id, beschreibung, menge, einheit, einzelpreis, gesamtpreis, kategorie)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  this.lastID,
                  `Lackierarbeiten lt. Auftrag ${auftrag.rep_nr}`,
                  auftrag.gesamtzeit,
                  "Std.",
                  auftrag.basis_stundenpreis,
                  auftrag.gesamtkosten,
                  "arbeitszeit",
                ]
              );

              res.json({
                rechnung_id: this.lastID,
                rechnung_nr,
                message: "Auftrag erfolgreich zu Rechnung konvertiert!",
              });
            }
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all rechnungen
app.get("/api/rechnungen", (req, res) => {
  const sql = `
        SELECT r.*, k.name as kunde_name, k.kunde_nr, a.rep_nr
        FROM rechnungen r
        LEFT JOIN kunden k ON r.kunde_id = k.id
        LEFT JOIN auftraege a ON r.auftrag_id = a.id
        ORDER BY r.created_at DESC
    `;

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Apply discount to rechnung
app.put("/api/rechnungen/:id/rabatt", (req, res) => {
  const { rabatt } = req.body;
  const rechnungId = req.params.id;

  // Get current rechnung
  db.get(
    "SELECT * FROM rechnungen WHERE id = ?",
    [rechnungId],
    (err, rechnung) => {
      if (err || !rechnung) {
        res.status(400).json({ error: "Rechnung not found" });
        return;
      }

      const originalNetto = rechnung.netto_betrag / (1 - rechnung.rabatt / 100);
      const newNetto = originalNetto * (1 - rabatt / 100);
      const newMwst = newNetto * 0.19;
      const newBrutto = newNetto + newMwst;

      db.run(
        "UPDATE rechnungen SET rabatt = ?, netto_betrag = ?, mwst_betrag = ?, brutto_betrag = ? WHERE id = ?",
        [rabatt, newNetto, newMwst, newBrutto, rechnungId],
        function (err) {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            res.json({
              rabatt,
              netto_betrag: newNetto,
              brutto_betrag: newBrutto,
              message: `${rabatt}% Rabatt angewendet`,
            });
          }
        }
      );
    }
  );
});

// Quick time templates
app.post("/api/auftraege/:id/schnell-zeiten", (req, res) => {
  const { template } = req.body;
  const auftragId = req.params.id;

  const templates = {
    "spot-repair": [
      { beschreibung: "Demontage/Vorbereitung", zeit: 0.5 },
      { beschreibung: "Schleifen/Spachteln", zeit: 0.25 },
      { beschreibung: "Grundierung", zeit: 0.25 },
      { beschreibung: "Basislack", zeit: 0.5 },
      { beschreibung: "Klarlack", zeit: 0.25 },
      { beschreibung: "Polieren/Finish", zeit: 0.25 },
    ],
    "kleine-reparatur": [
      { beschreibung: "Demontage/Vorbereitung", zeit: 1 },
      { beschreibung: "Schleifen/Spachteln", zeit: 1 },
      { beschreibung: "Grundierung", zeit: 0.5 },
      { beschreibung: "Basislack", zeit: 1 },
      { beschreibung: "Klarlack", zeit: 0.5 },
      { beschreibung: "Polieren/Finish", zeit: 0.5 },
      { beschreibung: "Montage", zeit: 0.5 },
    ],
    teilelackierung: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 2 },
      { beschreibung: "Schleifen/Spachteln", zeit: 2.5 },
      { beschreibung: "Grundierung", zeit: 1 },
      { beschreibung: "Zwischenschliff", zeit: 0.5 },
      { beschreibung: "Basislack", zeit: 2 },
      { beschreibung: "Klarlack", zeit: 1 },
      { beschreibung: "Polieren/Finish", zeit: 1 },
      { beschreibung: "Montage", zeit: 1 },
    ],
    komplettlackierung: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 4 },
      { beschreibung: "Schleifen/Spachteln", zeit: 6 },
      { beschreibung: "Grundierung", zeit: 3 },
      { beschreibung: "Zwischenschliff", zeit: 2 },
      { beschreibung: "Basislack", zeit: 4 },
      { beschreibung: "Klarlack", zeit: 3 },
      { beschreibung: "Polieren/Finish", zeit: 2 },
      { beschreibung: "Montage", zeit: 3 },
    ],
    oldtimer: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 8 },
      { beschreibung: "Schleifen/Spachteln", zeit: 15 },
      { beschreibung: "Grundierung", zeit: 6 },
      { beschreibung: "Zwischenschliff", zeit: 4 },
      { beschreibung: "Basislack", zeit: 8 },
      { beschreibung: "Klarlack", zeit: 6 },
      { beschreibung: "Polieren/Finish", zeit: 4 },
      { beschreibung: "Montage", zeit: 8 },
    ],
  };

  const templateData = templates[template];
  if (!templateData) {
    res.status(400).json({ error: "Invalid template" });
    return;
  }

  // Get basis stundenpreis
  db.get(
    "SELECT basis_stundenpreis FROM auftraege WHERE id = ?",
    [auftragId],
    (err, auftrag) => {
      if (err || !auftrag) {
        res.status(400).json({ error: "Auftrag not found" });
        return;
      }

      const stundenpreis = auftrag.basis_stundenpreis;

      // Update arbeitsschritte with template times
      templateData.forEach((item, index) => {
        const kosten = item.zeit * stundenpreis;
        db.run(
          `UPDATE arbeitsschritte 
                 SET zeit = ?, stundenpreis = ?, kosten = ? 
                 WHERE auftrag_id = ? AND reihenfolge = ?`,
          [item.zeit, stundenpreis, kosten, auftragId, index + 1]
        );
      });

      // Update totals
      setTimeout(() => {
        updateAuftragTotals(auftragId);
        res.json({ message: `${template} Template angewendet!` });
      }, 100);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Lackiererei Management System läuft auf http://localhost:${PORT}`
  );
  console.log("Drücken Sie Ctrl+C zum Beenden");
});

module.exports = app;
