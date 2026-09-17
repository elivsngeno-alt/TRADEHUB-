import { RefObject, useEffect, useRef, useState } from 'react';

export function useHover<T extends Element = HTMLElement>(
    elementRef?: RefObject<T> | null,
    shouldClear?: boolean
): [RefObject<T>, boolean] {
    const internalRef = useRef<T | null>(null);
    const [value, setValue] = useState<boolean>(false);

    useEffect(() => {
        if (shouldClear) {
            setValue(false);
        }
    }, [shouldClear]);

    const targetRef = (elementRef && typeof elementRef === 'object' && 'current' in elementRef
        ? elementRef
        : internalRef) as RefObject<T | null>;

    useEffect(() => {
        const node = targetRef.current;
        if (!node) return;

        const handleMouseEnter = () => setValue(true);
        const handleMouseLeave = () => setValue(false);

        node.addEventListener('mouseenter', handleMouseEnter);
        node.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            node.removeEventListener('mouseenter', handleMouseEnter);
            node.removeEventListener('mouseleave', handleMouseLeave);
        };
    });

    return [targetRef as RefObject<T>, value];
}

export function useHoverCallback() {
    const [isHovered, setIsHovered] = useState(false);

    const hoverProps = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
    };

    return [isHovered, hoverProps] as const;
}

