import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache results for 1 hour

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    const now = Date.now();
    if (accessToken && now < tokenExpiresAt) {
        return accessToken;
    }

    try {
        const res = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials'
            })
        });

        if (!res.ok) throw new Error(`Auth failed: ${res.status}`);

        const data = await res.json();
        accessToken = data.access_token;
        tokenExpiresAt = now + (data.expires_in * 1000) - 60000;
        return accessToken;
    } catch (err) {
        console.error('IGDB Auth Error:', err);
        throw err;
    }
}

export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json({ items: [] });

    // Check Cache
    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        return res.status(200).json({ items: cached, cached: true });
    }

    try {
        const token = await getAccessToken();
        // Sanitize query
        const sanitizedQuery = q.replace(/[";]/g, '');

        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            },
            body: `search "${sanitizedQuery}"; fields name, cover.url; limit 10;`
        });

        if (!response.ok) throw new Error(`IGDB Search failed: ${response.status}`);

        const data = await response.json();

        const results = data.map(game => {
            let coverUrl = null;
            if (game.cover && game.cover.url) {
                coverUrl = 'https:' + game.cover.url.replace('t_thumb', 't_cover_big');
            }
            return {
                id: game.id,
                name: game.name,
                tiny_image: coverUrl
            };
        });

        // Write to Cache
        cache.set(cacheKey, results);

        return res.status(200).json({ items: results, cached: false });
    } catch (error) {
        console.error("Search API Error:", error);
        return res.status(500).json({ error: 'Search failed' });
    }
}
