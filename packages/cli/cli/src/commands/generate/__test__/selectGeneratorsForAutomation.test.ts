import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import { buildAutomationTargeting, selectGeneratorsForAutomation } from "../selectGeneratorsForAutomation.js";

function makeGenerator(
    name: string,
    overrides: Partial<Pick<generatorsYml.GeneratorInvocation, "automation" | "absolutePathToLocalOutput" | "raw">> = {}
): generatorsYml.GeneratorInvocation {
    return {
        name,
        automation: { generate: true, upgrade: true, preview: true, verify: true },
        absolutePathToLocalOutput: undefined,
        raw: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

const optedOutAutomation = { generate: false, upgrade: true, preview: true, verify: true };

describe("selectGeneratorsForAutomation", () => {
    describe("targeting: 'none' (fan-out)", () => {
        it("returns all generators when none are opted out", () => {
            const gens = [makeGenerator("a"), makeGenerator("b")];
            expect(
                selectGeneratorsForAutomation({
                    generators: gens,
                    rootAutorelease: undefined,
                    targeting: { type: "none" }
                })
            ).toEqual({ type: "run", generators: gens, skipped: [] });
        });

        it("silently filters out generators with automations.generate: false", () => {
            const ok = makeGenerator("ok");
            const optedOut = makeGenerator("opted-out", { automation: optedOutAutomation });
            const result = selectGeneratorsForAutomation({
                generators: [ok, optedOut],
                rootAutorelease: undefined,
                targeting: { type: "none" }
            });
            if (result.type !== "run") {
                throw new Error("Expected 'run'");
            }
            expect(result.generators).toEqual([ok]);
            expect(result.skipped).toEqual([{ generator: optedOut, reason: "opted_out" }]);
        });

        it("silently filters out generators with local-file-system output", () => {
            const ok = makeGenerator("ok");
            const local = makeGenerator("local", {
                absolutePathToLocalOutput:
                    "/tmp/out" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
            });
            const result = selectGeneratorsForAutomation({
                generators: [ok, local],
                rootAutorelease: undefined,
                targeting: { type: "none" }
            });
            if (result.type !== "run") {
                throw new Error("Expected 'run'");
            }
            expect(result.generators.map((g) => g.name)).toEqual(["ok"]);
            expect(result.skipped).toEqual([{ generator: local, reason: "local_output" }]);
        });

        it("returns empty-after-skip with the dropped generators when root autorelease is false", () => {
            const a = makeGenerator("a");
            const b = makeGenerator("b");
            const result = selectGeneratorsForAutomation({
                generators: [a, b],
                rootAutorelease: false,
                targeting: { type: "none" }
            });
            expect(result).toEqual({
                type: "empty-after-skip",
                skipped: [
                    { generator: a, reason: "opted_out" },
                    { generator: b, reason: "opted_out" }
                ]
            });
        });

        it("keeps a generator that overrides root autorelease: false with its own true", () => {
            const overridden = makeGenerator("overridden", {
                raw: { autorelease: true } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(
                selectGeneratorsForAutomation({
                    generators: [overridden],
                    rootAutorelease: false,
                    targeting: { type: "none" }
                })
            ).toEqual({ type: "run", generators: [overridden], skipped: [] });
        });

        it("returns empty-after-skip with the dropped generators when every generator is opted out", () => {
            const a = makeGenerator("a", { automation: optedOutAutomation });
            expect(
                selectGeneratorsForAutomation({
                    generators: [a],
                    rootAutorelease: undefined,
                    targeting: { type: "none" }
                })
            ).toEqual({
                type: "empty-after-skip",
                skipped: [{ generator: a, reason: "opted_out" }]
            });
        });

        it("returns empty-after-skip when given no generators", () => {
            expect(
                selectGeneratorsForAutomation({
                    generators: [],
                    rootAutorelease: undefined,
                    targeting: { type: "none" }
                })
            ).toEqual({ type: "empty-after-skip", skipped: [] });
        });
    });

    describe("targeting: 'name' (lenient — silently filter opt-outs)", () => {
        it("runs the targeted generator when it's eligible", () => {
            const gen = makeGenerator("a");
            expect(
                selectGeneratorsForAutomation({
                    generators: [gen],
                    rootAutorelease: undefined,
                    targeting: { type: "name", name: "dupe" }
                })
            ).toEqual({ type: "run", generators: [gen], skipped: [] });
        });

        it("silently filters out an opted-out match, returning empty-after-skip when only opt-outs remain", () => {
            const optedOut = makeGenerator("dupe", { automation: optedOutAutomation });
            expect(
                selectGeneratorsForAutomation({
                    generators: [optedOut],
                    rootAutorelease: undefined,
                    targeting: { type: "name", name: "dupe" }
                })
            ).toEqual({
                type: "empty-after-skip",
                skipped: [{ generator: optedOut, reason: "opted_out" }]
            });
        });

        it("narrows from 2 matching generators to 1 when one is opted out", () => {
            const eligible = makeGenerator("dupe");
            const optedOut = makeGenerator("dupe", { automation: optedOutAutomation });
            const result = selectGeneratorsForAutomation({
                generators: [eligible, optedOut],
                rootAutorelease: undefined,
                targeting: { type: "name", name: "dupe" }
            });
            expect(result).toEqual({
                type: "run",
                generators: [eligible],
                skipped: [{ generator: optedOut, reason: "opted_out" }]
            });
        });

        it("narrows from 2 matching generators to 0 when both are opted out", () => {
            const a = makeGenerator("dupe", { automation: optedOutAutomation });
            const b = makeGenerator("dupe", {
                raw: { autorelease: false } as generatorsYml.GeneratorInvocation["raw"]
            });
            expect(
                selectGeneratorsForAutomation({
                    generators: [a, b],
                    rootAutorelease: undefined,
                    targeting: { type: "name", name: "dupe" }
                })
            ).toEqual({
                type: "empty-after-skip",
                skipped: [
                    { generator: a, reason: "opted_out" },
                    { generator: b, reason: "opted_out" }
                ]
            });
        });
    });

    describe("targeting: 'index' (strict — reject opt-outs)", () => {
        it("runs the targeted generator when it's eligible", () => {
            const gen = makeGenerator("a");
            expect(
                selectGeneratorsForAutomation({
                    generators: [gen],
                    rootAutorelease: undefined,
                    targeting: { type: "index", index: 0 }
                })
            ).toEqual({ type: "run", generators: [gen], skipped: [] });
        });

        it("rejects when the indexed generator has automations.generate: false", () => {
            const optedOut = makeGenerator("opted-out", { automation: optedOutAutomation });
            expect(
                selectGeneratorsForAutomation({
                    generators: [optedOut],
                    rootAutorelease: undefined,
                    targeting: { type: "index", index: 0 }
                })
            ).toEqual({
                type: "reject-opted-out",
                generatorName: "opted-out",
                index: 0,
                reason: "automations.generate is false"
            });
        });

        it("rejects when the indexed generator has local-file-system output", () => {
            const local = makeGenerator("local", {
                absolutePathToLocalOutput:
                    "/tmp/out" as unknown as generatorsYml.GeneratorInvocation["absolutePathToLocalOutput"]
            });
            const result = selectGeneratorsForAutomation({
                generators: [local],
                rootAutorelease: undefined,
                targeting: { type: "index", index: 0 }
            });
            if (result.type !== "reject-opted-out") {
                throw new Error("Expected reject-opted-out");
            }
            expect(result.generatorName).toBe("local");
            expect(result.reason).toMatch(/local-file-system/);
        });

        it("rejects when the indexed generator inherits autorelease: false from root", () => {
            const result = selectGeneratorsForAutomation({
                generators: [makeGenerator("a")],
                rootAutorelease: false,
                targeting: { type: "index", index: 0 }
            });
            if (result.type !== "reject-opted-out") {
                throw new Error("Expected reject-opted-out");
            }
            expect(result.reason).toMatch(/root/);
        });

        it("carries the targeted index through to the reject result so callers don't need outer scope", () => {
            const optedOut = makeGenerator("x", { automation: optedOutAutomation });
            const result = selectGeneratorsForAutomation({
                generators: [optedOut],
                rootAutorelease: undefined,
                targeting: { type: "index", index: 7 }
            });
            if (result.type !== "reject-opted-out") {
                throw new Error("Expected reject-opted-out");
            }
            expect(result.index).toBe(7);
        });
    });
});

describe("buildAutomationTargeting", () => {
    it("prefers index over name when both are present", () => {
        expect(buildAutomationTargeting({ generatorIndex: 2, generatorName: "ignored" })).toEqual({
            type: "index",
            index: 2
        });
    });

    it("returns name when only name is set", () => {
        expect(buildAutomationTargeting({ generatorIndex: undefined, generatorName: "fernapi/foo" })).toEqual({
            type: "name",
            name: "fernapi/foo"
        });
    });

    it("returns none when neither is set", () => {
        expect(buildAutomationTargeting({ generatorIndex: undefined, generatorName: undefined })).toEqual({
            type: "none"
        });
    });
});
