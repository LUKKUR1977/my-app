const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ✅ CZAS
function getTime(){
  return new Date().toLocaleTimeString("pl-PL", {
    timeZone: "Europe/Warszawa" // poprawione
  });
}

// ✅ BOT SMART
function generateReply(text){
  const t = text.toLowerCase();

  // ✅ godzina
  if(t.includes("godzina")){
    return "🕒 Jest godzina: " + getTime();
  }

  // ✅ przywitanie
  if(t.includes("hej") || t.includes("cześć") || t.includes("czesc")){
    return "👋 Hej!";
  }

  // ✅ stolica paryża
  if(t.includes("stolica") && t.includes("paryz")){
    return "🇫🇷 Stolica Francji to Paryż 😉";
  }

  // ✅ wiek
  if(t.includes("ile masz lat")){
    return "🤖 Nie mam lat 😄 jestem programem!";
  }

  // ✅ fallback
  return "🤖 Nie rozumiem 😄";
}

// ✅ FRONT
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:white;font-family:sans-serif;padding:20px">

  <h2>Chat</h2>

  <input id="msg" placeholder="message">
  <button onclick="send()">Send</button>

  <div id="msgs"></div>

  <script>

  function setup(){
    const input = document.getElementById("msg");

    input.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        e.preventDefault();
        send();
      }
    });
  }

  async function send(){
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if(!text) return;

    const r = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text})
    });

    const d = await r.json();

    msgs.innerHTML += "<p>"+text+"</p>";
    msgs.innerHTML += "<p>"+d.reply+"</p>";

    input.value="";
  }

  window.onload = setup;

  </script>

  </body>
  </html>
  `);
});

// ✅ API
app.post("/chat",(req,res)=>{
  res.json({reply: generateReply(req.body.text)});
});

// ✅ START
app.listen(PORT, "0.0.0.0", ()=>{
  console.log("🚀 RUNNING", PORT);
});
