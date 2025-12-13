import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import path from "path";

export const FAILED_TESTS_FILENAME = ".seed-failures.json";

export interface FailedTestsData {
    generators: string[];
    fixtures: string[];
    options: {
        skipScripts: boolean;
        local: boolean;
        parallel: number;
        logLevel: string;
        keepContainer: boolean;
        containerRuntime?: string;
    };
}

export interface GeneratorFailures {
    generator: string;
    fixtures: string[];
}

function getFailedTestsFilePath(): AbsoluteFilePath {
    // Save in the current working directory (repo root)
    return AbsoluteFilePath.of(path.join(process.cwd(), FAILED_TESTS_FILENAME));
}

export function saveFailedTests(generatorFailures: GeneratorFailures[], options: FailedTestsData["options"]): void {
    const filePath = getFailedTestsFilePath();

    // Filter to only generators with failures
    const failuresWithFixtures = generatorFailures.filter((gf) => gf.fixtures.length > 0);

    if (failuresWithFixtures.length === 0) {
        // No failures, remove the file if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            CONSOLE_LOGGER.debug(`Removed ${FAILED_TESTS_FILENAME} (no failures)`);
        }
        return;
    }

    const data: FailedTestsData = {
        generators: failuresWithFixtures.map((gf) => gf.generator),
        fixtures: failuresWithFixtures.flatMap((gf) => gf.fixtures),
        options
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    CONSOLE_LOGGER.info(
        `Saved ${failuresWithFixtures.flatMap((gf) => gf.fixtures).length} failed fixture(s) to ${FAILED_TESTS_FILENAME}`
    );
}

export function loadFailedTests(): FailedTestsData | undefined {
    const filePath = getFailedTestsFilePath();

    if (!fs.existsSync(filePath)) {
        return undefined;
    }

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as FailedTestsData;
    } catch (error) {
        CONSOLE_LOGGER.error(`Failed to read ${FAILED_TESTS_FILENAME}: ${(error as Error).message}`);
        return undefined;
    }
}

export function clearFailedTests(): void {
    const filePath = getFailedTestsFilePath();
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        CONSOLE_LOGGER.info(`Cleared ${FAILED_TESTS_FILENAME}`);
    }
}
