// pages/api/submit-form.js
import { query } from "@/utils/db"; // Путь к твоему файлу db.js

// Вместо 'export default function handler(req, res)' используем 'export async function POST(req)'
export async function POST(req) {
  // Для App Router тело запроса парсится с помощью req.json()
  const { name, email, message } = await req.json();

  // Простая валидация входных данных
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ message: "Все поля обязательны для заполнения." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Вставляем данные в таблицу `contacts`
    const result = await query({
      query: "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
      values: [name, email, message],
    });

    // Возвращаем Response объект для App Router
    return new Response(
      JSON.stringify({
        message: "Сообщение успешно отправлено!",
        insertId: result.insertId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Ошибка при сохранении сообщения в БД:", error);
    return new Response(
      JSON.stringify({ message: "Ошибка сервера при сохранении сообщения." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Если тебе нужны другие методы (например, GET для чтения), ты бы экспортировал их так:
/*
export async function GET(req) {
  // Логика для GET-запросов
  return new Response(JSON.stringify({ data: 'Пример GET данных' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
*/
