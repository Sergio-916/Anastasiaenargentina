const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Load environment variables from .env file in the root directory
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function registerUser() {
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not defined. Please check your .env file.");
    rl.close();
    return;
  }

  rl.question('Enter email: ', async (email) => {
    rl.question('Enter password: ', async (password) => {
      const hashedPassword = await bcrypt.hash(password, 10);

      let db;
      try {
        db = await mysql.createConnection(process.env.DATABASE_URL);
        await db.execute(
          'INSERT INTO users (email, password) VALUES (?, ?)',
          [email, hashedPassword]
        );
        console.log(`User ${email} created successfully.`);
      } catch (error) {
        console.error("Error creating user:", error.message);
      } finally {
        if (db) await db.end();
        rl.close();
      }
    });
  });
}

registerUser();
