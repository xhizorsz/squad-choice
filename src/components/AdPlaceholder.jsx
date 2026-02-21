import React from 'react';

const AdPlaceholder = () => {
    // In production, this would load the ad script.
    // For now, it keeps the space reserved.
    return (
        <div style={{
            width: '100%',
            height: '100px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.8rem',
            margin: '2rem 0'
        }}>
            Werbung
        </div>
    );
};

export default AdPlaceholder;
