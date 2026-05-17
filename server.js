const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db = null;

// ✅ DEBUG DB
async function startDB() {
  try {
    console.log("🔌 Łączenie z Mongo...");

    if (!process.env.MONGO_URI) {
      console.log("❌ BRAK MONGO_URI");
      return;
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    db = client.db("chatapp");

    console.log("✅ Mongo CONNECTED");

  } catch (err) {
    console.log("❌ Mongo ERROR:", err.message);
  }
}
startDB();

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false, error: "DB OFF" });

  console.log("REGISTER:", req.body);

  await db.collection("users").insertOne(req.body);

  res.json({ ok: true });
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false, error: "DB OFF" });

  console.log("LOGIN:", req.body);

  const user = await db.collection("users").findOne(req.body);

  console.log("FOUND:", user);

  res.json({ ok: !!user });
});

// ✅ SIMPLE UI
app.get("/", (req, res) => {
res.send(`
<html>
<body style="background:#343541;color:white;font-family:Arial;padding:20px">

<h2>Login</h2>

<input id="u"><br><br>
<input id="p"><br><br>

<button onclick="register()">Register</button>
<button onclick="login()">Login</button>

<script>
async function register(){
  await fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      u: u.value,
      p: p.value
    })
  });
  alert("Zarejestrowano");
}

async function login(){
  const res = await fetch("/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      u: u.value,
      p: p.value
    })
  });

  const data = await res.json();

  if(data.ok){
    alert("✅ LOGIN OK");
  } else {
    alert("❌ LOGIN FAIL");
  }
}
</script>

</body>
</html>
`);
});

app.listen(process.env.PORT || 3000);
