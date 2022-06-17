import { HelperManager } from "@fern-typescript/helper-manager";
import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientProject } from "../generateClientProject";

const FIXTURES_DIR = "fixtures";

const MOCK_HELPERS_MANAGERS = new HelperManager({ encodings: {} });

describe("generateClientProject", () => {
    itFernETE("posts", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "posts"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateClientProject({
                packageName: "posts",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
    });

    itFernETE("no errors", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "no-errors"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateClientProject({
                packageName: "no-errors",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
    });

    itFernETE("chat app", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "chat"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateClientProject({
                packageName: "chat",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
    });
});
