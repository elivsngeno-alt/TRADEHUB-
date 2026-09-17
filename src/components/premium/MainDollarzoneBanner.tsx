import React from 'react';
import lionLogo from '@/assets/images/lion_logo_1789599001445.jpg';
import './premium-dollarzone-banner.scss';

export const MainDollarzoneBanner: React.FC = () => {
    return (
        <div className="elisy-dollarzone-banner">
            <div className="elisy-dollarzone-banner__glow" />
            <div className="elisy-dollarzone-banner__content">
                <div className="elisy-dollarzone-banner__lion-col">
                    <div className="elisy-dollarzone-banner__lion-frame">
                        <img src={lionLogo} alt="ELISY254 Lion Graphic" className="elisy-dollarzone-banner__lion-img" />
                        <svg className="elisy-dollarzone-banner__lion-crown-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 5 L63 35 L95 35 L69 54 L79 85 L50 65 L21 85 L31 54 L5 35 L37 35 Z" fill="url(#crownGradient)" stroke="#ffd700" strokeWidth="2" />
                            <defs>
                                <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="50%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <div className="elisy-dollarzone-banner__text-col">
                    <div className="elisy-dollarzone-banner__badges">
                        <span className="elisy-badge elisy-badge--green">⚡ OFFICIAL TRADING HUB</span>
                        <span className="elisy-badge elisy-badge--gold">👑 HIGH WIN-RATE ALGORITHMS</span>
                        <span className="elisy-badge elisy-badge--dark">100% AUTOMATED BOT ENGINE</span>
                    </div>

                    <h1 className="elisy-dollarzone-banner__title">
                        WELCOME TO <span className="elisy-text-gradient">ELISY254 DOLLARZONE</span>
                    </h1>

                    <p className="elisy-dollarzone-banner__subtitle">
                        Build, test, load, and execute Deriv strategy XML bots with high precision, automated risk controls, and live market analytics.
                    </p>

                    <div className="elisy-dollarzone-banner__stats">
                        <div className="elisy-stat-chip">
                            <span className="elisy-stat-chip__dot green-pulse" />
                            <span className="elisy-stat-chip__label">WebSocket API:</span>
                            <strong>Connected Live</strong>
                        </div>
                        <div className="elisy-stat-chip">
                            <span className="elisy-stat-chip__icon">🦁</span>
                            <span className="elisy-stat-chip__label">Dollarzone Strategy Engine:</span>
                            <strong>Active v2.5</strong>
                        </div>
                        <div className="elisy-stat-chip">
                            <span className="elisy-stat-chip__icon">📊</span>
                            <span className="elisy-stat-chip__label">Free Bots Library:</span>
                            <strong>XML Strategies Loaded</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainDollarzoneBanner;
