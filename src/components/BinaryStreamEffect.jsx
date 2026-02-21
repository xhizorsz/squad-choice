import React, { useEffect, useRef } from 'react';

const BinaryStreamEffect = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const rand = (min, max) => Math.random() * (max - min) + min;

        // Effect State
        let streams = [];

        const init = () => {
            streams = [];
            const count = Math.floor(width / 30);
            for (let i = 0; i < count; i++) {
                streams.push({
                    x: i * 30,
                    y: Math.random() * height,
                    speed: rand(0.5, 1.5),
                    val: Math.random() > 0.5 ? '1' : '0',
                    opacity: Math.random() * 0.6
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.font = '20px monospace'; // Using monospace as JetBrains Mono might not be loaded, works fine.

            streams.forEach(s => {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.fillText(s.val, s.x, s.y);

                s.y += s.speed;
                if (Math.random() > 0.95) s.val = Math.random() > 0.5 ? '1' : '0';

                if (s.y > height) {
                    s.y = -20;
                    s.opacity = Math.random() * 0.6;
                }
            });

            animationId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            init();
        };

        window.addEventListener('resize', handleResize);

        init();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1, // -1 to sit behind everything
                pointerEvents: 'none',
                background: '#050505' // Base bg
            }}
        />
    );
};

export default BinaryStreamEffect;
