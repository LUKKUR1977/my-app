const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let db = null;

// 🔥 BEZ await — NIE blokujemy startu
const client = new MongoClient(process.env.MONGO_URI);

client.connect()
  .then(() => {
    db = client.db("chatapp");
    console.log("✅ Mongo CONNECTED");
  })
  .catch(err => {
    console.log("❌ Mongo ERROR:");
    console.log(err);
  });

// ✅ prosta odpowiedź żeby NIE było 502
app.get("/", (req, res) => {
  res.send("✅ DZIAŁA");
});

// ✅ TEST REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok:false });

  const { u, p } = req.body;

  await db.collection("users").insertOne({ u, p });

  res.json({ ok:true });
});

// ✅ SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
``
