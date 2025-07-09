const express = require("express");
const router = express.Router();
const auftraegeModel = require("../models/auftraege");
const arbeitsschritteModel = require("../models/arbeitsschritte");
const rechnungenModel = require("../models/rechnungen");
const {
  validateAuftrag,
  validateArbeitsschritt,
} = require("../utils/validation");
const { applyTimeTemplate } = require("../utils/templates");

// GET /api/auftraege - Alle Aufträge abrufen
router.get("/", async (req, res) => {
  try {
    const { status, kunde_id, limit, offset } = req.query;
    const filters = { status, kunde_id, limit, offset };

    const auftraege = await auftraegeModel.getAll(filters);
    res.json(auftraege);
  } catch (error) {
    console.error("Fehler beim Abrufen der Aufträge:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Aufträge" });
  }
});

// GET /api/auftraege/:id - Einzelnen Auftrag mit Arbeitsschritten abrufen
router.get("/:id", async (req, res) => {
  try {
    const auftrag = await auftraegeModel.getByIdWithDetails(req.params.id);
    if (!auftrag) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }
    res.json(auftrag);
  } catch (error) {
    console.error("Fehler beim Abrufen des Auftrags:", error);
    res.status(500).json({ error: "Fehler beim Abrufen des Auftrags" });
  }
});

// POST /api/auftraege - Neuen Auftrag erstellen
router.post("/", async (req, res) => {
  try {
    // Validierung
    const validation = validateAuftrag(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await auftraegeModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Fehler beim Erstellen des Auftrags:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res
        .status(400)
        .json({ error: "Auftrag mit dieser Nummer existiert bereits" });
    } else {
      res.status(500).json({ error: "Fehler beim Erstellen des Auftrags" });
    }
  }
});

// PUT /api/auftraege/:id - Auftrag aktualisieren
router.put("/:id", async (req, res) => {
  try {
    // Validierung
    const validation = validateAuftrag(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await auftraegeModel.update(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }
    res.json({
      message: "Auftrag erfolgreich aktualisiert",
      changes: result.changes,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Auftrags:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Auftrags" });
  }
});

// DELETE /api/auftraege/:id - Auftrag löschen
router.delete("/:id", async (req, res) => {
  try {
    // Prüfen ob Auftrag bereits eine Rechnung hat
    const hasRechnung = await auftraegeModel.hasRechnung(req.params.id);
    if (hasRechnung) {
      return res.status(400).json({
        error:
          "Auftrag kann nicht gelöscht werden, da bereits eine Rechnung erstellt wurde",
      });
    }

    const result = await auftraegeModel.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }
    res.json({ message: "Auftrag erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Auftrags:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Auftrags" });
  }
});

// POST /api/auftraege/:id/zu-rechnung - Auftrag zu Rechnung konvertieren
router.post("/:id/zu-rechnung", async (req, res) => {
  try {
    const auftragId = req.params.id;

    // Auftrag mit Details abrufen
    const auftrag = await auftraegeModel.getByIdWithDetails(auftragId);
    if (!auftrag) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }

    // Prüfen ob Arbeitszeiten vorhanden sind
    if (!auftrag.gesamtzeit || auftrag.gesamtzeit === 0) {
      return res.status(400).json({
        error: "Keine Arbeitszeiten im Auftrag eingegeben!",
      });
    }

    // Prüfen ob bereits eine Rechnung existiert
    const existingRechnung = await rechnungenModel.getByAuftragId(auftragId);
    if (existingRechnung) {
      return res.status(400).json({
        error: "Für diesen Auftrag wurde bereits eine Rechnung erstellt!",
      });
    }

    // Rechnung erstellen
    const rechnungData = {
      auftrag_id: auftragId,
      kunde_id: auftrag.kunde_id,
      beschreibung: `Lackierarbeiten lt. Auftrag ${auftrag.rep_nr}`,
      arbeitszeit: auftrag.gesamtzeit,
      stundenpreis: auftrag.basis_stundenpreis,
      netto_betrag: auftrag.gesamtkosten,
    };

    const rechnung = await rechnungenModel.createFromAuftrag(rechnungData);

    // Auftrag Status auf "abgeschlossen" setzen
    await auftraegeModel.updateStatus(auftragId, "abgeschlossen");

    res.json({
      rechnung_id: rechnung.id,
      rechnung_nr: rechnung.rechnung_nr,
      message: `Auftrag ${auftrag.rep_nr} erfolgreich zu Rechnung ${rechnung.rechnung_nr} konvertiert!`,
      details: {
        arbeitszeit: auftrag.gesamtzeit,
        stundenpreis: auftrag.basis_stundenpreis,
        netto_betrag: auftrag.gesamtkosten,
        brutto_betrag: rechnung.brutto_betrag,
      },
    });
  } catch (error) {
    console.error("Fehler beim Konvertieren zu Rechnung:", error);
    res.status(500).json({ error: "Fehler beim Konvertieren zu Rechnung" });
  }
});

// POST /api/auftraege/:id/schnell-zeiten - Zeit-Template anwenden
router.post("/:id/schnell-zeiten", async (req, res) => {
  try {
    const { template } = req.body;
    const auftragId = req.params.id;

    // Auftrag abrufen
    const auftrag = await auftraegeModel.getById(auftragId);
    if (!auftrag) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }

    // Template anwenden
    const result = await applyTimeTemplate(
      auftragId,
      template,
      auftrag.basis_stundenpreis
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Auftrag-Totals neu berechnen
    await auftraegeModel.updateTotals(auftragId);

    res.json({
      message: `${template} Template erfolgreich angewendet!`,
      template: template,
      steps_updated: result.stepsUpdated,
      total_time: result.totalTime,
      total_cost: result.totalCost,
    });
  } catch (error) {
    console.error("Fehler beim Anwenden des Templates:", error);
    res.status(500).json({ error: "Fehler beim Anwenden des Templates" });
  }
});

// GET /api/auftraege/:id/arbeitsschritte - Arbeitsschritte eines Auftrags
router.get("/:id/arbeitsschritte", async (req, res) => {
  try {
    const arbeitsschritte = await arbeitsschritteModel.getByAuftragId(
      req.params.id
    );
    res.json(arbeitsschritte);
  } catch (error) {
    console.error("Fehler beim Abrufen der Arbeitsschritte:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Arbeitsschritte" });
  }
});

