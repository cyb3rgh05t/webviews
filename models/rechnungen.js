const { db } = require("../config/database");
const {
  getNextNumber,
  updateNextNumber,
  generateRechnungsnummer,
} = require("../utils/numbers");

class RechnungenModel {
  // Alle Rechnungen abrufen
  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
                SELECT r.*, 
                       k.name as kunde_name, 
                       k.kunde_nr,
                       k.telefon as kunde_telefon,
                       a.rep_nr as auftrag_rep_nr,
                       COUNT(rp.id) as posten_count,
                       CASE 
                           WHEN r.status = 'offen' THEN 'Offen'
                           WHEN r.status = 'versendet' THEN 'Versendet'
                           WHEN r.status = 'bezahlt' THEN 'Bezahlt'
                           WHEN r.status = 'ueberfaellig' THEN 'Überfällig'
                           WHEN r.status = 'storniert' THEN 'Storniert'
                           ELSE r.status
                       END as status_text,
                       CASE 
                           WHEN r.faelligkeitsdatum < date('now') AND r.status = 'offen' THEN 1
                           ELSE 0
                       END as ist_ueberfaellig
                FROM rechnungen r
                LEFT JOIN kunden k ON r.kunde_id = k.id
                LEFT JOIN auftraege a ON r.auftrag_id = a.id
                LEFT JOIN rechnungsposten rp ON r.id = rp.rechnung_id
            `;

      const params = [];
      const whereClauses = [];

      // Filter anwenden
      if (filters.status) {
        whereClauses.push("r.status = ?");
        params.push(filters.status);
      }

      if (filters.kunde_id) {
        whereClauses.push("r.kunde_id = ?");
        params.push(filters.kunde_id);
      }

      if (filters.monat && filters.jahr) {
        whereClauses.push(
          'strftime("%Y", r.datum) = ? AND strftime("%m", r.datum) = ?'
        );
        params.push(filters.jahr, filters.monat.toString().padStart(2, "0"));
      } else if (filters.jahr) {
        whereClauses.push('strftime("%Y", r.datum) = ?');
        params.push(filters.jahr);
      }

      if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      sql += " GROUP BY r.id ORDER BY r.created_at DESC";

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

  // Rechnung nach ID abrufen
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT r.*, 
                       k.name as kunde_name, 
                       k.kunde_nr, 
                       k.strasse as kunde_strasse,
                       k.plz_ort as kunde_plz_ort,
                       k.telefon as kunde_telefon,
                       k.email as kunde_email,
                       a.rep_nr as auftrag_rep_nr,
                       a.kennzeichen as auftrag_kennzeichen,
                       a.modell as auftrag_modell
                FROM rechnungen r
                LEFT JOIN kunden k ON r.kunde_id = k.id
                LEFT JOIN auftraege a ON r.auftrag_id = a.id
                WHERE r.id = ?
            `;

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Rechnung mit Posten abrufen
  static getByIdWithDetails(id) {
    return new Promise((resolve, reject) => {
      // Erst die Rechnung abrufen
      this.getById(id)
        .then((rechnung) => {
          if (!rechnung) {
            resolve(null);
            return;
          }

          // Dann die Rechnungsposten abrufen
          const sql = `
                    SELECT * FROM rechnungsposten 
                    WHERE rechnung_id = ? 
                    ORDER BY id ASC
                `;

          db.all(sql, [id], (err, posten) => {
            if (err) {
              reject(err);
            } else {
              rechnung.posten = posten || [];
              resolve(rechnung);
            }
          });
        })
        .catch(reject);
    });
  }

