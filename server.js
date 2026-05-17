const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let db;

// ✅ NOWY FIX — FULL TLS FIX
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true
});

// 🔌 łączymy bez blokowania aplikacji
client.connect()
  .then(() => {
    db = client.db("chatapp");
    console.log("✅ Mongo CONNECTED");
  })
  .catch(err => {
    console.log("❌ Mongo ERROR:", err.message);
  });

// ✅ TEST endpoint
app.get("/", (req, res) => {
  res.send("✅ API działa");
});

app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;

  await db.collection("users").insertOne({ u, p });
  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;

  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

app.post("/chat", (req, res) => {
  res.json({ reply: "🤖 " + req.body.message });
});

// 🚀 MUSI DZIAŁAĆ NON STOP
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT", PORT);
});
``
