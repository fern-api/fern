import type { generatorsYml } from "@fern-api/configuration-loader";
import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";
import { describe, expect, it } from "vitest";

import { shouldPreflightGenerator } from "../shouldPreflightGenerator.js";

function makeGenerator(
    overrides: Partial<Pick<generatorsYml.GeneratorInvocation, "automation" | "absolutePathToLocalOutput" | "raw">> = {}
): generatorsYml.GeneratorInvocation {
    return {
        automation: { generate: true, upgrade: true, preview: true, verify: true },
        absolutePathToLocalOutput: undefined,
        raw: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

const automationOn: AutomationRunOptions = {
    recorder: { recordSuccess: () => undefined, recordFailure: () => undefined }
};

describe("shouldPreflightGenerator", () => {
    describe("outside automation mode (fern generate)", () => {
        it("preflights every generator, including opted-out ones, to preserve existing behavior", () => {
            const optedOut = makeGenerator({
                automation: { generate: false, upgrade: true, preview: true, verify: true }
            });
            expect(
                shouldPreflightGenerator({
                    generator: optedOut,
                    rootAutorelease: undefined,
                    automation: undefined
                })
            ).toBe(true);
        });
    });

    describe("in automation mode", () => {
        it("preflights an eligible generator", () => {
            expect(
                shouldPreflightGenerator({
                    generator: makeGenerator(),
                    rootAutorelease: undefined,
                    automation: automationOn
                })
            ).toBe(true);
        });

        it("skips preflight for automations.generate: false", () => {
            const optedOut = makeGenerator({
                automation: { generate: false, upgrade: true, preview: true, verify: true }
            });
            expect(
                shouldPreflightGenerator({
                    generator: optedOut,
                    rootAutorelease: undefined,
                    automation: automationOn
                })
            ).toBe(false);
        });

        it("skips preflight for local-file-system output", () => {
            const local = makeGenerator({
                absolutePathToLocalOutput:
                    "/tmp/out" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
            });
            expect(
                shouldPreflightGenerator({
                    generator: local,
                    rootAutorelease: undefined,
                    automation: automationOn
                })
            ).toBe(false);
        });

        it("skips preflight when root autorelease: false and generator doesn't override", () => {
            expect(
                shouldPreflightGenerator({
                    generator: makeGenerator(),
                    rootAutorelease: false,
                    automation: automationOn
                })
            ).toBe(false);
        });

        it("preflights when generator overrides root autorelease: false with its own true", () => {
            const overridden = makeGenerator({
                raw: { autorelease: true } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(
                shouldPreflightGenerator({
                    generator: overridden,
                    rootAutorelease: false,
                    automation: automationOn
                })
            ).toBe(true);
        });
    });
});
