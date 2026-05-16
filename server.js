import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// ✅ SAFE INIT (nie crashuje)
let client;
try {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.log("OpenAI init error:", e);
}

// ✅ TEST
app.get("/", (req, res) => {
  res.send("✅ SERVER DZIAŁA + AI READY");
});

// ✅ CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!client) {
      return res.json({ reply: "Brak API key" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: message,
    });

    const reply = response.output_text || "Brak odpowiedzi";

    res.json({ reply });

  } catch (err) {
    console.log("CHAT ERROR:", err);
    res.json({ reply: "Błąd AI 💥" });
  }
});

// ✅ ważne — zapobiega crash
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("PROMISE ERROR:", err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 START:", PORT);
});

