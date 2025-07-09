const { db } = require("../config/database");
const {
  getNextNumber,
  updateNextNumber,
  generateRepNummer,
  generateAuftragsnummer,
} = require("../utils/numbers");

class AuftraegeModel {
  // Alle Aufträge abrufen
  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
                SELECT a.*, 
                       k.name as kunde_name, 
                       k.kunde_nr,
                       k.telefon as kunde_telefon,
                       COUNT(r.id) as rechnungen_count,
                       CASE 
                           WHEN a.status = 'offen' THEN 'Offen'
                           WHEN a.status = 'bearbeitung' THEN 'In Bearbeitung'
                           WHEN a.status = 'abgeschlossen' THEN 'Abgeschlossen'
                           WHEN a.status = 'storniert' THEN 'Storniert'
                           ELSE a.status
                       END as status_text
                FROM auftraege a
                LEFT JOIN kunden k ON a.kunde_id = k.id
                LEFT JOIN rechnungen r ON a.id = r.auftrag_id
            `;

      const params = [];
      const whereClauses = [];

      // Filter anwenden
      if (filters.status) {
        whereClauses.push("a.status = ?");
        params.push(filters.status);
      }

      if (filters.kunde_id) {
        whereClauses.push("a.kunde_id = ?");
        params.push(filters.kunde_id);
      }

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += " GROUP BY a.id ORDER BY a.created_at DESC";

      // Pagination
      if (filters.limit) {
        sql += " LIMIT ?";
        params.push(parseInt(filters.limit));

        if (filters.offset) {
          sql += " OFFSET ?";
          params.push(parseInt(filters.offset));
        }
      }

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Auftrag nach ID abrufen
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT a.*, 
                       k.name as kunde_name, 
                       k.kunde_nr, 
                       k.strasse as kunde_strasse,
                       k.plz_ort as kunde_plz_ort,
                       k.telefon as kunde_telefon,
                       k.email as kunde_email
                FROM auftraege a
                LEFT JOIN kunden k ON a.kunde_id = k.id
                WHERE a.id = ?
            `;

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Auftrag mit Arbeitsschritten abrufen
  static getByIdWithDetails(id) {
    return new Promise((resolve, reject) => {
      // Erst den Auftrag abrufen
      this.getById(id)
        .then((auftrag) => {
          if (!auftrag) {
            resolve(null);
            return;
          }

          // Dann die Arbeitsschritte abrufen
          const sql = `
                    SELECT * FROM arbeitsschritte 
                    WHERE auftrag_id = ? 
                    ORDER BY reihenfolge ASC, id ASC
                `;

          db.all(sql, [id], (err, arbeitsschritte) => {
            if (err) {
              reject(err);
            } else {
              auftrag.arbeitsschritte = arbeitsschritte || [];
              resolve(auftrag);
            }
          });
        })
        .catch(reject);
    });
  }

