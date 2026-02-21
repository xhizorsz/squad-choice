import { createSession, ensureTable } from '../../lib/turso.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await ensureTable(); // Ensure DB is ready

        // Generate Short 8-char ID (Base36)
        const sessionId = Math.random().toString(36).substring(2, 10);
        const initialData = {
            users: [], // Will contain { name: "Maverick", color: "#..." }
            games: []
        };

        await createSession(sessionId, initialData);

        return res.status(200).json({ sessionId });
    } catch (error) {
        console.error("Create Session Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
