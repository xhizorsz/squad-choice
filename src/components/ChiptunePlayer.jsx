import React, { useState, useRef } from 'react';

const ChiptunePlayer = () => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        setPlaying(!playing);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 100
        }}>
            <audio ref={audioRef} src="/chiptune.mp3" loop />
            <button
                onClick={togglePlay}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: playing ? 'var(--accent-color)' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                }}
                title="Easter Egg 🎵"
            >
                <span className="material-symbols-outlined">
                    {playing ? 'music_note' : 'music_off'}
                </span>
            </button>
        </div>
    );
};

export default ChiptunePlayer;
