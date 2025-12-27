// scripts/kill-connections.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function killSleepingConnections() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined. Please check your .env file.');
    process.exit(1);
  }

  let connection;
  try {
    // Create a new connection
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    // Get list of processes
    console.log('Getting list of processes...');
    const [processes] = await connection.execute('SHOW PROCESSLIST');
    
    // Filter sleeping connections for our user
    const dbUser = process.env.DB_USER || 'u318670773_anastasia'; // Use from env or default
    const sleepingConnections = processes.filter(
      p => p.Command === 'Sleep' && p.User === dbUser && p.Time > 60 // Only kill connections idle for more than 60 seconds
    );
    
    console.log(`Found ${sleepingConnections.length} sleeping connections to kill.`);
    
    // Kill each sleeping connection
    for (const proc of sleepingConnections) {
      try {
        console.log(`Killing connection ${proc.Id}...`);
        await connection.execute(`KILL ${proc.Id}`);
      } catch (err) {
        console.error(`Failed to kill connection ${proc.Id}:`, err.message);
      }
    }
    
    console.log('Done killing sleeping connections.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

// Run the function
killSleepingConnections();
