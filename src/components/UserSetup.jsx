import React, { useState } from 'react';
import BinaryStreamEffect from './BinaryStreamEffect';

const COLORS = [
    'linear-gradient(135deg, #FF6B6B 0%, #EA4335 100%)', // Red
    'linear-gradient(135deg, #4285F4 0%, #2962FF 100%)', // Blue
    'linear-gradient(135deg, #34A853 0%, #00C853 100%)', // Green
    'linear-gradient(135deg, #FBBC05 0%, #FFD600 100%)', // Yellow
    'linear-gradient(135deg, #A142F4 0%, #6200EA 100%)', // Purple
    'linear-gradient(135deg, #FF4081 0%, #F50057 100%)', // Pink
    'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)', // Cyan
    'linear-gradient(135deg, #FF9800 0%, #EF6C00 100%)', // Orange
];

const UserSetup = ({ onComplete, existingUsers = [] }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    // Default to 'reclaim' if there are users, otherwise straight to 'create'
    const [view, setView] = useState(existingUsers.length > 0 ? 'reclaim' : 'create');

    const handleReclaim = (user) => {
        onComplete(user);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete({ name: name.trim(), color: selectedColor });
        }
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#050505'
        }}>
            <BinaryStreamEffect />
            <div className="landing-card" style={{ position: 'relative', zIndex: 1, background: 'rgba(23, 23, 23, 0.8)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
                {view === 'reclaim' ? (
                    <div className="animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Who are you?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            {existingUsers.map((u, i) => (
                                <button key={i} onClick={() => handleReclaim(u)}
                                    className="btn"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        padding: '1rem',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        cursor: 'pointer', transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <div className="avatar-stack" style={{ background: u.color, width: '40px', height: '40px', margin: 0, fontSize: '1rem' }}>
                                        {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.9rem' }}>{u.name}</span>
                                </button>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '1rem', opacity: 0.5 }}>Not on the list?</div>
                            <button className="btn btn-secondary" onClick={() => setView('create')} style={{ width: '100%' }}>Create New Profile</button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>🎮 New Player</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>👤 Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="search-input"
                                    placeholder="e.g. Maverick"
                                    autoFocus
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>🎨 Your Color</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {COLORS.map((grad, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedColor(grad)}
                                            style={{
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: grad,
                                                cursor: 'pointer',
                                                border: selectedColor === grad ? '2px solid white' : '2px solid transparent',
                                                transform: selectedColor === grad ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                {existingUsers.length > 0 && (
                                    <button type="button" className="btn btn-secondary" onClick={() => setView('reclaim')}>Back</button>
                                )}
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!name.trim()}>
                                    🚀 Let's go
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSetup;
