const express = require("express");

const app = express();
app.use(express.json());

// ✅ fallback zawsze działa
function fallback(message) {
  return "AI (offline): " + message;
}

// UI
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#222;color:white;font-family:Arial;">
    <div id="messages" style="height:90vh;overflow:auto;"></div>
    <input id="msg" style="width:80%" />
    <button onclick="send()">Wyślij</button>

    <script>
      const box = document.getElementById("messages");

      async function send() {
        const input = document.getElementById("msg");
        const msg = input.value;

        box.innerHTML += "<p>Ty: " + msg + "</p>";

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message: msg})
        });

        const data = await res.json();

        box.innerHTML += "<p>AI: " + data.reply + "</p>";
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

// ✅ HYBRYDA
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.json({ reply: fallback(message) });
    }

    const reply =
      data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({ reply: fallback(message) });
    }

    res.json({ reply });

  } catch {
    res.json({ reply: fallback(message) });
  }
});

app.listen(process.env.PORT || 3000);
