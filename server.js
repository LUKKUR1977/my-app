import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send(`
    <h2>🤖 AI Chat</h2>

    <input id="msg" placeholder="Napisz coś..." />
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });

        const data = await res.json();

        chat.innerHTML += "<p><b>AI:</b> " + data.reply + "</p>";

        input.value = "";
      }
    </script>
  `);
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    const reply =
      response.output?.[0]?.content?.[0]?.text || "Brak odpowiedzi";

    res.json({ reply });

  } catch (e) {
    console.log(e);
    res.json({ reply: "Błąd AI 💥" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server:", PORT);
});
