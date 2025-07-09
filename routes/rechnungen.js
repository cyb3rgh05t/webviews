const express = require("express");
const router = express.Router();
const rechnungenModel = require("../models/rechnungen");
const {
  validateRechnung,
  validateRechnungsposten,
} = require("../utils/validation");

// GET /api/rechnungen - Alle Rechnungen abrufen
router.get("/", async (req, res) => {
  try {
    const { status, kunde_id, monat, jahr, limit, offset } = req.query;
    const filters = { status, kunde_id, monat, jahr, limit, offset };

    const rechnungen = await rechnungenModel.getAll(filters);
    res.json(rechnungen);
  } catch (error) {
    console.error("Fehler beim Abrufen der Rechnungen:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Rechnungen" });
  }
});

// GET /api/rechnungen/:id - Einzelne Rechnung mit Posten abrufen
router.get("/:id", async (req, res) => {
  try {
    const rechnung = await rechnungenModel.getByIdWithDetails(req.params.id);
    if (!rechnung) {
      return res.status(404).json({ error: "Rechnung nicht gefunden" });
    }
    res.json(rechnung);
  } catch (error) {
    console.error("Fehler beim Abrufen der Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Rechnung" });
  }
});

// POST /api/rechnungen - Neue Rechnung erstellen
router.post("/", async (req, res) => {
  try {
    // Validierung
    const validation = validateRechnung(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await rechnungenModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Fehler beim Erstellen der Rechnung:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res
        .status(400)
        .json({ error: "Rechnung mit dieser Nummer existiert bereits" });
    } else {
      res.status(500).json({ error: "Fehler beim Erstellen der Rechnung" });
    }
  }
});

// PUT /api/rechnungen/:id - Rechnung aktualisieren
router.put("/:id", async (req, res) => {
  try {
    // Validierung
    const validation = validateRechnung(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await rechnungenModel.update(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Rechnung nicht gefunden" });
    }
    res.json({
      message: "Rechnung erfolgreich aktualisiert",
      changes: result.changes,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Rechnung" });
  }
});

// DELETE /api/rechnungen/:id - Rechnung löschen
router.delete("/:id", async (req, res) => {
  try {
    // Prüfen ob Rechnung bereits bezahlt ist
    const rechnung = await rechnungenModel.getById(req.params.id);
    if (rechnung && rechnung.status === "bezahlt") {
      return res.status(400).json({
        error: "Bezahlte Rechnungen können nicht gelöscht werden",
      });
    }

    const result = await rechnungenModel.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Rechnung nicht gefunden" });
    }
    res.json({ message: "Rechnung erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen der Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Löschen der Rechnung" });
  }
});

// PUT /api/rechnungen/:id/rabatt - Rabatt anwenden
router.put("/:id/rabatt", async (req, res) => {
  try {
    const { rabatt } = req.body;
    const rechnungId = req.params.id;

    // Rabatt validieren
    if (isNaN(rabatt) || rabatt < 0 || rabatt > 50) {
      return res.status(400).json({
        error: "Rabatt muss zwischen 0 und 50 Prozent liegen",
      });
    }

    const result = await rechnungenModel.applyRabatt(rechnungId, rabatt);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `${rabatt}% Rabatt angewendet`,
      rabatt: rabatt,
      netto_betrag: result.netto_betrag,
      brutto_betrag: result.brutto_betrag,
      ersparnis: result.ersparnis,
    });
  } catch (error) {
    console.error("Fehler beim Anwenden des Rabatts:", error);
    res.status(500).json({ error: "Fehler beim Anwenden des Rabatts" });
  }
});

// PUT /api/rechnungen/:id/bezahlt - Rechnung als bezahlt markieren
router.put("/:id/bezahlt", async (req, res) => {
  try {
    const { bezahlt_am } = req.body;
    const rechnungId = req.params.id;

    const result = await rechnungenModel.markAsBezahlt(rechnungId, bezahlt_am);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: "Rechnung als bezahlt markiert",
      bezahlt_am: result.bezahlt_am,
      status: "bezahlt",
    });
  } catch (error) {
    console.error("Fehler beim Markieren der Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Markieren der Rechnung" });
  }
});

