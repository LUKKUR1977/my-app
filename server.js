const express = require("express");

const app = express();
app.use(express.json());

// fallback (zawsze działa)
function fallback(message) {
  return "Fallback: " + message;
}

// strona
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#222;color:white;font-family:Arial;">
    <div id="messages"></div>
    <input id="msg"/>
    <button onclick="send()">Wyślij</button>

    <script>
      async function send() {
        const input = document.getElementById("msg");
        const msg = input.value;

        document.getElementById("messages").innerHTML += "<p>Ty: " + msg + "</p>";

        const res = await fetch("/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({message: msg})
        });

        const data = await res.json();

        document.getElementById("messages").innerHTML += "<p>AI: " + data.reply + "</p>";
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

// ✅ DEBUG OPENROUTER
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
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();

    console.log("OPENROUTER:", data);

    if (data.error) {
      return res.json({ reply: "ERROR: " + data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.json({ reply: "BRAK ODPOWIEDZI Z AI ❌" });
    }

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "CRASH 💥" });
  }
});

app.listen(process.env.PORT || 3000);
