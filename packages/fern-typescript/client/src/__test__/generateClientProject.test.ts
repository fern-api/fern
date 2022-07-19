import { HelperManager } from "@fern-typescript/helper-manager";
import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientProject } from "../generateClientProject";

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const FIXTURES = ["posts", "no-errors", "chat", "auth"];
const MOCK_HELPERS_MANAGERS = new HelperManager({ encodings: {} });

describe("generateClientProject", () => {
    for (const fixture of FIXTURES) {
        itFernETE({
            testName: fixture,
            testFile: __filename,
            pathToFixture: path.join(FIXTURES_DIR, fixture),
            generateFiles: async ({ volume, intermediateRepresentation }) => {
                await generateClientProject({
                    packageName: fixture,
                    packageVersion: "0.0.0",
                    volume,
                    intermediateRepresentation,
                    helperManager: MOCK_HELPERS_MANAGERS,
                });
            },
        });
    }
});
