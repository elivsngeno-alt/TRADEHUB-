import { useCallback, useEffect } from 'react';
import { useStore } from './useStore';

export const applyThemeToDocument = (isDark: boolean) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
        root.classList.remove('light', 'theme--light');
        root.classList.add('dark', 'theme--dark');
        body?.classList.remove('light', 'theme--light');
        body?.classList.add('dark', 'theme--dark');
    } else {
        root.classList.remove('dark', 'theme--dark');
        root.classList.add('light', 'theme--light');
        body?.classList.remove('dark', 'theme--dark');
        body?.classList.add('light', 'theme--light');
    }

    root.style.colorScheme = isDark ? 'dark' : 'light';

    const rootVars: Record<string, string> = isDark
        ? {
              '--color-scheme': 'dark',
              '--site-bg': '#0b0f17',
              '--site-card-bg': '#151d26',
              '--site-header-background': '#101820',
              '--site-nav-background': '#0b0f17',
              '--site-text': '#f8fafc',
              '--site-text-muted': '#94a3b8',
              '--site-border': '#263541',
              '--general-main-1': '#0b0f17',
              '--general-main-2': '#151d26',
              '--general-section-1': '#18242f',
              '--text-general': '#e2e8f0',
              '--text-prominent': '#ffffff',
              '--text-less-prominent': '#94a3b8',
              '--border-normal': '#263541',
          }
        : {
              '--color-scheme': 'light',
              '--site-bg': '#f8fafc',
              '--site-card-bg': '#ffffff',
              '--site-header-background': '#ffffff',
              '--site-nav-background': '#151d26',
              '--site-text': '#0f172a',
              '--site-text-muted': '#64748b',
              '--site-border': '#e2e8f0',
              '--general-main-1': '#ffffff',
              '--general-main-2': '#ffffff',
              '--general-section-1': '#f8fafc',
              '--text-general': '#0f172a',
              '--text-prominent': '#020617',
              '--text-less-prominent': '#64748b',
              '--border-normal': '#e2e8f0',
          };

    Object.entries(rootVars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
    });
};

const useThemeSwitcher = () => {
    const { ui } = useStore() ?? {
        ui: {
            setDarkMode: () => {},
            is_dark_mode_on: false,
        },
    };
    const { setDarkMode, is_dark_mode_on } = ui;

    useEffect(() => {
        applyThemeToDocument(Boolean(is_dark_mode_on));
    }, [is_dark_mode_on]);

    const toggleTheme = useCallback(() => {
        const newIsDark = !is_dark_mode_on;
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        setDarkMode(newIsDark);
        applyThemeToDocument(newIsDark);
    }, [is_dark_mode_on, setDarkMode]);

    return {
        toggleTheme,
        is_dark_mode_on,
        setDarkMode,
    };
};

export default useThemeSwitcher;
