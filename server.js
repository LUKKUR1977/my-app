const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db = null;

// ✅ SAFE DB CONNECT
async function startDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db("chatapp");
    console.log("✅ Mongo OK");
  } catch (err) {
    console.log("❌ Mongo ERROR:", err.message);
  }
}
startDB();

// ✅ AI
function smartAI(msg) {
  if (msg.includes("godzina")) return new Date().toLocaleTimeString();
  return "🤖 " + msg;
}

// ✅ LOGIN
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;
  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok: false });

  const { u, p } = req.body;
  await db.collection("users").insertOne({ u, p });

  res.json({ ok: true });
});

// ✅ CHAT
app.post("/chat", (req, res) => {
  res.json({ reply: smartAI(req.body.message) });
});

// ✅ PRO UI
app.get("/", (req, res) => {
res.send(`
<html>
<body style="background:#343541;color:white;font-family:Arial">

<h2>🔐 Login</h2>
<input id="u"><br>
<input id="p"><br>

<button onclick="login()">Login</button>
<button onclick="register()">Register</button>

<div id="chat" style="display:none">
  <h3>Chat</h3>
  <div id="messages"></div>
  <input id="msg">
  <button onclick="send()">Send</button>
</div>

<script>
let user = "";

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
    user = u.value;
    chat.style.display="block";
  }
}

async function register(){
  await fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      u: u.value,
      p: p.value
    })
  });
}

async function send(){
  const res = await fetch("/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({message:msg.value})
  });

  const data = await res.json();

  messages.innerHTML += "<p>"+msg.value+"</p>";
  messages.innerHTML += "<p>"+data.reply+"</p>";
}
</script>

</body>
</html>
`);
});

app.listen(process.env.PORT || 3000);

