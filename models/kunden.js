const { db } = require("../config/database");
const { getNextNumber, updateNextNumber } = require("../utils/numbers");

class KundenModel {
  // Alle Kunden abrufen
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT k.*, 
                       COUNT(a.id) as auftraege_count,
                       COUNT(r.id) as rechnungen_count,
                       COALESCE(SUM(r.brutto_betrag), 0) as gesamtumsatz
                FROM kunden k
                LEFT JOIN auftraege a ON k.id = a.kunde_id
                LEFT JOIN rechnungen r ON k.id = r.kunde_id
                GROUP BY k.id
                ORDER BY k.created_at DESC
            `;

      db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Kunden nach ID abrufen
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT k.*, 
                       COUNT(a.id) as auftraege_count,
                       COUNT(r.id) as rechnungen_count,
                       COALESCE(SUM(r.brutto_betrag), 0) as gesamtumsatz
                FROM kunden k
                LEFT JOIN auftraege a ON k.id = a.kunde_id
                LEFT JOIN rechnungen r ON k.id = r.kunde_id
                WHERE k.id = ?
                GROUP BY k.id
            `;

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Neuen Kunden erstellen
  static async create(kundeData) {
    const nextNum = await getNextNumber("next_kunde_nr");
    const kunde_nr = "K-" + nextNum.toString().padStart(3, "0");

    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO kunden (kunde_nr, name, strasse, plz_ort, telefon, email, notizen)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

      db.run(
        sql,
        [
          kunde_nr,
          kundeData.name,
          kundeData.strasse || null,
          kundeData.plz_ort || null,
          kundeData.telefon || null,
          kundeData.email || null,
          kundeData.notizen || null,
        ],
        async function (err) {
          if (err) {
            reject(err);
          } else {
            await updateNextNumber("next_kunde_nr", nextNum + 1);
            resolve({
              id: this.lastID,
              kunde_nr,
              message: `Kunde ${kunde_nr} erfolgreich erstellt!`,
            });
          }
        }
      );
    });
  }

  // Kunden aktualisieren
  static update(id, kundeData) {
    return new Promise((resolve, reject) => {
      const sql = `
                UPDATE kunden 
                SET name = ?, strasse = ?, plz_ort = ?, telefon = ?, 
                    email = ?, notizen = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

      db.run(
        sql,
        [
          kundeData.name,
          kundeData.strasse || null,
          kundeData.plz_ort || null,
          kundeData.telefon || null,
          kundeData.email || null,
          kundeData.notizen || null,
          id,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Kunden löschen
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM kunden WHERE id = ?";

      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Prüfen ob Kunde Aufträge hat
  static hasAuftraege(id) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT COUNT(*) as count FROM auftraege WHERE kunde_id = ?";

      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });
  }

  // Alle Aufträge eines Kunden abrufen
  static getAuftraege(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT a.*, 
                       CASE 
                           WHEN a.status = 'offen' THEN 'Offen'
                           WHEN a.status = 'bearbeitung' THEN 'In Bearbeitung'
                           WHEN a.status = 'abgeschlossen' THEN 'Abgeschlossen'
                           ELSE a.status
                       END as status_text
                FROM auftraege a
                WHERE a.kunde_id = ?
                ORDER BY a.created_at DESC
            `;

      db.all(sql, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Alle Rechnungen eines Kunden abrufen
  static getRechnungen(id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT r.*, a.rep_nr,
                       CASE 
                           WHEN r.status = 'offen' THEN 'Offen'
                           WHEN r.status = 'bezahlt' THEN 'Bezahlt'
                           WHEN r.status = 'ueberfaellig' THEN 'Überfällig'
                           ELSE r.status
                       END as status_text
                FROM rechnungen r
                LEFT JOIN auftraege a ON r.auftrag_id = a.id
                WHERE r.kunde_id = ?
                ORDER BY r.created_at DESC
            `;

      db.all(sql, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Kunden suchen
  static search(query) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT k.*, 
                       COUNT(a.id) as auftraege_count,
                       COALESCE(SUM(r.brutto_betrag), 0) as gesamtumsatz
                FROM kunden k
                LEFT JOIN auftraege a ON k.id = a.kunde_id
                LEFT JOIN rechnungen r ON k.id = r.kunde_id
                WHERE k.name LIKE ? OR k.kunde_nr LIKE ? OR k.telefon LIKE ?
                GROUP BY k.id
                ORDER BY k.name ASC
            `;

      const searchTerm = `%${query}%`;
      db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Kundenstatistiken abrufen
  static getStatistics() {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT 
                    COUNT(*) as total_kunden,
                    COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as neue_kunden_30d,
                    COALESCE(AVG(
                        (SELECT COUNT(*) FROM auftraege WHERE kunde_id = kunden.id)
                    ), 0) as avg_auftraege_pro_kunde,
                    COALESCE(AVG(
                        (SELECT SUM(brutto_betrag) FROM rechnungen WHERE kunde_id = kunden.id)
                    ), 0) as avg_umsatz_pro_kunde
                FROM kunden
            `;

      db.get(sql, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = KundenModel;
