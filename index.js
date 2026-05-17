const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// 🔥 POPRAWNA GODZINA (Warszawa)
function getPolishTime(){
  return new Date().toLocaleTimeString("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// 🔥 BOT
function generateReply(text){
  const t = text.toLowerCase();

  if(t.includes("godzina")){
    return "🕒 Jest godzina: " + getPolishTime();
  }

  if(t.includes("data")){
    return "📅 Dziś: " + new Date().toLocaleDateString("pl-PL", {
      timeZone: "Europe/Warsaw"
    });
  }

  if(t.includes("hej") || t.includes("czesc") || t.includes("cześć")){
    return "👋 Hej! Co u Ciebie?";
  }

  if(t.includes("co robisz")){
    return "💻 Działam na Twoim serwerze 😎";
  }

  return "🤖 Spróbuj zapytać inaczej 😄";
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
    await fetch("/register",{method:"POST"});
    alert("✅ konto utworzone");
  }

  async function login(){
    const r = await fetch("/login",{method:"POST"});
    const d = await r.json();
    if(d.ok){chat.style.display="block";}
  }

  async function send(){
    const text = msg.value;

    const r = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text})
    });

    const d = await r.json();

    msgs.innerHTML += "<p>"+text+"</p>";
    msgs.innerHTML += "<p>"+d.reply+"</p>";

    msg.value="";
  }
  </script>

  </body>
  </html>
  `);
});

// ✅ API
app.post("/register",(req,res)=>res.json({ok:true}));
app.post("/login",(req,res)=>res.json({ok:true}));

app.post("/chat",(req,res)=>{
  const reply = generateReply(req.body.text);
  res.json({reply});
});

// ✅ START
app.listen(PORT, "0.0.0.0", ()=>{
  console.log("🚀 SERVER RUNNING", PORT);
});

