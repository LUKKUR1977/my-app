import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// ✅ SAFE INIT
let client;
try {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.log("OpenAI init error:", e);
}

// ✅ FRONTEND
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="font-family: Arial; max-width:600px; margin:auto;">
    
    <h2>🤖 AI Chat</h2>

    <input id="msg" placeholder="Napisz coś..." style="padding:10px;width:70%;" />
    <button onclick="send()" style="padding:10px;">Wyślij</button>

    <div id="chat" style="margin-top:20px;"></div>

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

        chat.scrollTop = chat.scrollHeight;

        input.value = "";
      }
    </script>

  </body>
  </html>
  `);
});

// ✅ AI CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!client) {
      return res.json({ reply: "Brak API key ❌" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    const reply = response.output_text || "Brak odpowiedzi";

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "Błąd AI 💥" });
  }
});

// ✅ anty crash
process.on("uncaughtException", err => console.log(err));
process.on("unhandledRejection", err => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER START:", PORT);
});
