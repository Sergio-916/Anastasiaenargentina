import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from frontend/.env
config({ path: path.resolve(process.cwd(), '.env') });

// Parse the DATABASE_URL to extract components
const parseDbUrl = (url) => {
  try {
    // Expected format: mysql://username:password@hostname:port/database
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):?(\d*)\/(.+)/;
    const matches = url.match(regex);
    
    if (!matches || matches.length < 6) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    return {
      user: matches[1],
      password: matches[2],
      host: matches[3],
      port: matches[4] || 3306,
      database: matches[5]
    };
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error.message);
    throw error;
  }
};

// Create a connection pool with explicit configuration
const dbConfig = process.env.DATABASE_URL ? parseDbUrl(process.env.DATABASE_URL) : {};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,      // Limit max connections
  maxIdle: 10,              // Max idle connections
  idleTimeout: 60000,       // Close idle connections after 60s
  queueLimit: 0,            // Unlimited queue
  enableKeepAlive: true,    // Keep connections alive
  keepAliveInitialDelay: 30000 // 30s keep-alive
});

// Single shared connection for static generation
let staticGenConnection = null;

export async function query({ query, values = [] }) {
  // For static generation during build, reuse a single connection
  if (process.env.NODE_ENV === 'production' && !staticGenConnection) {
    try {
      staticGenConnection = await mysql.createConnection(process.env.DATABASE_URL);
      console.log('Created static generation connection');
    } catch (error) {
      console.error('Failed to create static generation connection:', error.message);
    }
  }
  
  try {
    // Use static connection for production builds, pool for everything else
    if (process.env.NODE_ENV === 'production' && staticGenConnection) {
      const [results] = await staticGenConnection.execute(query, values);
      return results;
    } else {
      const [results] = await pool.execute(query, values);
      return results;
    }
  } catch (error) {
    console.error("Database error:", error.message);
    throw Error(error.message);
  }
}
