const express = require("express");

const app = express();

// ⚠️ NAJWAŻNIEJSZE
const PORT = process.env.PORT || 3000;

// ✅ ROOT
app.get("/", (req, res) => {
  res.status(200).send("✅ SERVER DZIAŁA FINAL");
});

// ✅ HEALTH (Railway tego używa często)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ KEEP ALIVE (kluczowy fix)
setInterval(() => {
  console.log("⏱ keep alive");
}, 10000);

// ✅ START — MUSI BYĆ TAK
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT", PORT);
});
