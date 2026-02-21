import React, { useEffect } from 'react';

const DonateButton = () => {
    useEffect(() => {
        // Load the PayPal SDK script dynamically
        const script = document.createElement('script');
        script.src = 'https://www.paypalobjects.com/donate/sdk/donate-sdk.js';
        script.charset = 'UTF-8';
        script.async = true;

        script.onload = () => {
            // Render the button once the SDK is loaded
            if (window.PayPal && window.PayPal.Donation && window.PayPal.Donation.Button) {
                // Check if button already rendered to prevent duplicates in StrictMode
                const container = document.getElementById('donate-button');
                if (container && container.innerHTML.trim() === '') {
                    window.PayPal.Donation.Button({
                        env: 'production',
                        hosted_button_id: '6N8J9CWLVZL9U',
                        image: {
                            src: 'https://pics.paypal.com/00/s/YmQ1ZGRlYjctMGJhMC00NzIwLTgzM2QtYzIyZDQ3NzI5MjNj/file.PNG',
                            alt: 'Donate with PayPal button',
                            title: 'PayPal - The safer, easier way to pay online!',
                        }
                    }).render('#donate-button');
                }
            }
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup script on unmount
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return (
        <div id="donate-button-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
            <div id="donate-button"></div>
            <p style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)', maxWidth: '400px', margin: 0, lineHeight: 1.5, opacity: 0.8 }}>
                Saved your game night? Drop some coffee loot for the dev! ☕🎮
            </p>
        </div>
    );
};

export default DonateButton;
