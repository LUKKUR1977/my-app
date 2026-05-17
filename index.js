const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ✅ CZAS
function getTime(){
  return new Date().toLocaleTimeString("pl-PL", {
    timeZone: "Europe/Warsaw"
  });
}

// ✅ BOT
function generateReply(text){
  const t = text.toLowerCase();

  if(t.includes("godzina")){
    return "🕒 Jest godzina: " + getTime();
  }

  if(t.includes("hej")){
    return "👋 Hej!";
  }

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

  const input = document.getElementById("msg");

  async function send(){
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

  // ✅ ✅ ✅ ENTER FIX (NA 100%)
  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      e.preventDefault();
      send();
    }
  });

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
