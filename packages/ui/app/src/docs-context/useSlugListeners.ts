import { useCallback, useRef } from "react";

export declare namespace useSlugListeners {
    export interface Args {
        selectedSlug: string | undefined;
    }

    export interface Return {
        invokeListeners: (slug: string) => void;
        registerListener: (slug: string, listener: () => void) => () => void;
    }
}

export function useSlugListeners({ selectedSlug }: useSlugListeners.Args): useSlugListeners.Return {
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
            if (slug === selectedSlug) {
                listener();
            }
            return () => {
                const listenersForSlug = listeners.current[slug];
                if (listenersForSlug != null) {
                    const indexOfListenerToDelete = listenersForSlug.indexOf(listener);
                    if (indexOfListenerToDelete !== -1) {
                        // eslint-disable-next-line no-console
                        console.warn("Failed to deregister listener.");
                    } else {
                        listenersForSlug.splice(indexOfListenerToDelete, 1);
                    }
                }
            };
        },
        [selectedSlug]
    );

    return {
        invokeListeners,
        registerListener,
    };
}
