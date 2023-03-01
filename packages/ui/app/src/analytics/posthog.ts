import posthog from "posthog-js";

let IS_POSTHOG_INITIALIZED = false;
function safeAccessPosthog(run: () => void): void {
    if (IS_POSTHOG_INITIALIZED) {
        run();
    }
}

export function initializePosthog(token: string): void {
    if (import.meta.env.PROD) {
        posthog.init(token, {
            api_host: "https://app.posthog.com",
            loaded: () => {
                IS_POSTHOG_INITIALIZED = true;
            },
        });
    }
}

export function identifyUser(userId: string, details?: Record<string, unknown>): void {
    safeAccessPosthog(() => {
        posthog.identify(userId);
        if (details != null) {
            posthog.people.set(details);
        }
    });
}

export function resetPosthog(): void {
    safeAccessPosthog(() => {
        posthog.reset();
    });
}
