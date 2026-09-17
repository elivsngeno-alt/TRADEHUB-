import React from 'react';
import { observer } from 'mobx-react-lite';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import { MoonIcon, SunIcon } from './icons';
import './theme-toggle.scss';

export interface ThemeToggleProps {
    className?: string;
    showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = observer(({ className = '', showText = false }) => {
    const { is_dark_mode_on, toggleTheme } = useThemeSwitcher();

    return (
        <button
            type='button'
            className={`prodb-theme-toggle-switch ${is_dark_mode_on ? 'is-dark' : 'is-light'} ${className}`}
            onClick={toggleTheme}
            aria-label={is_dark_mode_on ? 'Switch to light mode' : 'Switch to dark mode'}
            title={is_dark_mode_on ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-pressed={is_dark_mode_on}
            role='switch'
            aria-checked={is_dark_mode_on}
        >
            <span className='prodb-theme-toggle-switch__track'>
                <span className='prodb-theme-toggle-switch__thumb' />
                <span className={`prodb-theme-toggle-switch__icon prodb-theme-toggle-switch__icon--sun ${!is_dark_mode_on ? 'is-active' : ''}`}>
                    <SunIcon />
                    {showText && <span className='prodb-theme-toggle-switch__label'>Light</span>}
                </span>
                <span className={`prodb-theme-toggle-switch__icon prodb-theme-toggle-switch__icon--moon ${is_dark_mode_on ? 'is-active' : ''}`}>
                    <MoonIcon />
                    {showText && <span className='prodb-theme-toggle-switch__label'>Dark</span>}
                </span>
            </span>
        </button>
    );
});

export default ThemeToggle;
