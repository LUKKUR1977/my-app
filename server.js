const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

async function start() {
  try {
    console.log("🔌 connecting to Mongo...");

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("chatapp");

    console.log("✅ Mongo connected");

    // ✅ REGISTER
    app.post("/register", async (req, res) => {
      const { u, p } = req.body;

      const exists = await db.collection("users").findOne({ u });

      if (exists) {
        return res.json({ ok: false, msg: "user exists" });
      }

      await db.collection("users").insertOne({ u, p });

      res.json({ ok: true });
    });

    // ✅ LOGIN
    app.post("/login", async (req, res) => {
      const { u, p } = req.body;

      const user = await db.collection("users").findOne({ u });

      if (!user) return res.json({ ok: false });

      if (user.p !== p) return res.json({ ok: false });

      res.json({ ok: true });
    });

    // ✅ CHAT
    app.post("/chat", (req, res) => {
      res.json({ reply: "🤖 " + req.body.message });
    });

    // ✅ FRONT
    app.get("/", (req, res) => {
      res.send(`
      <html>
      <body style="background:#222;color:white;font-family:Arial;padding:20px">

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
        const res = await fetch("/register",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({u:u.value,p:p.value})
        });

        const data = await res.json();
        alert("REGISTER: " + JSON.stringify(data));
      }

      async function login(){
        const res = await fetch("/login",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({u:u.value,p:p.value})
        });

        const data = await res.json();
        alert("LOGIN: " + JSON.stringify(data));

        if(data.ok){
          chat.style.display="block";
        }
      }

      async function send(){
        const res = await fetch("/chat",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({message:msg.value})
        });

        const data = await res.json();

        msgs.innerHTML += "<p>"+msg.value+"</p>";
        msgs.innerHTML += "<p>"+data.reply+"</p>";
      }
      </script>

      </body>
      </html>
      `);
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("🚀 SERVER READY");
    });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
}

start();
``
