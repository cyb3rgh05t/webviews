const arbeitsschritteModel = require("../models/arbeitsschritte");

/**
 * ZEIT-TEMPLATES FÜR LACKIERARBEITEN
 * Wie im VBA-Code SchnellZeitenAuftrag()
 */

// Template-Definitionen (wie im VBA-Code)
const TIME_TEMPLATES = {
  "spot-repair": {
    name: "Spot-Repair",
    description: "Kleine Ausbesserung (1-2 Std)",
    totalTime: 2.0,
    steps: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 0.5 },
      { beschreibung: "Schleifen/Spachteln", zeit: 0.25 },
      { beschreibung: "Grundierung", zeit: 0.25 },
      { beschreibung: "Zwischenschliff", zeit: 0 },
      { beschreibung: "Basislack", zeit: 0.5 },
      { beschreibung: "Klarlack", zeit: 0.25 },
      { beschreibung: "Polieren/Finish", zeit: 0.25 },
      { beschreibung: "Montage", zeit: 0 },
    ],
  },

  "kleine-reparatur": {
    name: "Kleine Reparatur",
    description: "Kleinere Schadstelle (3-5 Std)",
    totalTime: 4.5,
    steps: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 1.0 },
      { beschreibung: "Schleifen/Spachteln", zeit: 1.0 },
      { beschreibung: "Grundierung", zeit: 0.5 },
      { beschreibung: "Zwischenschliff", zeit: 0 },
      { beschreibung: "Basislack", zeit: 1.0 },
      { beschreibung: "Klarlack", zeit: 0.5 },
      { beschreibung: "Polieren/Finish", zeit: 0.5 },
      { beschreibung: "Montage", zeit: 0.5 },
    ],
  },

  teilelackierung: {
    name: "Teilelackierung",
    description: "Einzelne Bauteile (6-10 Std)",
    totalTime: 11.0,
    steps: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 2.0 },
      { beschreibung: "Schleifen/Spachteln", zeit: 2.5 },
      { beschreibung: "Grundierung", zeit: 1.0 },
      { beschreibung: "Zwischenschliff", zeit: 0.5 },
      { beschreibung: "Basislack", zeit: 2.0 },
      { beschreibung: "Klarlack", zeit: 1.0 },
      { beschreibung: "Polieren/Finish", zeit: 1.0 },
      { beschreibung: "Montage", zeit: 1.0 },
    ],
  },

  komplettlackierung: {
    name: "Komplettlackierung",
    description: "Fahrzeug komplett (15-25 Std)",
    totalTime: 27.0,
    steps: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 4.0 },
      { beschreibung: "Schleifen/Spachteln", zeit: 6.0 },
      { beschreibung: "Grundierung", zeit: 3.0 },
      { beschreibung: "Zwischenschliff", zeit: 2.0 },
      { beschreibung: "Basislack", zeit: 4.0 },
      { beschreibung: "Klarlack", zeit: 3.0 },
      { beschreibung: "Polieren/Finish", zeit: 2.0 },
      { beschreibung: "Montage", zeit: 3.0 },
    ],
  },

  oldtimer: {
    name: "Oldtimer-Restaurierung",
    description: "Restaurierung Klassiker (40+ Std)",
    totalTime: 59.0,
    steps: [
      { beschreibung: "Demontage/Vorbereitung", zeit: 8.0 },
      { beschreibung: "Schleifen/Spachteln", zeit: 15.0 },
      { beschreibung: "Grundierung", zeit: 6.0 },
      { beschreibung: "Zwischenschliff", zeit: 4.0 },
      { beschreibung: "Basislack", zeit: 8.0 },
      { beschreibung: "Klarlack", zeit: 6.0 },
      { beschreibung: "Polieren/Finish", zeit: 4.0 },
      { beschreibung: "Montage", zeit: 8.0 },
    ],
  },
};

/**
 * Verfügbare Templates abrufen
 * @returns {Object} Alle verfügbaren Templates
 */
