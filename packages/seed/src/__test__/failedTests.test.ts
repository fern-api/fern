import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs module before any imports
vi.mock("fs", () => ({
    default: {
        existsSync: vi.fn(),
        writeFileSync: vi.fn(),
        readFileSync: vi.fn(),
        unlinkSync: vi.fn()
    },
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    unlinkSync: vi.fn()
}));

// Mock the logger
vi.mock("@fern-api/logger", () => ({
    CONSOLE_LOGGER: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn()
    }
}));

import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";

import {
    clearFailedTests,
    FAILED_TESTS_FILENAME,
    FailedTestsData,
    GeneratorFailures,
    loadFailedTests,
    saveFailedTests
} from "../utils/failedTests";

describe("failedTests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("saveFailedTests", () => {
        it("saves failed tests to file when there are failures", () => {
            const generatorFailures: GeneratorFailures[] = [
                { generator: "ts-sdk", fixtures: ["exhaustive", "simple-api"] },
                { generator: "python-sdk", fixtures: ["pagination"] }
            ];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false,
                containerRuntime: "docker"
            };

            saveFailedTests(generatorFailures, options);

            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            const [filePath, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
            expect(filePath).toContain(FAILED_TESTS_FILENAME);

            const savedData = JSON.parse(content) as FailedTestsData;
            expect(savedData.generators).toEqual(["ts-sdk", "python-sdk"]);
            expect(savedData.fixtures).toEqual(["exhaustive", "simple-api", "pagination"]);
            expect(savedData.options).toEqual(options);
        });

        it("removes file when there are no failures", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            const generatorFailures: GeneratorFailures[] = [
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

            expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
            expect(fs.writeFileSync).not.toHaveBeenCalled();
            expect(CONSOLE_LOGGER.debug).toHaveBeenCalled();
        });

        it("does not try to remove file if it does not exist and there are no failures", () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const generatorFailures: GeneratorFailures[] = [];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false
            };

            saveFailedTests(generatorFailures, options);

            expect(fs.unlinkSync).not.toHaveBeenCalled();
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });

        it("filters out generators with no failures", () => {
            const generatorFailures: GeneratorFailures[] = [
                { generator: "ts-sdk", fixtures: ["exhaustive"] },
                { generator: "python-sdk", fixtures: [] },
                { generator: "java-sdk", fixtures: ["simple-api"] }
            ];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false
            };

            saveFailedTests(generatorFailures, options);

            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            const [, content] = vi.mocked(fs.writeFileSync).mock.calls[0] as [string, string];
            const savedData = JSON.parse(content) as FailedTestsData;
            expect(savedData.generators).toEqual(["ts-sdk", "java-sdk"]);
            expect(savedData.fixtures).toEqual(["exhaustive", "simple-api"]);
        });

        it("logs info message when saving failures", () => {
            const generatorFailures: GeneratorFailures[] = [{ generator: "ts-sdk", fixtures: ["exhaustive"] }];
            const options: FailedTestsData["options"] = {
                skipScripts: false,
                local: true,
                parallel: 4,
                logLevel: "info",
                keepContainer: false
            };

            saveFailedTests(generatorFailures, options);

            expect(CONSOLE_LOGGER.info).toHaveBeenCalledWith(expect.stringContaining("1 failed fixture(s)"));
        });
    });

    describe("loadFailedTests", () => {
        it("returns undefined when file does not exist", () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = loadFailedTests();

            expect(result).toBeUndefined();
            expect(fs.readFileSync).not.toHaveBeenCalled();
        });

        it("returns parsed data when file exists", () => {
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

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));

            const result = loadFailedTests();

            expect(result).toEqual(mockData);
        });

        it("returns undefined and logs error when file is invalid JSON", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue("invalid json {");

            const result = loadFailedTests();

            expect(result).toBeUndefined();
            expect(CONSOLE_LOGGER.error).toHaveBeenCalledWith(expect.stringContaining("Failed to read"));
        });

        it("returns undefined and logs error when read throws", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                throw new Error("Permission denied");
            });

            const result = loadFailedTests();

            expect(result).toBeUndefined();
            expect(CONSOLE_LOGGER.error).toHaveBeenCalledWith(expect.stringContaining("Permission denied"));
        });
    });

    describe("clearFailedTests", () => {
        it("removes file when it exists", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            clearFailedTests();

            expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
            expect(CONSOLE_LOGGER.info).toHaveBeenCalledWith(expect.stringContaining("Cleared"));
        });

        it("does nothing when file does not exist", () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            clearFailedTests();

            expect(fs.unlinkSync).not.toHaveBeenCalled();
            expect(CONSOLE_LOGGER.info).not.toHaveBeenCalled();
        });
    });

    describe("FAILED_TESTS_FILENAME", () => {
        it("has the expected value", () => {
            expect(FAILED_TESTS_FILENAME).toBe(".seed-failures.json");
        });
    });
});
