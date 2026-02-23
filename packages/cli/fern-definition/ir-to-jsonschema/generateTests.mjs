import { generateTestsFromDirectory } from "@fern-api/configs/vitest/generateTestsFromDirectory.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../..");

export function generate() {
    const testDefinitionsDir = path.join(REPO_ROOT, "test-definitions", "fern", "apis");

    generateTestsFromDirectory({
        fixturesDir: testDefinitionsDir,
        outputDir: path.join(__dirname, "src", "__test__", "__generated__", "test-definitions"),
        testRunnerImport: "../../runJsonSchemaTest.js",
        testRunnerFunction: "runJsonSchemaTest",
        timeout: 90_000
    });
}

generate();