  // Neuen Auftrag erstellen
  static async create(auftragData) {
    const nextRepNum = await getNextNumber("next_rep_nr");
    const nextAuftragNum = await getNextNumber("next_auftrag_nr");

    const rep_nr = generateRepNummer(nextRepNum);
    const auftrag_nr = generateAuftragsnummer(nextAuftragNum);

    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO auftraege (
                    auftrag_nr, rep_nr, kunde_id, kennzeichen, modell, vin, 
                    farbcode, farbe, basis_stundenpreis, notizen
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      db.run(
        sql,
        [
          auftrag_nr,
          rep_nr,
          auftragData.kunde_id,
          auftragData.kennzeichen?.toUpperCase() || null,
          auftragData.modell || null,
          auftragData.vin?.toUpperCase() || null,
          auftragData.farbcode || null,
          auftragData.farbe || null,
          auftragData.basis_stundenpreis || 65.0,
          auftragData.notizen || null,
        ],
        async function (err) {
          if (err) {
            reject(err);
          } else {
            await updateNextNumber("next_rep_nr", nextRepNum + 1);
            await updateNextNumber("next_auftrag_nr", nextAuftragNum + 1);

            const auftragId = this.lastID;

            // Standard-Arbeitsschritte erstellen
            await AuftraegeModel.createStandardArbeitsschritte(
              auftragId,
              auftragData.basis_stundenpreis || 65.0
            );

            resolve({
              id: auftragId,
              rep_nr,
              auftrag_nr,
              message: `Auftrag ${rep_nr} erfolgreich erstellt!`,
            });
          }
        }
      );
    });
  }

  // Standard-Arbeitsschritte erstellen
  static async createStandardArbeitsschritte(auftragId, stundenpreis) {
    const standardSchritte = [
      "Demontage/Vorbereitung",
      "Schleifen/Spachteln",
      "Grundierung",
      "Zwischenschliff",
      "Basislack",
      "Klarlack",
      "Polieren/Finish",
      "Montage",
    ];

    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO arbeitsschritte (auftrag_id, beschreibung, stundenpreis, reihenfolge)
                VALUES (?, ?, ?, ?)
            `;

      const stmt = db.prepare(sql);

      standardSchritte.forEach((schritt, index) => {
        stmt.run([auftragId, schritt, stundenpreis, index + 1]);
      });

      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Auftrag aktualisieren
  static update(id, auftragData) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE auftraege 
                SET kennzeichen = ?, modell = ?, vin = ?, farbcode = ?, 
                    farbe = ?, basis_stundenpreis = ?, notizen = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(
        sql,
        [
          auftragData.kennzeichen?.toUpperCase() || null,
          auftragData.modell || null,
          auftragData.vin?.toUpperCase() || null,
          auftragData.farbcode || null,
          auftragData.farbe || null,
          auftragData.basis_stundenpreis || 65.0,
          auftragData.notizen || null,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Auftrag löschen
  static delete(id) {
    return new Promise((resolve, reject) => {
      // Zuerst Arbeitsschritte löschen
      db.run(
        "DELETE FROM arbeitsschritte WHERE auftrag_id = ?",
        [id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Dann Auftrag löschen
            db.run("DELETE FROM auftraege WHERE id = ?", [id], function (err) {
              if (err) reject(err);
              else resolve({ changes: this.changes });
            });
          }
        }
      );
    });
  }

  // Prüfen ob Auftrag eine Rechnung hat
  static hasRechnung(id) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT COUNT(*) as count FROM rechnungen WHERE auftrag_id = ?";

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });
  }

  // Auftrag-Status aktualisieren
  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE auftraege 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(sql, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Auftrag-Totals neu berechnen
  static updateTotals(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COALESCE(SUM(zeit), 0) as gesamtzeit,
                    COALESCE(SUM(kosten), 0) as gesamtkosten
                FROM arbeitsschritte 
                WHERE auftrag_id = ?
            `;

      db.get(sql, [id], (err, totals) => {
        if (err) {
          reject(err);
        } else {
          const updateSql = `
                        UPDATE auftraege 
                        SET gesamtzeit = ?, gesamtkosten = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;

          db.run(
            updateSql,
            [totals.gesamtzeit, totals.gesamtkosten, id],
            function (updateErr) {
              if (updateErr) reject(updateErr);
              else
                resolve({
                  gesamtzeit: totals.gesamtzeit,
                  gesamtkosten: totals.gesamtkosten,
                });
            }
          );
        }
      });
    });
  }

  // Aufträge suchen
  static search(query) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT a.*, k.name as kunde_name, k.kunde_nr
                FROM auftraege a
                LEFT JOIN kunden k ON a.kunde_id = k.id
                WHERE 
                    a.rep_nr LIKE ? OR 
                    a.auftrag_nr LIKE ? OR
                    a.kennzeichen LIKE ? OR
                    a.modell LIKE ? OR
                    a.vin LIKE ? OR
                    k.name LIKE ?
                ORDER BY a.created_at DESC
            `;

      const searchTerm = `%${query}%`;
      const params = Array(6).fill(searchTerm);

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Auftrags-Statistiken
  static getStatistics() {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COUNT(*) as total_auftraege,
                    COUNT(CASE WHEN status = 'offen' THEN 1 END) as offen,
                    COUNT(CASE WHEN status = 'bearbeitung' THEN 1 END) as in_bearbeitung,
                    COUNT(CASE WHEN status = 'abgeschlossen' THEN 1 END) as abgeschlossen,
                    COUNT(CASE WHEN status = 'storniert' THEN 1 END) as storniert,
                    COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as neue_30d,
                    COALESCE(AVG(gesamtzeit), 0) as avg_arbeitszeit,
                    COALESCE(AVG(gesamtkosten), 0) as avg_kosten,
                    COALESCE(SUM(gesamtkosten), 0) as total_umsatz,
                    COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of month') THEN gesamtkosten ELSE 0 END), 0) as monatsumsatz
                FROM auftraege
            `;

      db.get(sql, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Monatsstatistiken
  static getMonthlyStats(year, month) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    DATE(created_at) as datum,
                    COUNT(*) as auftraege_count,
                    COALESCE(SUM(gesamtkosten), 0) as tagesumsatz
                FROM auftraege
                WHERE strftime('%Y', created_at) = ? 
                AND strftime('%m', created_at) = ?
                GROUP BY DATE(created_at)
                ORDER BY datum ASC
            `;

      db.all(
        sql,
        [year.toString(), month.toString().padStart(2, "0")],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Aufträge eines Kunden
  static getByKundeId(kundeId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT a.*, 
                       COUNT(r.id) as rechnungen_count,
                       CASE 
                           WHEN a.status = 'offen' THEN 'Offen'
                           WHEN a.status = 'bearbeitung' THEN 'In Bearbeitung'
                           WHEN a.status = 'abgeschlossen' THEN 'Abgeschlossen'
                           WHEN a.status = 'storniert' THEN 'Storniert'
                           ELSE a.status
                       END as status_text
                FROM auftraege a
                LEFT JOIN rechnungen r ON a.id = r.auftrag_id
                WHERE a.kunde_id = ?
                GROUP BY a.id
                ORDER BY a.created_at DESC
            `;

      db.all(sql, [kundeId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Auftrag duplizieren
  static duplicate(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // Original-Auftrag abrufen
        const original = await this.getByIdWithDetails(id);
        if (!original) {
          reject(new Error("Original-Auftrag nicht gefunden"));
          return;
        }

        // Neuen Auftrag erstellen (ohne Arbeitsschritte)
        const newAuftragData = {
          kunde_id: original.kunde_id,
          kennzeichen: original.kennzeichen,
          modell: original.modell,
          vin: original.vin,
          farbcode: original.farbcode,
          farbe: original.farbe,
          basis_stundenpreis: original.basis_stundenpreis,
          notizen: `Kopie von ${original.rep_nr}`,
        };

        const newAuftrag = await this.create(newAuftragData);

        resolve({
          id: newAuftrag.id,
          rep_nr: newAuftrag.rep_nr,
          message: `Auftrag ${original.rep_nr} erfolgreich dupliziert als ${newAuftrag.rep_nr}`,
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = AuftraegeModel;