  // Neue Rechnung erstellen
  static async create(rechnungData) {
    const nextRechnungNum = await getNextNumber("next_rechnung_nr");
    const rechnung_nr = generateRechnungsnummer(nextRechnungNum);

    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO rechnungen (
                    rechnung_nr, kunde_id, auftrag_id, faelligkeitsdatum,
                    netto_betrag, mwst_betrag, brutto_betrag, rabatt, notizen
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const mwstSatz = 0.19; // 19% MwSt
      const nettoBetrag = rechnungData.netto_betrag || 0;
      const rabatt = rechnungData.rabatt || 0;
      const nettoNachRabatt = nettoBetrag * (1 - rabatt / 100);
      const mwstBetrag = nettoNachRabatt * mwstSatz;
      const bruttoBetrag = nettoNachRabatt + mwstBetrag;

      // Fälligkeitsdatum berechnen (30 Tage ab heute)
      const faelligkeitsdatum =
        rechnungData.faelligkeitsdatum ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      db.run(
        sql,
        [
          rechnung_nr,
          rechnungData.kunde_id,
          rechnungData.auftrag_id || null,
          faelligkeitsdatum,
          nettoNachRabatt,
          mwstBetrag,
          bruttoBetrag,
          rabatt,
          rechnungData.notizen || null,
        ],
        async function (err) {
          if (err) {
            reject(err);
          } else {
            await updateNextNumber("next_rechnung_nr", nextRechnungNum + 1);

            resolve({
              id: this.lastID,
              rechnung_nr,
              netto_betrag: nettoNachRabatt,
              mwst_betrag: mwstBetrag,
              brutto_betrag: bruttoBetrag,
              message: `Rechnung ${rechnung_nr} erfolgreich erstellt!`,
            });
          }
        }
      );
    });
  }

  // Rechnung aus Auftrag erstellen
  static async createFromAuftrag(auftragData) {
    const nextRechnungNum = await getNextNumber("next_rechnung_nr");
    const rechnung_nr = generateRechnungsnummer(nextRechnungNum);

    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO rechnungen (
                    rechnung_nr, kunde_id, auftrag_id, netto_betrag, 
                    mwst_betrag, brutto_betrag, faelligkeitsdatum
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

      const mwstSatz = 0.19; // 19% MwSt
      const nettoBetrag = auftragData.netto_betrag;
      const mwstBetrag = nettoBetrag * mwstSatz;
      const bruttoBetrag = nettoBetrag + mwstBetrag;

      // Fälligkeitsdatum: 30 Tage ab heute
      const faelligkeitsdatum = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      db.run(
        sql,
        [
          rechnung_nr,
          auftragData.kunde_id,
          auftragData.auftrag_id,
          nettoBetrag,
          mwstBetrag,
          bruttoBetrag,
          faelligkeitsdatum,
        ],
        async function (err) {
          if (err) {
            reject(err);
          } else {
            await updateNextNumber("next_rechnung_nr", nextRechnungNum + 1);

            const rechnungId = this.lastID;

            // Arbeitszeit als ersten Posten hinzufügen
            const postenSql = `
                        INSERT INTO rechnungsposten (
                            rechnung_id, beschreibung, menge, einheit, 
                            einzelpreis, gesamtpreis, kategorie
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;

            db.run(
              postenSql,
              [
                rechnungId,
                auftragData.beschreibung,
                auftragData.arbeitszeit,
                "Std.",
                auftragData.stundenpreis,
                nettoBetrag,
                "arbeitszeit",
              ],
              (postenErr) => {
                if (postenErr) {
                  console.warn(
                    "Fehler beim Erstellen des Rechnungspostens:",
                    postenErr
                  );
                }

                resolve({
                  id: rechnungId,
                  rechnung_nr,
                  netto_betrag: nettoBetrag,
                  mwst_betrag: mwstBetrag,
                  brutto_betrag: bruttoBetrag,
                });
              }
            );
          }
        }
      );
    });
  }

  // Rechnung aktualisieren
  static update(id, rechnungData) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE rechnungen 
                SET faelligkeitsdatum = ?, notizen = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(
        sql,
        [
          rechnungData.faelligkeitsdatum || null,
          rechnungData.notizen || null,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Rechnung löschen
  static delete(id) {
    return new Promise((resolve, reject) => {
      // Zuerst Rechnungsposten löschen
      db.run(
        "DELETE FROM rechnungsposten WHERE rechnung_id = ?",
        [id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Dann Rechnung löschen
            db.run("DELETE FROM rechnungen WHERE id = ?", [id], function (err) {
              if (err) reject(err);
              else resolve({ changes: this.changes });
            });
          }
        }
      );
    });
  }

  // Rabatt anwenden
  static applyRabatt(id, rabatt) {
    return new Promise((resolve, reject) => {
      // Erst aktuelle Rechnung abrufen
      this.getById(id)
        .then((rechnung) => {
          if (!rechnung) {
            resolve({ success: false, error: "Rechnung nicht gefunden" });
            return;
          }

          // Berechne neue Beträge
          const originalNetto =
            rechnung.netto_betrag / (1 - rechnung.rabatt / 100);
          const neuerNetto = originalNetto * (1 - rabatt / 100);
          const neuerMwst = neuerNetto * 0.19;
          const neuerBrutto = neuerNetto + neuerMwst;
          const ersparnis = originalNetto - neuerNetto;

          const sql = `
                    UPDATE rechnungen 
                    SET rabatt = ?, netto_betrag = ?, mwst_betrag = ?, brutto_betrag = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;

          db.run(
            sql,
            [rabatt, neuerNetto, neuerMwst, neuerBrutto, id],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  success: true,
                  netto_betrag: neuerNetto,
                  mwst_betrag: neuerMwst,
                  brutto_betrag: neuerBrutto,
                  ersparnis: ersparnis,
                });
              }
            }
          );
        })
        .catch(reject);
    });
  }

  // Als bezahlt markieren
  static markAsBezahlt(id, bezahlt_am = null) {
    return new Promise((resolve, reject) => {
      const bezahltDatum = bezahlt_am || new Date().toISOString().split("T")[0];

      const sql = `
                UPDATE rechnungen 
                SET status = 'bezahlt', bezahlt_am = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(sql, [bezahltDatum, id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve({ success: false, error: "Rechnung nicht gefunden" });
        } else {
          resolve({
            success: true,
            bezahlt_am: bezahltDatum,
          });
        }
      });
    });
  }

  // Status aktualisieren
  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE rechnungen 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(sql, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Rechnungsposten abrufen
  static getPosten(rechnungId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT * FROM rechnungsposten 
                WHERE rechnung_id = ? 
                ORDER BY id ASC
            `;

      db.all(sql, [rechnungId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Rechnungsposten hinzufügen
  static addPosten(postenData) {
    return new Promise((resolve, reject) => {
      const menge = parseFloat(postenData.menge) || 1;
      const einzelpreis = parseFloat(postenData.einzelpreis) || 0;
      const gesamtpreis = menge * einzelpreis;

      const sql = `
                INSERT INTO rechnungsposten (
                    rechnung_id, beschreibung, menge, einheit, 
                    einzelpreis, gesamtpreis, kategorie
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

      db.run(
        sql,
        [
          postenData.rechnung_id,
          postenData.beschreibung,
          menge,
          postenData.einheit || "Stk",
          einzelpreis,
          gesamtpreis,
          postenData.kategorie || "sonstiges",
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              gesamtpreis: gesamtpreis,
              message: "Rechnungsposten erfolgreich erstellt",
            });
          }
        }
      );
    });
  }

  // Rechnungsposten aktualisieren
  static updatePosten(id, postenData) {
    return new Promise((resolve, reject) => {
      const menge = parseFloat(postenData.menge) || 1;
      const einzelpreis = parseFloat(postenData.einzelpreis) || 0;
      const gesamtpreis = menge * einzelpreis;

      const sql = `
                UPDATE rechnungsposten 
                SET beschreibung = ?, menge = ?, einheit = ?, 
                    einzelpreis = ?, gesamtpreis = ?, kategorie = ?
                WHERE id = ?
            `;

      db.run(
        sql,
        [
          postenData.beschreibung,
          menge,
          postenData.einheit || "Stk",
          einzelpreis,
          gesamtpreis,
          postenData.kategorie || "sonstiges",
          id,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              changes: this.changes,
              gesamtpreis: gesamtpreis,
              message: "Rechnungsposten erfolgreich aktualisiert",
            });
          }
        }
      );
    });
  }

  // Rechnungsposten löschen
  static deletePosten(id) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM rechnungsposten WHERE id = ?";

      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Rechnung-Totals neu berechnen
  static updateTotals(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COALESCE(SUM(gesamtpreis), 0) as netto_betrag
                FROM rechnungsposten 
                WHERE rechnung_id = ?
            `;

      db.get(sql, [id], (err, totals) => {
        if (err) {
          reject(err);
        } else {
          // Aktuelle Rechnung für Rabatt-Info abrufen
          this.getById(id)
            .then((rechnung) => {
              const rabatt = rechnung ? rechnung.rabatt : 0;
              const nettoNachRabatt = totals.netto_betrag * (1 - rabatt / 100);
              const mwstBetrag = nettoNachRabatt * 0.19;
              const bruttoBetrag = nettoNachRabatt + mwstBetrag;

              const updateSql = `
                            UPDATE rechnungen 
                            SET netto_betrag = ?, mwst_betrag = ?, brutto_betrag = ?,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `;

              db.run(
                updateSql,
                [nettoNachRabatt, mwstBetrag, bruttoBetrag, id],
                function (updateErr) {
                  if (updateErr) reject(updateErr);
                  else
                    resolve({
                      netto_betrag: nettoNachRabatt,
                      mwst_betrag: mwstBetrag,
                      brutto_betrag: bruttoBetrag,
                    });
                }
              );
            })
            .catch(reject);
        }
      });
    });
  }

  // Rechnung nach Auftrag-ID abrufen
  static getByAuftragId(auftragId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT * FROM rechnungen 
                WHERE auftrag_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            `;

      db.get(sql, [auftragId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Rechnungen suchen
  static search(query) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT r.*, k.name as kunde_name, k.kunde_nr, a.rep_nr
                FROM rechnungen r
                LEFT JOIN kunden k ON r.kunde_id = k.id
                LEFT JOIN auftraege a ON r.auftrag_id = a.id
                WHERE 
                    r.rechnung_nr LIKE ? OR 
                    k.name LIKE ? OR
                    k.kunde_nr LIKE ? OR
                    a.rep_nr LIKE ?
                ORDER BY r.created_at DESC
            `;

      const searchTerm = `%${query}%`;
      const params = Array(4).fill(searchTerm);

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Rechnungs-Statistiken
  static getStatistics() {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COUNT(*) as total_rechnungen,
                    COUNT(CASE WHEN status = 'offen' THEN 1 END) as offen,
                    COUNT(CASE WHEN status = 'versendet' THEN 1 END) as versendet,
                    COUNT(CASE WHEN status = 'bezahlt' THEN 1 END) as bezahlt,
                    COUNT(CASE WHEN status = 'ueberfaellig' THEN 1 END) as ueberfaellig,
                    COUNT(CASE WHEN status = 'storniert' THEN 1 END) as storniert,
                    COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as neue_30d,
                    COALESCE(AVG(brutto_betrag), 0) as avg_rechnungsbetrag,
                    COALESCE(SUM(brutto_betrag), 0) as total_umsatz,
                    COALESCE(SUM(CASE WHEN status = 'bezahlt' THEN brutto_betrag ELSE 0 END), 0) as bezahlter_umsatz,
                    COALESCE(SUM(CASE WHEN status = 'offen' OR status = 'versendet' THEN brutto_betrag ELSE 0 END), 0) as offener_umsatz,
                    COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of month') THEN brutto_betrag ELSE 0 END), 0) as monatsumsatz
                FROM rechnungen
            `;

      db.get(sql, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Monatsstatistiken
  static getMonthlyStats(year) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    strftime('%m', datum) as monat,
                    COUNT(*) as rechnungen_count,
                    COALESCE(SUM(brutto_betrag), 0) as umsatz,
                    COALESCE(SUM(CASE WHEN status = 'bezahlt' THEN brutto_betrag ELSE 0 END), 0) as bezahlter_umsatz,
                    COALESCE(AVG(brutto_betrag), 0) as avg_rechnungsbetrag
                FROM rechnungen
                WHERE strftime('%Y', datum) = ?
                GROUP BY strftime('%m', datum)
                ORDER BY monat ASC
            `;

      db.all(sql, [year.toString()], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Überfällige Rechnungen
  static getUeberfaellige() {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT r.*, k.name as kunde_name, k.kunde_nr, k.telefon,
                       julianday('now') - julianday(r.faelligkeitsdatum) as tage_ueberfaellig
                FROM rechnungen r
                LEFT JOIN kunden k ON r.kunde_id = k.id
                WHERE r.faelligkeitsdatum < date('now') 
                AND r.status IN ('offen', 'versendet')
                ORDER BY r.faelligkeitsdatum ASC
            `;

      db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Bulk-Status-Update
  static bulkUpdateStatus(ids, status) {
    return new Promise((resolve, reject) => {
      const placeholders = ids.map(() => "?").join(",");
      const sql = `
                UPDATE rechnungen 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id IN (${placeholders})
            `;

      db.run(sql, [status, ...ids], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes });
        }
      });
    });
  }

  // Rechnungen eines Kunden
  static getByKundeId(kundeId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT r.*, a.rep_nr,
                       COUNT(rp.id) as posten_count,
                       CASE 
                           WHEN r.status = 'offen' THEN 'Offen'
                           WHEN r.status = 'versendet' THEN 'Versendet'
                           WHEN r.status = 'bezahlt' THEN 'Bezahlt'
                           WHEN r.status = 'ueberfaellig' THEN 'Überfällig'
                           WHEN r.status = 'storniert' THEN 'Storniert'
                           ELSE r.status
                       END as status_text
                FROM rechnungen r
                LEFT JOIN auftraege a ON r.auftrag_id = a.id
                LEFT JOIN rechnungsposten rp ON r.id = rp.rechnung_id
                WHERE r.kunde_id = ?
                GROUP BY r.id
                ORDER BY r.created_at DESC
            `;

      db.all(sql, [kundeId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Rechnung duplizieren
  static duplicate(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // Original-Rechnung mit Posten abrufen
        const original = await this.getByIdWithDetails(id);
        if (!original) {
          resolve({
            success: false,
            error: "Original-Rechnung nicht gefunden",
          });
          return;
        }

        // Neue Rechnung erstellen
        const newRechnungData = {
          kunde_id: original.kunde_id,
          auftrag_id: original.auftrag_id,
          netto_betrag: original.netto_betrag,
          rabatt: original.rabatt,
          notizen: `Kopie von ${original.rechnung_nr}`,
        };

        const newRechnung = await this.create(newRechnungData);

        // Posten kopieren
        if (original.posten && original.posten.length > 0) {
          for (const posten of original.posten) {
            await this.addPosten({
              rechnung_id: newRechnung.id,
              beschreibung: posten.beschreibung,
              menge: posten.menge,
              einheit: posten.einheit,
              einzelpreis: posten.einzelpreis,
              kategorie: posten.kategorie,
            });
          }

          // Totals neu berechnen
          await this.updateTotals(newRechnung.id);
        }

        resolve({
          success: true,
          id: newRechnung.id,
          rechnung_nr: newRechnung.rechnung_nr,
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = RechnungenModel;
