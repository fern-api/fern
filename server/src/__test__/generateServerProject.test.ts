import { HelperManager } from "@fern-typescript/helper-manager";
import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateServerProject } from "../generateServerProject";

const FIXTURES_DIR = "fixtures";

const MOCK_HELPERS_MANAGERS = new HelperManager({ encodings: {} });

describe("generateServerProject", () => {
    itFernETE("posts", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "posts"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateServerProject({
                packageName: "posts",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
        outputToDisk: true,
    });
});
