import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs/promises before any imports
vi.mock("fs/promises", () => ({
    rm: vi.fn()
}));

// Mock the testWorkspaceFixtures module before importing cleanOrphanedSeedFolders
vi.mock("../commands/test/testWorkspaceFixtures", () => ({
    LANGUAGE_SPECIFIC_FIXTURE_PREFIXES: ["csharp", "go", "java", "python", "ruby", "ts"],
    FIXTURES: []
}));

// Mock fs module
vi.mock("fs", () => ({
    default: {
        readdirSync: vi.fn(),
        statSync: vi.fn()
    },
    readdirSync: vi.fn(),
    statSync: vi.fn()
}));

import fs from "fs";
import { rm } from "fs/promises";

import * as Clean from "../commands/clean/cleanOrphanedSeedFolders";
import { GeneratorWorkspace } from "../loadGeneratorWorkspaces";

describe("cleanOrphanedSeedFolders", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns empty result when there are no orphans", async () => {
        // Setup mocks to return no orphans
        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return ["fixture-a"] as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return ["fixture-a"] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of("/seed/python-sdk"),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const result = await Clean.cleanOrphanedSeedFolders([generator], true);

        expect(result.orphanedFolders).toHaveLength(0);
        expect(result.deletedFolders).toHaveLength(0);
    });

    it("does not delete in dry-run mode", async () => {
        // Setup mocks to return one orphan
        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return ["fixture-a"] as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return ["fixture-a", "orphan-fixture"] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of("/seed/python-sdk"),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const result = await Clean.cleanOrphanedSeedFolders([generator], true);

        expect(result.orphanedFolders).toHaveLength(1);
        expect(result.orphanedFolders[0]?.folder).toBe("orphan-fixture");
        expect(result.deletedFolders).toEqual([]);
        expect(rm).not.toHaveBeenCalled();
    });

    it("deletes all orphans when dryRun is false", async () => {
        // Setup mocks to return two orphans
        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return ["fixture-a"] as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return ["fixture-a", "orphan-1", "orphan-2"] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        vi.mocked(rm).mockResolvedValue(undefined);

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of("/seed/python-sdk"),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const result = await Clean.cleanOrphanedSeedFolders([generator], false);

        expect(rm).toHaveBeenCalledTimes(2);
        expect(result.deletedFolders).toHaveLength(2);
    });

    it("handles deletion errors gracefully", async () => {
        // Setup mocks to return two orphans
        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return ["fixture-a"] as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return ["fixture-a", "orphan-1", "orphan-2"] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        vi.mocked(rm).mockRejectedValueOnce(new Error("Permission denied")).mockResolvedValueOnce(undefined);

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of("/seed/python-sdk"),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const result = await Clean.cleanOrphanedSeedFolders([generator], false);

        expect(rm).toHaveBeenCalledTimes(2);
        expect(result.deletedFolders).toHaveLength(1);
    });
});

describe("findOrphanedSeedFolders", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("marks fixture folders without test definitions as orphaned", () => {
        const seedRoot = "/seed/python-sdk";

        const testDefinitions = ["fixture-a", "fixture-b", "common-fixture"];
        const seedTopLevel = ["fixture-a", "common-fixture", "orphan-fixture"];

        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return testDefinitions as unknown as ReturnType<typeof fs.readdirSync>;
            }
            if (d === seedRoot) {
                return seedTopLevel as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return [] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of(seedRoot),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const orphans = Clean.findOrphanedSeedFolders([generator]);

        expect(orphans.some((o) => o.generator === "python-sdk" && o.folder === "orphan-fixture")).toBe(true);
        expect(orphans.some((o) => o.folder === "fixture-a")).toBe(false);
        expect(orphans.some((o) => o.folder === "common-fixture")).toBe(false);
    });

    it("marks subfolders not in fixture config as orphaned", () => {
        const seedRoot = "/seed/python-sdk";

        const testDefinitions = ["exhaustive"];
        const seedTopLevel = ["exhaustive"];
        const exhaustiveSubFolders = ["no-custom-config", "inline-path-params", ".github", "src", "tests"];

        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return testDefinitions as unknown as ReturnType<typeof fs.readdirSync>;
            }
            if (d === seedRoot) {
                return seedTopLevel as unknown as ReturnType<typeof fs.readdirSync>;
            }
            if (d === `${seedRoot}/exhaustive`) {
                return exhaustiveSubFolders as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return [] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of(seedRoot),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk",
                fixtures: {
                    exhaustive: [{ outputFolder: "no-custom-config" }, { outputFolder: "inline-path-params" }]
                }
            }
        };

        const orphans = Clean.findOrphanedSeedFolders([generator]);

        expect(orphans.some((o) => o.folder === "exhaustive" && o.subFolder === ".github")).toBe(true);
        expect(orphans.some((o) => o.folder === "exhaustive" && o.subFolder === "src")).toBe(true);
        expect(orphans.some((o) => o.folder === "exhaustive" && o.subFolder === "tests")).toBe(true);
        expect(orphans.some((o) => o.folder === "exhaustive" && o.subFolder === "no-custom-config")).toBe(false);
        expect(orphans.some((o) => o.folder === "exhaustive" && o.subFolder === "inline-path-params")).toBe(false);
    });

    it("ignores language-specific fixtures for non-matching generators", () => {
        const seedRoot = "/seed/python-sdk";

        const testDefinitions = ["common-fixture", "java-special"];
        const seedTopLevel = ["common-fixture", "java-special"];

        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return testDefinitions as unknown as ReturnType<typeof fs.readdirSync>;
            }
            if (d === seedRoot) {
                return seedTopLevel as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return [] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of(seedRoot),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const orphans = Clean.findOrphanedSeedFolders([generator]);

        expect(orphans.some((o) => o.folder === "java-special")).toBe(true);
        expect(orphans.some((o) => o.folder === "common-fixture")).toBe(false);
    });

    it("returns empty array when all folders match expected fixtures", () => {
        const seedRoot = "/seed/python-sdk";

        const testDefinitions = ["fixture-a", "fixture-b"];
        const seedTopLevel = ["fixture-a", "fixture-b"];

        vi.mocked(fs.readdirSync).mockImplementation((dir) => {
            const d = dir.toString();
            if (d.includes("test-definitions") && d.includes("apis")) {
                return testDefinitions as unknown as ReturnType<typeof fs.readdirSync>;
            }
            if (d === seedRoot) {
                return seedTopLevel as unknown as ReturnType<typeof fs.readdirSync>;
            }
            return [] as unknown as ReturnType<typeof fs.readdirSync>;
        });

        vi.mocked(fs.statSync).mockImplementation(() => {
            return { isDirectory: () => true } as ReturnType<typeof fs.statSync>;
        });

        const generator: GeneratorWorkspace = {
            workspaceName: "python-sdk",
            absolutePathToWorkspace: AbsoluteFilePath.of(seedRoot),
            workspaceConfig: {
                image: "test",
                displayName: "Python SDK",
                irVersion: "1.0.0",
                test: {} as never,
                publish: {} as never,
                defaultOutputMode: "github",
                generatorType: "sdk"
            }
        };

        const orphans = Clean.findOrphanedSeedFolders([generator]);

        expect(orphans).toHaveLength(0);
    });
});