// POST /api/auftraege/:id/arbeitsschritte - Neuen Arbeitsschritt hinzufügen
router.post("/:id/arbeitsschritte", async (req, res) => {
  try {
    // Validierung
    const validation = validateArbeitsschritt(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const schrittData = {
      ...req.body,
      auftrag_id: req.params.id,
    };

    const result = await arbeitsschritteModel.create(schrittData);

    // Auftrag-Totals neu berechnen
    await auftraegeModel.updateTotals(req.params.id);

    res.status(201).json(result);
  } catch (error) {
    console.error("Fehler beim Erstellen des Arbeitsschritts:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Erstellen des Arbeitsschritts" });
  }
});

// PUT /api/auftraege/:auftragId/arbeitsschritte/:id - Arbeitsschritt aktualisieren
router.put("/:auftragId/arbeitsschritte/:id", async (req, res) => {
  try {
    // Validierung
    const validation = validateArbeitsschritt(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await arbeitsschritteModel.update(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Arbeitsschritt nicht gefunden" });
    }

    // Auftrag-Totals neu berechnen
    await auftraegeModel.updateTotals(req.params.auftragId);

    res.json({
      message: "Arbeitsschritt erfolgreich aktualisiert",
      changes: result.changes,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Arbeitsschritts:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Aktualisieren des Arbeitsschritts" });
  }
});

// DELETE /api/auftraege/:auftragId/arbeitsschritte/:id - Arbeitsschritt löschen
router.delete("/:auftragId/arbeitsschritte/:id", async (req, res) => {
  try {
    const result = await arbeitsschritteModel.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Arbeitsschritt nicht gefunden" });
    }

    // Auftrag-Totals neu berechnen
    await auftraegeModel.updateTotals(req.params.auftragId);

    res.json({ message: "Arbeitsschritt erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Arbeitsschritts:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Arbeitsschritts" });
  }
});

// PUT /api/auftraege/:id/status - Auftrag-Status ändern
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "offen",
      "bearbeitung",
      "abgeschlossen",
      "storniert",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status muss einer von ${validStatuses.join(", ")} sein`,
      });
    }

    const result = await auftraegeModel.updateStatus(req.params.id, status);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Auftrag nicht gefunden" });
    }

    res.json({ message: `Auftrag-Status auf "${status}" geändert` });
  } catch (error) {
    console.error("Fehler beim Ändern des Status:", error);
    res.status(500).json({ error: "Fehler beim Ändern des Status" });
  }
});

// GET /api/auftraege/stats/summary - Auftrags-Statistiken
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await auftraegeModel.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Fehler beim Abrufen der Statistiken:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Statistiken" });
  }
});

// GET /api/auftraege/search/:query - Aufträge suchen
router.get("/search/:query", async (req, res) => {
  try {
    const auftraege = await auftraegeModel.search(req.params.query);
    res.json(auftraege);
  } catch (error) {
    console.error("Fehler bei der Auftragssuche:", error);
    res.status(500).json({ error: "Fehler bei der Suche" });
  }
});

module.exports = router;
