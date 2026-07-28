import { describe, expect, it, vi } from "vitest";
import { BackgroundValidationScheduler } from "../BackgroundValidationScheduler.js";

const flushImmediate = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe("BackgroundValidationScheduler", () => {
    it("defers validation until the current event-loop turn completes", async () => {
        const run = vi.fn().mockResolvedValue(undefined);
        const scheduler = new BackgroundValidationScheduler<number>(run);

        scheduler.schedule(1);

        expect(run).not.toHaveBeenCalled();
        await flushImmediate();
        expect(run).toHaveBeenCalledWith(1);
    });

    it("runs one validation at a time and keeps only the latest pending value", async () => {
        let finishFirst: (() => void) | undefined;
        const firstRun = new Promise<void>((resolve) => {
            finishFirst = resolve;
        });
        const run = vi
            .fn()
            .mockImplementationOnce(() => firstRun)
            .mockResolvedValue(undefined);
        const scheduler = new BackgroundValidationScheduler<number>(run);

        scheduler.schedule(1);
        await flushImmediate();
        scheduler.schedule(2);
        scheduler.schedule(3);

        expect(run).toHaveBeenCalledTimes(1);
        finishFirst?.();
        await firstRun;
        await flushImmediate();

        expect(run).toHaveBeenCalledTimes(2);
        expect(run).toHaveBeenLastCalledWith(3);
    });
});
