import React, { useEffect, useRef, useState } from 'react';

const TypingAnimation = ({ texts = [], typingSpeed = 120, pauseBetween = 1000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[textIndex] || '';

        let timeout;
        if (!isDeleting && charIndex < currentText.length) {
            // Typing forward
            timeout = setTimeout(() => {
                setDisplayText(currentText.slice(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            }, typingSpeed);
        } else if (!isDeleting && charIndex === currentText.length) {
            // Finished typing, pause then start deleting
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, pauseBetween);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            timeout = setTimeout(() => {
                setDisplayText(currentText.slice(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            }, typingSpeed / 2);
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting, move to next text
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex, texts, typingSpeed, pauseBetween]);

    return (
        <>
            <span className="text-gray-300">{displayText}</span>
            <span className="w-0.5 h-5 bg-blue-500 animate-pulse"></span>
        </>
    );
};

const MobileTrigger = ({ children, className = "" }) => {
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.target) {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-active', 'true');
                    } else {
                        entry.target.removeAttribute('data-active');
                    }
                }
            },
            {
                threshold: 0,
                // Trigger only when in the vertical center (approx middle 33%)
                rootMargin: '-33% 0px -33% 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`group ${className}`}>
            {children}
        </div>
    );
};

const FeatureSection = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const revealElements = sectionRef.current?.querySelectorAll('.reveal');
        revealElements?.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <main ref={sectionRef} className="container mx-auto px-4 pb-32 space-y-32">

            {/* 1. SESSION SYSTEM */}
            <div className="reveal flex flex-col md:flex-row items-center gap-12 lg:gap-24 group">
                <div className="flex-1 space-y-6 relative">
                    <div className="blob-purple left-0 top-0"></div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-bold tracking-wider border border-purple-500/20">
                        <span className="material-symbols-outlined text-[16px]">bolt</span> INSTANT
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Zero friction.<br /><span className="text-purple-400">Instant choices.</span></h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Forget about "signing up" or "verifying email". Create a session in one click.
                        A unique ID is generated instantly, and your session is ready.
                        Real-time polling ensures everyone stays in sync.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    <div className="glass-card p-2 transform rotate-2 hover:rotate-0 transition duration-700 relative">
                        <div className="bg-black/80 rounded-xl overflow-hidden border border-white/5">
                            {/* Browser Header */}
                            <div className="bg-white/5 p-3 flex gap-2 items-center border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="mx-auto text-[10px] text-gray-600 font-mono bg-black/50 px-2 rounded">squad-choice.vercel.app/session/badc0ff3</div>
                            </div>
                            {/* Content */}
                            <div className="p-8 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                                <div className="text-center space-y-2 relative z-10">
                                    <span className="material-symbols-outlined text-6xl text-purple-500 mb-2 animate-pulse" style={{ fontSize: '64px' }}>wifi_tethering</span>
                                    <h3 className="text-xl font-bold">Session #badc0ff3</h3>
                                    <p className="text-sm text-green-400 flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Instant Updates
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. INVITE SHARING (Moved from 7, alternating: flex-row-reverse) */}
            <div className="reveal flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900/30 text-teal-300 rounded-full text-xs font-bold tracking-wider border border-teal-500/20">
                        <span className="material-symbols-outlined text-[16px]">share</span> INVITE
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Share with <span className="text-teal-400">one click</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Invite friends via Discord, WhatsApp, or Slack instantly. Just click to copy the magic link.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    {/* Wrapped in MobileTrigger for Toast Animation */}
                    <MobileTrigger className="glass-card p-8 flex flex-col items-center justify-center space-y-4">
                        <div className="w-full bg-black/40 rounded-lg p-4 flex items-center justify-between border border-white/10 group-hover:border-teal-500/50 group-data-[active=true]:border-teal-500/50 transition">
                            <code className="text-gray-400 font-mono text-sm truncate">squad-choice.vercel.app/session/badc0ff3</code>
                            <button className="text-teal-400 hover:text-teal-300">
                                <span className="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                        {/* Toast Notification Mockup */}
                        <div className="bg-[#6366f1] text-white px-4 py-2 rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-2 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:translate-y-0 transition duration-500 delay-100">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-sm">Link copied to clipboard!</span>
                        </div>
                    </MobileTrigger>
                </div>
            </div>

            {/* 3. GAME SEARCH (IGDB) */}
            <div className="reveal flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-bold tracking-wider border border-blue-500/20">
                        <span className="material-symbols-outlined text-[16px]">database</span> POWERED BY IGDB
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">The entire <span className="text-blue-400">universe</span> of games.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Search thousands of titles. We fetch cover arts automatically. Build your playlist in seconds.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    <div className="glass-card p-6 relative overflow-hidden max-w-sm mx-auto">
                        {/* Search Bar */}
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-xl mb-6">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                            <TypingAnimation texts={["Minecraft", "Counter Strike", "Warcraft III"]} typingSpeed={100} pauseBetween={1000} />
                        </div>
                        {/* Results Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Result 1 - RV There Yet */}
                            <MobileTrigger className="group/item relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4]">
                                <img src="/rv_there_yet_cover.jpg" alt="RV There Yet" className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 group-data-[active=true]/item:opacity-100 transition duration-300 group-hover/item:scale-110 group-data-[active=true]/item:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3">
                                    <div className="text-s font-bold text-white">RV There Yet</div>
                                </div>
                            </MobileTrigger>
                            {/* Result 2 - Peak */}
                            <MobileTrigger className="group/item relative rounded-lg overflow-hidden cursor-pointer aspect-[3/4]">
                                <img src="/peak_cover.jpg" alt="Peak" className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 group-data-[active=true]/item:opacity-100 transition duration-300 group-hover/item:scale-110 group-data-[active=true]/item:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3">
                                    <div className="text-s font-bold text-white">Peak</div>
                                </div>
                            </MobileTrigger>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. VOTING SYSTEM */}
            <div className="reveal flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 group">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-bold tracking-wider border border-green-500/20">
                        <span className="material-symbols-outlined text-[16px]">how_to_vote</span> REAL-TIME
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Democracy <br />in <span className="text-green-400">action</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Votes update live on everyone's screen. Avatars show exactly who wants to play what. The list auto-sorts based on popularity.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    <div className="glass-card p-6 space-y-4">
                        {/* Vote Item 1 */}
                        <MobileTrigger className="bg-white/5 rounded-xl p-4 border border-green-500/30 relative overflow-hidden group/vote">
                            <div className="absolute left-0 top-0 bottom-0 w-3/4 bg-green-500/10 z-0 transition-all duration-1000 group-hover/vote:w-[80%] group-data-[active=true]/vote:w-[80%]"></div>
                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="font-bold text-lg">RV There Yet</h3>
                                    <div className="text-[10px] text-gray-500">added by Maverick</div>
                                </div>
                                <span className="text-xl font-bold text-green-400 flex items-center gap-1">3 <span className="text-lg">🔥</span></span>
                            </div>
                            <div className="absolute top-4 right-4 z-10 hidden"></div>
                            {/* Avatar Group Top Left relative to card */}
                            <div className="absolute top-3 right-3 flex -space-x-2 z-20">
                                <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">JD</div>
                                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">AK</div>
                                <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">M</div>
                            </div>
                        </MobileTrigger>
                        {/* Vote Item 2 */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-white/5 z-0"></div>
                            <div className="relative z-10 flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-400">Peak</h3>
                                <span className="text-xl font-bold text-gray-500">1</span>
                            </div>
                            <div className="relative z-10 flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-yellow-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">S</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. SPIN WHEEL */}
            <div className="reveal flex flex-col md:flex-row items-center gap-12 lg:gap-24 group">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-900/30 text-yellow-300 rounded-full text-xs font-bold tracking-wider border border-yellow-500/20">
                        <span className="material-symbols-outlined text-[16px]">casino</span> TIE BREAKER
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Let fate <span className="text-yellow-400">decide</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Stalemate? The Spin Wheel settles arguments instantly. Built-in suspense, confetti celebration for the winner.
                        <br />
                        <span className="text-sm text-yellow-500/80 mt-2 block flex items-center gap-1">
                            Click on <span className="material-symbols-outlined text-lg">casino</span> to open the wheel.
                        </span>
                    </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                    <div className="glass-card p-12 relative">
                        {/* Wheel */}
                        <div className="relative w-64 h-64">
                            <div className="w-full h-full rounded-full border-8 border-gray-800 relative overflow-hidden animate-spin-slow shadow-2xl" style={{ background: 'conic-gradient(#ef4444 0deg 90deg, #3b82f6 90deg 180deg, #22c55e 180deg 270deg, #eab308 270deg 360deg)' }}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full z-20"></div>
                                </div>
                            </div>
                            {/* Pointer */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-4xl drop-shadow-xl z-30">▼</div>
                        </div>
                        {/* Confetti Particles (Decor) */}
                        <div className="absolute top-10 left-10 w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="absolute top-20 right-10 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="absolute bottom-10 left-20 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>

            {/* 6. ALREADY PLAYED */}
            <div className="reveal flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 group">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900/30 text-indigo-300 rounded-full text-xs font-bold tracking-wider border border-indigo-500/20">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> TRACKING
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Mark as <span className="text-indigo-400">played</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Keep the momentum going. Mark games as "Played" to move them to the bottom of the list. Enjoy a satisfying confetti pop every time.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    <div className="glass-card p-6">
                        {/* Played State */}
                        <div className="flex items-center justify-between p-4 mb-4 border-b border-white/5 opacity-50">
                            <span className="text-gray-500 line-through">Peak</span>
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 uppercase">Played</span>
                        </div>
                        {/* Action State */}
                        <div className="flex items-center justify-between p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/30">
                            <span className="font-bold">RV There Yet</span>
                            <button className="flex items-center justify-center w-11 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-full text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                                <span className="material-symbols-outlined text-xl">sports_esports</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. USER PROFILE (Moved from 2, alternating: flex-row) */}
            <div className="reveal flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-900/30 text-pink-300 rounded-full text-xs font-bold tracking-wider border border-pink-500/20">
                        <span className="material-symbols-outlined text-[16px]">face</span> PERSONALIZED
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Express <span className="text-pink-400">yourself</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Pick a nickname and choose from 8 vivid gradients. Your avatar follows you across votes, making the board easy to read at a glance.
                    </p>
                </div>
                <div className="flex-1 w-full">
                    {/* Wrapped in MobileTrigger for Profile Animation */}
                    <MobileTrigger className="glass-card p-6 transform -rotate-1 hover:rotate-0 group-data-[active=true]:rotate-0 transition duration-500 relative bg-gradient-to-br from-white/5 to-transparent flex flex-col items-center max-w-sm mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-6 w-full max-w-[280px]">
                            {/* Avatar Preview */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-white/10 flex items-center justify-center text-xl font-bold shadow-xl shrink-0">
                                JD
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block flex items-center gap-1"><span className="text-lg">👤</span> Your Name</label>
                                <div className="text-lg font-medium border-b border-white/20 pb-1 truncate">Maverick</div>
                            </div>
                        </div>
                        {/* Color Picker Mockup */}
                        <div className="w-full flex flex-col items-center">
                            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1"><span className="text-lg">🎨</span> Your Color</label>
                            <div className="grid grid-cols-4 gap-3 max-w-[280px]">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i} className={`w-12 h-12 rounded-full cursor-pointer hover:scale-110 group-data-[active=true]:animate-pulse transition ring-2 ring-transparent hover:ring-white`} style={{
                                        background: [
                                            'linear-gradient(135deg, #FF6B6B 0%, #EA4335 100%)',
                                            'linear-gradient(135deg, #FBBC05 0%, #FFD600 100%)',
                                            'linear-gradient(135deg, #34A853 0%, #00C853 100%)',
                                            'linear-gradient(135deg, #4285F4 0%, #2962FF 100%)',
                                            'linear-gradient(135deg, #A142F4 0%, #6200EA 100%)',
                                            'linear-gradient(135deg, #FF4081 0%, #F50057 100%)',
                                            'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
                                            'linear-gradient(135deg, #FF9800 0%, #EF6C00 100%)'
                                        ][i],
                                        boxShadow: i === 4 ? '0 0 10px white' : 'none',
                                        transform: i === 4 ? 'scale(1.1)' : 'scale(1)'
                                    }}></div>
                                ))}
                            </div>
                        </div>
                    </MobileTrigger>
                </div>
            </div>

            {/* 8. ATMOSPHERE */}
            <div className="reveal flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 group pb-20">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-bold tracking-wider border border-purple-500/20">
                        <span className="material-symbols-outlined text-[16px]">music_note</span> ATMOSPHERE
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">Vibes <span className="text-purple-400">included</span>.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Dark Mode? Included. Hidden 8-bit music? Also included. Your job? Find it.
                        <br />
                        <span className="text-purple-400/80 text-base mt-2 block">We put the "vibes" in quite literally.</span>
                    </p>
                </div>
                <div className="flex-1 w-full relative">
                    <MobileTrigger className="glass-card p-8 flex items-center justify-center relative overflow-hidden group/record min-h-[240px]">
                        {/* Vinyl Record */}
                        <div className="relative w-40 h-40 rounded-full bg-[#18181b] border-6 border-[#09090b] shadow-2xl flex items-center justify-center group-hover/record:animate-[spin_3s_linear_infinite] group-data-[active=true]/record:animate-[spin_3s_linear_infinite] transition-all">
                            {/* Grooves */}
                            <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'repeating-radial-gradient(#3f3f46 0, #3f3f46 1px, transparent 2px, transparent 6px)' }}></div>
                            {/* Shine */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-30"></div>

                            {/* Label */}
                            <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.6)] relative z-10 ring-4 ring-black/50">
                                <span className="material-symbols-outlined text-2xl text-white">music_note</span>
                            </div>
                        </div>
                    </MobileTrigger>
                </div>
            </div>
        </main>
    );
};

export default FeatureSection;
