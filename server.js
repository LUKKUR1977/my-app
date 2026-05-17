const express = require("express");

const app = express();
app.use(express.json());

let history = [];

// ✅ fallback AI (zawsze działa)
function smartAI(message) {
  const msg = message.toLowerCase();

  if (msg.includes("kim jesteś")) return "Jestem Twoim AI 🤖";
  if (msg.includes("cześć")) return "Hej 👋";
  if (msg.includes("jak się masz")) return "Dobrze 😎";

  return "Rozumiem: " + message;
}

// ✅ UI
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#343541;color:white;font-family:Arial;">

    <div id="messages" style="height:90vh;overflow:auto;"></div>

    <input id="msg" style="width:80%" />
    <button onclick="send()">Wyślij</button>

    <script>
      const box = document.getElementById("messages");

      async function send() {
        const input = document.getElementById("msg");
        const text = input.value;

        if (!text) return;

        box.innerHTML += "<p>Ty: " + text + "</p>";

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message:text})
        });

        const data = await res.json();

        box.innerHTML += "<p>AI: " + data.reply + "</p>";
        box.scrollTop = box.scrollHeight;

        input.value = "";
      }

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

// ✅ HYBRYDA AI (OpenRouter + fallback)
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  history.push(message);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    // ✅ jeśli działa — użyj AI
    if (data.choices && data.choices[0]) {
      return res.json({
        reply: data.choices[0].message.content
      });
    }

    // ❌ jeśli NIE działa → fallback
    const reply = smartAI(message);
    res.json({ reply });

  } catch (err) {
    console.log(err);

    // ✅ fallback zawsze działa
    const reply = smartAI(message);
    res.json({ reply });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
