import express from "express";

const app = express();
app.use(express.json());

// ✅ FRONT
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="font-family: Arial; max-width:600px; margin:auto;">
    <h2>🤖 AI Chat</h2>
    <input id="msg" placeholder="Napisz coś..." style="padding:10px;width:70%;" />
    <button onclick="send()">Wyślij</button>
    <div id="chat"></div>

    <script>
      async function send() {
        const input = document.getElementById("msg");
        const chat = document.getElementById("chat");

        const message = input.value;

        chat.innerHTML += "<p><b>Ty:</b> " + message + "</p>";

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ message })
        });

        const data = await res.json();

        chat.innerHTML += "<p><b>AI:</b> " + data.reply + "</p>";
      }
    </script>
  </body>
  </html>
  `);
});

// ✅ CHAT (DEBUG VERSION)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data); // 🔥 WAŻNE

    if (data.error) {
      return res.json({ reply: "ERROR: " + data.error.message });
    }

    const reply =
      data.choices?.[0]?.message?.content || "Brak odpowiedzi";

    res.json({ reply });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.json({ reply: "Błąd serwera 💥" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER:", PORT);
});
