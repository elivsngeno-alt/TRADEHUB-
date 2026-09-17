export interface UserSessionItem {
    loginid: string;
    currency: string;
    is_virtual: boolean;
    balance: number;
    last_seen: string;
    signed_in_at: string;
    trades_count: number;
    volume_traded: number;
    status: string;
}

export interface CommissionLogItem {
    id: string;
    timestamp: string;
    userLoginId: string;
    stake: number;
    volume: number;
    markupRate: number;
    commissionAmount: number;
    status: 'Settled' | 'Pending';
}

export const THEME_PRESETS = [
    { name: 'Emerald Green', primary: '#059669', secondary: '#19cba3', nav_bg: '#151d26' },
    { name: 'Indigo Royalty', primary: '#4f46e5', secondary: '#818cf8', nav_bg: '#0f172a' },
    { name: 'Dark Gold', primary: '#d97706', secondary: '#fbbf24', nav_bg: '#18181b' },
    { name: 'Crimson Power', primary: '#dc2626', secondary: '#f87171', nav_bg: '#1a0d0d' },
    { name: 'Cyber Cyan', primary: '#0891b2', secondary: '#22d3ee', nav_bg: '#081c24' },
];

export const DEFAULT_MOCK_USERS: UserSessionItem[] = [
    { loginid: 'CR9182341', currency: 'USD', is_virtual: false, balance: 1450.8, last_seen: 'Just now', signed_in_at: '2026-09-15 14:20', trades_count: 42, volume_traded: 3820.0, status: 'Active' },
    { loginid: 'CR8721092', currency: 'USD', is_virtual: false, balance: 890.25, last_seen: '5 mins ago', signed_in_at: '2026-09-15 11:05', trades_count: 18, volume_traded: 1650.0, status: 'Active' },
    { loginid: 'VRTC1092834', currency: 'USD', is_virtual: true, balance: 10000.0, last_seen: '12 mins ago', signed_in_at: '2026-09-15 09:30', trades_count: 85, volume_traded: 12400.0, status: 'Active' },
    { loginid: 'CR5520198', currency: 'EUR', is_virtual: false, balance: 3200.5, last_seen: '1 hour ago', signed_in_at: '2026-09-14 18:45', trades_count: 120, volume_traded: 15800.0, status: 'Offline' },
];

export const DEFAULT_COMMISSION_LOGS: CommissionLogItem[] = [
    { id: 'COMM-1092', timestamp: '2026-09-15 16:40', userLoginId: 'CR9182341', stake: 100, volume: 1000, markupRate: 1.5, commissionAmount: 15.0, status: 'Settled' },
    { id: 'COMM-1091', timestamp: '2026-09-15 15:12', userLoginId: 'CR8721092', stake: 50, volume: 500, markupRate: 1.5, commissionAmount: 7.5, status: 'Settled' },
    { id: 'COMM-1090', timestamp: '2026-09-15 13:05', userLoginId: 'CR5520198', stake: 250, volume: 2500, markupRate: 1.5, commissionAmount: 37.5, status: 'Pending' },
];
