const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let db = null;

const client = new MongoClient(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 3000
});

// 🔥 NIE BLOKUJE STARTU → NIE MA 502
client.connect()
  .then(() => {
    console.log("✅ Mongo CONNECTED");
    db = client.db("chatapp");
  })
  .catch(err => {
    console.log("❌ Mongo ERROR:");
    console.log(err.message);
  });

// ✅ ZAWSZE ODPOWIADA → Railway nie ubija appki
app.get("/", (req, res) => {
  res.send("✅ DZIAŁA BACKEND");
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok:false });

  const { u, p } = req.body;

  await db.collection("users").insertOne({ u, p });

  res.json({ ok:true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
