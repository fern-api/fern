import { afterEach, describe, expect, it } from "vitest";

import { AUTOMATION_EVENT_NAMES } from "../../../../telemetry/automationTelemetryEvent.js";
import { PreviewRunCollector } from "../PreviewRunResult.js";

describe("PreviewRunCollector telemetry", () => {
    const originalAutomationMode = process.env.FERN_AUTOMATION;

    afterEach(() => {
        if (originalAutomationMode == null) {
            delete process.env.FERN_AUTOMATION;
        } else {
            process.env.FERN_AUTOMATION = originalAutomationMode;
        }
    });

    it("emits preview_group_completed when automation mode is enabled", () => {
        process.env.FERN_AUTOMATION = "true";
        const emitted: unknown[] = [];
        const collector = new PreviewRunCollector({
            emitAutomationEvent: (event) => {
                emitted.push(event);
            }
        });

        collector.recordSuccess({
            group: { groupName: "ts-sdk", apiName: "api", generator: "fernapi/fern-typescript-sdk" },
            result: {
                status: "success",
                org: "acme",
                previews: [
                    {
                        preview_id: "preview-1",
                        install: "npm install ...",
                        version: "0.0.0-preview.1",
                        package_name: "@acme-preview/sdk",
                        registry_url: "https://registry.example.com"
                    }
                ]
            },
            pushDiffEnabled: false
        });

        expect(emitted).toHaveLength(1);
        expect(emitted[0]).toMatchObject({
            event: AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_COMPLETED
        });
    });

    it("emits preview_group_failed with cli error options", () => {
        process.env.FERN_AUTOMATION = "true";
        const emitted: Array<{ event: string; options?: { error?: unknown } }> = [];
        const cliError = new Error("network down");
        const collector = new PreviewRunCollector({
            emitAutomationEvent: (event, options) => {
                emitted.push({ event: event.event, options });
            }
        });

        collector.recordFailure({
            group: { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" },
            message: "network down",
            failureSource: "cli",
            error: cliError
        });

        expect(emitted[0]).toMatchObject({
            event: AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_FAILED,
            options: { error: cliError }
        });
    });

    it("does not pass cli error options for container failures", () => {
        process.env.FERN_AUTOMATION = "true";
        const emitted: Array<{ event: string; options?: { error?: unknown } }> = [];
        const collector = new PreviewRunCollector({
            emitAutomationEvent: (event, options) => {
                emitted.push({ event: event.event, options });
            }
        });

        collector.recordFailure({
            group: { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" },
            message: "container failed",
            failureSource: "container",
            error: new Error("container failed")
        });

        expect(emitted[0]).toMatchObject({
            event: AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_FAILED,
            options: undefined
        });
    });

    it("does not emit when automation mode is disabled", () => {
        delete process.env.FERN_AUTOMATION;
        const emitted: unknown[] = [];
        const collector = new PreviewRunCollector({
            emitAutomationEvent: (event) => {
                emitted.push(event);
            }
        });

        collector.recordFailure({
            group: { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" },
            message: "boom"
        });

        expect(emitted).toHaveLength(0);
    });
});

describe("PreviewRunCollector", () => {
    it("tracks successes and failures", () => {
        const collector = new PreviewRunCollector();

        collector.recordSuccess({
            group: { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" },
            result: { status: "success", org: "acme", previews: [] },
            pushDiffEnabled: false
        });
        collector.recordFailure({
            group: { groupName: "node", apiName: "api", generator: "fernapi/fern-typescript-node-sdk" },
            message: "failed"
        });

        expect(collector.results()).toHaveLength(2);
        expect(collector.hasFailures()).toBe(true);
        expect(collector.counts()).toEqual({ succeeded: 1, failed: 1 });
    });
});
