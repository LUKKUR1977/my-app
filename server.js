const express = require("express");

const app = express();
app.use(express.json());

let history = [];

// ✅ LEPSZE AI
function smartAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("kim jesteś")) return "Jestem Twoim AI 🤖";
  if (msg.includes("cześć")) return "Hej 👋";
  if (msg.includes("jak się masz")) return "Dobrze 😎";

  if (history.length > 5) {
    return "Pamiętam rozmowę 👀: " + message;
  }

  return "Myślę nad: " + message;
}

// ✅ UI
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <style>
      body {
        margin:0;
        font-family:Arial;
        background:#343541;
        color:white;
        display:flex;
      }

      #sidebar {
        width:200px;
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
        overflow-y:auto;
        padding:20px;
        display:flex;
        flex-direction:column;
      }

      .msg {
        margin-bottom:10px;
        padding:10px;
        border-radius:8px;
        max-width:70%;
      }

      .user {
        background:#3b82f6;
        align-self:flex-end;
      }

      .ai {
        background:#444654;
        align-self:flex-start;
      }

      #inputBox {
        display:flex;
        padding:10px;
        background:#40414f;
      }

      input {
        flex:1;
        padding:10px;
        border:none;
        border-radius:5px;
      }

      button {
        margin-left:10px;
        padding:10px;
        background:#19c37d;
        border:none;
        color:white;
        border-radius:5px;
        cursor:pointer;
      }
    </style>
  </head>

  <body>

    <div id="sidebar">
      <h3>💬 Chat</h3>
      <p>Nowa rozmowa</p>
    </div>

    <div id="chat">

      <div id="messages"></div>

      <div id="inputBox">
        <input id="msg" placeholder="Napisz wiadomość..." />
        <button onclick="send()">Wyślij</button>
      </div>

    </div>

    <script>
      async function send() {
        const input = document.getElementById("msg");
        const box = document.getElementById("messages");

        const text = input.value;

        if (!text) return;

        box.innerHTML += '<div class="msg user">' + text + '</div>';

        const loading = document.createElement("div");
        loading.className = "msg ai";
        loading.innerText = "🤖 pisze...";
        box.appendChild(loading);

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message:text})
        });

        const data = await res.json();

        loading.remove();

        box.innerHTML += '<div class="msg ai">' + data.reply + '</div>';

        input.value = "";
        box.scrollTop = box.scrollHeight;
      }

      // ✅ ENTER DZIAŁA POPRAWNIE
      document.getElementById("msg").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          send();
        }
      });

    </script>

  </body>
  </html>
  `);
});

// ✅ backend
app.post("/chat", (req, res) => {
  const { message } = req.body;

  history.push(message);

  const reply = smartAI(message);

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
