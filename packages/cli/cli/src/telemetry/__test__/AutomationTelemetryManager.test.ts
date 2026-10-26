import { afterEach, describe, expect, it, vi } from "vitest";
import type { AutomationEventApiClient } from "../AutomationEventApiClient.js";
import { AutomationTelemetryManager } from "../AutomationTelemetryManager.js";

describe("AutomationTelemetryManager", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("stops waiting when telemetry shutdown does not settle", async () => {
        vi.useFakeTimers();
        const shutdown = vi.fn(() => new Promise<void>(() => undefined));
        const manager = new AutomationTelemetryManager(
            {
                instrumentPostHogAutomationEvent: vi.fn()
            },
            { shutdown } as unknown as AutomationEventApiClient
        );

        const flush = manager.flush();
        await vi.advanceTimersByTimeAsync(10_000);

        await expect(flush).resolves.toBeUndefined();
        expect(shutdown).toHaveBeenCalledOnce();
    });

    it("clears the timeout when telemetry shutdown settles", async () => {
        vi.useFakeTimers();
        const manager = new AutomationTelemetryManager(
            {
                instrumentPostHogAutomationEvent: vi.fn()
            },
            { shutdown: vi.fn().mockResolvedValue(undefined) } as unknown as AutomationEventApiClient
        );

        await manager.flush();

        expect(vi.getTimerCount()).toBe(0);
    });
});
