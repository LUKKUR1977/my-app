const express = require("express");

const app = express();
app.use(express.json());

/* ==================== FAKE LOGIN DB ==================== */
let users = []; // zapis w pamięci (prosto + za darmo)

/* ==================== AI ==================== */
function smartAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("godzina")) {
    return "🕒 Jest: " + new Date().toLocaleTimeString();
  }

  if (msg.includes("data")) {
    return "📅 Dziś: " + new Date().toLocaleDateString();
  }

  if (msg.includes("kim jesteś")) {
    return "Jestem Twoim AI 🤖";
  }

  if (msg.includes("cześć")) {
    return "Hej 👋";
  }

  return "Rozumiem: " + message;
}

/* ==================== FRONT ==================== */
app.get("/", (req, res) => {
res.send(`
<html>
<head>
<style>
body {
  margin:0;
  display:flex;
  background:#343541;
  color:white;
  font-family:Arial;
}

/* LOGIN */
#login {
  margin:auto;
  display:flex;
  flex-direction:column;
  gap:10px;
}

/* APP */
#app {
  display:none;
  width:100%;
}

#sidebar {
  width:220px;
  background:#202123;
  padding:15px;
}

#chat {
  flex:1;
  display:flex;
  flex-direction:column;
  height:100vh;
}

#messages {
  flex:1;
  overflow:auto;
  padding:20px;
  display:flex;
  flex-direction:column;
}

.msg {
  max-width:70%;
  padding:10px;
  margin-bottom:8px;
  border-radius:8px;
}

.user {
  background:#3b82f6;
  align-self:flex-end;
}

.ai {
  background:#444654;
}

.chat-item {
  background:#2a2b32;
  padding:8px;
  margin-top:5px;
  cursor:pointer;
}

#inputBox {
  display:flex;
  padding:10px;
  background:#40414f;
}
</style>
</head>

<body>

<div id="login">
  <h2>🔐 Login</h2>
  <input id="user" placeholder="Login"/>
  <input id="pass" placeholder="Hasło" />
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

/* ===== LOGIN ===== */
async function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  const res = await fetch("/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u,p})
  });

  const data = await res.json();

  if(data.ok){
    user = u;
    startApp();
  } else alert("błąd");
}

async function register(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  await fetch("/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({u,p})
  });

  alert("zarejestrowano");
}

/* ===== APP ===== */

function startApp(){
  document.getElementById("login").style.display="none";
  document.getElementById("app").style.display="flex";

  chats = JSON.parse(localStorage.getItem(user)) || [];
  if(chats.length===0) newChat();

  renderChats();
  render();
}

function save(){
  localStorage.setItem(user, JSON.stringify(chats));
}

function renderChats(){
  const list = document.getElementById("chatList");
  list.innerHTML="";

  chats.forEach((c,i)=>{
    const el=document.createElement("div");
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
  current=chats.length-1;
  save();
  renderChats();
  render();
}

/* ===== CHAT ===== */

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

/* ==================== BACKEND ==================== */

app.post("/register",(req,res)=>{
  users.push(req.body);
  res.json({ok:true});
});

app.post("/login",(req,res)=>{
  const found = users.find(x=>x.u===req.body.u && x.p===req.body.p);
  res.json({ok:!!found});
});

app.post("/chat",(req,res)=>{
  const reply = smartAI(req.body.message);
  res.json({reply});
});

app.listen(process.env.PORT || 3000);
