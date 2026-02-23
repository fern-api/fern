/**
 * Generates per-fixture test files for parallel execution.
 *
 * Run before vitest starts so that generated files are discoverable.
 * Also called by globalSetup's onTestsRerun for watch mode.
 */

import { generateTestsFromDirectory } from "@fern-api/configs/vitest/generateTestsFromDirectory.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../../../..");

const TEST_DEFINITIONS_DIR = path.join(ROOT_DIR, "test-definitions");
const TEST_DEFINITIONS_OPENAPI_DIR = path.join(ROOT_DIR, "test-definitions-openapi");

export function generate() {
    // Generate per-fixture test files for IR generation (test-definitions)
    generateTestsFromDirectory({
        fixturesDir: path.join(TEST_DEFINITIONS_DIR, "fern/apis"),
        outputDir: path.join(__dirname, "src/ir/__test__/__generated__/test-definitions"),
        testRunnerImport: "../../runIRTestDefinition.js",
        testRunnerFunction: "runIRTestDefinition",
        statics: {
            testDefinitionsSource: "test-definitions"
        },
        timeout: 30_000
    });

    // Generate per-fixture test files for IR generation (test-definitions-openapi)
    generateTestsFromDirectory({
        fixturesDir: path.join(TEST_DEFINITIONS_OPENAPI_DIR, "fern/apis"),
        outputDir: path.join(__dirname, "src/ir/__test__/__generated__/test-definitions-openapi"),
        testRunnerImport: "../../runIRTestDefinition.js",
        testRunnerFunction: "runIRTestDefinition",
        statics: {
            testDefinitionsSource: "test-definitions-openapi"
        },
        getFixtureArgs: (name) => ({
            audiences: name === "audiences" ? { type: "select", audiences: ["public"] } : undefined
        }),
        timeout: 10_000
    });

    // Generate per-fixture test files for Dynamic IR generation (test-definitions)
    generateTestsFromDirectory({
        fixturesDir: path.join(TEST_DEFINITIONS_DIR, "fern/apis"),
        outputDir: path.join(__dirname, "src/dynamic-snippets/__test__/__generated__/test-definitions"),
        testRunnerImport: "../../runDynamicIRTestDefinition.js",
        testRunnerFunction: "runDynamicIRTestDefinition",
        statics: {
            testDefinitionsSource: "test-definitions"
        },
        timeout: 30_000
    });
}

// Run directly when executed as a script
generate();
