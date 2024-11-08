// Подключение к WebSocket серверу
const ws = new WebSocket("wss://websocketsserver.onrender.com");

// Событие открытия соединения
ws.onopen = () => {
  console.log("==> Connected to WebSocket server");
};

// Событие закрытия соединения
ws.onclose = () => {
  console.log("==> Disconnected from WebSocket server");
};

// Событие получения сообщения
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("==> Received:", message);
};

//? ......  Обработка клика кнопки и проверка никнейма .......

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("nickname-modal");
  const nicknameInput = document.getElementById("nickname-input");
  const nicknameSubmit = document.getElementById("nickname-submit");
  const clearHistoryButton = document.getElementById("clear-history");

  // Обработчик нажатия на кнопку "Продолжить"
  nicknameSubmit.addEventListener("click", () => {
    const nickname = nicknameInput.value.trim();
    if (nickname) {
      checkNickname(nickname); // Проверка уникальности псевдонима
    } else {
      alert("Пожалуйста, введите псевдоним.");
    }
  });

  // Функция проверки никнейма
  async function checkNickname(name) {
    try {
      const response = await fetch(
        "https://websocketsserver.onrender.com/new-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        },
      );
      const result = await response.json();

      if (result.status === "ok") {
        console.log("==> Никнейм принят:", result.user.name);
        modal.style.display = "none"; // Скрыть модальное окно
        initializeChat(name); // Инициализация чата с никнеймом
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Ошибка при проверке никнейма:", error);
    }
  }

  // Функция для инициализации чата после успешного ввода никнейма
  function initializeChat(nickname) {
    const chatContainer = document.getElementById("chat-container");
    const messageInput = document.getElementById("message-input");
    const sendMessageButton = document.getElementById("send-message");
    const messagesContainer = document.getElementById("messages");
    const usersContainer = document.getElementById("users");

    chatContainer.style.display = "flex";

    const ws = new WebSocket("wss://websocketsserver.onrender.com");

    // Таймер для отправки пинг-сообщений каждые 3 секунд
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping", user: { name: nickname } }));
      }
    }, 3000);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          user: { name: nickname },
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        const uniqueUsers = data.filter((user) => user.name !== "");
        updateUserList(uniqueUsers);
      } else if (data.type === "send") {
        if (data.user.name !== nickname) {
          displayMessage(data);
        }
      } else if (data.type === "history") {
        messagesContainer.innerHTML = "";
        data.data.forEach((msg) => displayMessage(msg));
      }
    };

    function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText) {
        const messageData = {
          type: "send",
          message: messageText,
          user: { name: nickname },
          timestamp: new Date().toISOString(),
        };

        ws.send(JSON.stringify(messageData));

        displayMessage({
          ...messageData,
          user: { name: "You" },
        });

        messageInput.value = "";
      }
    }

    // Добавляем обработчик нажатия Enter на поле ввода
    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    // Обработчик для кнопки отправки
    sendMessageButton.addEventListener("click", sendMessage);

    // Обработчик для кнопки очистки истории
    clearHistoryButton.addEventListener("click", () => {
      ws.send(JSON.stringify({ type: "clear" }));
      messagesContainer.innerHTML = "";
    });

    function displayMessage(data) {
      const messageElement = document.createElement("div");
      messageElement.className =
        data.user.name === "You" ? "my-message" : "other-message";

      const metaElement = document.createElement("div");
      metaElement.className = "message-meta";
      const date = new Date(data.timestamp || Date.now());
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      metaElement.innerHTML = `<strong>${data.user.name}:</strong> <span class="timestamp">${formattedDate} ${formattedTime}</span>`;

      const textElement = document.createElement("div");
      textElement.className = "message-text";
      textElement.textContent = data.message;

      messageElement.appendChild(metaElement);
      messageElement.appendChild(textElement);
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateUserList(users) {
      usersContainer.innerHTML = "";
      users.forEach((user) => {
        const userElement = document.createElement("li");
        userElement.textContent = user.name === nickname ? "You" : user.name;

        if (user.name === nickname) {
          userElement.classList.add("current-user");
        }
        usersContainer.appendChild(userElement);
      });
    }

    window.addEventListener("beforeunload", () => {
      ws.send(
        JSON.stringify({
          type: "exit",
          user: { name: nickname },
        }),
      );
      ws.close();
      clearInterval(pingInterval); // Очищаем таймер при закрытии соединения
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        ws.send(JSON.stringify({ type: "exit", user: { name: nickname } }));
        ws.close();
      }
    });
  }
});
