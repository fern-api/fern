import { isTelemetryOptedOutByEnv } from "@fern-api/core-utils";

/**
 * Whether this process may send PostHog events. Builds bake in `POSTHOG_API_KEY` (dev and local
 * builds inject none, and publish jobs without the secret inject `""`), and users opt out with
 * `FERN_DISABLE_TELEMETRY=true`.
 */
export function isEventTelemetryEnabled(): boolean {
    const posthogApiKey = process.env.POSTHOG_API_KEY;
    if (posthogApiKey == null || posthogApiKey.trim().length === 0) {
        return false;
    }
    return !isTelemetryOptedOutByEnv();
}
