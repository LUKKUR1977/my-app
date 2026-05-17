const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ===== DATABASE =====
let db;

async function startDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("chatapp");
  console.log("✅ MongoDB connected");
}
startDB();

// ===== SMART AI (fallback) =====
function smartAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("godzina")) {
    return "🕒 Jest: " + new Date().toLocaleTimeString();
  }
  if (msg.includes("data")) {
    return "📅 Dziś: " + new Date().toLocaleDateString();
  }
  if (msg.includes("cześć") || msg.includes("hej")) {
    return "Hej 👋 jak mogę pomóc?";
  }
  if (msg.includes("kim jesteś")) {
    return "Jestem Twoim AI 🤖";
  }

  return "🤖 Rozumiem: " + message;
}

// ===== AUTH =====
app.post("/register", async (req, res) => {
  const { u, p } = req.body;

  await db.collection("users").insertOne({ u, p });

  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  const { u, p } = req.body;

  const user = await db.collection("users").findOne({ u, p });

  res.json({ ok: !!user });
});

// ===== LOAD CHATS =====
app.post("/loadChats", async (req, res) => {
  const { u } = req.body;

  const data = await db.collection("chats").findOne({ u });

  res.json({ chats: data?.chats || [] });
});

// ===== SAVE CHATS =====
app.post("/saveChats", async (req, res) => {
  const { u, chats } = req.body;

  await db.collection("chats").updateOne(
    { u },
    { $set: { chats } },
    { upsert: true }
  );

  res.json({ ok: true });
});

// ===== CHAT WITH AI =====
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [{ role: "user", content: message }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.json({ reply: smartAI(message) });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || smartAI(message)
    });

  } catch {
    res.json({ reply: smartAI(message) });
  }
});

// ===== FRONTEND (FULL APP) =====
app.get("/", (req, res) => {
res.send(`

<html>
<head>
<style>
body { margin:0; display:flex; background:#343541; color:white; font-family:Arial;}
#login { margin:auto; display:flex; flex-direction:column; gap:10px;}
#app { display:none; width:100%; }
#sidebar { width:220px; background:#202123; padding:15px;}
#chat { flex:1; display:flex; flex-direction:column; height:100vh;}
#messages { flex:1; overflow:auto; padding:20px; display:flex; flex-direction:column;}
.msg { max-width:70%; padding:10px; margin-bottom:8px; border-radius:8px;}
.user { background:#3b82f6; align-self:flex-end;}
.ai { background:#444654;}
.chat-item { background:#2a2b32; padding:8px; margin-top:5px; cursor:pointer;}
#inputBox { display:flex; padding:10px; background:#40414f;}
</style>
</head>

<body>

<div id="login">
  <h2>🔐 Login</h2>
  <input id="user" placeholder="Login"/>
  <input id="pass" placeholder="Hasło"/>
  <button onclick="login()">Zaloguj</button>
  <button onclick="register()">Rejestruj</button>
</div>

<div id="app">

  <div id="sidebar">
    <button onclick="newChat()">+ Nowy czat</button>
    <div id="chatList"></div>
  </div>

  <div id="chat">
    <div id="messages"></div>

    <div id="inputBox">
      <input id="msg"/>
      <button onclick="send()">Wyślij</button>
    </div>
  </div>

</div>

<script>
let user = null;
let chats = [];
let current = 0;

const box = document.getElementById("messages");

// LOGIN
async function login(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const res = await fetch("/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u,p})
  });

  const data = await res.json();

  if(data.ok){
    user = u;
    startApp();
  } else alert("błąd loginu");
}

async function register(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  await fetch("/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u,p})
  });

  alert("konto utworzone");
}

// APP
async function startApp(){
  document.getElementById("login").style.display="none";
  document.getElementById("app").style.display="flex";

  const res = await fetch("/loadChats",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u:user})
  });

  const data = await res.json();
  chats = data.chats || [];

  if(chats.length === 0) newChat();

  renderChats();
  render();
}

function renderChats(){
  const list = document.getElementById("chatList");
  list.innerHTML = "";

  chats.forEach((c,i)=>{
    const el = document.createElement("div");
    el.className="chat-item";
    el.innerText="Czat "+(i+1);
    el.onclick=()=>{
      current=i;
      render();
    };
    list.appendChild(el);
  });
}

function render(){
  box.innerHTML="";
  chats[current].forEach(m=>{
    box.innerHTML+=\`<div class="msg \${m.t}">\${m.v}</div>\`;
  });
}

function newChat(){
  chats.push([]);
  current = chats.length-1;
  save();
  renderChats();
  render();
}

// SAVE TO DB
async function save(){
  await fetch("/saveChats",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u:user, chats})
  });
}

// CHAT
async function send(){
  const input=document.getElementById("msg");
  const text=input.value;

  if(!text) return;

  chats[current].push({t:"user", v:text});
  render();

  const res = await fetch("/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({message:text})
  });

  const data = await res.json();

  chats[current].push({t:"ai", v:data.reply});
  render();

  input.value="";
  save();
}

document.addEventListener("keydown",e=>{
  if(e.key==="Enter") send();
});
</script>

</body>
</html>

`);
});

app.listen(process.env.PORT || 3000);

