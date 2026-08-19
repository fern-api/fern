/**
 * Reads observability-relevant context from the environment for automation
 * runs. Single source of truth for the enrichment fields that ride along on
 * every PostHog event and every automation event API payload during an
 * automation run. Sentry tags receive the same low-cardinality subset, with
 * URLs intentionally kept out of tags.
 */

import { getRunIdProperties } from "@fern-api/cli-telemetry";

/**
 * Strict typed automation context. Matches the actions wrapper's
 * run-level context shape: event-specific fields live on
 * `AutomationTelemetryEvent`.
 */
export interface AutomationTelemetryContext {
    action: string | undefined;
    run_id: string | undefined;
    github_run_id: string | undefined;
    github_run_url: string | undefined;
    org: string | undefined;
    config_repo: string | undefined;
    config_commit_sha: string | undefined;
    config_branch: string | undefined;
    config_pr_number: string | undefined;
    trigger: string | undefined;
    cli_version: string | undefined;
}

/**
 * Returns the automation context derived from the current process
 * environment.
 */
export function getAutomationContextFromEnv(): AutomationTelemetryContext {
    const { fern_run_id, github_run_id } = getRunIdProperties();
    return {
        action: process.env.FERN_ACTION,
        run_id: fern_run_id,
        github_run_id: github_run_id,
        github_run_url: process.env.FERN_GITHUB_RUN_URL,
        org: undefined,
        config_repo: process.env.FERN_CONFIG_REPO,
        config_commit_sha: process.env.FERN_CONFIG_COMMIT_SHA,
        config_branch: process.env.FERN_CONFIG_BRANCH,
        config_pr_number: process.env.FERN_CONFIG_PR_NUMBER,
        trigger: process.env.GITHUB_EVENT_NAME,
        cli_version: process.env.CLI_VERSION
    };
}

/**
 * Returns true if automation mode was explicitly exported by the actions wrapper.
 */
export function isAutomationMode(): boolean {
    return process.env.FERN_AUTOMATION === "true";
}
