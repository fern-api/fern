import type { generatorsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";
import { filterGenerators, parseGeneratorArg } from "../commands/generate/filterGenerators.js";

function makeGenerator(name: string): generatorsYml.GeneratorInvocation {
    // Minimal stub — only `name` is used by filterGenerators
    return { name } as unknown as generatorsYml.GeneratorInvocation;
}

describe("filterGenerators", () => {
    const generators = [
        makeGenerator("fernapi/fern-typescript-node-sdk"),
        makeGenerator("fernapi/fern-python-sdk"),
        makeGenerator("fernapi/fern-typescript-node-sdk")
    ];

    describe("no filter", () => {
        it("returns all generators when no index or name is specified", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: undefined,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.generators).toHaveLength(3);
            }
        });
    });

    describe("index-based selection", () => {
        it("selects first generator by index 0", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: 0,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.generators).toHaveLength(1);
                expect(result.generators[0]?.name).toBe("fernapi/fern-typescript-node-sdk");
            }
        });

        it("selects second generator by index 1", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: 1,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.generators).toHaveLength(1);
                expect(result.generators[0]?.name).toBe("fernapi/fern-python-sdk");
            }
        });

        it("selects third generator (duplicate name) by index 2", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: 2,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.generators).toHaveLength(1);
                expect(result.generators[0]?.name).toBe("fernapi/fern-typescript-node-sdk");
                // Verify it's the third entry (index 2), not the first (index 0)
                expect(result.generators[0]).toBe(generators[2]);
            }
        });

        it("returns error for out-of-bounds index", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: 5,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toContain("out of bounds");
                expect(result.error).toContain("3 generators available");
            }
        });

        it("returns error for negative index", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: -1,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toContain("out of bounds");
            }
        });

        it("returns error for index on empty group", () => {
            const result = filterGenerators({
                generators: [],
                generatorIndex: 0,
                generatorName: undefined,
                groupName: "sdk"
            });
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toContain("0 generators available");
            }
        });
    });

    describe("name-based selection", () => {
        it("selects all generators matching a name", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: undefined,
                generatorName: "fernapi/fern-typescript-node-sdk",
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                // Both index 0 and index 2 match
                expect(result.generators).toHaveLength(2);
                expect(result.generators.every((g) => g.name === "fernapi/fern-typescript-node-sdk")).toBe(true);
            }
        });

        it("selects single generator by unique name", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: undefined,
                generatorName: "fernapi/fern-python-sdk",
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.generators).toHaveLength(1);
                expect(result.generators[0]?.name).toBe("fernapi/fern-python-sdk");
            }
        });

        it("returns error for non-existent name", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: undefined,
                generatorName: "fernapi/fern-go-sdk",
                groupName: "sdk"
            });
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toContain("not found in group 'sdk'");
                expect(result.error).toContain("fernapi/fern-typescript-node-sdk");
            }
        });
    });

    describe("index takes precedence over name", () => {
        it("uses index when both are provided", () => {
            const result = filterGenerators({
                generators,
                generatorIndex: 1,
                generatorName: "fernapi/fern-typescript-node-sdk",
                groupName: "sdk"
            });
            expect(result.ok).toBe(true);
            if (result.ok) {
                // Index 1 is python, not typescript — index wins
                expect(result.generators).toHaveLength(1);
                expect(result.generators[0]?.name).toBe("fernapi/fern-python-sdk");
            }
        });
    });
});

describe("parseGeneratorArg", () => {
    it("returns both undefined for undefined input", () => {
        expect(parseGeneratorArg(undefined)).toEqual({ generatorName: undefined, generatorIndex: undefined });
    });

    it("parses '0' as index 0", () => {
        expect(parseGeneratorArg("0")).toEqual({ generatorName: undefined, generatorIndex: 0 });
    });

    it("parses '3' as index 3", () => {
        expect(parseGeneratorArg("3")).toEqual({ generatorName: undefined, generatorIndex: 3 });
    });

    it("parses generator name with slashes", () => {
        expect(parseGeneratorArg("fernapi/fern-typescript-node-sdk")).toEqual({
            generatorName: "fernapi/fern-typescript-node-sdk",
            generatorIndex: undefined
        });
    });

    it("treats negative numbers as names", () => {
        expect(parseGeneratorArg("-1")).toEqual({ generatorName: "-1", generatorIndex: undefined });
    });

    it("treats floats as names", () => {
        expect(parseGeneratorArg("1.5")).toEqual({ generatorName: "1.5", generatorIndex: undefined });
    });

    it("treats empty string as a name", () => {
        expect(parseGeneratorArg("")).toEqual({ generatorName: "", generatorIndex: undefined });
    });
});
