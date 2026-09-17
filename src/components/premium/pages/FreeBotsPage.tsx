import React, { useEffect, useRef, useState } from 'react';
import lionLogo from '@/assets/images/lion_logo_1789599001445.jpg';
import { loadStrategyToBotBuilder } from '@/utils/bot-loader-utils';
import { getYouTubeEmbedUrl } from '@/utils/youtube-helper';
import { DownloadIcon } from '../icons';

export type UserBotItem = {
    id: string;
    name: string;
    fileName: string;
    xmlContent: string;
    addedAt: string;
    description?: string;
    imageUrl?: string;
    youtubeUrl?: string;
    tags?: string;
    category?: string;
    disabled?: boolean;
};

const STORAGE_KEY = 'user_custom_bots_library';
const LAYOUT_STORAGE_KEY = 'user_bots_display_layout';

const SAMPLE_XML = `<xml xmlns="http://www.w3.org/1999/xhtml" collection="false">
  <block type="trade_definition" id="trade_def" x="0" y="0">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">R_100</field>
      </block>
    </statement>
  </block>
</xml>`;

export const DEFAULT_FEATURED_BOTS: UserBotItem[] = [
    {
        id: 'default-bot-1',
        name: 'ELISY254 Lion Volatility 100 Pro',
        fileName: 'elisy254_volatility100_pro.xml',
        xmlContent: SAMPLE_XML,
        addedAt: new Date().toLocaleDateString(),
        description: 'Automated Volatility 100 strategy with intelligent market trend analysis, dynamic stake management, and built-in stop loss safeguards.',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        tags: 'HIGH WIN RATE',
        category: 'Volatility 100',
    },
    {
        id: 'default-bot-2',
        name: 'ELISY254 Dollarzone Rise/Fall Scalper',
        fileName: 'elisy254_rise_fall_scalper.xml',
        xmlContent: SAMPLE_XML,
        addedAt: new Date().toLocaleDateString(),
        description: 'Fast tick scalper bot for Rise/Fall contracts with tick duration optimization and automatic martingale recovery control.',
        imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: 'RISE / FALL',
        category: 'Scalper',
    },
    {
        id: 'default-bot-3',
        name: 'ELISY254 Digit Differs SafeGuard',
        fileName: 'elisy254_digit_differs_safe.xml',
        xmlContent: SAMPLE_XML,
        addedAt: new Date().toLocaleDateString(),
        description: 'High-probability Digit Differs bot strategy with consecutive digit pattern scanning and risk management cap.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
        tags: 'DIGIT DIFFERS',
        category: 'Digits',
    },
];

