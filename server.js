const express = require("express");

const app = express();
app.use(express.json());

// ✅ fallback AI
function fallback(message) {
  return "🤖 " + message;
}

// ✅ FRONTEND (PRO UI)
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
        padding:20px;
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
        padding:30px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .msg {
        max-width:70%;
        padding:14px;
        border-radius:10px;
        font-size:15px;
      }

      .user {
        background:linear-gradient(135deg,#3b82f6,#2563eb);
        align-self:flex-end;
      }

      .ai {
        background:#444654;
        align-self:flex-start;
      }

      .fade {
        opacity:0;
        animation:fadeIn 0.4s forwards;
      }

      @keyframes fadeIn {
        to { opacity:1; }
      }

      .typing::after {
        content:"";
        animation:dots 1.5s infinite;
      }

      @keyframes dots {
        0% {content:"";}
        33% {content:".";}
        66% {content:"..";}
        100% {content:"...";}
      }

      #inputBox {
        display:flex;
        padding:15px;
        background:#40414f;
      }

      input {
        flex:1;
        padding:12px;
        border-radius:8px;
        border:none;
        font-size:15px;
      }

      button {
        margin-left:10px;
        padding:12px 18px;
        background:#19c37d;
        border:none;
        border-radius:8px;
        color:white;
        cursor:pointer;
      }

      button:hover {
        background:#14a46d;
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
        <input id="msg" placeholder="Napisz wiadomość..." />
        <button onclick="send()">Wyślij</button>
      </div>
    </div>

    <script>
      const box = document.getElementById("messages");

      function newChat() {
        box.innerHTML = "";
      }

      function typeEffect(el, text) {
        let i = 0;
        function write() {
          if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(write, 15);
          }
        }
        write();
      }

      async function send() {
        const input = document.getElementById("msg");
        const text = input.value;

        if (!text) return;

        // USER
        box.innerHTML += '<div class="msg user fade">' + text + '</div>';

        // LOADING
        const loading = document.createElement("div");
        loading.className = "msg ai typing";
        loading.innerText = "🤖 pisze";
        box.appendChild(loading);

        box.scrollTop = box.scrollHeight;

        // delay (jak AI)
        await new Promise(r => setTimeout(r, 500 + Math.random()*500));

        const res = await fetch("/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({message:text})
        });

        const data = await res.json();

        loading.remove();

        // AI MESSAGE
        const aiMsg = document.createElement("div");
        aiMsg.className = "msg ai fade";
        box.appendChild(aiMsg);

        typeEffect(aiMsg, data.reply);

        box.scrollTop = box.scrollHeight;
        input.value = "";
      }

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


// ✅ BACKEND HYBRYDA
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
