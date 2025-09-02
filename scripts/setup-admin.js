// scripts/setup-admin.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function setupAdminTable() {
  // Проверяем наличие переменной окружения
  if (!process.env.DATABASE_URL) {
    console.error('Ошибка: DATABASE_URL не определен в переменных окружения');
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Создаем таблицу admin_users, если она не существует
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Запрашиваем пароль у пользователя или используем аргумент командной строки
    let password = process.argv[2];
    
    if (!password) {
      console.log('Пожалуйста, введите пароль ниже:');
      // Используем простой способ ввода пароля
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Запрашиваем пароль и ждем ввода
      password = await new Promise((resolve) => {
        rl.question('Пароль: ', (answer) => {
          rl.close();
          resolve(answer);
        });
      });
      
      if (!password || password.trim() === '') {
        console.error('Пароль не может быть пустым');
        process.exit(1);
      }
    }

    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Проверяем, существует ли уже пользователь admin
    const [users] = await connection.execute(
      'SELECT id FROM admin_users WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      // Обновляем существующего пользователя
      await connection.execute(
        'UPDATE admin_users SET password_hash = ? WHERE username = ?',
        [passwordHash, 'admin']
      );
      console.log('Пароль администратора успешно обновлен');
    } else {
      // Создаем нового пользователя admin
      await connection.execute(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
        ['admin', passwordHash]
      );
      console.log('Пользователь администратора успешно создан');
    }

  } catch (error) {
    console.error('Ошибка при настройке таблицы администратора:', error);
  } finally {
    await connection.end();
  }
}

setupAdminTable().catch(console.error);
