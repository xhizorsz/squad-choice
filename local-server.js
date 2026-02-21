import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // package.json has cors

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Helper to wrap Vercel-style async handlers
const wrapHandler = (importPath) => async (req, res) => {
    try {
        const module = await import(importPath);
        return module.default(req, res);
    } catch (err) {
        console.error(`Error in handler for ${importPath}:`, err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Routes matching api/ folder structure
app.all('/api/session/create', wrapHandler('./api/session/create.js'));

app.all('/api/session/:id', async (req, res) => {
    // Vercel puts dynamic path params into query
    req.query.id = req.params.id;
    const module = await import('./api/session/[id].js');
    return module.default(req, res);
});

app.all('/api/search', wrapHandler('./api/search.js'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Local API Server running at http://localhost:${port}`);
});
