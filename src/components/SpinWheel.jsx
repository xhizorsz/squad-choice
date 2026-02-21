import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const SpinWheel = ({ games, onClose }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState(null);
    const spinMusicRef = useRef(null);

    const [spinDuration, setSpinDuration] = useState(5000);

    // Colors for the segments
    const COLORS = ['#FF6B6B', '#4285F4', '#34A853', '#FBBC05', '#A142F4', '#00C853', '#EA4335', '#2962FF'];

    const spin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setWinner(null);

        // Determine Spin Mode
        // 50% chance for Long Spin (13s total, re-acceleration)
        const isLongSpin = Math.random() < 0.5;

        // Start Spin Music
        if (!spinMusicRef.current) {
            spinMusicRef.current = new Audio('/techno_racer.mp3');
            spinMusicRef.current.loop = true;
        }
        spinMusicRef.current.currentTime = 0;
        spinMusicRef.current.play().catch(e => console.error("Spin music failed", e));

        // INITIAL SPIN (Phase 1 or Normal)
        // Normal: 5s. Long: Starts as 5s, but interrupted.
        setSpinDuration(5000);

        const segmentSize = 360 / games.length;

        // Calculate target for Phase 1 (Normal end or Fake stop)
        let extraSpins = 5 * 360;
        let randomDegree = Math.floor(Math.random() * 360);
        let currentTotalRotation = rotation + extraSpins + randomDegree;

        setRotation(currentTotalRotation);

        if (!isLongSpin) {
            // NORMAL SPIN (5s)
            setTimeout(() => {
                finishSpin(currentTotalRotation);
            }, 5000);
        } else {
            // LONG SPIN (13s total)
            // At 5.0s (exactly when it stops), we REVERSE!
            setTimeout(() => {
                // Phase 2: Reverse spin!
                // Remaining time: 13s - 5.0s = 8.0s
                setSpinDuration(8000);

                // Spin BACKWARDS 10-15 times
                const phase2Spins = 15 * 360;
                // We SUBTRACT from the current target to spin in opposite direction
                // We keep the integer part of rotation but target a new random segment
                const finalRotation = currentTotalRotation - phase2Spins - Math.floor(Math.random() * 360);

                setRotation(finalRotation);

                // Finish after total 13s (8.0s from now)
                setTimeout(() => {
                    finishSpin(finalRotation);
                }, 8000);

            }, 5000); // Trigger exactly at 5s
        }
    };

    const finishSpin = (finalDeg) => {
        setIsSpinning(false);
        // Stop Spin Music
        if (spinMusicRef.current) {
            spinMusicRef.current.pause();
            spinMusicRef.current.currentTime = 0;
        }
        calculateWinner(finalDeg);
    };

    const calculateWinner = (deg) => {
        // Normalize degrees to 0-360, handling negative values
        const actualDeg = ((deg % 360) + 360) % 360;
        // Pointer is at Top. Wheel Rotate -> moves segments.
        // If Wheel is 0deg, Segment 0 is at 0deg (Top).
        // If Wheel rotates +90deg (CW), Segment 0 moves to 90deg (Right).
        // The segment at Top (0deg) is now the one at -90deg (or 270deg).
        // So Position at Top = (360 - actualDeg) % 360.

        const segmentSize = 360 / games.length;
        const position = (360 - actualDeg) % 360;

        const winningIndex = Math.floor(position / segmentSize);
        // Clamp index just in case
        const winnerGame = games[winningIndex % games.length];

        setWinner(winnerGame);
        triggerConfetti();
    };

    const triggerConfetti = () => {
        // Play Honk Sound
        const honk = new Audio('/honk.mp3');
        honk.volume = 0.5;
        honk.play().catch(e => console.error("Honk play failed", e));

        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }; // Higher than modal 9999

        var random = function (min, max) {
            return Math.random() * (max - min) + min;
        };

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    const segmentSize = 360 / games.length;
    // Generate conic gradient string
    const gradient = games.map((g, i) => {
        const color = COLORS[i % COLORS.length];
        const start = i * segmentSize;
        const end = (i + 1) * segmentSize;
        return `${color} ${start}deg ${end}deg`;
    }).join(', ');

    return (
        <div
            className="animate-fade-in"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999, // High Z-Index
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0
            }}
            onClick={onClose}
        >
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >

                {/* Arrow Pointer */}
                <div style={{
                    position: 'absolute',
                    top: '-4vmin',
                    zIndex: 20,
                    filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '8vmin', color: 'white' }}>arrow_drop_down</span>
                </div>

                {/* Wheel */}
                <div
                    style={{
                        position: 'relative',
                        width: '80vmin',
                        height: '80vmin',
                        borderRadius: '50%',
                        border: '8px solid white',
                        background: `conic-gradient(${gradient})`,
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.2, 0, 0.2, 1)` : 'none', // dynamic duration
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Labels inside the wheel (Rotated with the wheel) */}
                    {games.map((g, i) => (
                        <div
                            key={g.id}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                // Rotate to center of segment
                                // Geometry Fix for 80vmin: 
                                // Radius = 40vmin. Center Cap ~10vmin (20vmin diam).
                                // Usable ring = 10vmin to 40vmin.
                                // We position text block of height 25vmin at translateY(-25vmin) to sit nicely.
                                transform: `rotate(${i * segmentSize + segmentSize / 2}deg) translateY(-22vmin)`,
                                transformOrigin: 'center center',
                                width: '6vmin',
                                height: '30vmin',
                                marginLeft: '-3vmin',
                                marginTop: '-15vmin',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                pointerEvents: 'none',
                                paddingTop: '0px'
                            }}
                        >
                            <span style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                color: 'white',
                                fontWeight: 'bold',
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                fontSize: '2.5vmin',
                                maxHeight: '28vmin',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}>
                                {g.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Center Cap / Spin Button */}
                {!winner && (
                    <div
                        onClick={spin}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20vmin',
                            height: '20vmin',
                            background: 'white',
                            borderRadius: '50%',
                            cursor: isSpinning ? 'default' : 'pointer',
                            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                            zIndex: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5vmin'
                        }}
                    >
                        <span style={{ color: 'black', fontWeight: 'bold' }}>
                            {isSpinning ? '...' : 'SPIN'}
                        </span>
                    </div>
                )}

                {winner && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="animate-fade-in glass-panel" style={{
                            textAlign: 'center',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(20, 20, 20, 0.95)',
                            minWidth: '30vmin',
                            boxShadow: '0 10px 50px rgba(0,0,0,0.8)'
                        }}>
                            <div style={{ fontSize: '1.5vmin', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Winner</div>
                            <div style={{
                                fontSize: '4vmin',
                                fontWeight: 'bold',
                                background: 'linear-gradient(to right, #FBBF24, #F97316)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '16px',
                                whiteSpace: 'nowrap'
                            }}>
                                {winner.title}
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '1vmin 4vmin',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '9999px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    fontSize: '2vmin'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpinWheel;
