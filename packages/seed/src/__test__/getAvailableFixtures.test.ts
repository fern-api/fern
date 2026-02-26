import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import {
    calculateRecommendedGroups,
    getAvailableFixturesFromList,
    splitFixturesIntoGroups
} from "../commands/list-test-fixtures/getAvailableFixtures";
import { GeneratorWorkspace } from "../loadGeneratorWorkspaces";

describe("getAvailableFixtures", () => {
    const createGenerator = (
        workspaceName: string,
        fixtures?: Record<string, { outputFolder: string }[]>
    ): GeneratorWorkspace => ({
        workspaceName,
        absolutePathToWorkspace: AbsoluteFilePath.of(`/seed/${workspaceName}`),
        workspaceConfig: {
            image: "test",
            displayName: workspaceName,
            irVersion: "1.0.0",
            test: {} as never,
            publish: {} as never,
            defaultOutputMode: "github",
            generatorType: "SDK",
            fixtures
        }
    });

    describe("without output folders", () => {
        it("returns all fixtures when no language-specific prefixes match", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures = ["alias", "basic-auth", "exhaustive", "file-upload"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "basic-auth", "exhaustive", "file-upload"]);
        });

        it("filters out language-specific fixtures for non-matching generators", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures = ["alias", "java-special", "ts-custom", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "exhaustive"]);
            expect(result).not.toContain("java-special");
            expect(result).not.toContain("ts-custom");
        });

        it("includes language-specific fixtures for matching generators", () => {
            const generator = createGenerator("java-sdk");
            const allFixtures = ["alias", "java-special", "java-builder-extension", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "java-special", "java-builder-extension", "exhaustive"]);
        });

        it("handles ts prefix for typescript generators", () => {
            const generator = createGenerator("ts-sdk");
            const allFixtures = ["alias", "ts-custom", "java-special", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "ts-custom", "exhaustive"]);
            expect(result).not.toContain("java-special");
        });

        it("returns empty array when all fixtures are for other languages", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures = ["java-special", "ts-custom", "csharp-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual([]);
        });
    });

    describe("with output folders", () => {
        it("returns fixtures without output folders when no config exists", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures = ["alias", "basic-auth"];

            const result = getAvailableFixturesFromList(generator, allFixtures, true);

            expect(result).toEqual(["alias", "basic-auth"]);
        });

        it("expands fixtures with output folders from config", () => {
            const generator = createGenerator("python-sdk", {
                exhaustive: [{ outputFolder: "no-custom-config" }, { outputFolder: "inline-path-params" }]
            });
            const allFixtures = ["alias", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, true);

            expect(result).toEqual(["alias", "exhaustive:no-custom-config", "exhaustive:inline-path-params"]);
        });

        it("handles mixed fixtures with and without output folders", () => {
            const generator = createGenerator("python-sdk", {
                exhaustive: [{ outputFolder: "config-a" }, { outputFolder: "config-b" }],
                enum: [{ outputFolder: "forward-compatible" }]
            });
            const allFixtures = ["alias", "exhaustive", "enum", "basic-auth"];

            const result = getAvailableFixturesFromList(generator, allFixtures, true);

            expect(result).toEqual([
                "alias",
                "exhaustive:config-a",
                "exhaustive:config-b",
                "enum:forward-compatible",
                "basic-auth"
            ]);
        });

        it("filters language-specific fixtures before expanding output folders", () => {
            const generator = createGenerator("python-sdk", {
                "java-special": [{ outputFolder: "config-a" }],
                exhaustive: [{ outputFolder: "no-custom-config" }]
            });
            const allFixtures = ["alias", "java-special", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, true);

            expect(result).toEqual(["alias", "exhaustive:no-custom-config"]);
            expect(result).not.toContain("java-special:config-a");
        });

        it("handles empty output folder config array", () => {
            const generator = createGenerator("python-sdk", {
                exhaustive: []
            });
            const allFixtures = ["alias", "exhaustive"];

            const result = getAvailableFixturesFromList(generator, allFixtures, true);

            expect(result).toEqual(["alias", "exhaustive"]);
        });
    });

    describe("edge cases", () => {
        it("handles empty fixtures list", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures: string[] = [];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual([]);
        });

        it("handles generator with model suffix", () => {
            const generator = createGenerator("java-model");
            const allFixtures = ["alias", "java-special", "ts-custom"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "java-special"]);
        });

        it("handles csharp prefix", () => {
            const generator = createGenerator("csharp-sdk");
            const allFixtures = ["alias", "csharp-special", "java-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "csharp-special"]);
        });

        it("handles go prefix", () => {
            const generator = createGenerator("go-sdk");
            const allFixtures = ["alias", "go-special", "java-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "go-special"]);
        });

        it("handles ruby prefix", () => {
            const generator = createGenerator("ruby-sdk");
            const allFixtures = ["alias", "ruby-special", "java-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "ruby-special"]);
        });

        it("handles python prefix", () => {
            const generator = createGenerator("python-sdk");
            const allFixtures = ["alias", "python-special", "java-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "python-special"]);
        });
    });
});

