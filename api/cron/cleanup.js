import { db } from '../../lib/turso.js';

export default async function handler(req, res) {
    // Vercel Cron automatically adds this header. We verify it to prevent manual abuse.
    // However, for simplicity in "Hobby" deployment without hard secrets, we can also check a custom env var.
    // Standard Vercel Cron protection: process.env.CRON_SECRET
    // Note: On Vercel Hobby, you must configure this env var manually or rely on Vercel's protection.

    // Check Authorization Header (If CRON_SECRET is set)
    if (process.env.CRON_SECRET) {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const rs = await db.execute({
            sql: "DELETE FROM sessions WHERE last_active < ?",
            args: [sevenDaysAgo]
        });

        console.log(`Cleanup run: Deleted ${rs.rowsAffected} old sessions.`);

        return res.status(200).json({
            success: true,
            deleted: rs.rowsAffected
        });
    } catch (error) {
        console.error("Cleanup API Error:", error);
        return res.status(500).json({ error: 'Cleanup failed' });
    }
}
