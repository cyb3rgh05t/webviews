const express = require("express");
const path = require("path");
const cors = require("cors");

// Import routes
const kundenRoutes = require("./routes/kunden");
const auftraegeRoutes = require("./routes/auftraege");
const rechnungenRoutes = require("./routes/rechnungen");
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");

// Import database initialization
const { initializeDatabase } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize database
initializeDatabase();

// Routes
app.use("/api/kunden", kundenRoutes);
app.use("/api/auftraege", auftraegeRoutes);
app.use("/api/rechnungen", rechnungenRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🎨 Lackiererei Management System läuft auf http://localhost:${PORT}`
  );
  console.log("📁 Projektstruktur:");
  console.log("   ├── config/     - Konfigurationsdateien");
  console.log("   ├── routes/     - API-Routen");
  console.log("   ├── models/     - Datenbankmodelle");
  console.log("   ├── utils/      - Hilfsfunktionen");
  console.log("   └── public/     - Frontend-Dateien");
  console.log("");
  console.log("🚀 Bereit für Entwicklung!");
  console.log("🔧 Drücken Sie Ctrl+C zum Beenden");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Server wird beendet...");
  process.exit(0);
});

module.exports = app;
