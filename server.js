const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let db = null;

// 🔥 KLUCZ — FIX SSL
const client = new MongoClient(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

client.connect()
  .then(() => {
    db = client.db("chatapp");
    console.log("✅ Mongo CONNECTED");
  })
  .catch(err => {
    console.log("❌ Mongo error:", err.message);
  });

// ✅ żeby NIE było 502
app.get("/", (req, res) => {
  res.send("✅ API działa");
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false, error: "no db yet" });

  const { u, p } = req.body;
  await db.collection("users").insertOne({ u, p });

  res.json({ ok: true });
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;

  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

// ✅ CHAT
app.post("/chat", (req, res) => {
  res.json({ reply: "🤖 " + req.body.message });
});

// ✅ SERVER MUSI DZIAŁAĆ NON-STOP
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
