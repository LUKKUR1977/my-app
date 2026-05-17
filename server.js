const express = require("express");

const app = express();
app.use(express.json());

// ✅ fallback AI (ZAWSZE DZIAŁA)
function fallback(message) {
  return "🤖 " + message;
}

// ✅ FRONT (CHATGPT UI)
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <style>
      body {
        margin:0;
        display:flex;
        background:#343541;
        color:white;
        font-family:Arial;
      }

      #sidebar {
        width:220px;
        background:#202123;
        padding:15px;
      }

      #chat {
        flex:1;
        display:flex;
        flex-direction:column;
        height:100vh;
      }

      #messages {
        flex:1;
        overflow-y:auto;
        padding:20px;
        display:flex;
        flex-direction:column;
      }

      .msg {
        max-width:70%;
        padding:12px;
        border-radius:8px;
        margin-bottom:10px;
      }

      .user {
        background:#3b82f6;
        align-self:flex-end;
      }

      .ai {
        background:#444654;
        align-self:flex-start;
      }

      #inputBox {
        display:flex;
        padding:10px;
        background:#40414f;
      }

      input {
        flex:1;
        padding:10px;
        border:none;
        border-radius:5px;
      }

      button {
        margin-left:10px;
        padding:10px;
        background:#19c37d;
        border:none;
        color:white;
        border-radius:5px;
        cursor:pointer;
      }
    </style>
  </head>

  <body>

    <div id="sidebar">
      <h3>💬 Chat</h3>
      <button onclick="newChat()">Nowa rozmowa</button>
    </div>

    <div id="chat">
      <div id="messages"></div>

      <div id="inputBox">
        <input id="msg" placeholder="Napisz coś..." />
        <button onclick="send()">Wyślij</button>
      </div>
    </div>

    <script>
      const box = document.getElementById("messages");

      function newChat(){
        box.innerHTML = "";
      }

      async function send() {
        const input = document.getElementById("msg");
        const text = input.value;

        if (!text) return;

        box.innerHTML += '<div class="msg user">' + text + '</div>';

        const loading = document.createElement("div");
        loading.className = "msg ai";
        loading.innerText = "🤖 pisze...";
        box.appendChild(loading);

        const res = await fetch("/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({message:text})
        });

        const data = await res.json();

        loading.remove();

        box.innerHTML += '<div class="msg ai">' + data.reply + '</div>';

        box.scrollTop = box.scrollHeight;
        input.value = "";
      }

      // ✅ ENTER
      document.getElementById("msg").addEventListener("keydown", e => {
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

// ✅ backend (hybryda)
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

    res.json({
      reply: data.choices?.[0]?.message?.content || fallback(message)
    });

  } catch {
    res.json({ reply: fallback(message) });
  }
});

app.listen(process.env.PORT || 3000);
