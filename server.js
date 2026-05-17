const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db = null;

// ===== DB =====
async function startDB() {
  try {
    console.log("🔌 Mongo connect...");

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    db = client.db("chatapp");

    console.log("✅ Mongo działa");
  } catch (err) {
    console.log("❌ Mongo error:", err.message);
  }
}
startDB();

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;

  await db.collection("users").insertOne({
    u: u,
    p: p
  });

  res.json({ ok: true });
});

// ===== LOGIN (NAPRAWIONY) =====
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;

  const user = await db.collection("users").findOne({
    u: u,
    p: p
  });

  res.json({ ok: !!user });
});

// ===== CHAT =====
app.post("/chat", (req, res) => {
  const msg = req.body.message;

  if (msg.includes("godzina")) {
    return res.json({
      reply: "🕒 " + new Date().toLocaleTimeString()
    });
  }

  res.json({
    reply: "🤖 " + msg
  });
});

// ===== FRONT =====
app.get("/", (req, res) => {
res.send(`
<html>
<body style="background:#343541;color:white;font-family:Arial;padding:20px">

<div id="loginBox">
  <h2>🔐 Login</h2>

  <input id="u" placeholder="login"><br><br>
  <input id="p" placeholder="hasło"><br><br>

  <button onclick="register()">Register</button>
  <button onclick="login()">Login</button>
</div>

<div id="chatBox" style="display:none">
  <h2>💬 Chat</h2>

  <div id="messages"></div>

  <br>
  <input id="msg">
  <button onclick="send()">Wyślij</button>
</div>

<script>

// ===== REGISTER
async function register(){
  await fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      u: document.getElementById("u").value,
      p: document.getElementById("p").value
    })
  });

  alert("✅ Zarejestrowano");
}

// ===== LOGIN
async function login(){
  const res = await fetch("/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      u: document.getElementById("u").value,
      p: document.getElementById("p").value
    })
  });

  const data = await res.json();

  if(data.ok){
    document.getElementById("loginBox").style.display="none";
    document.getElementById("chatBox").style.display="block";
  } else {
    alert("❌ Błędny login");
  }
}

// ===== CHAT
async function send(){
  const text = document.getElementById("msg").value;

  const res = await fetch("/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({message:text})
  });

  const data = await res.json();

  document.getElementById("messages").innerHTML += "<p>"+text+"</p>";
  document.getElementById("messages").innerHTML += "<p>"+data.reply+"</p>";
}

</script>

</body>
</html>
`);
});

app.listen(process.env.PORT || 3000);
``
