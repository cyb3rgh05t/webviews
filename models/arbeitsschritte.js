const { db } = require("../config/database");

class ArbeitsschritteModel {
  // Alle Arbeitsschritte eines Auftrags abrufen
  static getByAuftragId(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    id,
                    auftrag_id,
                    beschreibung,
                    zeit,
                    stundenpreis,
                    kosten,
                    reihenfolge,
                    created_at,
                    updated_at
                FROM arbeitsschritte 
                WHERE auftrag_id = ? 
                ORDER BY reihenfolge ASC, id ASC
            `;

      db.all(sql, [auftragId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Einzelnen Arbeitsschritt abrufen
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    id,
                    auftrag_id,
                    beschreibung,
                    zeit,
                    stundenpreis,
                    kosten,
                    reihenfolge,
                    created_at,
                    updated_at
                FROM arbeitsschritte 
                WHERE id = ?
            `;

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Neuen Arbeitsschritt erstellen
  static create(schrittData) {
    return new Promise((resolve, reject) => {
      // Kosten automatisch berechnen
      const zeit = parseFloat(schrittData.zeit) || 0;
      const stundenpreis = parseFloat(schrittData.stundenpreis) || 0;
      const kosten = zeit * stundenpreis;

      // Nächste Reihenfolge ermitteln wenn nicht angegeben
      if (!schrittData.reihenfolge) {
        this.getNextReihenfolge(schrittData.auftrag_id)
          .then((reihenfolge) => {
            const sql = `
                        INSERT INTO arbeitsschritte (
                            auftrag_id, beschreibung, zeit, stundenpreis, 
                            kosten, reihenfolge
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

            db.run(
              sql,
              [
                schrittData.auftrag_id,
                schrittData.beschreibung,
                zeit,
                stundenpreis,
                kosten,
                reihenfolge,
              ],
              function (err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    id: this.lastID,
                    kosten: kosten,
                    message: "Arbeitsschritt erfolgreich erstellt",
                  });
                }
              }
            );
          })
          .catch(reject);
      } else {
        const sql = `
                    INSERT INTO arbeitsschritte (
                        auftrag_id, beschreibung, zeit, stundenpreis, 
                        kosten, reihenfolge
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

        db.run(
          sql,
          [
            schrittData.auftrag_id,
            schrittData.beschreibung,
            zeit,
            stundenpreis,
            kosten,
            schrittData.reihenfolge,
          ],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({
                id: this.lastID,
                kosten: kosten,
                message: "Arbeitsschritt erfolgreich erstellt",
              });
            }
          }
        );
      }
    });
  }

  // Arbeitsschritt aktualisieren
  static update(id, schrittData) {
    return new Promise((resolve, reject) => {
      // Kosten automatisch berechnen
      const zeit = parseFloat(schrittData.zeit) || 0;
      const stundenpreis = parseFloat(schrittData.stundenpreis) || 0;
      const kosten = zeit * stundenpreis;

      const sql = `
                UPDATE arbeitsschritte 
                SET beschreibung = ?, zeit = ?, stundenpreis = ?, 
                    kosten = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(
        sql,
        [schrittData.beschreibung, zeit, stundenpreis, kosten, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              changes: this.changes,
              kosten: kosten,
              message: "Arbeitsschritt erfolgreich aktualisiert",
            });
          }
        }
      );
    });
  }

  // Arbeitsschritt löschen
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM arbeitsschritte WHERE id = ?";

      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Alle Arbeitsschritte eines Auftrags löschen
  static deleteByAuftragId(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM arbeitsschritte WHERE auftrag_id = ?";

      db.run(sql, [auftragId], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Nächste Reihenfolge-Nummer ermitteln
  static getNextReihenfolge(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT COALESCE(MAX(reihenfolge), 0) + 1 as next_reihenfolge
                FROM arbeitsschritte 
                WHERE auftrag_id = ?
            `;

      db.get(sql, [auftragId], (err, row) => {
        if (err) reject(err);
        else resolve(row.next_reihenfolge);
      });
    });
  }

  // Arbeitsschritte neu sortieren
  static reorder(auftragId, newOrder) {
    return new Promise((resolve, reject) => {
      // newOrder ist ein Array von IDs in der gewünschten Reihenfolge
      const sql = "UPDATE arbeitsschritte SET reihenfolge = ? WHERE id = ?";
      const stmt = db.prepare(sql);

      let errors = [];
      let completed = 0;

      newOrder.forEach((id, index) => {
        stmt.run([index + 1, id], (err) => {
          if (err) errors.push(err);
          completed++;

          if (completed === newOrder.length) {
            stmt.finalize();
            if (errors.length > 0) {
              reject(errors[0]);
            } else {
              resolve({ message: "Arbeitsschritte erfolgreich neu sortiert" });
            }
          }
        });
      });
    });
  }

  // Arbeitsschritt duplizieren
  static duplicate(id) {
    return new Promise((resolve, reject) => {
      this.getById(id)
        .then((original) => {
          if (!original) {
            reject(new Error("Original-Arbeitsschritt nicht gefunden"));
            return;
          }

          const newSchrittData = {
            auftrag_id: original.auftrag_id,
            beschreibung: `${original.beschreibung} (Kopie)`,
            zeit: original.zeit,
            stundenpreis: original.stundenpreis,
          };

          this.create(newSchrittData)
            .then((result) => {
              resolve({
                id: result.id,
                message: "Arbeitsschritt erfolgreich dupliziert",
              });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  // Massenupdate für Zeit-Templates
  static updateMultiple(updates) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE arbeitsschritte 
                SET zeit = ?, stundenpreis = ?, kosten = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      const stmt = db.prepare(sql);

      let errors = [];
      let completed = 0;
      let totalUpdated = 0;

      updates.forEach((update) => {
        const kosten = (update.zeit || 0) * (update.stundenpreis || 0);

        stmt.run(
          [update.zeit || 0, update.stundenpreis || 0, kosten, update.id],
          function (err) {
            if (err) {
              errors.push(err);
            } else {
              totalUpdated += this.changes;
            }

            completed++;

            if (completed === updates.length) {
              stmt.finalize();
              if (errors.length > 0) {
                reject(errors[0]);
              } else {
                resolve({
                  updated: totalUpdated,
                  message: `${totalUpdated} Arbeitsschritte erfolgreich aktualisiert`,
                });
              }
            }
          }
        );
      });

      if (updates.length === 0) {
        resolve({ updated: 0, message: "Keine Updates durchgeführt" });
      }
    });
  }

  // Arbeitsschritt-Statistiken
  static getStatistics(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COUNT(*) as total_schritte,
                    COUNT(CASE WHEN zeit > 0 THEN 1 END) as schritte_mit_zeit,
                    COUNT(CASE WHEN zeit = 0 OR zeit IS NULL THEN 1 END) as schritte_ohne_zeit,
                    COALESCE(SUM(zeit), 0) as gesamtzeit,
                    COALESCE(SUM(kosten), 0) as gesamtkosten,
                    COALESCE(AVG(zeit), 0) as avg_zeit_pro_schritt,
                    COALESCE(AVG(stundenpreis), 0) as avg_stundenpreis,
                    COALESCE(MIN(zeit), 0) as min_zeit,
                    COALESCE(MAX(zeit), 0) as max_zeit
                FROM arbeitsschritte 
                WHERE auftrag_id = ?
            `;

      db.get(sql, [auftragId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Leere Arbeitsschritte finden
  static findEmpty(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT id, beschreibung
                FROM arbeitsschritte 
                WHERE auftrag_id = ? 
                AND (zeit = 0 OR zeit IS NULL)
                ORDER BY reihenfolge ASC
            `;

      db.all(sql, [auftragId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Standard-Arbeitsschritte für Template erstellen
  static createFromTemplate(auftragId, templateData, stundenpreis) {
    return new Promise((resolve, reject) => {
      // Erst alle vorhandenen Arbeitsschritte löschen
      this.deleteByAuftragId(auftragId)
        .then(() => {
          const sql = `
                    INSERT INTO arbeitsschritte (
                        auftrag_id, beschreibung, zeit, stundenpreis, 
                        kosten, reihenfolge
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

          const stmt = db.prepare(sql);

          let errors = [];
          let completed = 0;
          let totalCreated = 0;

          templateData.forEach((schritt, index) => {
            const kosten = schritt.zeit * stundenpreis;

            stmt.run(
              [
                auftragId,
                schritt.beschreibung,
                schritt.zeit,
                stundenpreis,
                kosten,
                index + 1,
              ],
              function (err) {
                if (err) {
                  errors.push(err);
                } else {
                  totalCreated++;
                }

                completed++;

                if (completed === templateData.length) {
                  stmt.finalize();
                  if (errors.length > 0) {
                    reject(errors[0]);
                  } else {
                    resolve({
                      created: totalCreated,
                      totalTime: templateData.reduce(
                        (sum, s) => sum + s.zeit,
                        0
                      ),
                      totalCost: templateData.reduce(
                        (sum, s) => sum + s.zeit * stundenpreis,
                        0
                      ),
                      message: `${totalCreated} Arbeitsschritte aus Template erstellt`,
                    });
                  }
                }
              }
            );
          });
        })
        .catch(reject);
    });
  }

  // Arbeitsschritte exportieren (für Backup/Export)
  static exportByAuftragId(auftragId) {
    return new Promise((resolve, reject) => {
      this.getByAuftragId(auftragId)
        .then((schritte) => {
          const exportData = schritte.map((schritt) => ({
            beschreibung: schritt.beschreibung,
            zeit: schritt.zeit,
            stundenpreis: schritt.stundenpreis,
            reihenfolge: schritt.reihenfolge,
          }));

          resolve(exportData);
        })
        .catch(reject);
    });
  }
}

module.exports = ArbeitsschritteModel;