function getAvailableTemplates() {
  return Object.keys(TIME_TEMPLATES).map((key) => ({
    id: key,
    name: TIME_TEMPLATES[key].name,
    description: TIME_TEMPLATES[key].description,
    totalTime: TIME_TEMPLATES[key].totalTime,
    stepCount: TIME_TEMPLATES[key].steps.length,
  }));
}

/**
 * Spezifisches Template abrufen
 * @param {string} templateId - Template-ID
 * @returns {Object|null} Template-Daten oder null
 */
function getTemplate(templateId) {
  return TIME_TEMPLATES[templateId] || null;
}

/**
 * Template auf Auftrag anwenden (wie VBA SchnellZeitenAuftrag)
 * @param {number} auftragId - Auftrag-ID
 * @param {string} templateId - Template-ID
 * @param {number} stundenpreis - Stundenpreis
 * @returns {Promise<Object>} Ergebnis der Anwendung
 */
async function applyTimeTemplate(auftragId, templateId, stundenpreis = 65.0) {
  try {
    const template = getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        error: `Template '${templateId}' nicht gefunden`,
      };
    }

    // Template auf Arbeitsschritte anwenden
    const result = await arbeitsschritteModel.createFromTemplate(
      auftragId,
      template.steps,
      stundenpreis
    );

    return {
      success: true,
      templateName: template.name,
      stepsUpdated: result.created,
      totalTime: result.totalTime,
      totalCost: result.totalCost,
      message: `${template.name} Template erfolgreich angewendet`,
    };
  } catch (error) {
    console.error("Fehler beim Anwenden des Templates:", error);
    return {
      success: false,
      error: "Fehler beim Anwenden des Templates: " + error.message,
    };
  }
}

/**
 * Template-Zeiten für vorhandene Arbeitsschritte anwenden
 * (Alternative Methode - aktualisiert statt zu ersetzen)
 * @param {number} auftragId - Auftrag-ID
 * @param {string} templateId - Template-ID
 * @param {number} stundenpreis - Stundenpreis
 * @returns {Promise<Object>} Ergebnis der Anwendung
 */
async function applyTemplateToExistingSteps(
  auftragId,
  templateId,
  stundenpreis = 65.0
) {
  try {
    const template = getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        error: `Template '${templateId}' nicht gefunden`,
      };
    }

    // Vorhandene Arbeitsschritte abrufen
    const existingSteps = await arbeitsschritteModel.getByAuftragId(auftragId);

    if (existingSteps.length === 0) {
      // Wenn keine Schritte vorhanden, Template komplett erstellen
      return await applyTimeTemplate(auftragId, templateId, stundenpreis);
    }

    // Updates für vorhandene Schritte erstellen
    const updates = [];

    for (
      let i = 0;
      i < Math.min(existingSteps.length, template.steps.length);
      i++
    ) {
      const existingStep = existingSteps[i];
      const templateStep = template.steps[i];

      updates.push({
        id: existingStep.id,
        zeit: templateStep.zeit,
        stundenpreis: stundenpreis,
      });
    }

    // Updates anwenden
    const result = await arbeitsschritteModel.updateMultiple(updates);

    const totalTime = template.steps
      .slice(0, updates.length)
      .reduce((sum, step) => sum + step.zeit, 0);
    const totalCost = totalTime * stundenpreis;

    return {
      success: true,
      templateName: template.name,
      stepsUpdated: result.updated,
      totalTime: totalTime,
      totalCost: totalCost,
      message: `${template.name} Template auf ${result.updated} Arbeitsschritte angewendet`,
    };
  } catch (error) {
    console.error("Fehler beim Anwenden des Templates:", error);
    return {
      success: false,
      error: "Fehler beim Anwenden des Templates: " + error.message,
    };
  }
}

/**
 * Custom Template erstellen
 * @param {string} name - Template-Name
 * @param {string} description - Beschreibung
 * @param {Array} steps - Arbeitsschritte mit {beschreibung, zeit}
 * @returns {string} Neue Template-ID
 */
