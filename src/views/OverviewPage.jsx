import React, { useState, useEffect, useRef } from 'react';
import UserListModal from '../components/UserListModal';
import UserSetup from '../components/UserSetup';
import DonateButton from '../components/DonateButton';
import BinaryStreamEffect from '../components/BinaryStreamEffect';
import ChiptunePlayer from '../components/ChiptunePlayer';
import SpinWheel from '../components/SpinWheel';
import confetti from 'canvas-confetti';

const OverviewPage = ({ sessionId }) => {
    const [session, setSession] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [modalData, setModalData] = useState(null); // { title: string, users: [], canSwitch: boolean }

    const handleSwitchToUser = (targetUser) => {
        // Log in as this user
        sessionStorage.setItem(`session_user_${sessionId}`, JSON.stringify(targetUser));
        setCurrentUser(targetUser);

        // Update URL to include ?u=USER_ID so reload works
        const url = new URL(window.location);
        url.searchParams.set('u', targetUser.id);
        window.history.replaceState({}, '', url);

        setModalData(null); // Close modal
    };

    const handleShowUsers = (e, title, userIds, canSwitch = false) => {
        if (e) e.stopPropagation();
        // If userIds is passed (Game Card), filter users.
        // If NOT passed (Header), use ALL session users.
        const targetUsers = userIds
            ? userIds.map(id => (session.users || []).find(u => u.id === id)).filter(Boolean)
            : (session.users || []);

        setModalData({ title, users: targetUsers, canSwitch });
    };
    const [searching, setSearching] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const [showSpinWheel, setShowSpinWheel] = useState(false);
    const [spinPool, setSpinPool] = useState([]);

    // Polling Ref to avoid stale closures
    const sessionRef = useRef(session);
    useEffect(() => { sessionRef.current = session; }, [session]);

    // 1. Initial Load & Auto-Login from URL
    useEffect(() => {
        // Auto-Login via URL Param ONLY (User Request)
        const params = new URLSearchParams(window.location.search);
        const userIdParam = params.get('u');

        if (userIdParam) {
            // We tentatively set it, but validation happens after fetchSession
            // For instant UI feedback, we can wait or set a loader
        }

        fetchSession();
    }, [sessionId]);

    // Update URL with User ID when logged in (For Refresh Persistence)
    useEffect(() => {
        if (currentUser && currentUser.id) {
            const url = new URL(window.location);
            if (url.searchParams.get('u') !== currentUser.id) {
                url.searchParams.set('u', currentUser.id);
                window.history.replaceState({}, '', url);
            }
        }
    }, [currentUser]);

    // 2. Polling (every 2s active, 10s inactive - simplified to 4s for now)
    useEffect(() => {
        const interval = setInterval(fetchSession, 4000);
        return () => clearInterval(interval);
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const res = await fetch(`/api/session/${sessionId}`);
            if (res.ok) {
                const data = await res.json();

                // If short ID was used, specific full ID might be needed
                if (data.sessionId && data.sessionId !== sessionId) {
                    // Redirect to full ID URL to keep things consistent? 
                    // Or just handle seamlessly. Let's just update state.
                }

                setSession(data);



                // Auto-Login Logic (Restored)
                const params = new URLSearchParams(window.location.search);
                const userIdParam = params.get('u');

                // If URL has user param, try to log in
                if (userIdParam && data.users && !currentUser) {
                    const matchedUser = data.users.find(u => u.id === userIdParam);
                    if (matchedUser) {
                        setCurrentUser(matchedUser);
                        // Also sync to sessionStorage for good measure
                        sessionStorage.setItem(`session_user_${sessionId}`, JSON.stringify(matchedUser));
                    }
                }
                // If NO URL param, we do NOT look at localStorage/sessionStorage. 
                // We force selection as requested: "Link without request -> Selection"
            }
        } catch (e) {
            console.error("Fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    const syncSession = async (newData) => {
        // Optimistic UI Update
        setSession(newData);
        try {
            await fetch(`/api/session/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
        } catch (e) {
            console.error("Sync error", e);
            // Revert or fetch? For now, fetch will fix it next tick
        }
    };

    const handleUserComplete = (user) => {
        // Generate Short ID (8 chars) if new
        const shortId = Math.random().toString(36).substring(2, 10);
        const newUser = user.id ? user : { ...user, id: shortId };

        // We can still store it to remember "who i was" during this browsing session?
        // But user said "always select". Let's NOT prevent page reload from losing state?
        // Actually, refreshing page losing state is annoying.
        // Interpretation: "Invite Link" should not log me in. "Opening Session" (clean) -> Selection.
        // If I just reload, maybe I stay logged in?
        // Let's use SessionStorage instead of LocalStorage? That clears on tab close.
        sessionStorage.setItem(`session_user_${sessionId}`, JSON.stringify(newUser));
        setCurrentUser(newUser);

        // Add user to session if not exists
        if (sessionRef.current) {
            const updatedUsers = [...(sessionRef.current.users || [])];
            // Update or Add
            const existingIndex = updatedUsers.findIndex(u => u.name === newUser.name || u.id === newUser.id);

            if (existingIndex >= 0) {
                // Update color or properties if needed, or just ensure they are active?
                // For now, assume Reclaim just means "I am this person".
                updatedUsers[existingIndex] = newUser;
            } else {
                updatedUsers.push(newUser);
            }
            syncSession({ ...sessionRef.current, users: updatedUsers });
        }
    };

    const handleLogout = () => {
        if (!window.confirm("Leave session? This will remove you from the list.")) return;
        sessionStorage.removeItem(`session_user_${sessionId}`);

        if (session && currentUser) {
            // Remove user
            const updatedUsers = session.users.filter(u => u.id !== currentUser.id);

            // Remove user's votes from all games
            const updatedGames = session.games.map(game => ({
                ...game,
                votes: game.votes.filter(voteId => voteId !== currentUser.id)
            }));

            syncSession({ ...session, users: updatedUsers, games: updatedGames });
        }

        setCurrentUser(null);
    };

    const handleSwitchUser = () => {
        // Just clear local state, don't remove from session
        sessionStorage.removeItem(`session_user_${sessionId}`);
        setCurrentUser(null);

        // Remove URL param so auto-login doesn't trigger immediately
        const url = new URL(window.location);
        url.searchParams.delete('u');
        window.history.replaceState({}, '', url);
    };

    // 3. Search Logic
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearching(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSearchResults(data.items || []);
                } catch (e) {
                    console.error(e);
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleAddGame = (gameData) => {
        if (!session || !currentUser) return;

        const newGame = {
            id: gameData.id,
            title: gameData.name,
            cover: gameData.tiny_image,
            addedBy: currentUser.name,
            votes: [],
            status: 'active' // active, played, deleted
        };

        const updatedGames = [...(session.games || []), newGame];
        syncSession({ ...session, games: updatedGames });
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleVote = (gameId) => {
        if (!session || !currentUser) return;

        const updatedGames = session.games.map(game => {
            if (game.id === gameId) {
                // Use ID for voting to handle duplicate names
                const hasVoted = game.votes.includes(currentUser.id);
                const newVotes = hasVoted
                    ? game.votes.filter(v => v !== currentUser.id)
                    : [...game.votes, currentUser.id];
                return { ...game, votes: newVotes };
            }
            return game;
        });

        // Check for winner (simple majority logic or just visual?) 
        // For now just sync
        syncSession({ ...session, games: updatedGames });
    };

    const handleDelete = (gameId) => {
        if (!window.confirm("Delete game?")) return;
        const updatedGames = session.games.filter(g => g.id !== gameId);
        syncSession({ ...session, games: updatedGames });
    };

    const handleStatusToggle = (gameId) => {
        const updatedGames = session.games.map(game => {
            if (game.id === gameId) {
                return { ...game, status: game.status === 'played' ? 'active' : 'played' };
            }
            return game;
        });
        syncSession({ ...session, games: updatedGames });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    };

    const handleShare = async () => {
        const cleanUrl = `${window.location.origin}/session/${sessionId}`;

        try {
            // Try modern Clipboard API first (requires Secure Context)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(cleanUrl);
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 2000);
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            // Fallback: Legacy execCommand for non-secure contexts (e.g. mobile HTTP)
            try {
                const textArea = document.createElement("textarea");
                textArea.value = cleanUrl;

                // Ensure it's not visible but part of DOM
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);

                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    setShowCopyToast(true);
                    setTimeout(() => setShowCopyToast(false), 2000);
                } else {
                    // If even that fails, fallback to prompt
                    window.prompt("Link to copy:", cleanUrl);
                }
            } catch (fallbackErr) {
                console.error("Copy failed:", fallbackErr);
                window.prompt("Link to copy:", cleanUrl);
            }
        }
    };

    if (loading) return null; // Don't show anything while loading to avoid flash

    if (!session) return <div className="container">Session not found.</div>;

    if (!currentUser) {
        return <UserSetup
            onComplete={handleUserComplete}
            existingUsers={session.users || []}
        />;
    }

    const activeGames = (session.games || []).filter(g => g.status !== 'played');
    const playedGames = (session.games || []).filter(g => g.status === 'played');

    // Sorting: Most votes first
    activeGames.sort((a, b) => b.votes.length - a.votes.length);

    // User Compact Mode Logic
    const users = session.users || [];
    const isCompact = users.length > 6;

    return (
        <div className="container" style={{ position: 'relative' }}>
            <BinaryStreamEffect />
            <ChiptunePlayer />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header / Nav */}
                <div className="nav-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                            onClick={() => window.location.href = '/'}
                            title="Back to Home"
                        >
                            {/* Logo */}
                            <img src="/SquadChoice.svg" alt="Logo" style={{ height: '40px' }} />
                            {/* Title & Session ID */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, lineHeight: 1 }}>
                                    Squad<span className="text-gradient">Choice</span>
                                </h2>
                                <span style={{ fontSize: '1rem', opacity: 0.5, lineHeight: 1, marginTop: '4px' }}>#{sessionId.slice(0, 8)}</span>
                            </div>
                        </div>

                        {/* Mobile User Controls (Row 1 Right) */}
                        <div className="mobile-flex" style={{ marginLeft: 'auto', alignItems: 'center', gap: '8px' }}>
                            {/* Active User Indicator (Me) */}
                            <div className="avatar-stack" style={{ background: currentUser.color, width: '38px', height: '38px', border: '2px solid var(--accent-color)' }} title="You">
                                {currentUser.name.substring(0, 2).toUpperCase()}
                            </div>

                            <button className="btn-icon" onClick={handleLogout} title="Leave Session" style={{ width: '38px', height: '38px', background: '#333' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Users List & Share & Me */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn-icon" onClick={() => {
                            const allGames = (session.games || []).filter(g => g.status !== 'played');
                            const votedGames = allGames.filter(g => g.votes && g.votes.length > 0);

                            // Case 1: No games at all
                            if (allGames.length === 0) {
                                alert("🎰 Spin Wheel Unavailable\n\nNo games have been added yet.\nAdd some games using the search bar first!");
                                return;
                            }

                            // Case 2: No votes yet
                            if (votedGames.length === 0) {
                                alert("🎰 Spin Wheel Unavailable\n\nNo one has voted yet!\nClick on games to cast your vote.");
                                return;
                            }

                            // Case 3: Only 1 game has votes
                            if (votedGames.length === 1) {
                                alert(`🏆 Clear Winner: "${votedGames[0].title}"\n\nOnly one game has votes, so it wins by default!\nThe spin wheel is only needed when there's a tie to break.`);
                                return;
                            }

                            // Group games by vote count
                            const voteGroups = {};
                            votedGames.forEach(g => {
                                const count = g.votes.length;
                                if (!voteGroups[count]) voteGroups[count] = [];
                                voteGroups[count].push(g);
                            });

                            // Get sorted vote counts (descending)
                            const sortedCounts = Object.keys(voteGroups).map(Number).sort((a, b) => b - a);
                            const topVotes = sortedCounts[0];
                            let pool = [...voteGroups[topVotes]];

                            // Case 4: One clear leader with most votes
                            if (pool.length === 1) {
                                const leader = pool[0];

                                // Check if second tier can be used for a spin
                                if (sortedCounts.length > 1) {
                                    const secondTier = voteGroups[sortedCounts[1]];
                                    if (secondTier.length >= 2) {
                                        // Use second tier for runner-up decision
                                        pool = [...secondTier];
                                    } else {
                                        // Not enough in second tier either
                                        alert(`🏆 Clear Winner: "${leader.title}"\n\nThis game leads with ${topVotes} vote${topVotes > 1 ? 's' : ''} and there's no tie to break.\nThe spin wheel is only needed when multiple games are tied.`);
                                        return;
                                    }
                                } else {
                                    // Only one tier exists
                                    alert(`🏆 Clear Winner: "${leader.title}"\n\nThis game leads with ${topVotes} vote${topVotes > 1 ? 's' : ''} and there's no tie to break.\nThe spin wheel is only needed when multiple games are tied.`);
                                    return;
                                }
                            }

                            // Final check: pool must have at least 2 games
                            if (pool.length < 2) {
                                alert("🎰 Spin Wheel Unavailable\n\nNot enough games are tied.\nThe wheel needs at least 2 games with the same number of votes.");
                                return;
                            }

                            setSpinPool(pool);
                            setShowSpinWheel(true);
                        }} title="Spin Wheel" style={{ width: '38px', height: '38px', background: '#333' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>casino</span>
                        </button>

                        <div className="desktop-only" style={{ width: '1px', height: '20px', background: '#333', margin: '0 0.5rem' }}></div>

                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Active User Indicator (Me) */}
                            <div className="avatar-stack" style={{ background: currentUser.color, width: '38px', height: '38px', border: '2px solid var(--accent-color)' }} title="You">
                                {currentUser.name.substring(0, 2).toUpperCase()}
                            </div>

                            <button className="btn-icon" onClick={handleLogout} title="Leave Session" style={{ width: '38px', height: '38px', background: '#333' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                            </button>

                            <div style={{ width: '1px', height: '20px', background: '#333', margin: '0 0.5rem' }}></div>
                        </div>

                        <div className="avatar-group"
                            onClick={(e) => handleShowUsers(e, "All Players", null, true)}
                            style={{ cursor: 'pointer' }}
                            title="Show all players">
                            {isCompact ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                    <span className="material-symbols-outlined">group</span>
                                    <span>{session.users?.length || 0}</span>
                                </div>
                            ) : (
                                (session.users || []).map(u => (
                                    <div key={u.id} className="avatar-stack" title={u.name} style={{ background: u.color }}>
                                        {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                ))
                            )}
                            {!isCompact && (
                                <div className="avatar-stack total">
                                    {(session.users || []).length}
                                </div>
                            )}
                        </div>

                        <button className="btn-secondary desktop-only" onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', padding: '0 1rem', fontSize: '0.9rem', borderRadius: '50px', background: '#333', border: 'none', color: 'white' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>ios_share</span>
                            <span>Invite</span>
                        </button>

                        <button className="btn-icon mobile-only" onClick={handleShare} title="Invite" style={{ width: '38px', height: '38px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>ios_share</span>
                        </button>
                    </div>
                </div>

                {/* Greeting Row */}
                <div style={{ marginTop: '1rem', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 500, margin: 0, lineHeight: 1.1 }}>
                        Hey <span className="text-gradient" style={{ fontWeight: 'bold' }}>{currentUser.name}</span>,<br />
                        <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>what are we playing?</span>
                    </h1>
                </div>

                {/* Toast Notification */}
                {showCopyToast && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%',
                        display: 'flex', justifyContent: 'center',
                        zIndex: 9999, pointerEvents: 'none'
                    }}>
                        <div className="animate-fade-in" style={{
                            marginTop: '80px',
                            background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem',
                            borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto'
                        }}>
                            <span className="material-symbols-outlined">check_circle</span>
                            Link copied to clipboard!
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 50 }}>
                    <div className="search-container">
                        <span className="material-symbols-outlined" style={{ color: 'var(--text-secondary)' }}>search</span>
                        <input
                            className="search-input"
                            placeholder="Add a game to the list..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ marginLeft: '1rem' }}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="glass-panel" style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            marginTop: '0.5rem', borderRadius: '0.5rem', maxHeight: '400px', overflowY: 'auto',
                            border: '1px solid var(--border-color)', background: '#1a1a1a'
                        }}>
                            {searchResults.map(game => (
                                <div key={game.id}
                                    onClick={() => handleAddGame(game)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem', cursor: 'pointer',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {game.tiny_image && <img src={game.tiny_image} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} alt="" />}
                                    <span>{game.name}</span>
                                    <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '0.8rem' }}>Add</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Games Grid */}
                {/* SpinWheel REMOVED */}

                <h2 style={{ marginBottom: '1rem' }}>🔥 Hot Picks ({activeGames.length})</h2>
                <div className="game-grid">
                    {activeGames.map(game => (
                        <div key={game.id} className={`game-card ${game.votes.includes(currentUser.id) ? 'selected' : ''}`}
                            onClick={() => handleVote(game.id)}>

                            <img src={game.cover || 'https://placehold.co/300x400/222/999?text=No+Cover'} className="game-card-img" alt={game.title} />
                            <div className="card-overlay-bottom"></div>

                            {/* Votes Indicator */}
                            <div className="avatar-group-top">
                                {game.votes.slice(0, 3).map((voterId, i) => {
                                    const userObj = users.find(u => u.id === voterId);
                                    // Fallback if user left but vote remains (though we clean it up now)
                                    if (!userObj) return null;
                                    return (
                                        <div key={i} className="avatar-stack" style={{ background: userObj?.color || '#555', fontSize: '0.6rem' }} title={userObj.name}>
                                            {userObj.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    );
                                })}
                                {game.votes.length > 3 && (
                                    <div className="avatar-stack" style={{ background: '#333' }}>+{game.votes.length - 3}</div>
                                )}
                            </div>

                            <div className="card-content">
                                <div className="game-title">{game.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    🔥 {game.votes.length} • added by {game.addedBy}
                                </div>

                                <div className="card-actions">
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleStatusToggle(game.id); }} title="Mark as played">
                                        <span className="material-symbols-outlined">sports_esports</span>
                                    </button>
                                    <button className="btn-icon" onClick={(e) => handleShowUsers(e, `Voters for ${game.title}`, game.votes)} title="Show Voters">
                                        <span className="material-symbols-outlined">bar_chart</span>
                                    </button>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }} title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Played Games Section */}
                {playedGames.length > 0 && (
                    <div style={{ marginTop: '4rem', opacity: 0.6 }}>
                        <h2 style={{ marginBottom: '1rem' }}>🏆 Already Played</h2>
                        <div className="game-grid">
                            {playedGames.map(game => (
                                <div key={game.id} className="game-card" style={{ filter: 'grayscale(1)' }}>
                                    <img src={game.cover} className="game-card-img" alt="" />
                                    <div className="card-content">
                                        <div className="game-title">{game.title}</div>
                                        <button className="btn-icon" onClick={() => handleStatusToggle(game.id)}>
                                            <span className="material-symbols-outlined">undo</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <footer style={{ marginTop: '3rem', paddingBottom: '2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <DonateButton />
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '-0.5rem' }}>
                        Open Source on <a href="https://github.com/xhizorsz/squad-choice" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>GitHub</a> • <a href="https://github.com/xhizorsz/squad-choice/issues/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Report a Bug</a>
                    </p>
                </footer>

                {showSpinWheel && (
                    <SpinWheel
                        games={spinPool}
                        onClose={() => setShowSpinWheel(false)}
                    />
                )}

                {modalData && (
                    <UserListModal
                        title={modalData.title}
                        users={modalData.users}
                        currentUser={currentUser}
                        onSwitchUser={modalData.canSwitch ? handleSwitchToUser : null}
                        onClose={() => setModalData(null)}
                    />
                )}
            </div>
        </div >
    );
};

export default OverviewPage;
