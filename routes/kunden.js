const express = require("express");
const router = express.Router();
const kundenModel = require("../models/kunden");
const { validateKunde } = require("../utils/validation");

// GET /api/kunden - Alle Kunden abrufen
router.get("/", async (req, res) => {
  try {
    const kunden = await kundenModel.getAll();
    res.json(kunden);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kunden:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Kunden" });
  }
});

// GET /api/kunden/:id - Einzelnen Kunden abrufen
router.get("/:id", async (req, res) => {
  try {
    const kunde = await kundenModel.getById(req.params.id);
    if (!kunde) {
      return res.status(404).json({ error: "Kunde nicht gefunden" });
    }
    res.json(kunde);
  } catch (error) {
    console.error("Fehler beim Abrufen des Kunden:", error);
    res.status(500).json({ error: "Fehler beim Abrufen des Kunden" });
  }
});

// POST /api/kunden - Neuen Kunden erstellen
router.post("/", async (req, res) => {
  try {
    // Validierung
    const validation = validateKunde(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await kundenModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Fehler beim Erstellen des Kunden:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      res
        .status(400)
        .json({ error: "Kunde mit dieser Nummer existiert bereits" });
    } else {
      res.status(500).json({ error: "Fehler beim Erstellen des Kunden" });
    }
  }
});

// PUT /api/kunden/:id - Kunden aktualisieren
router.put("/:id", async (req, res) => {
  try {
    // Validierung
    const validation = validateKunde(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(", ") });
    }

    const result = await kundenModel.update(req.params.id, req.body);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Kunde nicht gefunden" });
    }
    res.json({
      message: "Kunde erfolgreich aktualisiert",
      changes: result.changes,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Kunden:", error);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Kunden" });
  }
});

// DELETE /api/kunden/:id - Kunden löschen
router.delete("/:id", async (req, res) => {
  try {
    // Prüfen ob Kunde Aufträge hat
    const hasAuftraege = await kundenModel.hasAuftraege(req.params.id);
    if (hasAuftraege) {
      return res.status(400).json({
        error:
          "Kunde kann nicht gelöscht werden, da noch Aufträge vorhanden sind",
      });
    }

    const result = await kundenModel.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Kunde nicht gefunden" });
    }
    res.json({ message: "Kunde erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen des Kunden:", error);
    res.status(500).json({ error: "Fehler beim Löschen des Kunden" });
  }
});

// GET /api/kunden/:id/auftraege - Alle Aufträge eines Kunden
router.get("/:id/auftraege", async (req, res) => {
  try {
    const auftraege = await kundenModel.getAuftraege(req.params.id);
    res.json(auftraege);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kundenaufträge:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Aufträge" });
  }
});

// GET /api/kunden/:id/rechnungen - Alle Rechnungen eines Kunden
router.get("/:id/rechnungen", async (req, res) => {
  try {
    const rechnungen = await kundenModel.getRechnungen(req.params.id);
    res.json(rechnungen);
  } catch (error) {
    console.error("Fehler beim Abrufen der Kundenrechnungen:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Rechnungen" });
  }
});

// GET /api/kunden/search/:query - Kunden suchen
router.get("/search/:query", async (req, res) => {
  try {
    const kunden = await kundenModel.search(req.params.query);
    res.json(kunden);
  } catch (error) {
    console.error("Fehler bei der Kundensuche:", error);
    res.status(500).json({ error: "Fehler bei der Suche" });
  }
});

module.exports = router;
