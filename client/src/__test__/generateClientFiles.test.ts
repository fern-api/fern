import { HelperManager } from "@fern-typescript/helper-manager";
import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientFiles } from "../generateClientFiles";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

const MOCK_HELPERS_MANAGERS = new HelperManager({ encodings: {} });

describe("generateClientFiles", () => {
    itFernETE("posts", {
        directory: path.join(FIXTURES_DIR, "posts"),
        generateFiles: async ({ directory, intermediateRepresentation }) => {
            await generateClientFiles({
                directory,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
        outputToDisk: true,
    });

    itFernETE("no errors", {
        directory: path.join(FIXTURES_DIR, "no-errors"),
        generateFiles: async ({ directory, intermediateRepresentation }) => {
            await generateClientFiles({
                directory,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
    });

    /*
    itFernETE("chat app", {
        directory: path.join(FIXTURES_DIR, "chat"),
        generateFiles: async ({ directory, intermediateRepresentation }) => {
            await generateClientFiles({
                directory,
                intermediateRepresentation,
                helperManager: MOCK_HELPERS_MANAGERS,
            });
        },
    });
    */
});
