import { getSession, getSessionByShortId, updateSession, ensureTable } from '../../lib/turso.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing session ID' });
    }

    // GET: Retrieve Session
    if (req.method === 'GET') {
        try {
            await ensureTable();
            let data = await getSession(id);

            // Fallback: Try short ID if exact match failed and ID length is 8 (or close)
            if (!data && id.length >= 8) {
                data = await getSessionByShortId(id);
            }

            if (!data) {
                return res.status(404).json({ error: 'Session not found' });
            }
            return res.status(200).json(data);
        } catch (error) {
            console.error("Get Session Error:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST: Update Session (Full Overwrite for now, relying on client to send complete state)
    // To be safer for concurrency, we could implement specific actions (ADD_USER, VOTE), 
    // but the plan specifies "Thick Client", so we trust the client sends the new state.
    if (req.method === 'POST') {
        try {
            const newData = req.body;
            if (!newData) {
                return res.status(400).json({ error: 'Missing body' });
            }

            // In a real production app with high concurrency, we'd use versioning here.
            await updateSession(id, newData);
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Update Session Error:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
