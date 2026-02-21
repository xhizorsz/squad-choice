import { createClient } from "@libsql/client";

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Validation: Ensure credentials are present
const isDev = process.env.NODE_ENV === 'development';

if (!url && !isDev) {
    console.error("FATAL: TURSO_DB_URL is not defined in Production!");
    throw new Error("Database configuration missing");
}

console.log(`Database connecting to: ${url ? 'Turso Cloud' : 'Local File (Dev)'}`);

export const db = createClient({
    url: url || "file:local.db",
    authToken: authToken,
});

export async function ensureTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            data TEXT,
            last_active INTEGER
        )
    `);
}

export async function getSession(id) {
    const rs = await db.execute({
        sql: "SELECT * FROM sessions WHERE id = ?",
        args: [id],
    });

    if (rs.rows.length === 0) return null;
    try {
        const data = JSON.parse(rs.rows[0].data);
        // Inject the REAL full ID into the data object so the client knows it
        return { ...data, sessionId: rs.rows[0].id };
    } catch (e) {
        console.error("Failed to parse session data", e);
        return null;
    }
}

export async function getSessionByShortId(shortId) {
    // efficient prefix search
    const rs = await db.execute({
        sql: "SELECT * FROM sessions WHERE id LIKE ? LIMIT 1",
        args: [`${shortId}%`],
    });

    if (rs.rows.length === 0) return null;
    try {
        const data = JSON.parse(rs.rows[0].data);
        return { ...data, sessionId: rs.rows[0].id };
    } catch (e) {
        console.error("Failed to parse session data", e);
        return null;
    }
}

export async function createSession(id, initialData) {
    const dataStr = JSON.stringify(initialData);
    const now = Date.now();
    await db.execute({
        sql: "INSERT INTO sessions (id, data, last_active) VALUES (?, ?, ?)",
        args: [id, dataStr, now],
    });
}

export async function updateSession(id, newData) {
    const dataStr = JSON.stringify(newData);
    const now = Date.now();
    await db.execute({
        sql: "UPDATE sessions SET data = ?, last_active = ? WHERE id = ?",
        args: [dataStr, now, id],
    });
}
