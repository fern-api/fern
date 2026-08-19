import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";
import { shouldSkipGenerator } from "../commands/generate/shouldSkipGenerator.js";

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

describe("shouldSkipGenerator", () => {
    describe("automation.generate", () => {
        it("does not skip when automation.generate is true", () => {
            const generator = makeGenerator();
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(false);
        });

        it("skips when automation.generate is false", () => {
            const generator = makeGenerator({
                automation: { generate: false, upgrade: true, preview: true, verify: true }
            });
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(true);
        });
    });

    describe("local-file-system output", () => {
        it("skips when absolutePathToLocalOutput is set", () => {
            const generator = makeGenerator({
                absolutePathToLocalOutput:
                    "/tmp/output" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
            });
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(true);
        });

        it("does not skip when absolutePathToLocalOutput is undefined", () => {
            const generator = makeGenerator({ absolutePathToLocalOutput: undefined });
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(false);
        });
    });

    describe("autorelease", () => {
        it("skips when generator-level autorelease is false", () => {
            const generator = makeGenerator({
                raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(true);
        });

        it("does not skip when generator-level autorelease is true", () => {
            const generator = makeGenerator({
                raw: { autorelease: true } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(false);
        });

        it("skips when root autorelease is false and generator has no override", () => {
            const generator = makeGenerator();
            expect(shouldSkipGenerator({ generator, rootAutorelease: false })).toBe(true);
        });

        it("does not skip when root autorelease is false but generator overrides to true", () => {
            const generator = makeGenerator({
                raw: { autorelease: true } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(shouldSkipGenerator({ generator, rootAutorelease: false })).toBe(false);
        });

        it("does not skip when root autorelease is true and generator has no override", () => {
            const generator = makeGenerator();
            expect(shouldSkipGenerator({ generator, rootAutorelease: true })).toBe(false);
        });

        it("does not skip when root autorelease is undefined and generator has no override", () => {
            const generator = makeGenerator();
            expect(shouldSkipGenerator({ generator, rootAutorelease: undefined })).toBe(false);
        });
    });
});
