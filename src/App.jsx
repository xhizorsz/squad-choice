import React, { useState, useEffect } from 'react';
import OverviewPage from './views/OverviewPage';
import LandingPage from './views/LandingPage';

function App() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => setPath(window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Route: /session/:id
    const sessionMatch = path.match(/^\/session\/([a-zA-Z0-9-]+)$/);

    if (path === '/' || path === '') {
        return <LandingPage />;
    }

    if (sessionMatch) {
        const sessionId = sessionMatch[1];
        return <OverviewPage sessionId={sessionId} />;
    }

    // Fallback: 404 handled by LandingPage redirect or simple message
    return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
            <h1>404</h1>
            <p>Seite nicht gefunden.</p>
            <a href="/" style={{ color: 'var(--accent-color)' }}>Zurück zur Startseite</a>
        </div>
    );
}

export default App;
