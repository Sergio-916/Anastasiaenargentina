"use client";
// pages/index.js
import { useState } from "react";

function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    setStatus("Отправка...");

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Спасибо за сообщение! Мы свяжемся с вами.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus(`Ошибка: ${data.message || "Что-то пошло не так."}`);
      }
    } catch (error) {
      console.error("Ошибка при отправке формы:", error);
      setStatus("Произошла сетевая ошибка.");
    }
  };

  return (
    <div>
      <h1>Свяжитесь с нами</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Отправить</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default HomePage;
