import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });
// Create a connection pool (better performance than single connections)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'test_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
export async function saveUserMessage(sessionId, message) {
    try {
        const [result] = await pool.execute('INSERT INTO  transcripts(user_id, text, created_at) VALUES (?, ?, NOW())', [sessionId, message]);
        console.log(`Saved to DB: ${message}`);
        return true;
    }
    catch (error) {
        console.error('Database Error:', error);
        return false;
    }
}
//# sourceMappingURL=db.js.map