import { useCallback, useEffect, useRef } from "react";

export declare namespace useSlugListeners {
    export interface Args {
        selectedSlug: string | undefined;
    }

    export interface Return {
        invokeListeners: (slug: string) => void;
        registerListener: (slug: string, listener: () => void) => () => void;
    }
}

export function useSlugListeners(label: string, { selectedSlug }: useSlugListeners.Args): useSlugListeners.Return {
    // so the callbacks are stable
    const selectedSlugRef = useRef(selectedSlug);
    useEffect(() => {
        selectedSlugRef.current = selectedSlug;
    }, [selectedSlug]);

    const listeners = useRef<Record<string, (() => void)[]>>({});

    const invokeListeners = useCallback((slug: string) => {
        const listenersForSlug = listeners.current[slug];
        if (listenersForSlug != null) {
            for (const listener of listenersForSlug) {
                setTimeout(listener, 0);
            }
        }
    }, []);

    const registerListener = useCallback(
        (slug: string, listener: () => void) => {
            const listenersForPath = (listeners.current[slug] ??= []);
            listenersForPath.push(listener);
            if (slug === selectedSlugRef.current) {
                listener();
            }
            return () => {
                const listenersForSlug = listeners.current[slug];
                if (listenersForSlug != null) {
                    const indexOfListenerToDelete = listenersForSlug.indexOf(listener);
                    if (indexOfListenerToDelete === -1) {
                        // eslint-disable-next-line no-console
                        console.warn(`Failed to deregister listener for ${label}.`);
                    } else {
                        listenersForSlug.splice(indexOfListenerToDelete, 1);
                    }
                }
            };
        },
        [label]
    );

    return {
        invokeListeners,
        registerListener,
    };
}
