import React from 'react';

export interface IconProps {
    icon?: string;
    className?: string;
    size?: string | number;
    color?: string;
    custom_color?: string;
    onClick?: (e?: any) => void;
    [key: string]: any;
}

export const Icon: React.FC<IconProps> = ({
    icon,
    className = '',
    size = 16,
    color,
    custom_color,
    onClick,
    ...props
}) => {
    const iconSize = typeof size === 'number' ? `${size}px` : size;
    return (
        <span
            className={`deriv-icon ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                color: color || custom_color || 'currentColor',
            }}
            onClick={onClick}
            data-icon={icon}
            {...props}
        />
    );
};

export default Icon;
