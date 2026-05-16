const express = require("express");

const app = express();
app.use(express.json());

let history = [];

function smartAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("kim jesteś")) return "Jestem Twoim AI 🤖";
  if (msg.includes("cześć")) return "Hej 👋";
  if (msg.includes("jak się masz")) return "Dobrze 😎";

  if (history.length > 3) {
    return "Pamiętam rozmowę 👀: " + message;
  }

  return "Rozumiem: " + message;
}

app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#343541;color:white;font-family:Arial;margin:0;">

    <div id="messages" style="height:90vh;overflow:auto;padding:20px;"></div>

    <div style="display:flex;padding:10px;background:#40414f;">
      <input id="msg" style="flex:1;padding:10px;" />
      <button onclick="send()">Wyślij</button>
    </div>

    <script>
      async function send() {
        const input = document.getElementById("msg");
        const messages = document.getElementById("messages");

        const text = input.value;

        messages.innerHTML += "<p><b>Ty:</b> " + text + "</p>";

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message:text})
        });

        const data = await res.json();

        messages.innerHTML += "<p><b>AI:</b> " + data.reply + "</p>";

        input.value = "";
        messages.scrollTop = messages.scrollHeight;
      }

      document.addEventListener("keydown", e => {
        if (e.key === "Enter") send();
      });
    </script>

  </body>
  </html>
  `);
});

app.post("/chat", (req, res) => {
  const { message } = req.body;

  history.push(message);

  const reply = smartAI(message);

  res.json({ reply });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
