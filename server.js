import express from "express";

const app = express();
app.use(express.json());

// ✅ strona HTML
app.get("/", (req, res) => {
  res.send(`
    <h2>🤖 AI Chat</h2>
    <input id="msg" placeholder="Napisz coś..." />
    <button onclick="send()">Wyślij</button>
    <div id="chat"></div>

    <script>
      async function send() {
        const msg = document.getElementById("msg").value;

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ message: msg })
        });

        const data = await res.json();

        document.getElementById("chat").innerHTML += 
          "<p><b>Ty:</b> " + msg + "</p>" +
          "<p><b>AI:</b> " + data.reply + "</p>";
      }
    </script>
  `);
});

// ✅ fake AI (na początek)
app.post("/chat", (req, res) => {
  const { message } = req.body;
  res.json({ reply: "Napisałeś: " + message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server działa:", PORT);
});

