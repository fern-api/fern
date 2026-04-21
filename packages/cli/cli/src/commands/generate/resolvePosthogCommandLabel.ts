import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";

/**
 * Returns the posthog event `command` label for a generate invocation — `"fern automations generate"`
 * when running in automation fan-out mode, `"fern generate"` otherwise. Keeping this as a pure
 * function ensures telemetry labels don't drift across code paths as more entry points are added.
 */
export function resolvePosthogCommandLabel(automation: AutomationRunOptions | undefined): string {
    return automation != null ? "fern automations generate" : "fern generate";
}
