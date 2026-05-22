import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliContext } from "../../../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../../../cliCommons.js";
import {
    AUTOMATION_EVENT_NAMES,
    type AutomationTelemetryEvent
} from "../../../../telemetry/automationTelemetryEvent.js";
import { sdkPreview } from "../../../sdk-preview/sdkPreview.js";
import { listPreviewGroups } from "../../listPreviewGroups.js";
import { executeAutomationsPreview } from "../executeAutomationsPreview.js";

vi.mock("../../../../cliCommons.js", () => ({
    loadProjectAndRegisterWorkspacesWithContext: vi.fn()
}));

vi.mock("../../listPreviewGroups.js", () => ({
    listPreviewGroups: vi.fn()
}));

vi.mock("../../../sdk-preview/sdkPreview.js", () => ({
    sdkPreview: vi.fn()
}));

function createMockCliContext(): CliContext & { emittedEvents: AutomationTelemetryEvent[] } {
    const emitted: AutomationTelemetryEvent[] = [];
    return {
        emitAutomationTelemetryEvent: (event: AutomationTelemetryEvent) => {
            emitted.push(event);
        },
        logger: {
            info: vi.fn(),
            warn: vi.fn()
        },
        emittedEvents: emitted
    } as unknown as CliContext & { emittedEvents: AutomationTelemetryEvent[] };
}

describe("executeAutomationsPreview", () => {
    const originalAutomationMode = process.env.FERN_AUTOMATION;
    const originalExitCode = process.exitCode;

    beforeEach(() => {
        vi.mocked(loadProjectAndRegisterWorkspacesWithContext).mockResolvedValue({
            apiWorkspaces: []
        } as unknown as Awaited<ReturnType<typeof loadProjectAndRegisterWorkspacesWithContext>>);
    });

    afterEach(() => {
        if (originalAutomationMode == null) {
            delete process.env.FERN_AUTOMATION;
        } else {
            process.env.FERN_AUTOMATION = originalAutomationMode;
        }
        process.exitCode = originalExitCode;
        vi.clearAllMocks();
    });

    it("emits preview_started and preview_completed in automation mode", async () => {
        process.env.FERN_AUTOMATION = "true";
        vi.mocked(listPreviewGroups).mockReturnValue([
            { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" }
        ]);
        vi.mocked(sdkPreview).mockResolvedValue({
            status: "success",
            org: "acme",
            previews: []
        });

        const cliContext = createMockCliContext();
        await executeAutomationsPreview({
            cliContext,
            options: { group: undefined, json: false, pushDiff: false }
        });

        const events = cliContext.emittedEvents;
        expect(events.map((entry) => entry.event)).toEqual([
            AUTOMATION_EVENT_NAMES.PREVIEW_STARTED,
            AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_COMPLETED,
            AUTOMATION_EVENT_NAMES.PREVIEW_COMPLETED
        ]);
        expect(events[2]).toMatchObject({
            attributes: { succeeded: 1, failed: 0 }
        });
    });

    it("sets exit code when a group fails", async () => {
        process.env.FERN_AUTOMATION = "true";
        vi.mocked(listPreviewGroups).mockReturnValue([
            { groupName: "ts-sdk", apiName: null, generator: "fernapi/fern-typescript-sdk" }
        ]);
        vi.mocked(sdkPreview).mockResolvedValue({
            status: "error",
            message: "preview failed",
            failureSource: "cli"
        });

        const cliContext = createMockCliContext();
        await executeAutomationsPreview({
            cliContext,
            options: { group: undefined, json: true, pushDiff: false }
        });

        expect(process.exitCode).toBe(1);
        const events = cliContext.emittedEvents;
        expect(events.map((entry) => entry.event)).toContain(AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_FAILED);
    });

    it("writes empty JSON results when no groups are eligible", async () => {
        vi.mocked(listPreviewGroups).mockReturnValue([]);
        const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

        const cliContext = createMockCliContext();
        await executeAutomationsPreview({
            cliContext,
            options: { group: undefined, json: true, pushDiff: false }
        });

        expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify({ results: [] }, null, 2)}\n`);
        stdoutSpy.mockRestore();
    });
});
