import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

/**
 * Base directory for all SDK diff test fixtures
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const FIXTURES_DIR = path.join(__dirname, "..", "__fixtures__");

/**
 * Helper to get absolute path to a fixture directory
 */
export function getFixturePath(fixtureName: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.join(FIXTURES_DIR, fixtureName));
}

/**
 * SDK fixture variation types for testing different scenarios
 */
export interface SdkFixtureScenario {
    name: string;
    description: string;
    expectedVersionBump: "major" | "minor" | "patch" | "no_change";
    expectedBreakingChanges: string[];
    expectedCommitType: string; // feat, fix, docs, refactor, etc.
    apiPath: string; // Path to the API definition for seed generation
}

/**
 * Predefined test scenarios for SDK diff testing using existing diffSampleIr definitions
 */
export const SDK_TEST_SCENARIOS: Record<string, SdkFixtureScenario> = {
    base: {
        name: "base",
        description: "Base SDK for comparison",
        expectedVersionBump: "no_change",
        expectedBreakingChanges: [],
        expectedCommitType: "chore",
        apiPath: "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/base"
    },
    addedEndpoint: {
        name: "addedEndpoint",
        description: "Add a new endpoint to the SDK",
        expectedVersionBump: "minor",
        expectedBreakingChanges: [],
        expectedCommitType: "feat",
        apiPath: "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/addedEndpoint"
    },
    addedOptionalTypeProperty: {
        name: "addedOptionalTypeProperty",
        description: "Add an optional property to existing type",
        expectedVersionBump: "minor",
        expectedBreakingChanges: [],
        expectedCommitType: "feat",
        apiPath:
            "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/addedOptionalTypeProperty"
    },
    addedRequiredTypeProperty: {
        name: "addedRequiredTypeProperty",
        description: "Add a required property to existing type",
        expectedVersionBump: "major",
        expectedBreakingChanges: ["Added required property to type"],
        expectedCommitType: "feat",
        apiPath:
            "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/addedRequiredTypeProperty"
    },
    addedType: {
        name: "addedType",
        description: "Add a new type definition",
        expectedVersionBump: "minor",
        expectedBreakingChanges: [],
        expectedCommitType: "feat",
        apiPath: "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/addedType"
    },
    addedHeader: {
        name: "addedHeader",
        description: "Add a new header to existing endpoint",
        expectedVersionBump: "minor",
        expectedBreakingChanges: [],
        expectedCommitType: "feat",
        apiPath: "/Users/jsklan/git/fern/packages/commons/test-utils/src/__test__/diffSampleIr/stable/addedHeader"
    }
};

/**
 * Copy a fixture directory to create a variation
 */
export async function copyFixture(sourceName: string, targetName: string): Promise<void> {
    const sourcePath = getFixturePath(sourceName);
    const targetPath = getFixturePath(targetName);

    // Use cp -r to copy the entire directory
    execSync(`cp -r "${sourcePath}" "${targetPath}"`);
}

/**
 * Generate SDK fixtures using seed CLI
 */
export async function generateSdkFixture(scenarioName: string, apiPath: string): Promise<void> {
    const outputPath = getFixturePath(scenarioName);

    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Generate SDK using seed run command to a temporary location
    const command = `node --enable-source-maps packages/seed/dist/cli.cjs run --generator ts-sdk --path ${apiPath} --skip-scripts`;

    try {
        const result = execSync(command, {
            cwd: "/Users/jsklan/git/fern",
            stdio: "pipe",
            encoding: "utf8"
        });

        // Parse the output to find the generated SDK path
        const outputMatch = result.match(/Generated (.*)/);
        if (outputMatch) {
            const generatedPath = outputMatch[1].trim();
            // Copy the generated SDK to our fixtures directory
            execSync(`cp -r "${generatedPath}"/* "${outputPath}"/`, { stdio: "pipe" });
        } else {
            throw new Error("Could not find generated SDK path in output");
        }
    } catch (error: any) {
        throw new Error(
            `Failed to generate SDK for ${scenarioName}: ${error.message}\nOutput: ${error.stdout || ""}\nError: ${error.stderr || ""}`
        );
    }
}

/**
 * Generate all SDK fixtures using the predefined scenarios
 */
export async function generateAllSdkFixtures(): Promise<void> {
    console.log("Generating all SDK fixtures using pnpm seed run...");

    for (const [scenarioName, scenario] of Object.entries(SDK_TEST_SCENARIOS)) {
        console.log(`Generating ${scenarioName}...`);
        await generateSdkFixture(scenarioName, scenario.apiPath);
    }

    console.log("All SDK fixtures generated successfully!");
}

/**
 * Validate that a fixture directory exists and has expected structure
 */
export async function validateFixture(fixtureName: string): Promise<boolean> {
    try {
        const fixturePath = getFixturePath(fixtureName);
        const stats = await fs.stat(fixturePath);

        if (!stats.isDirectory()) {
            return false;
        }

        // Check for key files that should exist in an SDK
        const keyFiles = ["package.json", "src/index.ts", "src/Client.ts"];
        for (const file of keyFiles) {
            const filePath = path.join(fixturePath, file);
            try {
                await fs.access(filePath);
            } catch {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Clean up all test fixtures except the base one
 */
export async function cleanupFixtures(): Promise<void> {
    const fixtures = await fs.readdir(FIXTURES_DIR);
    const toDelete = fixtures.filter((name) => name !== "base");

    await Promise.all(
        toDelete.map(async (name) => {
            const fixturePath = getFixturePath(name);
            await fs.rm(fixturePath, { recursive: true, force: true });
        })
    );
}
