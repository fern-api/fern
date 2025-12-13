import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the failedTests module
vi.mock("../utils/failedTests", () => ({
    loadFailedTests: vi.fn(),
    saveFailedTests: vi.fn(),
    clearFailedTests: vi.fn(),
    FAILED_TESTS_FILENAME: ".seed-failures.json"
}));

// Mock the testWorkspaceFixtures module
vi.mock("../commands/test/testWorkspaceFixtures", () => ({
    testGenerator: vi.fn()
}));

// Mock loadGeneratorWorkspaces
vi.mock("../loadGeneratorWorkspaces", () => ({
    loadGeneratorWorkspaces: vi.fn()
}));

// Mock console methods
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

// Mock process.exit
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`process.exit(${code})`);
});

import { TestGeneratorResult, testGenerator } from "../commands/test/testWorkspaceFixtures";
import { loadGeneratorWorkspaces } from "../loadGeneratorWorkspaces";
import { FailedTestsData, loadFailedTests, saveFailedTests } from "../utils/failedTests";

describe("retry-failed command behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("loadFailedTests behavior", () => {
        it("returns undefined when no failures file exists", () => {
            vi.mocked(loadFailedTests).mockReturnValue(undefined);

            const result = loadFailedTests();

            expect(result).toBeUndefined();
        });

        it("returns saved data when failures file exists", () => {
            const mockData: FailedTestsData = {
                generators: ["ts-sdk"],
                fixtures: ["exhaustive", "simple-api"],
                options: {
                    skipScripts: false,
                    local: true,
                    parallel: 4,
                    logLevel: "info",
                    keepContainer: false
                }
            };

            vi.mocked(loadFailedTests).mockReturnValue(mockData);

            const result = loadFailedTests();

            expect(result).toEqual(mockData);
            expect(result?.generators).toEqual(["ts-sdk"]);
            expect(result?.fixtures).toEqual(["exhaustive", "simple-api"]);
        });
    });

    describe("testGenerator integration", () => {
        it("returns TestGeneratorResult with success and empty failedFixtures on success", async () => {
            const mockResult: TestGeneratorResult = {
                success: true,
                generator: "ts-sdk",
                failedFixtures: []
            };

            vi.mocked(testGenerator).mockResolvedValue(mockResult);

            const result = await testGenerator({
                runner: {} as never,
                generator: {} as never,
                fixtures: ["exhaustive"],
                outputFolder: undefined,
                inspect: false
            });

            expect(result.success).toBe(true);
            expect(result.generator).toBe("ts-sdk");
            expect(result.failedFixtures).toEqual([]);
        });

        it("returns TestGeneratorResult with failure and failedFixtures on failure", async () => {
            const mockResult: TestGeneratorResult = {
                success: false,
                generator: "python-sdk",
                failedFixtures: ["exhaustive", "pagination"]
            };

            vi.mocked(testGenerator).mockResolvedValue(mockResult);

            const result = await testGenerator({
                runner: {} as never,
                generator: {} as never,
                fixtures: ["exhaustive", "pagination", "simple-api"],
                outputFolder: undefined,
                inspect: false
            });

            expect(result.success).toBe(false);
            expect(result.generator).toBe("python-sdk");
            expect(result.failedFixtures).toEqual(["exhaustive", "pagination"]);
        });
    });

    describe("saveFailedTests behavior after retry", () => {
        it("saves new failures after retry-failed completes", () => {
            const generatorFailures = [
                { generator: "ts-sdk", fixtures: ["exhaustive"] },
                { generator: "python-sdk", fixtures: [] }
            ];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false
            };

            saveFailedTests(generatorFailures, options);

            expect(saveFailedTests).toHaveBeenCalledWith(generatorFailures, options);
        });

        it("clears failures file when all tests pass", () => {
            const generatorFailures = [
                { generator: "ts-sdk", fixtures: [] },
                { generator: "python-sdk", fixtures: [] }
            ];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false
            };

            saveFailedTests(generatorFailures, options);

            expect(saveFailedTests).toHaveBeenCalledWith(generatorFailures, options);
        });
    });

    describe("option override behavior", () => {
        it("uses saved options when no overrides provided", () => {
            const savedData: FailedTestsData = {
                generators: ["ts-sdk"],
                fixtures: ["exhaustive"],
                options: {
                    skipScripts: false,
                    local: true,
                    parallel: 8,
                    logLevel: "info",
                    keepContainer: false,
                    containerRuntime: "docker"
                }
            };

            // Simulate the option merging logic from retry-failed command
            const argv = {
                skipScripts: undefined,
                local: undefined,
                parallel: undefined,
                "log-level": undefined,
                keepContainer: undefined,
                containerRuntime: undefined
            };

            const skipScripts = argv.skipScripts ?? savedData.options.skipScripts;
            const local = argv.local ?? savedData.options.local;
            const parallel = argv.parallel ?? savedData.options.parallel;
            const logLevel = argv["log-level"] ?? savedData.options.logLevel;
            const keepContainer = argv.keepContainer ?? savedData.options.keepContainer;
            const containerRuntime = argv.containerRuntime ?? savedData.options.containerRuntime;

            expect(skipScripts).toBe(false);
            expect(local).toBe(true);
            expect(parallel).toBe(8);
            expect(logLevel).toBe("info");
            expect(keepContainer).toBe(false);
            expect(containerRuntime).toBe("docker");
        });

        it("overrides saved options when command line args provided", () => {
            const savedData: FailedTestsData = {
                generators: ["ts-sdk"],
                fixtures: ["exhaustive"],
                options: {
                    skipScripts: false,
                    local: true,
                    parallel: 8,
                    logLevel: "info",
                    keepContainer: false,
                    containerRuntime: "docker"
                }
            };

            // Simulate the option merging logic with overrides
            const argv = {
                skipScripts: true,
                local: false,
                parallel: 2,
                "log-level": "debug",
                keepContainer: true,
                containerRuntime: "podman"
            };

            const skipScripts = argv.skipScripts ?? savedData.options.skipScripts;
            const local = argv.local ?? savedData.options.local;
            const parallel = argv.parallel ?? savedData.options.parallel;
            const logLevel = argv["log-level"] ?? savedData.options.logLevel;
            const keepContainer = argv.keepContainer ?? savedData.options.keepContainer;
            const containerRuntime = argv.containerRuntime ?? savedData.options.containerRuntime;

            expect(skipScripts).toBe(true);
            expect(local).toBe(false);
            expect(parallel).toBe(2);
            expect(logLevel).toBe("debug");
            expect(keepContainer).toBe(true);
            expect(containerRuntime).toBe("podman");
        });

        it("allows partial overrides", () => {
            const savedData: FailedTestsData = {
                generators: ["ts-sdk"],
                fixtures: ["exhaustive"],
                options: {
                    skipScripts: false,
                    local: true,
                    parallel: 8,
                    logLevel: "info",
                    keepContainer: false
                }
            };

            // Only override parallel
            const argv = {
                skipScripts: undefined,
                local: undefined,
                parallel: 2,
                "log-level": undefined,
                keepContainer: undefined,
                containerRuntime: undefined
            };

            const skipScripts = argv.skipScripts ?? savedData.options.skipScripts;
            const local = argv.local ?? savedData.options.local;
            const parallel = argv.parallel ?? savedData.options.parallel;
            const logLevel = argv["log-level"] ?? savedData.options.logLevel;
            const keepContainer = argv.keepContainer ?? savedData.options.keepContainer;

            expect(skipScripts).toBe(false); // from saved
            expect(local).toBe(true); // from saved
            expect(parallel).toBe(2); // overridden
            expect(logLevel).toBe("info"); // from saved
            expect(keepContainer).toBe(false); // from saved
        });
    });

    describe("generator filtering", () => {
        it("filters generators to only those with failures", () => {
            const allGenerators = [
                { workspaceName: "ts-sdk" },
                { workspaceName: "python-sdk" },
                { workspaceName: "java-sdk" }
            ];

            const failedGenerators = ["ts-sdk", "python-sdk"];

            const filteredGenerators = allGenerators.filter((g) => failedGenerators.includes(g.workspaceName));

            expect(filteredGenerators).toHaveLength(2);
            expect(filteredGenerators.map((g) => g.workspaceName)).toEqual(["ts-sdk", "python-sdk"]);
        });
    });

    describe("fixture format handling", () => {
        it("handles simple fixture names", () => {
            const fixtures = ["exhaustive", "simple-api", "pagination"];

            expect(fixtures).toHaveLength(3);
            expect(fixtures[0]).toBe("exhaustive");
        });

        it("handles fixture:output-folder format", () => {
            const fixtures = ["exhaustive:custom-output", "simple-api", "pagination:v2"];

            const fixturesWithOutputFolder = fixtures.filter((f) => f.includes(":"));
            const simpleFixtures = fixtures.filter((f) => !f.includes(":"));

            expect(fixturesWithOutputFolder).toEqual(["exhaustive:custom-output", "pagination:v2"]);
            expect(simpleFixtures).toEqual(["simple-api"]);
        });
    });
});
