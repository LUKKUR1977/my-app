const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ✅ BOT (działający)
function reply(text){
  const t = text.toLowerCase();

  if(t.includes("godzina")){
    return "🕒 " + new Date().toLocaleTimeString("pl-PL", {
      timeZone: "Europe/Warsaw"
    });
  }

  if(t.includes("hej")){
    return "👋 Hej!";
  }

  return "🤖 Nie rozumiem 😄";
}

// ✅ FRONT (NAPRAWIONY)
app.get("/", (req,res)=>{
  res.send(`
  <html>
  <body style="background:black;color:white;font-family:sans-serif;padding:20px">

  <h2>Chat</h2>

  <input id="msg" style="padding:10px">
  <button id="btn">Send</button>

  <div id="chat"></div>

  <script>

  const input = document.getElementById("msg");
  const btn = document.getElementById("btn");
  const chat = document.getElementById("chat");

  async function sendMessage(){
    const text = input.value.trim();
    if(!text) return;

    const res = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });

    const data = await res.json();

    chat.innerHTML += "<p>"+text+"</p>";
    chat.innerHTML += "<p>"+data.reply+"</p>";

    input.value="";
  }

  // ✅ CLICK
  btn.onclick = sendMessage;

  // ✅ ENTER
  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      sendMessage();
    }
  });

  </script>

  </body>
  </html>
  `);
});

// ✅ API
app.post("/chat",(req,res)=>{
  res.json({reply: reply(req.body.text)});
});

// ✅ START
app.listen(PORT,"0.0.0.0",()=>{
  console.log("🚀 RUNNING", PORT);
});
``
