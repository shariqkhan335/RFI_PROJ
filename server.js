const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("RFI_PROJ running ✅"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
