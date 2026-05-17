const express = require("express");

const app = express();

// ✅ KLUCZOWE
const PORT = process.env.PORT;

// ✅ root — MUSI odpowiadać
app.get("/", (req, res) => {
  res.send("✅ DZIAŁA 100%");
});

// ✅ start
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
