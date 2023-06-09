import posthog from "posthog-js";

let IS_POSTHOG_INITIALIZED = false;
function safeAccessPosthog(run: () => void): void {
    if (IS_POSTHOG_INITIALIZED) {
        run();
    }
}

export function initializePosthog(apiKey: string): void {
    if (process.env.NODE_ENV === "production") {
        posthog.init(apiKey, {
            api_host: "https://app.posthog.com",
            loaded: () => {
                IS_POSTHOG_INITIALIZED = true;
            },
        });
    }
}

export function identifyUser(userId: string): void {
    safeAccessPosthog(() => {
        posthog.identify(userId);
    });
}

export function resetPosthog(): void {
    safeAccessPosthog(() => {
        posthog.reset();
    });
}
