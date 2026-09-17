import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { LockIcon, ShieldIcon } from '../icons';
import { DEFAULT_THEME_COLORS, NAVIGATION_CATALOG } from '../site-customization';
import type { PremiumSection } from '../types';
import { DEFAULT_COMMISSION_LOGS, DEFAULT_MOCK_USERS, THEME_PRESETS, type UserSessionItem } from './admin-data';
import { DEFAULT_FEATURED_BOTS, type UserBotItem } from './FreeBotsPage';
import './admin-panel.scss';

type AdminTab = 'users' | 'earnings' | 'branding' | 'risk' | 'bots' | 'api' | 'diagnostics';

const ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL,
    ...(process.env.ADMIN_EMAILS || '').split(','),
]
    .map(value => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));
const ENV_ADMIN_EMAIL = ADMIN_EMAILS[0] || '';
const ADMIN_SESSION_KEY = 'admin_authenticated_until';
const ADMIN_SESSION_TTL_MS = 30 * 60 * 1000;

const getAdminSessionExpiry = () => {
    const expiry = Number(sessionStorage.getItem(ADMIN_SESSION_KEY) || 0);
    return Number.isFinite(expiry) && expiry > Date.now() ? expiry : 0;
};

interface AdminPanelPageProps {
    onExit?: () => void;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = observer(({ onExit }) => {
    const [isUnlocked, setIsUnlocked] = useState(() => {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_unlocked');
        return Boolean(getAdminSessionExpiry());
    });
    const [adminEmailInput, setAdminEmailInput] = useState(() => localStorage.getItem('admin_email_login') || ENV_ADMIN_EMAIL);
    const [adminPassInput, setAdminPassInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    // Signed-In Users
    const [userSessions, setUserSessions] = useState<UserSessionItem[]>(() => {
        try {
            const saved = localStorage.getItem('admin_user_sessions');
            if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length) return parsed; }
        } catch (e) { console.error('Failed reading user sessions', e); }
        return DEFAULT_MOCK_USERS;
    });

    // Affiliate Settings
    const [affiliateToken, setAffiliateToken] = useState(() => localStorage.getItem('admin_affiliate_token') || 'DERIV_AFF_98124');
    const [affiliateAppId, setAffiliateAppId] = useState(() => localStorage.getItem('admin_affiliate_app_id') || '1089');
    const [markupRate, setMarkupRate] = useState(() => localStorage.getItem('admin_markup_rate') || '1.5');
    const [payoutSchedule, setPayoutSchedule] = useState(() => localStorage.getItem('admin_payout_schedule') || 'Weekly');

    // Ledger Logs
    const [commissionLogs] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_commission_logs');
            if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length) return parsed; }
        } catch (e) { console.error('Failed reading commission logs', e); }
        return DEFAULT_COMMISSION_LOGS;
    });

    // Manual User Form
    const [newUserId, setNewUserId] = useState('');
    const [newUserType, setNewUserType] = useState<'Real' | 'Demo'>('Real');
    const [newUserBalance, setNewUserBalance] = useState('500');

    // Bot Library Config
    const [editingBotId, setEditingBotId] = useState<string | null>(null);
    const [adminBotName, setAdminBotName] = useState('');
    const [adminBotDescription, setAdminBotDescription] = useState('');
    const [adminBotImageUrl, setAdminBotImageUrl] = useState('');
    const [adminBotYoutubeUrl, setAdminBotYoutubeUrl] = useState('');
    const [adminBotTags, setAdminBotTags] = useState('HIGH WIN RATE');
    const [adminBotCategory, setAdminBotCategory] = useState('Volatility Indices');
    const [adminBotXmlContent, setAdminBotXmlContent] = useState('');
    const [adminBotXmlFileName, setAdminBotXmlFileName] = useState('');
    const [adminBotDisabled, setAdminBotDisabled] = useState(false);

    const [adminBotsList, setAdminBotsList] = useState<UserBotItem[]>(() => {
        try {
            const saved = localStorage.getItem('user_custom_bots_library');
            if (saved !== null) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; }
        } catch (e) { console.error('Failed reading bots', e); }
        return DEFAULT_FEATURED_BOTS;
    });

    // Branding & Navigation
    const [colors, setColors] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_panel_config');
            if (saved) { const parsed = JSON.parse(saved); if (parsed.colors) return { ...DEFAULT_THEME_COLORS, ...parsed.colors }; }
        } catch (e) { console.error('Failed reading config', e); }
        return { ...DEFAULT_THEME_COLORS };
    });

    const [navigation, setNavigation] = useState<PremiumSection[]>(() => {
        try {
            const saved = localStorage.getItem('admin_panel_config');
            if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed.navigation)) return parsed.navigation; }
        } catch (e) { console.error('Failed reading nav config', e); }
        return NAVIGATION_CATALOG.map(item => item.id);
    });

    // Risk
    const [killSwitch, setKillSwitch] = useState(() => localStorage.getItem('admin_kill_switch') === 'true');
    const [maxLossLimit, setMaxLossLimit] = useState(() => localStorage.getItem('admin_max_loss') || '100');
    const [maxStakeCap, setMaxStakeCap] = useState(() => localStorage.getItem('admin_max_stake') || '50');

    // API & Server
    const [serverEndpoint, setServerEndpoint] = useState(() => localStorage.getItem('admin_ws_endpoint') || 'wss://ws.derivws.com/websockets/v3');
    const [appId, setAppId] = useState(() => localStorage.getItem('admin_app_id') || '1089');
    const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [pingResult, setPingResult] = useState<string | null>(null);
    const [pinging, setPinging] = useState(false);

    // Diagnostics
    const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([
        { time: new Date().toLocaleTimeString(), text: 'System diagnostics active.', type: 'info' },
        { time: new Date().toLocaleTimeString(), text: 'Deriv WebSocket & Commission API active.', type: 'success' },
    ]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        const email = adminEmailInput.trim();
        const pass = adminPassInput.trim();
        if (!email) return setAuthError('Please enter admin email.');
        if (!pass) return setAuthError('Please enter admin password.');

        const isEmailValid = ADMIN_EMAILS.includes(email.toLowerCase());
        const configuredPassword = process.env.ADMIN_PASSWORD || '';
        const isPassValid = Boolean(configuredPassword) && pass === configuredPassword;

        if (isEmailValid && isPassValid) {
            setIsUnlocked(true);
            sessionStorage.setItem(ADMIN_SESSION_KEY, String(Date.now() + ADMIN_SESSION_TTL_MS));
            localStorage.setItem('admin_email_login', email);
            setAuthError('');
            window.dispatchEvent(new CustomEvent('admin_config_updated'));
            showToast('✓ Admin Console authenticated successfully.');
        } else {
            setAuthError('Invalid admin email or password. Please verify credentials.');
        }
    };

    const handleLock = () => {
        setIsUnlocked(false);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_unlocked');
        window.dispatchEvent(new CustomEvent('admin_config_updated'));
    };

    const handleKillSwitchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setKillSwitch(checked);
        localStorage.setItem('admin_kill_switch', String(checked));
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: checked ? 'EMERGENCY KILL SWITCH ACTIVATED!' : 'Kill switch deactivated.', type: checked ? 'error' : 'warn' }]);
        showToast(checked ? '⚠ Emergency Kill Switch Activated!' : '✓ Kill switch deactivated.');
    };

    const handlePingTest = () => {
        setPinging(true);
        setPingResult('Testing ping...');
        const startTime = Date.now();
        try {
            const ws = new WebSocket(`${serverEndpoint}?app_id=${appId}`);
            ws.onopen = () => {
                const latency = Date.now() - startTime;
                setPingResult(`Connected! Ping: ${latency} ms`);
                setPinging(false);
                ws.close();
            };
            ws.onerror = () => { setPingResult('Failed socket connection.'); setPinging(false); };
        } catch { setPingResult('Invalid socket URL.'); setPinging(false); }
    };

    // Save Bot Strategy with direct image upload & video link support
    const handleSaveBot = () => {
        if (!adminBotName.trim()) return alert('Please enter Bot Strategy Name.');
        if (!adminBotXmlContent.trim()) return alert('Please select or upload a Blockly XML strategy file.');

        if (editingBotId) {
            const updated = adminBotsList.map(b => b.id === editingBotId ? {
                ...b,
                name: adminBotName.trim(),
                fileName: adminBotXmlFileName || b.fileName,
                xmlContent: adminBotXmlContent,
                description: adminBotDescription.trim() || 'Custom strategy configured via Admin.',
                imageUrl: adminBotImageUrl.trim(),
                youtubeUrl: adminBotYoutubeUrl.trim(),
                tags: adminBotTags.trim() || 'STRATEGY',
                category: adminBotCategory.trim() || 'Custom',
                disabled: adminBotDisabled,
            } : b);
            setAdminBotsList(updated);
            localStorage.setItem('user_custom_bots_library', JSON.stringify(updated));
            showToast(`✓ Strategy Bot "${adminBotName.trim()}" updated successfully!`);
        } else {
            const newBot: UserBotItem = {
                id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: adminBotName.trim(),
                fileName: adminBotXmlFileName || `${adminBotName.toLowerCase().replace(/\s+/g, '_')}.xml`,
                xmlContent: adminBotXmlContent,
                addedAt: new Date().toLocaleDateString(),
                description: adminBotDescription.trim() || 'Custom strategy configured via Admin.',
                imageUrl: adminBotImageUrl.trim(),
                youtubeUrl: adminBotYoutubeUrl.trim(),
                tags: adminBotTags.trim() || 'ADMIN BOT',
                category: adminBotCategory.trim() || 'Custom',
                disabled: adminBotDisabled,
            };
            const updated = [newBot, ...adminBotsList];
            setAdminBotsList(updated);
            localStorage.setItem('user_custom_bots_library', JSON.stringify(updated));
            showToast(`✓ Strategy Bot "${newBot.name}" added to platform library!`);
        }

        // Reset form
        setEditingBotId(null);
        setAdminBotName('');
        setAdminBotDescription('');
        setAdminBotImageUrl('');
        setAdminBotYoutubeUrl('');
        setAdminBotTags('HIGH WIN RATE');
        setAdminBotCategory('Volatility Indices');
        setAdminBotXmlContent('');
        setAdminBotXmlFileName('');
        setAdminBotDisabled(false);
    };

    // Direct image file upload handler (converts file to data URL)
    const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Image file size should be less than 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setAdminBotImageUrl(ev.target.result as string);
                showToast('✓ Direct image file loaded successfully!');
            }
        };
        reader.readAsDataURL(file);
    };

    // Explicit Save Handlers for other settings cards
    const handleSaveAffiliate = () => {
        localStorage.setItem('admin_affiliate_token', affiliateToken.trim());
        localStorage.setItem('admin_affiliate_app_id', affiliateAppId.trim());
        localStorage.setItem('admin_markup_rate', markupRate.trim());
        localStorage.setItem('admin_payout_schedule', payoutSchedule);
        showToast('✓ Deriv Affiliate settings saved successfully!');
    };

    const handleSaveBranding = () => {
        const config = { colors, navigation };
        localStorage.setItem('admin_panel_config', JSON.stringify(config));
        window.dispatchEvent(new CustomEvent('admin_config_updated'));
        window.dispatchEvent(new CustomEvent('site_customization_updated'));
        showToast('✓ Navigation & Branding settings saved!');
    };

    const handleSaveRisk = () => {
        localStorage.setItem('admin_max_loss', maxLossLimit);
        localStorage.setItem('admin_max_stake', maxStakeCap);
        showToast('✓ Risk Management limits saved!');
    };

    const handleSaveApi = () => {
        localStorage.setItem('admin_ws_endpoint', serverEndpoint.trim());
        localStorage.setItem('admin_app_id', appId.trim());
        if (geminiApiKey) localStorage.setItem('gemini_api_key', geminiApiKey.trim());
        showToast('✓ API & Server configuration saved!');
    };

    const totalUsersCount = userSessions.length;
    const realUsersCount = userSessions.filter(u => !u.is_virtual).length;
    const demoUsersCount = userSessions.filter(u => u.is_virtual).length;
    const totalTradedVolume = userSessions.reduce((acc, u) => acc + (u.volume_traded || 0), 0);
    const totalCommissionEarned = commissionLogs.reduce((acc, c) => acc + c.commissionAmount, 0);

    if (!isUnlocked) {
        return (
            <div className='admin-panel' style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', padding: 20 }}>
                <div className='admin-panel__lock-screen' style={{ width: '100%', maxWidth: 460, padding: 28, background: '#1e293b', borderRadius: 16, border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><LockIcon style={{ width: 44, height: 44, color: '#10b981' }} /></div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', margin: '0 0 6px', color: '#f8fafc' }}>Admin Console Login</h2>
                    <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
                        Enter your administrator email and password to access platform controls, user management, and bot strategy configuration.
                    </p>

                    <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, fontSize: 11, color: '#10b981', marginBottom: 18, textAlign: 'center', fontWeight: 600 }}>
                        Configured administrator: {ENV_ADMIN_EMAIL || 'Set ADMIN_EMAIL in deployment variables'}
                    </div>

                    <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>Admin Email</label>
                            <input
                                type='email'
                                value={adminEmailInput}
                                onChange={e => setAdminEmailInput(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #475569', background: '#0f172a', color: '#f8fafc', fontSize: 14, outline: 'none' }}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>Admin Password</label>
                            <input
                                type='password'
                                value={adminPassInput}
                                onChange={e => setAdminPassInput(e.target.value)}
                                placeholder='Enter admin password'
                                style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #475569', background: '#0f172a', color: '#f8fafc', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        {authError && <div style={{ color: '#f87171', fontSize: 13, fontWeight: 600 }}>⚠ {authError}</div>}
                        <button type='submit' style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                            🔑 Sign In to Admin Console
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className='admin-panel' style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', paddingBottom: 60 }}>
            {/* Toast Floating Alert */}
            {toastMessage && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#10b981', color: '#ffffff', padding: '12px 20px', borderRadius: 8, fontWeight: 800, fontSize: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s' }}>
                    {toastMessage}
                </div>
            )}

            <header className='admin-panel__header' style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='admin-panel__header-title' style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldIcon style={{ width: 28, height: 28, color: '#10b981' }} />
                    <h1 style={{ margin: 0, fontSize: 20, color: '#f8fafc' }}>Site Admin Console</h1>
                    <span className='admin-badge' style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>Master Admin</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {onExit && (
                        <button type='button' style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #475569', background: '#334155', color: '#f8fafc', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={onExit}>
                            🚪 Exit Admin Panel
                        </button>
                    )}
                    <button type='button' className='admin-panel__tabs-btn' style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={handleLock}>
                        <LockIcon /> Lock Console
                    </button>
                </div>
            </header>

            <div className='admin-panel__kill-banner' style={{ margin: '16px 24px', padding: '14px 20px', background: killSwitch ? 'rgba(239, 68, 68, 0.15)' : '#1e293b', border: killSwitch ? '1px solid #ef4444' : '1px solid #334155', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='kill-info'>
                    <h3 style={{ margin: 0, fontSize: 15, color: killSwitch ? '#f87171' : '#f8fafc' }}>Emergency Platform Kill Switch</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{killSwitch ? 'CRITICAL: Trading bots globally suspended across all users.' : 'Status Normal: Bot execution permitted.'}</p>
                </div>
                <label className='switch danger'><input type='checkbox' checked={killSwitch} onChange={handleKillSwitchToggle} /><span className='slider' /></label>
            </div>

            <nav className='admin-panel__tabs' style={{ margin: '0 24px 20px', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'users' ? 'is-active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users ({totalUsersCount})</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'earnings' ? 'is-active' : ''}`} onClick={() => setActiveTab('earnings')}>Commission (${totalCommissionEarned.toFixed(2)})</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'bots' ? 'is-active' : ''}`} onClick={() => setActiveTab('bots')}>🤖 Bot Strategies ({adminBotsList.length})</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'branding' ? 'is-active' : ''}`} onClick={() => setActiveTab('branding')}>🎨 Branding & Menu</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'risk' ? 'is-active' : ''}`} onClick={() => setActiveTab('risk')}>🛡 Risk & Limits</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'api' ? 'is-active' : ''}`} onClick={() => setActiveTab('api')}>⚡ API & Server</button>
                <button type='button' className={`admin-panel__tabs-btn ${activeTab === 'diagnostics' ? 'is-active' : ''}`} onClick={() => setActiveTab('diagnostics')}>💻 Diagnostics</button>
            </nav>

            <div style={{ padding: '0 24px' }}>
                {activeTab === 'users' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__stats-grid'>
                            <div className='admin-panel__stat-card'><div className='stat-label'>Total Users</div><div className='stat-value emerald'>{totalUsersCount}</div></div>
                            <div className='admin-panel__stat-card'><div className='stat-label'>Real Money</div><div className='stat-value indigo'>{realUsersCount}</div></div>
                            <div className='admin-panel__stat-card'><div className='stat-label'>Demo / Virtual</div><div className='stat-value'>{demoUsersCount}</div></div>
                            <div className='admin-panel__stat-card'><div className='stat-label'>Traded Volume</div><div className='stat-value emerald'>${totalTradedVolume.toLocaleString()}</div></div>
                        </div>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Active Registered Users</h2>
                            <div className='admin-panel__table-wrapper'>
                                <table className='admin-panel__table'>
                                    <thead><tr><th>Login ID</th><th>Type</th><th>Balance</th><th>Trades</th><th>Volume</th><th>Last Active</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {userSessions.map(user => (
                                            <tr key={user.loginid}>
                                                <td className='bold'>{user.loginid}</td>
                                                <td><span className={`status-badge ${user.is_virtual ? 'demo' : 'real'}`}>{user.is_virtual ? 'Demo' : 'Real'}</span></td>
                                                <td>{user.currency} ${user.balance.toFixed(2)}</td>
                                                <td>{user.trades_count}</td>
                                                <td>${user.volume_traded.toFixed(2)}</td>
                                                <td>{user.last_seen}</td>
                                                <td><button type='button' className='btn-secondary' style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => setUserSessions(prev => prev.filter(u => u.loginid !== user.loginid))}>Remove</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Register Test User</h2>
                            <form onSubmit={e => { e.preventDefault(); if (!newUserId) return; setUserSessions([{ loginid: newUserId.toUpperCase(), currency: 'USD', is_virtual: newUserType === 'Demo', balance: parseFloat(newUserBalance) || 100, last_seen: 'Just now', signed_in_at: new Date().toLocaleString(), trades_count: 0, volume_traded: 0, status: 'Active' }, ...userSessions]); setNewUserId(''); showToast('✓ New test user added!'); }} className='admin-panel__grid'>
                                <div className='admin-panel__form-group'><label>Login ID</label><input type='text' value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder='CR981203' /></div>
                                <div className='admin-panel__form-group'><label>Type</label><select value={newUserType} onChange={e => setNewUserType(e.target.value as 'Real' | 'Demo')}><option value='Real'>Real</option><option value='Demo'>Demo</option></select></div>
                                <div className='admin-panel__form-group'><label>Balance ($)</label><input type='number' value={newUserBalance} onChange={e => setNewUserBalance(e.target.value)} /></div>
                                <div className='admin-panel__form-group' style={{ justifyContent: 'flex-end' }}><button type='submit' className='btn-primary'>+ Add User</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Deriv Affiliate & Commission Settings</h2>
                            <div className='admin-panel__grid'>
                                <div className='admin-panel__form-group'><label>Affiliate Token / ID</label><input type='text' value={affiliateToken} onChange={e => setAffiliateToken(e.target.value)} /></div>
                                <div className='admin-panel__form-group'><label>Deriv App ID</label><input type='text' value={affiliateAppId} onChange={e => setAffiliateAppId(e.target.value)} /></div>
                                <div className='admin-panel__form-group'><label>Markup Rate (%)</label><input type='number' step='0.1' value={markupRate} onChange={e => setMarkupRate(e.target.value)} /></div>
                                <div className='admin-panel__form-group'><label>Payout Schedule</label><select value={payoutSchedule} onChange={e => setPayoutSchedule(e.target.value)}><option value='Daily'>Daily</option><option value='Weekly'>Weekly</option></select></div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button type='button' className='btn-primary' style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer' }} onClick={handleSaveAffiliate}>
                                    💾 Save Affiliate Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bots' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>{editingBotId ? '✏ Edit Bot Strategy' : '➕ Add Strategy Bot'}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                <div className='admin-panel__form-group'>
                                    <label>Bot Name *</label>
                                    <input type='text' value={adminBotName} onChange={e => setAdminBotName(e.target.value)} placeholder='e.g. ELISY254 Volatility 100 Scalper' />
                                </div>
                                <div className='admin-panel__form-group'>
                                    <label>Badge Tag</label>
                                    <input type='text' value={adminBotTags} onChange={e => setAdminBotTags(e.target.value)} placeholder='HIGH WIN RATE' />
                                </div>
                                <div className='admin-panel__form-group'>
                                    <label>Category / Market</label>
                                    <input type='text' value={adminBotCategory} onChange={e => setAdminBotCategory(e.target.value)} placeholder='Volatility 100 / Rise Fall' />
                                </div>
                                <div className='admin-panel__form-group' style={{ gridColumn: '1 / -1' }}>
                                    <label>Description</label>
                                    <textarea value={adminBotDescription} onChange={e => setAdminBotDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #475569', background: '#0f172a', color: '#f8fafc', fontSize: 13 }} placeholder='Brief strategy explanation...' />
                                </div>

                                {/* Direct Image Upload & Image URL */}
                                <div className='admin-panel__form-group' style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontWeight: 800, color: '#10b981' }}>🖼 Strategy Image / Banner</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Upload Image Directly from Computer:</span>
                                            <input type='file' accept='image/*' onChange={handleImageFileUpload} style={{ fontSize: 12, color: '#cbd5e1' }} />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Or Paste Image URL:</span>
                                            <input type='text' value={adminBotImageUrl} onChange={e => setAdminBotImageUrl(e.target.value)} placeholder='https://images.unsplash.com/...' />
                                        </div>
                                    </div>
                                    {adminBotImageUrl && (
                                        <div style={{ marginTop: 8 }}>
                                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Image Preview:</span>
                                            <img src={adminBotImageUrl} alt='Bot preview' style={{ width: 120, height: 70, objectFit: 'cover', borderRadius: 8, display: 'block', marginTop: 4, border: '1px solid #475569' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Video Demo Link */}
                                <div className='admin-panel__form-group' style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontWeight: 800, color: '#f59e0b' }}>🎥 Video Demo Link (YouTube or Video URL)</label>
                                    <input type='text' value={adminBotYoutubeUrl} onChange={e => setAdminBotYoutubeUrl(e.target.value)} placeholder='https://www.youtube.com/watch?v=...' />
                                    {adminBotYoutubeUrl && (
                                        <div style={{ marginTop: 4, fontSize: 11, color: '#f59e0b' }}>
                                            ✓ Video Link Attached: {adminBotYoutubeUrl}
                                        </div>
                                    )}
                                </div>

                                {/* XML Strategy File Upload */}
                                <div className='admin-panel__form-group' style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontWeight: 800 }}>⚙ Blockly Strategy XML File *</label>
                                    <input type='file' accept='.xml' onChange={e => {
                                        const file = e.target.files?.[0]; if (!file) return; setAdminBotXmlFileName(file.name);
                                        const reader = new FileReader(); reader.onload = ev => { if (ev.target?.result) { setAdminBotXmlContent(ev.target.result as string); if (!adminBotName) setAdminBotName(file.name.replace(/\.xml$/i, '')); } }; reader.readAsText(file);
                                    }} style={{ fontSize: 12, color: '#cbd5e1' }} />
                                    {adminBotXmlFileName && <span style={{ fontSize: 11, color: '#10b981', display: 'block', marginTop: 4 }}>✓ File Loaded: {adminBotXmlFileName} ({adminBotXmlContent.length} chars)</span>}
                                </div>

                                <div className='admin-panel__form-group'>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type='checkbox' checked={adminBotDisabled} onChange={e => setAdminBotDisabled(e.target.checked)} />
                                        <span>Disable Bot Strategy</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                                <button type='button' style={{ padding: '12px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }} onClick={handleSaveBot}>
                                    💾 {editingBotId ? 'Save Bot Strategy Changes' : '+ Save Strategy Bot'}
                                </button>
                                {editingBotId && (
                                    <button type='button' style={{ padding: '12px 20px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }} onClick={() => { setEditingBotId(null); setAdminBotName(''); setAdminBotDescription(''); setAdminBotImageUrl(''); setAdminBotYoutubeUrl(''); setAdminBotXmlContent(''); setAdminBotXmlFileName(''); }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List of Platform Bots */}
                        <div className='admin-panel__card' style={{ marginTop: 24 }}>
                            <h2 className='admin-panel__card-title'>Configured Platform Bots ({adminBotsList.length})</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 14 }}>
                                {adminBotsList.map(bot => (
                                    <div key={bot.id} style={{ border: '1px solid #334155', borderRadius: 12, padding: 14, background: '#1e293b', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {bot.imageUrl && (
                                            <img src={bot.imageUrl} alt={bot.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: 15, color: '#f8fafc' }}>{bot.name}</strong>
                                            {bot.tags && <span style={{ padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>{bot.tags}</span>}
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{bot.description}</p>
                                        <div style={{ fontSize: 11, color: '#cbd5e1' }}>
                                            📁 File: <code>{bot.fileName}</code>
                                            {bot.youtubeUrl && <span style={{ marginLeft: 8, color: '#f59e0b' }}>🎥 Video Included</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <button type='button' style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => { setEditingBotId(bot.id); setAdminBotName(bot.name); setAdminBotDescription(bot.description || ''); setAdminBotImageUrl(bot.imageUrl || ''); setAdminBotYoutubeUrl(bot.youtubeUrl || ''); setAdminBotTags(bot.tags || 'HIGH WIN RATE'); setAdminBotCategory(bot.category || 'Volatility Indices'); setAdminBotXmlContent(bot.xmlContent); setAdminBotXmlFileName(bot.fileName); window.scrollTo({ top: 150, behavior: 'smooth' }); }}>✏ Edit</button>
                                            <button type='button' style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }} onClick={() => { const filtered = adminBotsList.filter(b => b.id !== bot.id); setAdminBotsList(filtered); localStorage.setItem('user_custom_bots_library', JSON.stringify(filtered)); showToast('✓ Bot strategy deleted.'); }}>🗑 Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Preset Color Palettes</h2>
                            <div className='admin-panel__presets'>
                                {THEME_PRESETS.map(p => (
                                    <button key={p.name} type='button' className='preset-btn' onClick={() => setColors({ primary: p.primary, secondary: p.secondary, nav_background: p.nav_bg, nav_text: '#f3f6f8', header_background: '#ffffff' })}>
                                        <span className='color-dot' style={{ background: p.primary }} />{p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Navigation Bar Toggles</h2>
                            <div className='admin-panel__nav-grid'>
                                {NAVIGATION_CATALOG.map(item => (
                                    <div key={item.id} className='nav-item-toggle'>
                                        <span>{item.label}</span>
                                        <label className='switch'><input type='checkbox' checked={navigation.includes(item.id)} disabled={item.required} onChange={() => setNavigation(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])} /><span className='slider' /></label>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button type='button' className='btn-primary' style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer' }} onClick={handleSaveBranding}>
                                    💾 Save Navigation & Branding
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risk' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Risk Management & Limits</h2>
                            <div className='admin-panel__grid'>
                                <div className='admin-panel__form-group'><label>Max Daily Loss ($)</label><input type='number' value={maxLossLimit} onChange={e => setMaxLossLimit(e.target.value)} /></div>
                                <div className='admin-panel__form-group'><label>Max Stake Cap ($)</label><input type='number' value={maxStakeCap} onChange={e => setMaxStakeCap(e.target.value)} /></div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button type='button' className='btn-primary' style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer' }} onClick={handleSaveRisk}>
                                    💾 Save Risk Limits
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>Deriv API & Server Settings</h2>
                            <div className='admin-panel__grid'>
                                <div className='admin-panel__form-group'><label>WebSocket Endpoint</label><input type='text' value={serverEndpoint} onChange={e => setServerEndpoint(e.target.value)} /></div>
                                <div className='admin-panel__form-group'><label>App ID</label><input type='text' value={appId} onChange={e => setAppId(e.target.value)} /></div>
                                <div className='admin-panel__form-group' style={{ gridColumn: '1 / -1' }}><label>Gemini API Key</label><input type='password' value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} /></div>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                                <button type='button' className='btn-primary' style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer' }} onClick={handleSaveApi}>
                                    💾 Save API Configuration
                                </button>
                                <button type='button' className='btn-secondary' style={{ padding: '10px 16px' }} onClick={handlePingTest} disabled={pinging}>{pinging ? 'Testing...' : 'Test Socket Latency'}</button>
                            </div>
                            {pingResult && <div style={{ fontSize: 12, marginTop: 10, fontWeight: 700, color: '#10b981' }}>{pingResult}</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'diagnostics' && (
                    <div className='admin-panel__content'>
                        <div className='admin-panel__card'>
                            <h2 className='admin-panel__card-title'>System Event Terminal</h2>
                            <div className='admin-panel__terminal'>
                                {logs.map((l, i) => <div key={i} className={`log-entry ${l.type}`}>[{l.time}] {l.text}</div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export const AdminDashboard = AdminPanelPage;
export default AdminPanelPage;
