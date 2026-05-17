const express = require("express");

const app = express();
app.use(express.json());

// fallback
function fallback(message) {
  return "🤖 " + message;
}

// UI
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

      .chat-item {
        padding:10px;
        margin-bottom:5px;
        background:#2a2b32;
        border-radius:6px;
        cursor:pointer;
      }

      .chat-item:hover {
        background:#3a3b42;
      }

      #chat {
        flex:1;
        display:flex;
        flex-direction:column;
        height:100vh;
      }

      #messages {
        flex:1;
        overflow:auto;
        padding:20px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .msg {
        max-width:70%;
        padding:12px;
        border-radius:10px;
      }

      .user {
        background:#3b82f6;
        align-self:flex-end;
      }

      .ai {
        background:#444654;
      }

      #inputBox {
        display:flex;
        padding:10px;
        background:#40414f;
      }

      input {
        flex:1;
        padding:10px;
        border-radius:6px;
        border:none;
      }

      button {
        margin-left:10px;
        padding:10px;
        background:#19c37d;
        border:none;
        color:white;
        border-radius:6px;
        cursor:pointer;
      }
    </style>
  </head>

  <body>

    <div id="sidebar">
      <button onclick="createChat()">+ Nowy czat</button>
      <div id="chatList"></div>
    </div>

    <div id="chat">
      <div id="messages"></div>

      <div id="inputBox">
        <input id="msg" placeholder="Napisz..." />
        <button onclick="send()">Wyślij</button>
      </div>
    </div>

    <script>
      let chats = JSON.parse(localStorage.getItem("chats")) || [];
      let currentChat = 0;

      const box = document.getElementById("messages");
      const list = document.getElementById("chatList");

      function save() {
        localStorage.setItem("chats", JSON.stringify(chats));
      }

      function renderChats() {
        list.innerHTML = "";

        chats.forEach((chat, i) => {
          const el = document.createElement("div");
          el.className = "chat-item";
          el.innerText = "Czat " + (i+1);
          el.onclick = () => {
            currentChat = i;
            renderMessages();
          };
          list.appendChild(el);
        });
      }

      function renderMessages() {
        box.innerHTML = "";

        chats[currentChat].forEach(msg => {
          box.innerHTML += '<div class="msg '+msg.type+'">'+msg.text+'</div>';
        });

        box.scrollTop = box.scrollHeight;
      }

      function createChat() {
        chats.push([]);
        currentChat = chats.length - 1;
        save();
        renderChats();
        renderMessages();
      }

      async function send() {
        const input = document.getElementById("msg");
        const text = input.value;

        if (!text) return;

        chats[currentChat].push({type:"user", text});
        renderMessages();

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

        chats[currentChat].push({type:"ai", text:data.reply});
        renderMessages();

        input.value = "";
        save();
      }

      document.getElementById("msg").addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          send();
        }
      });

      if (chats.length === 0) createChat();
      renderChats();
      renderMessages();
    </script>

  </body>
  </html>
  `);
});

// backend
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{
        "Authorization":"Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        model:"meta-llama/llama-3-8b-instruct",
        messages:[{role:"user", content:message}]
      })
    });

    const data = await response.json();

    if (data.error) return res.json({reply:fallback(message)});

    res.json({
      reply: data.choices?.[0]?.message?.content || fallback(message)
    });

  } catch {
    res.json({reply:fallback(message)});
  }
});

app.listen(process.env.PORT || 3000);

