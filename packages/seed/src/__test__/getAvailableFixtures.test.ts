import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { getAvailableFixturesFromList } from "../commands/list-test-fixtures/getAvailableFixtures";
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
            const allFixtures = ["java-special", "ts-custom", "go-fiber"];

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
            const allFixtures = ["alias", "go-fiber", "java-special"];

            const result = getAvailableFixturesFromList(generator, allFixtures, false);

            expect(result).toEqual(["alias", "go-fiber"]);
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
