const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("✅ SERVER DZIAŁA FINAL 🔥");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

setInterval(() => {
  console.log("⏱ keep alive");
}, 5000);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT", PORT);
});
