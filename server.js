const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db = null;

// ✅ BEZPIECZNE POŁĄCZENIE
async function startDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.log("❌ BRAK MONGO_URI");
      return;
    }

    const client = new MongoClient(uri);
    await client.connect();

    db = client.db("chatapp");

    console.log("✅ Mongo działa");

  } catch (err) {
    console.log("❌ BŁĄD MONGO:", err.message);
  }
}

startDB();

// ✅ AI fallback
function smartAI(message) {
  return "🤖 " + message;
}

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false });

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
  res.json({ reply: smartAI(req.body.message) });
});

// ✅ UI
app.get("/", (req, res) => {
  res.send("APP DZIAŁA ✅ (naprawiamy DB)");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server działa");
});
``
