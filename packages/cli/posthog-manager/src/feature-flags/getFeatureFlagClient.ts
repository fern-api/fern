import { getCliReleaseEnvironment } from "./CliReleaseEnvironment.js";
import { type FeatureFlagClient, NoopFeatureFlagClient, PosthogFeatureFlagClient } from "./FeatureFlagClient.js";

let featureFlagClient: FeatureFlagClient | undefined;

/**
 * Process-wide feature flag client. Unlike event telemetry, flag evaluation ignores
 * `FERN_DISABLE_TELEMETRY` / `FERN_TELEMETRY_DISABLED` so rollouts behave the same for every
 * user; flag checks never emit events. Without `POSTHOG_FEATURE_FLAGS_API_KEY` (unbuilt runs
 * and builds without the key) every flag resolves to off.
 */
export function getFeatureFlagClient(): FeatureFlagClient {
    if (featureFlagClient == null) {
        featureFlagClient = createFeatureFlagClient();
    }
    return featureFlagClient;
}

function createFeatureFlagClient(): FeatureFlagClient {
    const posthogApiKey = process.env.POSTHOG_FEATURE_FLAGS_API_KEY;
    if (posthogApiKey == null || posthogApiKey.trim().length === 0) {
        return new NoopFeatureFlagClient();
    }
    return new PosthogFeatureFlagClient({ posthogApiKey, environment: getCliReleaseEnvironment() });
}