// PUT /api/rechnungen/:id/status - Rechnungs-Status ändern
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "offen",
      "versendet",
      "bezahlt",
      "ueberfaellig",
      "storniert",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status muss einer von ${validStatuses.join(", ")} sein`,
      });
    }

    const result = await rechnungenModel.updateStatus(req.params.id, status);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Rechnung nicht gefunden" });
    }

    res.json({ message: `Rechnungs-Status auf "${status}" geändert` });
  } catch (error) {
    console.error("Fehler beim Ändern des Status:", error);
    res.status(500).json({ error: "Fehler beim Ändern des Status" });
  }
});

// GET /api/rechnungen/:id/posten - Rechnungsposten einer Rechnung
router.get("/:id/posten", async (req, res) => {
  try {
    const posten = await rechnungenModel.getPosten(req.params.id);
    res.json(posten);
  } catch (error) {
    console.error("Fehler beim Abrufen der Rechnungsposten:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Rechnungsposten" });
  }
});

// POST /api/rechnungen/:id/posten - Neuen Rechnungsposten hinzufügen
router.post("/:id/posten", async (req, res) => {
  try {
    // Validierung
    const validation = validateRechnungsposten(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const postenData = {
      ...req.body,
      rechnung_id: req.params.id,
    };

    const result = await rechnungenModel.addPosten(postenData);

    // Rechnung-Totals neu berechnen
    await rechnungenModel.updateTotals(req.params.id);

    res.status(201).json(result);
  } catch (error) {
    console.error("Fehler beim Erstellen des Rechnungspostens:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Erstellen des Rechnungspostens" });
  }
});

// PUT /api/rechnungen/:rechnungId/posten/:id - Rechnungsposten aktualisieren
router.put("/:rechnungId/posten/:id", async (req, res) => {
  try {
    // Validierung
    const validation = validateRechnungsposten(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await rechnungenModel.updatePosten(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Rechnungsposten nicht gefunden" });
    }

    // Rechnung-Totals neu berechnen
    await rechnungenModel.updateTotals(req.params.rechnungId);

    res.json({
      message: "Rechnungsposten erfolgreich aktualisiert",
      changes: result.changes,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Rechnungspostens:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Aktualisieren des Rechnungspostens" });
  }
});

// DELETE /api/rechnungen/:rechnungId/posten/:id - Rechnungsposten löschen
router.delete("/:rechnungId/posten/:id", async (req, res) => {
  try {
    const result = await rechnungenModel.deletePosten(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Rechnungsposten nicht gefunden" });
    }

    // Rechnung-Totals neu berechnen
    await rechnungenModel.updateTotals(req.params.rechnungId);

    res.json({ message: "Rechnungsposten erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Rechnungspostens:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Rechnungspostens" });
  }
});

// POST /api/rechnungen/:id/duplizieren - Rechnung duplizieren
router.post("/:id/duplizieren", async (req, res) => {
  try {
    const result = await rechnungenModel.duplicate(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      id: result.id,
      rechnung_nr: result.rechnung_nr,
      message: `Rechnung erfolgreich dupliziert als ${result.rechnung_nr}`,
    });
  } catch (error) {
    console.error("Fehler beim Duplizieren der Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Duplizieren der Rechnung" });
  }
});

// GET /api/rechnungen/stats/summary - Rechnungs-Statistiken
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await rechnungenModel.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Fehler beim Abrufen der Statistiken:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Statistiken" });
  }
});

// GET /api/rechnungen/stats/monatlich/:jahr - Monatsstatistiken
router.get("/stats/monatlich/:jahr", async (req, res) => {
  try {
    const jahr = req.params.jahr;
    const stats = await rechnungenModel.getMonthlyStats(jahr);
    res.json(stats);
  } catch (error) {
    console.error("Fehler beim Abrufen der Monatsstatistiken:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Abrufen der Monatsstatistiken" });
  }
});

// GET /api/rechnungen/ueberfaellig - Überfällige Rechnungen
router.get("/ueberfaellig", async (req, res) => {
  try {
    const rechnungen = await rechnungenModel.getUeberfaellige();
    res.json(rechnungen);
  } catch (error) {
    console.error("Fehler beim Abrufen überfälliger Rechnungen:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Abrufen überfälliger Rechnungen" });
  }
});

// POST /api/rechnungen/bulk-status - Bulk-Status-Update
router.post("/bulk-status", async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs-Array ist erforderlich" });
    }

    const validStatuses = [
      "offen",
      "versendet",
      "bezahlt",
      "ueberfaellig",
      "storniert",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status muss einer von ${validStatuses.join(", ")} sein`,
      });
    }

    const result = await rechnungenModel.bulkUpdateStatus(ids, status);

    res.json({
      message: `${result.updated} Rechnungen auf "${status}" aktualisiert`,
      updated: result.updated,
    });
  } catch (error) {
    console.error("Fehler beim Bulk-Status-Update:", error);
    res.status(500).json({ error: "Fehler beim Bulk-Status-Update" });
  }
});

