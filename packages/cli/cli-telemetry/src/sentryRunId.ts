import * as Sentry from "@sentry/node";
import { getFernRunId } from "./fernRunId.js";

/**
 * Tags the current FERN_RUN_ID onto the Sentry scope so all captured errors
 * in this run are correlated. Call this once after Sentry.init().
 */
export function setSentryFernRunIdTag(): void {
    const fernRunId = getFernRunId();
    if (fernRunId != null) {
        Sentry.setTag("fern_run_id", fernRunId);
    }
}

/**
 * Tags the current GITHUB_RUN_ID onto the Sentry scope. Call this once after
 * Sentry.init() when running inside a GitHub Actions workflow.
 */
export function setSentryGithubRunIdTag(): void {
    if (process.env.GITHUB_RUN_ID != null) {
        Sentry.setTag("github_run_id", process.env.GITHUB_RUN_ID);
    }
}

/**
 * Tags both FERN_RUN_ID and GITHUB_RUN_ID onto the Sentry scope.
 * Call this once after Sentry.init().
 */
export function setSentryRunIdTags(): void {
    setSentryFernRunIdTag();
    setSentryGithubRunIdTag();
}
