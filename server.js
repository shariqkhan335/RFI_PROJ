const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// API: return assessments JSON
app.get("/api/assessments", (req, res) => {
  const filePath = path.join(__dirname, "public", "data", "assessments.json");
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "assessments.json not found" });
  res.sendFile(filePath);
});

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