// GET /api/rechnungen/search/:query - Rechnungen suchen
router.get("/search/:query", async (req, res) => {
  try {
    const rechnungen = await rechnungenModel.search(req.params.query);
    res.json(rechnungen);
  } catch (error) {
    console.error("Fehler bei der Rechnungssuche:", error);
    res.status(500).json({ error: "Fehler bei der Suche" });
  }
});

// GET /api/rechnungen/kunde/:kundeId - Rechnungen eines Kunden
router.get("/kunde/:kundeId", async (req, res) => {
  try {
    const rechnungen = await rechnungenModel.getByKundeId(req.params.kundeId);
    res.json(rechnungen);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kundenrechnungen:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Rechnungen" });
  }
});

// POST /api/rechnungen/:id/email - Rechnung per E-Mail versenden
router.post("/:id/email", async (req, res) => {
  try {
    const { email, betreff, nachricht } = req.body;

    if (!email) {
      return res.status(400).json({ error: "E-Mail-Adresse ist erforderlich" });
    }

    // TODO: E-Mail-Versand implementieren
    // const result = await rechnungenModel.sendEmail(req.params.id, {
    //     email, betreff, nachricht
    // });

    res.json({
      message: "E-Mail-Versand wird implementiert",
      email: email,
      rechnung_id: req.params.id,
    });
  } catch (error) {
    console.error("Fehler beim E-Mail-Versand:", error);
    res.status(500).json({ error: "Fehler beim E-Mail-Versand" });
  }
});

// GET /api/rechnungen/:id/pdf - Rechnung als PDF generieren
router.get("/:id/pdf", async (req, res) => {
  try {
    // TODO: PDF-Generierung implementieren
    // const pdfBuffer = await rechnungenModel.generatePDF(req.params.id);

    res.json({
      message: "PDF-Generierung wird implementiert",
      rechnung_id: req.params.id,
    });
  } catch (error) {
    console.error("Fehler bei der PDF-Generierung:", error);
    res.status(500).json({ error: "Fehler bei der PDF-Generierung" });
  }
});

// POST /api/rechnungen/import - Rechnungen importieren
router.post("/import", async (req, res) => {
  try {
    const { data, format } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Daten-Array ist erforderlich" });
    }

    // TODO: Import implementieren
    // const result = await rechnungenModel.importData(data, format);

    res.json({
      message: "Import wird implementiert",
      count: data.length,
      format: format,
    });
  } catch (error) {
    console.error("Fehler beim Import:", error);
    res.status(500).json({ error: "Fehler beim Import" });
  }
});

// GET /api/rechnungen/export/:format - Rechnungen exportieren
router.get("/export/:format", async (req, res) => {
  try {
    const format = req.params.format;
    const { status, kunde_id, jahr } = req.query;

    const supportedFormats = ["csv", "xlsx", "json"];
    if (!supportedFormats.includes(format)) {
      return res.status(400).json({
        error: `Format muss einer von ${supportedFormats.join(", ")} sein`,
      });
    }

    // TODO: Export implementieren
    // const exportData = await rechnungenModel.exportData(format, {
    //     status, kunde_id, jahr
    // });

    res.json({
      message: "Export wird implementiert",
      format: format,
      filters: { status, kunde_id, jahr },
    });
  } catch (error) {
    console.error("Fehler beim Export:", error);
    res.status(500).json({ error: "Fehler beim Export" });
  }
});

module.exports = router;
