import { CliError } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import { AutomationTelemetryManager } from "../AutomationTelemetryManager.js";
import { AUTOMATION_EVENT_NAMES } from "../automationTelemetryEvent.js";

describe("AutomationTelemetryManager", () => {
    it("skips CLI Sentry when failure_source is container", () => {
        const captureException = vi.fn();
        const manager = new AutomationTelemetryManager({
            instrumentPostHogAutomationEvent: vi.fn(),
            captureException
        });

        manager.emit({
            event: AUTOMATION_EVENT_NAMES.GENERATOR_FAILED,
            errorCode: CliError.Code.ContainerError,
            attributes: {
                failure_source: "container",
                error_message: "Generator failed in container"
            }
        });

        expect(captureException).not.toHaveBeenCalled();
    });

    it("captures CLI Sentry when failure_source is cli", () => {
        const captureException = vi.fn().mockReturnValue("sentry-id");
        const manager = new AutomationTelemetryManager({
            instrumentPostHogAutomationEvent: vi.fn(),
            captureException
        });
        const error = new Error("network down");

        manager.emit(
            {
                event: AUTOMATION_EVENT_NAMES.GENERATOR_FAILED,
                errorCode: CliError.Code.NetworkError,
                attributes: {
                    failure_source: "cli",
                    error_message: "network down"
                }
            },
            { error }
        );

        expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
    });
});