function createCustomTemplate(name, description, steps) {
  const templateId = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const totalTime = steps.reduce((sum, step) => sum + (step.zeit || 0), 0);

  TIME_TEMPLATES[templateId] = {
    name: name,
    description: description,
    totalTime: totalTime,
    steps: steps,
    custom: true,
    created: new Date().toISOString(),
  };

  return templateId;
}

/**
 * Template löschen (nur Custom Templates)
 * @param {string} templateId - Template-ID
 * @returns {boolean} Erfolgreich gelöscht
 */
function deleteCustomTemplate(templateId) {
  const template = TIME_TEMPLATES[templateId];
  if (template && template.custom) {
    delete TIME_TEMPLATES[templateId];
    return true;
  }
  return false;
}

/**
 * Template-Statistiken berechnen
 * @param {string} templateId - Template-ID
 * @param {number} stundenpreis - Stundenpreis
 * @returns {Object} Statistiken
 */
function getTemplateStatistics(templateId, stundenpreis = 65.0) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const totalTime = template.totalTime;
  const totalCost = totalTime * stundenpreis;
  const avgTimePerStep = totalTime / template.steps.length;
  const stepsWithTime = template.steps.filter((step) => step.zeit > 0).length;

  return {
    templateId,
    name: template.name,
    description: template.description,
    totalTime,
    totalCost,
    avgTimePerStep,
    stepCount: template.steps.length,
    stepsWithTime,
    stepsWithoutTime: template.steps.length - stepsWithTime,
    costPerHour: stundenpreis,
    estimatedDays: Math.ceil(totalTime / 8), // 8h Arbeitstag
    complexity:
      totalTime < 5
        ? "Einfach"
        : totalTime < 15
          ? "Mittel"
          : totalTime < 30
            ? "Komplex"
            : "Sehr Komplex",
  };
}

/**
 * Template für Export vorbereiten
 * @param {string} templateId - Template-ID
 * @returns {Object} Export-Daten
 */
function exportTemplate(templateId) {
  const template = getTemplate(templateId);
  if (!template) return null;

  return {
    id: templateId,
    name: template.name,
    description: template.description,
    totalTime: template.totalTime,
    steps: template.steps.map((step) => ({
      beschreibung: step.beschreibung,
      zeit: step.zeit,
    })),
    exported: new Date().toISOString(),
    version: "1.0",
  };
}

/**
 * Template aus Export-Daten importieren
 * @param {Object} exportData - Export-Daten
 * @returns {string} Neue Template-ID
 */
function importTemplate(exportData) {
  return createCustomTemplate(
    exportData.name,
    exportData.description,
    exportData.steps
  );
}

/**
 * Template validieren
 * @param {Object} templateData - Template-Daten
 * @returns {Object} Validierungsergebnis
 */
function validateTemplate(templateData) {
  const errors = [];

  if (!templateData.name || templateData.name.trim().length === 0) {
    errors.push("Template-Name ist erforderlich");
  }

  if (!templateData.steps || !Array.isArray(templateData.steps)) {
    errors.push("Arbeitsschritte sind erforderlich");
  } else {
    templateData.steps.forEach((step, index) => {
      if (!step.beschreibung || step.beschreibung.trim().length === 0) {
        errors.push(
          `Arbeitsschritt ${index + 1}: Beschreibung ist erforderlich`
        );
      }

      if (typeof step.zeit !== "number" || step.zeit < 0) {
        errors.push(
          `Arbeitsschritt ${index + 1}: Zeit muss eine positive Zahl sein`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

module.exports = {
  getAvailableTemplates,
  getTemplate,
  applyTimeTemplate,
  applyTemplateToExistingSteps,
  createCustomTemplate,
  deleteCustomTemplate,
  getTemplateStatistics,
  exportTemplate,
  importTemplate,
  validateTemplate,
  TIME_TEMPLATES,
};
