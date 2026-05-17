const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Mongo bez blokowania
let db = null;
const client = new MongoClient(process.env.MONGO_URI);

client.connect()
  .then(() => {
    db = client.db("chatapp");
    console.log("✅ Mongo CONNECTED");
  })
  .catch(err => {
    console.log("❌ Mongo error:", err.message);
  });

// ✅ FRONT (LOGIN + CHAT)
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:white;font-family:Arial;padding:20px">

  <h2>Login</h2>

  <input id="u" placeholder="user"><br><br>
  <input id="p" placeholder="pass"><br><br>

  <button onclick="register()">Register</button>
  <button onclick="login()">Login</button>

  <div id="chat" style="display:none;margin-top:20px">
    <h3>Chat</h3>
    <div id="msgs"></div>
    <input id="msg" placeholder="message">
    <button onclick="send()">Send</button>
  </div>

  <script>
  async function register(){
    const r = await fetch("/register", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({u:u.value,p:p.value})
    });
    alert(JSON.stringify(await r.json()));
  }

  async function login(){
    const r = await fetch("/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({u:u.value,p:p.value})
    });
    const d = await r.json();
    alert(JSON.stringify(d));
    if(d.ok){
      chat.style.display="block";
    }
  }

  async function send(){
    const r = await fetch("/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message:msg.value})
    });
    const d = await r.json();
    msgs.innerHTML += "<p>"+msg.value+"</p><p>"+d.reply+"</p>";
  }
  </script>

  </body>
  </html>
  `);
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  if (!db) return res.json({ ok:false });

  const { u, p } = req.body;
  await db.collection("users").insertOne({ u, p });

  res.json({ ok:true });
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  if (!db) return res.json({ ok:false });

  const { u, p } = req.body;
  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

// ✅ CHAT
app.post("/chat", (req, res) => {
  res.json({ reply:"🤖 " + req.body.message });
});

// ✅ SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER RUNNING ON", PORT);
});
