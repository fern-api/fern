import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import {
    AUTOMATION_EVENT_NAMES,
    failureEventNameForCommand,
    isFailureAutomationEventName,
    toSentryTags
} from "../automationTelemetryEvent.js";

describe("automationTelemetryEvent", () => {
    it("marks generate failure events for Sentry gating", () => {
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.GENERATION_FAILED)).toBe(true);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.GENERATOR_FAILED)).toBe(true);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.GENERATOR_COMPLETED)).toBe(false);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.GENERATOR_SKIPPED)).toBe(false);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.GENERATION_STARTED)).toBe(false);
    });

    it("maps automations generate argv to generation_failed", () => {
        expect(failureEventNameForCommand(["node", "fern", "automations", "generate"])).toBe(
            AUTOMATION_EVENT_NAMES.GENERATION_FAILED
        );
    });

    it("maps automations preview argv to preview_failed", () => {
        expect(failureEventNameForCommand(["node", "fern", "automations", "preview"])).toBe(
            AUTOMATION_EVENT_NAMES.PREVIEW_FAILED
        );
    });

    it("marks preview failure events for Sentry gating", () => {
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_FAILED)).toBe(true);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.PREVIEW_FAILED)).toBe(true);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_COMPLETED)).toBe(false);
        expect(isFailureAutomationEventName(AUTOMATION_EVENT_NAMES.PREVIEW_STARTED)).toBe(false);
    });

    it("includes generator identity tags in Sentry tags", () => {
        expect(
            toSentryTags(
                {
                    event: AUTOMATION_EVENT_NAMES.GENERATOR_FAILED,
                    errorCode: CliError.Code.ContainerError,
                    attributes: {
                        generator_name: "fernapi/fern-python-sdk",
                        group_name: "python-sdk",
                        api_name: "api",
                        failure_source: "container"
                    }
                },
                {
                    action: "generate",
                    run_id: "run-1",
                    github_run_id: undefined,
                    github_run_url: undefined,
                    org: "acme",
                    config_repo: "acme/config",
                    config_commit_sha: undefined,
                    config_branch: undefined,
                    config_pr_number: undefined,
                    trigger: undefined,
                    cli_version: "1.0.0"
                }
            )
        ).toMatchObject({
            event: AUTOMATION_EVENT_NAMES.GENERATOR_FAILED,
            generator_name: "fernapi/fern-python-sdk",
            group_name: "python-sdk",
            api_name: "api",
            failure_source: "container"
        });
    });
});
