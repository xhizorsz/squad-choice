import React, { useState } from 'react';
import BinaryStreamEffect from '../components/BinaryStreamEffect';
import FeatureSection from '../components/FeatureSection';

const LandingPage = () => {
    const [joinId, setJoinId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/session/create', { method: 'POST' });
            const data = await res.json();
            if (data.sessionId) {
                window.location.href = `/session/${data.sessionId}`;
            } else {
                console.error('Session create failed', data);
                alert('Error: Could not create session. (Check DB connection)');
            }
        } catch (e) {
            console.error("Create Create Error", e);
            alert('Network or Server Error during creation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const cleanId = joinId.trim().replace(/^#/, ''); // Allow pasting with #
        if (cleanId) {
            window.location.href = `/session/${cleanId}`;
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <BinaryStreamEffect />

            {/* Hero Section */}
            <div className="container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '2rem' }}>

                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>

                    <header className="hero-section animate-fade-in" style={{ marginBottom: '0rem' }}>
                        <img src="/SquadChoice.svg" alt="SquadChoice Logo" style={{ width: '320px', height: 'auto', marginBottom: '1.5rem', transform: 'translateX(33px)' }} />
                        <h1 className="hero-title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                            Squad<span className="text-gradient">Choice</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            Vote together. Play together.
                        </p>
                        <p className="hero-subtitle" style={{ margin: 0 }}>
                            🎉 The voting tool for your next LAN party
                        </p>
                    </header>

                    <div className="landing-card" style={{ marginTop: '0rem', width: '100%', maxWidth: '400px', background: 'rgba(23, 23, 23, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>

                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                            disabled={isLoading}
                            style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', marginBottom: '0.5rem' }}
                        >
                            {isLoading ? 'Creating...' : '🚀 Create New Session'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0', color: 'var(--text-secondary)' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                            <span>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        </div>

                        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="🔑 Enter Session ID..."
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                className="search-input"
                                style={{ width: '100%', textAlign: 'center' }}
                            />
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                                🔗 Join Session
                            </button>
                        </form>

                    </div>
                </div>

                {/* Scroll Down Indicator */}

            </div>

            {/* Feature Section */}
            {/* Feature Section Spacer with Scroll Indicator */}
            <div style={{ height: '10vh', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', color: '#6b7280', animation: 'float 2s ease-in-out infinite' }}>
                    <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </div>
            </div>
            <FeatureSection />

            {/* Footer */}
            <footer className="landing-footer">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.025em' }}>Ready to play?</h3>
                <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={isLoading}
                    style={{ fontSize: '1.2rem', padding: '1rem 3rem', marginBottom: '2rem' }}
                >
                    🚀 Start a Session
                </button>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>© {new Date().getFullYear()} SquadChoice. Built for gamers.</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Open Source on <a href="https://github.com/xhizorsz/squad-choice" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>GitHub</a> • <a href="https://github.com/xhizorsz/squad-choice/issues/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Report a Bug</a>
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;

