import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";
import { describe, expect, it } from "vitest";

import { shouldSkipMissingGenerator } from "../shouldSkipMissingGenerator.js";

const automationOn: AutomationRunOptions = {
    recorder: { recordSuccess: () => undefined, recordFailure: () => undefined }
};

describe("shouldSkipMissingGenerator", () => {
    describe("outside automation mode (fern generate)", () => {
        it("never skips — a missing generator is always a fatal misconfiguration", () => {
            expect(
                shouldSkipMissingGenerator({
                    automation: undefined,
                    generatorName: "fernapi/fern-python-sdk",
                    generatorIndex: undefined
                })
            ).toBe(false);
            expect(
                shouldSkipMissingGenerator({
                    automation: undefined,
                    generatorName: undefined,
                    generatorIndex: 0
                })
            ).toBe(false);
        });
    });

    describe("in automation mode", () => {
        it("skips when name-based targeting doesn't match this group (fan-out across groups)", () => {
            expect(
                shouldSkipMissingGenerator({
                    automation: automationOn,
                    generatorName: "fernapi/fern-python-sdk",
                    generatorIndex: undefined
                })
            ).toBe(true);
        });

        it("does not skip when index-based targeting is out of bounds — fail loudly", () => {
            expect(
                shouldSkipMissingGenerator({
                    automation: automationOn,
                    generatorName: undefined,
                    generatorIndex: 5
                })
            ).toBe(false);
        });

        it("does not skip when no targeting is set (filterGenerators can't fail in this case)", () => {
            expect(
                shouldSkipMissingGenerator({
                    automation: automationOn,
                    generatorName: undefined,
                    generatorIndex: undefined
                })
            ).toBe(false);
        });
    });
});
