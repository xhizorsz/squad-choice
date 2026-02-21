import React, { useRef, useEffect } from 'react';

const UserListModal = ({ title, users, currentUser, onSwitchUser, onClose }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                    <button className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {users.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            No users found.
                        </div>
                    ) : (
                        users.map(user => {
                            const isMe = currentUser && user.id === currentUser.id;
                            return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="avatar-stack" style={{
                                        background: user.color,
                                        width: '40px', height: '40px', fontSize: '1rem',
                                        position: 'static', margin: 0 // Reset stack styles
                                    }}>
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '1rem', fontWeight: 500, flex: 1 }}>
                                        {user.name} {isMe && <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>(You)</span>}
                                    </span>

                                    {onSwitchUser && !isMe && (
                                        <button
                                            className="btn-icon"
                                            onClick={() => onSwitchUser(user)}
                                            title="Switch to this user"
                                            style={{ width: '32px', height: '32px', background: 'var(--border-color)' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
