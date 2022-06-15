import { HelperManager } from "@fern-typescript/helper-manager";
import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientProject } from "../generateClientProject";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

const MOCK_HELPERS_MANAGERS = new HelperManager({ encodings: {} });

describe("generateClientProject", () => {
    itFernETE("posts", {
        directory: path.join(FIXTURES_DIR, "posts"),
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
        directory: path.join(FIXTURES_DIR, "no-errors"),
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
        directory: path.join(FIXTURES_DIR, "chat"),
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
