import { isEventTelemetryEnabled } from "../isEventTelemetryEnabled.js";
import { getCliReleaseEnvironment } from "./CliReleaseEnvironment.js";
import { type FeatureFlagClient, NoopFeatureFlagClient, PosthogFeatureFlagClient } from "./FeatureFlagClient.js";

let featureFlagClient: FeatureFlagClient | undefined;

/**
 * Process-wide feature flag client. Unlike event telemetry, flag evaluation ignores
 * `FERN_DISABLE_TELEMETRY` so rollouts behave the same for every user. Flag checks emit
 * `$feature_flag_called` usage events only when event telemetry is enabled (see
 * {@link isEventTelemetryEnabled}). Without `POSTHOG_FEATURE_FLAGS_API_KEY` (unbuilt runs and
 * builds without the key) every flag resolves to off.
 */
export function getFeatureFlagClient(): FeatureFlagClient {
    if (featureFlagClient == null) {
        featureFlagClient = createFeatureFlagClient();
    }
    return featureFlagClient;
}

/** Sends queued flag usage events before exit. A no-op when no flag was evaluated in this process. */
export async function flushFeatureFlagClient(): Promise<void> {
    await featureFlagClient?.flush();
}

function createFeatureFlagClient(): FeatureFlagClient {
    const posthogApiKey = process.env.POSTHOG_FEATURE_FLAGS_API_KEY;
    if (posthogApiKey == null || posthogApiKey.trim().length === 0) {
        return new NoopFeatureFlagClient();
    }
    return new PosthogFeatureFlagClient({
        posthogApiKey,
        environment: getCliReleaseEnvironment(),
        sendFeatureFlagEvents: isEventTelemetryEnabled()
    });
}