describe("splitFixturesIntoGroups", () => {
    describe("single group scenarios", () => {
        it("returns single group with 'all' when numGroups is 0", () => {
            const fixtures = ["fixture1", "fixture2", "fixture3"];

            const result = splitFixturesIntoGroups(fixtures, 0);

            expect(result).toEqual([{ fixtures: ["all"] }]);
        });

        it("returns single group with 'all' when fixture count is 20 or less", () => {
            const fixtures = Array.from({ length: 20 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 5);

            expect(result).toEqual([{ fixtures: ["all"] }]);
        });

        it("returns single group with 'all' when fixture count is less than 20", () => {
            const fixtures = Array.from({ length: 15 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 3);

            expect(result).toEqual([{ fixtures: ["all"] }]);
        });
    });

    describe("multiple group scenarios", () => {
        it("splits fixtures evenly into groups", () => {
            const fixtures = Array.from({ length: 30 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 3);

            expect(result).toHaveLength(3);
            expect(result[0]?.fixtures).toHaveLength(10);
            expect(result[1]?.fixtures).toHaveLength(10);
            expect(result[2]?.fixtures).toHaveLength(10);
        });

        it("handles uneven splits with ceiling division", () => {
            const fixtures = Array.from({ length: 25 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 3);

            // 25 / 3 = 8.33, ceiling = 9
            // Group 1: 0-8 (9 fixtures)
            // Group 2: 9-17 (9 fixtures)
            // Group 3: 18-24 (7 fixtures)
            expect(result).toHaveLength(3);
            expect(result[0]?.fixtures).toHaveLength(9);
            expect(result[1]?.fixtures).toHaveLength(9);
            expect(result[2]?.fixtures).toHaveLength(7);
        });

        it("preserves fixture order within groups", () => {
            const fixtures = [
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u"
            ];

            const result = splitFixturesIntoGroups(fixtures, 3);

            // 21 fixtures / 3 groups = 7 per group
            expect(result[0]?.fixtures).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
            expect(result[1]?.fixtures).toEqual(["h", "i", "j", "k", "l", "m", "n"]);
            expect(result[2]?.fixtures).toEqual(["o", "p", "q", "r", "s", "t", "u"]);
        });

        it("handles more groups than fixtures", () => {
            const fixtures = Array.from({ length: 25 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 10);

            // 25 / 10 = 2.5, ceiling = 3
            // Should create groups with 3 fixtures each, some groups may be empty
            const totalFixtures = result.reduce((sum, g) => sum + g.fixtures.length, 0);
            expect(totalFixtures).toBe(25);
            // All groups should have fixtures (no empty groups)
            result.forEach((group) => {
                expect(group.fixtures.length).toBeGreaterThan(0);
            });
        });

        it("handles exactly 21 fixtures (just over threshold)", () => {
            const fixtures = Array.from({ length: 21 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 3);

            expect(result).toHaveLength(3);
            // 21 / 3 = 7 per group
            expect(result[0]?.fixtures).toHaveLength(7);
            expect(result[1]?.fixtures).toHaveLength(7);
            expect(result[2]?.fixtures).toHaveLength(7);
        });
    });

    describe("edge cases", () => {
        it("handles empty fixtures array with numGroups > 0", () => {
            const fixtures: string[] = [];

            const result = splitFixturesIntoGroups(fixtures, 3);

            // Empty array has 0 fixtures, which is <= 20, so returns single group with 'all'
            expect(result).toEqual([{ fixtures: ["all"] }]);
        });

        it("handles single fixture with numGroups > 0", () => {
            const fixtures = ["single"];

            const result = splitFixturesIntoGroups(fixtures, 3);

            // 1 fixture is <= 20, so returns single group with 'all'
            expect(result).toEqual([{ fixtures: ["all"] }]);
        });

        it("handles large number of fixtures", () => {
            const fixtures = Array.from({ length: 200 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 10);

            // 200 / 10 = 20 per group
            expect(result).toHaveLength(10);
            result.forEach((group) => {
                expect(group.fixtures).toHaveLength(20);
            });
        });

        it("handles numGroups of 1 with many fixtures", () => {
            const fixtures = Array.from({ length: 50 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, 1);

            expect(result).toHaveLength(1);
            expect(result[0]?.fixtures).toHaveLength(50);
        });
    });

    describe("auto-calculate groups (numGroups = -1)", () => {
        it("returns single group with 'all' when fixture count is 20 or less", () => {
            const fixtures = Array.from({ length: 20 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, -1);

            expect(result).toEqual([{ fixtures: ["all"] }]);
        });

        it("auto-calculates groups for 50 fixtures", () => {
            const fixtures = Array.from({ length: 50 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, -1);

            // 50 fixtures / 10 = 5 groups
            expect(result).toHaveLength(5);
        });

        it("auto-calculates groups for 100 fixtures", () => {
            const fixtures = Array.from({ length: 100 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, -1);

            // 100 fixtures / 10 = 10 groups
            expect(result).toHaveLength(10);
        });

        it("caps at 15 groups for very large fixture counts", () => {
            const fixtures = Array.from({ length: 200 }, (_, i) => `fixture${i}`);

            const result = splitFixturesIntoGroups(fixtures, -1);

            // 200 / 10 = 20, but capped at 15
            expect(result).toHaveLength(15);
        });
    });
});

describe("calculateRecommendedGroups", () => {
    it("returns 0 for fixture count <= 20", () => {
        expect(calculateRecommendedGroups(0)).toBe(0);
        expect(calculateRecommendedGroups(10)).toBe(0);
        expect(calculateRecommendedGroups(20)).toBe(0);
    });

    it("returns minimum of 2 groups for 21-30 fixtures", () => {
        expect(calculateRecommendedGroups(21)).toBe(3);
        expect(calculateRecommendedGroups(25)).toBe(3);
        expect(calculateRecommendedGroups(30)).toBe(3);
    });

    it("calculates 1 group per 10 fixtures", () => {
        expect(calculateRecommendedGroups(40)).toBe(4);
        expect(calculateRecommendedGroups(50)).toBe(5);
        expect(calculateRecommendedGroups(70)).toBe(7);
        expect(calculateRecommendedGroups(100)).toBe(10);
    });

    it("caps at 15 groups maximum", () => {
        expect(calculateRecommendedGroups(150)).toBe(15);
        expect(calculateRecommendedGroups(200)).toBe(15);
        expect(calculateRecommendedGroups(500)).toBe(15);
    });

    it("handles edge case of exactly 21 fixtures", () => {
        // 21 / 10 = 2.1, ceiling = 3
        expect(calculateRecommendedGroups(21)).toBe(3);
    });
});
