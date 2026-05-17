const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// 🔥 PROSTE „AI” (bardziej inteligentne)
function generateReply(text){
  const t = text.toLowerCase();

  if(t.includes("godzina")){
    const now = new Date();
    return "🕒 Jest godzina: " + now.toLocaleTimeString();
  }

  if(t.includes("data")){
    return "📅 Dzisiaj jest: " + new Date().toLocaleDateString();
  }

  if(t.includes("hej") || t.includes("cześć") || t.includes("czesc") || t.includes("hello")){
    return "👋 Hej! Jak mogę pomóc?";
  }

  if(t.includes("co robisz")){
    return "💻 Rozmawiam z tobą 😄";
  }

  if(t.includes("kim jestes")){
    return "🤖 Jestem twoim botem na Railway 🚀";
  }

  if(t.includes("haha")){
    return "😂 dobre 😄";
  }

  // fallback (najważniejsze – już NIE powtarza)
  return "🤖 Nie rozumiem, spróbuj inaczej 😄";
}

// ✅ FRONT
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:white;font-family:sans-serif;padding:20px">

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
    const r = await fetch("/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});
    alert(JSON.stringify(await r.json()));
  }

  async function login(){
    const r = await fetch("/login",{method:"POST"});
    const d = await r.json();
    if(d.ok){chat.style.display="block";}
  }

  async function send(){
    const r = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:msg.value})
    });
    const d = await r.json();
    msgs.innerHTML += "<p>"+msg.value+"</p><p>"+d.reply+"</p>";
  }
  </script>

  </body>
  </html>
  `);
});

// ✅ API
app.post("/register",(req,res)=>res.json({ok:true}));
app.post("/login",(req,res)=>res.json({ok:true}));

// 🔥 NOWY CHAT
app.post("/chat",(req,res)=>{
  const reply = generateReply(req.body.text);
  res.json({reply});
});

// ✅ START
app.listen(PORT, "0.0.0.0", ()=>{
  console.log("🚀 SERVER RUNNING", PORT);
});

