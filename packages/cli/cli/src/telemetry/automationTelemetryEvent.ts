/**
 * Event-name and property conventions for CLI automation telemetry. The shape
 * mirrors the actions wrapper: run-level fields live on
 * `AutomationTelemetryContext`, while `AutomationTelemetryEvent` carries only
 * event-specific fields.
 */
import type { CliError } from "@fern-api/task-context";
import type { AutomationTelemetryContext } from "./automationTelemetryContext.js";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Canonical automation event names. Used as both the PostHog event name and
 * the `event:<name>` Sentry tag for grouping/filtering.
 */
export const AUTOMATION_EVENT_NAMES = {
    GENERATION_STARTED: "generation_started",
    GENERATION_COMPLETED: "generation_completed",
    GENERATION_FAILED: "generation_failed",
    VERIFICATION_FAILED: "verification_failed",
    SDK_PR_CREATED: "sdk_pr_created",
    UPGRADE_APPLIED: "upgrade_applied",
    MAJOR_VERSION_BUMP: "major_version_bump"
} as const;

export type AutomationEventName = (typeof AUTOMATION_EVENT_NAMES)[keyof typeof AUTOMATION_EVENT_NAMES];

/**
 * Whether each automation event represents a failure. Used by the automation
 * event API POST to gate Slack delivery (only failures need Slack).
 */
const AUTOMATION_EVENT_FAILURE: Record<AutomationEventName, boolean> = {
    [AUTOMATION_EVENT_NAMES.GENERATION_STARTED]: false,
    [AUTOMATION_EVENT_NAMES.GENERATION_COMPLETED]: false,
    [AUTOMATION_EVENT_NAMES.GENERATION_FAILED]: true,
    [AUTOMATION_EVENT_NAMES.VERIFICATION_FAILED]: true,
    [AUTOMATION_EVENT_NAMES.SDK_PR_CREATED]: false,
    [AUTOMATION_EVENT_NAMES.UPGRADE_APPLIED]: false,
    [AUTOMATION_EVENT_NAMES.MAJOR_VERSION_BUMP]: false
};

export function isFailureAutomationEventName(event: AutomationEventName): boolean {
    return AUTOMATION_EVENT_FAILURE[event];
}

/**
 * Structured telemetry event. Carries only fields specific to the event
 * itself. Automation context is passed alongside every emit and flattened by
 * each sink.
 */
export interface AutomationTelemetryEvent {
    event: AutomationEventName;
    errorCode?: CliError.Code;
    attributes?: Record<string, JsonValue>;
}

/**
 * Returns the PostHog property bag for an automation event. Attributes are
 * flattened side-by-side with context fields so filters do not need nested
 * property syntax.
 */
export function toPosthogProperties(
    event: AutomationTelemetryEvent,
    context: AutomationTelemetryContext
): Record<string, unknown> {
    return {
        automation_mode: true,
        surface: "cli",
        action: context.action,
        run_id: context.run_id,
        github_run_id: context.github_run_id,
        github_run_url: context.github_run_url,
        org: context.org,
        config_repo: context.config_repo,
        config_commit_sha: context.config_commit_sha,
        config_branch: context.config_branch,
        config_pr_number: context.config_pr_number,
        trigger: context.trigger,
        cli_version: context.cli_version,
        ...(event.errorCode !== undefined ? { error_code: event.errorCode } : {}),
        ...(event.attributes ?? {})
    };
}

export function toSentryTags(
    event: AutomationTelemetryEvent,
    context: AutomationTelemetryContext
): Record<string, string> {
    function appendStringIfPresent(target: Record<string, string>, key: string, value: string | undefined): void {
        if (value != null) {
            target[key] = value;
        }
    }

    const tags: Record<string, string> = {
        surface: "cli",
        automation_mode: "true"
    };
    appendStringIfPresent(tags, "event", event.event);
    appendStringIfPresent(tags, "action", context.action);
    appendStringIfPresent(tags, "run_id", context.run_id);
    appendStringIfPresent(tags, "org", context.org);
    appendStringIfPresent(tags, "config_repo", context.config_repo);
    appendStringIfPresent(tags, "trigger", context.trigger);
    appendStringIfPresent(tags, "error_code", event.errorCode ?? "none");
    return tags;
}

export function toSentryContext(
    event: AutomationTelemetryEvent,
    context: AutomationTelemetryContext
): Record<string, unknown> {
    return {
        github_run_id: context.github_run_id,
        github_run_url: context.github_run_url,
        config_commit_sha: context.config_commit_sha,
        config_branch: context.config_branch,
        config_pr_number: context.config_pr_number,
        cli_version: context.cli_version,
        ...(event.attributes ?? {})
    };
}

/**
 * Returns the body sent to the automation event API at `/v1/automation/events`.
 */
export function toAutomationEventApiBody(
    event: AutomationTelemetryEvent,
    context: AutomationTelemetryContext
): Record<string, unknown> {
    return {
        event: event.event,
        timestamp: new Date().toISOString(),
        surface: "cli",
        action: context.action,
        run_id: context.run_id,
        github_run_id: context.github_run_id,
        github_run_url: context.github_run_url,
        org: context.org,
        config_repo: context.config_repo,
        config_commit_sha: context.config_commit_sha,
        config_branch: context.config_branch,
        config_pr_number: context.config_pr_number,
        trigger: context.trigger,
        cli_version: context.cli_version,
        ...(event.errorCode !== undefined ? { error_code: event.errorCode } : {}),
        ...(event.attributes ?? {})
    };
}

/**
 * Maps argv to the failure event name emitted by top-level automation error
 * handling. This is temporary until we have a better way to determine the
 * command that failed.
 */
export function failureEventNameForCommand(argv: readonly string[]): AutomationEventName {
    const joined = argv.join(" ");
    if (/\bautomations\s+generate\b/.test(joined)) {
        return AUTOMATION_EVENT_NAMES.GENERATION_FAILED;
    }
    if (/\bautomations\s+preview\b/.test(joined)) {
        return AUTOMATION_EVENT_NAMES.VERIFICATION_FAILED;
    }
    // Default for any other automation path - leg 3 still routes a Slack
    // message via the automation event API, so a sensible fallback matters.
    return AUTOMATION_EVENT_NAMES.GENERATION_FAILED;
}
