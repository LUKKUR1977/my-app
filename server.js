import express from "express";

const app = express();
app.use(express.json());

function fakeAI(message) {
  message = message.toLowerCase();

  if (message.includes("kim jesteś")) return "Jestem darmowym AI 🤖";
  if (message.includes("cześć")) return "Siema 👋";
  if (message.includes("jak się masz")) return "Dobrze 😎";

  return "Zrozumiałem: " + message;
}

app.get("/", (req, res) => {
  res.send(\`
  <html>
  <body style="background:#343541;color:white;font-family:Arial;">
    <h2>🤖 Chat</h2>

    <div id="messages"></div>

    <input id="msg" style="width:80%" />
    <button onclick="send()">Wyślij</button>

    <script>
      async function send() {
        const input = document.getElementById("msg");
        const msg = input.value;

        document.getElementById("messages").innerHTML += "<p>Ty: " + msg + "</p>";

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message: msg})
        });

        const data = await res.json();

        document.getElementById("messages").innerHTML += "<p>AI: " + data.reply + "</p>";

        input.value = "";
      }
    </script>

  </body>
  </html>
  \`);
});

app.post("/chat", (req, res) => {
  const reply = fakeAI(req.body.message);
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
