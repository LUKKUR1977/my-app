const express = require("express");

const app = express();

// ✅ Railway port (MUSI być bez fallback)
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  console.log("👉 request /");
  res.send("✅ DZIAŁA FINAL 🔥");
});

// ✅ bardzo ważne — default handler
app.all("*", (req, res) => {
  res.send("✅ DZIAŁA FINAL 🔥");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT", PORT);
});
