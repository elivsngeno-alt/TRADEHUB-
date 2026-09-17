import { RefObject, useEffect, useRef } from 'react';

function useEventListener<
    K extends keyof WindowEventMap,
    T extends HTMLElement = HTMLDivElement,
>(
    eventName: K | string,
    handler: (event: WindowEventMap[K] | Event) => void,
    element?: RefObject<T>
) {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement: T | Window = element?.current || window;
        if (!(targetElement && targetElement.addEventListener)) {
            return;
        }

        const eventListener = (event: Event) => savedHandler.current(event);

        targetElement.addEventListener(eventName, eventListener);

        return () => {
            targetElement.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
}

export default useEventListener;
