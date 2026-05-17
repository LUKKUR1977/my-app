const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let db = null;

// 🔌 Połączenie z Mongo (bez crasha)
async function connectDB() {
  try {
    console.log("🔌 Łączenie z Mongo...");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("chatapp");
    console.log("✅ Mongo CONNECTED");
  } catch (e) {
    console.log("❌ Mongo ERROR:", e.message);
  }
}

connectDB();

// ✅ TEST endpoint (żeby Railway nie wywalał 502)
app.get("/", (req, res) => {
  res.send("✅ API działa");
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false, error: "no db" });

  const { u, p } = req.body;

  await db.collection("users").insertOne({ u, p });

  res.json({ ok: true });
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false, error: "no db" });

  const { u, p } = req.body;

  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

// ✅ CHAT
app.post("/chat", (req, res) => {
  res.json({ reply: "🤖 " + req.body.message });
});

// 🚀 KLUCZOWE — server NIE może się zamknąć
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON PORT", PORT);
});

