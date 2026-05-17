const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

let db = null;

// ✅ ŁĄCZENIE Z RETRY (WAŻNE)
async function connectDB() {
  while (!db) {
    try {
      console.log("🔌 Connecting to Mongo...");
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      db = client.db("chatapp");
      console.log("✅ Mongo CONNECTED");
    } catch (err) {
      console.log("❌ Retry DB in 3s...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}
connectDB();

// ✅ REGISTER
app.post("/register", async (req, res) => {
  const { u, p } = req.body;

  if (!db) return res.json({ ok: false });

  await db.collection("users").insertOne({ u, p });

  res.json({ ok: true });
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  const { u, p } = req.body;

  if (!db) return res.json({ ok: false });

  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

// ✅ CHAT
app.post("/chat", (req, res) => {
  res.json({ reply: "🤖 " + req.body.message });
});

// ✅ FRONT
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#222;color:white;font-family:Arial">

  <h2>Login</h2>
  <input id="u"><br><br>
  <input id="p"><br><br>

  <button onclick="register()">Register</button>
  <button onclick="login()">Login</button>

  <div id="chat" style="display:none">
    <h3>Chat</h3>
    <div id="msgs"></div>
    <input id="msg">
    <button onclick="send()">Send</button>
  </div>

  <script>
  async function register(){
    const res = await fetch("/register", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({u:u.value,p:p.value})
    });
    alert(JSON.stringify(await res.json()));
  }

  async function login(){
    const res = await fetch("/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({u:u.value,p:p.value})
    });
    const d = await res.json();
    alert(JSON.stringify(d));
    if(d.ok){chat.style.display="block";}
  }

  async function send(){
    const res = await fetch("/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message:msg.value})
    });
    const d = await res.json();
    msgs.innerHTML += msg.value + "<br>" + d.reply + "<br>";
  }
  </script>

  </body>
  </html>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 SERVER RUNNING");
});
