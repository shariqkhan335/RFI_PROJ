const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Serve static site
app.use(express.static(path.join(__dirname, "public")));

// Simple API endpoints (later you can replace with DB)
app.get("/api/rfis", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "data", "rfis.json"));
});

app.get("/api/assessments", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "data", "assessments.json"));
});

app.get("/health", (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
