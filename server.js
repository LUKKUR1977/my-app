const express = require("express");

const app = express();
app.use(express.json());

// ✅ UI
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#222;color:white;font-family:Arial;">

    <div id="messages" style="height:90vh;overflow:auto;"></div>

    <input id="msg" style="width:80%" placeholder="Napisz coś..." />
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

// ✅ PRAWDZIWE AI (DZIAŁAJĄCY MODEL)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5", // ✅ działa
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.json({
        reply: "ERROR: " + data.error.message
      });
    }

    const reply =
      data.choices?.[0]?.message?.content || "Brak odpowiedzi";

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "Błąd AI 💥" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER:", PORT);
});
``