export const FreeBotsPage = ({ openBotBuilder }: { openBotBuilder?: () => void }) => {
    const [userBots, setUserBots] = useState<UserBotItem[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Failed reading user bots from storage', e);
        }
        return [];
    });

    const [displayMode, setDisplayMode] = useState<'horizontal' | 'grid'>(() => {
        try {
            const mode = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (mode === 'grid' || mode === 'horizontal') return mode;
        } catch (e) {
            // ignore
        }
        return 'horizontal'; // Default to horizontal slider line
    });

    const [busyId, setBusyId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [activeVideoModalUrl, setActiveVideoModalUrl] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');

    const sliderRef = useRef<HTMLDivElement | null>(null);

    // Sync localStorage changes from Admin Panel
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved !== null) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setUserBots(parsed);
                }
                const layout = localStorage.getItem(LAYOUT_STORAGE_KEY);
                if (layout === 'grid' || layout === 'horizontal') setDisplayMode(layout);
            } catch (e) {
                // ignore
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLoadBot = async (bot: UserBotItem) => {
        if (!openBotBuilder) return;
        setBusyId(bot.id);
        setErrorMessage('');
        setStatusMessage('');

        try {
            await loadStrategyToBotBuilder(bot.xmlContent, bot.fileName, openBotBuilder);
            setStatusMessage(`Loaded "${bot.name}" into Bot Builder workspace!`);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : String(err));
        } finally {
            setBusyId('');
        }
    };

    const handleDownloadXml = (bot: UserBotItem) => {
        const blob = new Blob([bot.xmlContent], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = bot.fileName.endsWith('.xml') ? bot.fileName : `${bot.fileName}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const scrollSlider = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Filter out disabled bots for regular users
    const filteredBots = userBots.filter(bot => !bot.disabled);

    return (
        <div className='prodb-free-bots' style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 20px 80px' }}>
            {/* Notifications */}
            {statusMessage && (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
                    ✓ {statusMessage}
                </div>
            )}
            {errorMessage && (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fee2e2', color: '#b91c1c', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
                    ⚠ {errorMessage}
                </div>
            )}

            {/* Empty State */}
            {filteredBots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--site-card-bg, #f8fafc)', borderRadius: 12, border: '1px solid var(--site-border, #e2e8f0)' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--site-text-muted, #64748b)', margin: '0 0 8px' }}>
                        No Active Strategy Bots Available
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--site-text-muted, #94a3b8)', margin: 0 }}>
                        Try adjusting your search filter or check back later for new strategy releases.
                    </p>
                </div>
            ) : displayMode === 'horizontal' ? (
                /* HORIZONTAL SLIDER LINE LAYOUT */
                <div style={{ position: 'relative' }}>
                    {/* Navigation Buttons */}
                    <button
                        type='button'
                        onClick={() => scrollSlider('left')}
                        title='Scroll Left'
                        style={{
                            position: 'absolute',
                            left: -16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#059669',
                            color: '#ffffff',
                            border: '2px solid #ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            cursor: 'pointer',
                            fontSize: 18,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ‹
                    </button>

                    <button
                        type='button'
                        onClick={() => scrollSlider('right')}
                        title='Scroll Right'
                        style={{
                            position: 'absolute',
                            right: -16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 10,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#059669',
                            color: '#ffffff',
                            border: '2px solid #ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            cursor: 'pointer',
                            fontSize: 18,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ›
                    </button>

                    <div
                        ref={sliderRef}
                        style={{
                            display: 'flex',
                            gap: 20,
                            overflowX: 'auto',
                            scrollBehavior: 'smooth',
                            padding: '8px 4px 24px',
                            scrollbarWidth: 'thin',
                            scrollSnapType: 'x mandatory',
                        }}
                    >
                        {filteredBots.map(bot => {
                            const embedVideoUrl = getYouTubeEmbedUrl(bot.youtubeUrl);
                            return (
                                <article
                                    key={bot.id}
                                    style={{
                                        flex: '0 0 320px',
                                        width: 320,
                                        scrollSnapAlign: 'start',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 14,
                                        overflow: 'hidden',
                                        border: '1px solid var(--site-border, #cbd5e1)',
                                        background: 'var(--site-card-bg, #ffffff)',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                >
                                    {/* Thumbnail / Cover */}
                                    <div style={{ position: 'relative', height: 160, width: '100%', background: '#0f172a', overflow: 'hidden' }}>
                                        <img
                                            src={bot.imageUrl || lionLogo}
                                            alt={bot.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bot.imageUrl ? 0.95 : 0.6 }}
                                        />
                                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                                            <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                                                {bot.tags || 'STRATEGY BOT'}
                                            </span>
                                        </div>

                                        {/* YouTube Video Overlay Badge if available */}
                                        {embedVideoUrl && (
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    setActiveVideoModalUrl(embedVideoUrl);
                                                    setActiveVideoTitle(bot.name);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 10,
                                                    right: 10,
                                                    background: 'rgba(220, 38, 38, 0.95)',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    padding: '4px 10px',
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                }}
                                            >
                                                ▶ Watch Tutorial
                                            </button>
                                        )}
                                    </div>

                                    {/* Bot Details */}
                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <small style={{ color: 'var(--site-text-muted, #64748b)', fontSize: 11 }}>Added: {bot.addedAt}</small>
                                        <h3 style={{ fontSize: 17, fontWeight: 800, margin: '6px 0 8px', color: 'var(--site-text, #0f172a)' }}>
                                            {bot.name}
                                        </h3>
                                        <p style={{ fontSize: 13, color: 'var(--site-text-muted, #64748b)', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                                            {bot.description || 'No description provided.'}
                                        </p>

                                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                            <button
                                                className='prodb-load-bot'
                                                disabled={busyId === bot.id}
                                                onClick={() => handleLoadBot(bot)}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    padding: '10px',
                                                    background: '#059669',
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {busyId === bot.id ? 'LOADING…' : 'LOAD BOT'} <DownloadIcon />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => handleDownloadXml(bot)}
                                                title='Export XML file'
                                                style={{
                                                    padding: '0 12px',
                                                    borderRadius: 8,
                                                    border: '1px solid var(--site-border, #cbd5e1)',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                }}
                                            >
                                                💾
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* GRID LAYOUT */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {filteredBots.map(bot => {
                        const embedVideoUrl = getYouTubeEmbedUrl(bot.youtubeUrl);
                        return (
                            <article
                                key={bot.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    border: '1px solid var(--site-border, #cbd5e1)',
                                    background: 'var(--site-card-bg, #ffffff)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <div style={{ position: 'relative', height: 160, width: '100%', background: '#0f172a', overflow: 'hidden' }}>
                                    <img
                                        src={bot.imageUrl || lionLogo}
                                        alt={bot.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bot.imageUrl ? 0.95 : 0.6 }}
                                    />
                                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                                        <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                                            {bot.tags || 'STRATEGY BOT'}
                                        </span>
                                    </div>

                                    {embedVideoUrl && (
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setActiveVideoModalUrl(embedVideoUrl);
                                                setActiveVideoTitle(bot.name);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                bottom: 10,
                                                right: 10,
                                                background: 'rgba(220, 38, 38, 0.95)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '4px 10px',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                            }}
                                        >
                                            ▶ Watch Tutorial
                                        </button>
                                    )}
                                </div>

                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <small style={{ color: 'var(--site-text-muted, #64748b)', fontSize: 11 }}>Added: {bot.addedAt}</small>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '6px 0 8px', color: 'var(--site-text, #0f172a)' }}>
                                        {bot.name}
                                    </h3>
                                    <p style={{ fontSize: 13, color: 'var(--site-text-muted, #64748b)', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                                        {bot.description || 'No description provided.'}
                                    </p>

                                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                        <button
                                            className='prodb-load-bot'
                                            disabled={busyId === bot.id}
                                            onClick={() => handleLoadBot(bot)}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                padding: '10px',
                                                background: '#059669',
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {busyId === bot.id ? 'LOADING…' : 'LOAD BOT'} <DownloadIcon />
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleDownloadXml(bot)}
                                            title='Export XML file'
                                            style={{
                                                padding: '0 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--site-border, #cbd5e1)',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                fontSize: 14,
                                            }}
                                        >
                                            💾
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* YouTube Video Tutorial Modal */}
            {activeVideoModalUrl && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        background: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                    }}
                    onClick={() => setActiveVideoModalUrl(null)}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 800,
                            background: '#0f172a',
                            borderRadius: 16,
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 16, fontWeight: 700 }}>
                                🎬 Video Strategy Tutorial: {activeVideoTitle}
                            </h3>
                            <button
                                type='button'
                                onClick={() => setActiveVideoModalUrl(null)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src={`${activeVideoModalUrl}?autoplay=1`}
                                title={activeVideoTitle}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreeBotsPage;
