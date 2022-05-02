import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientFiles } from "../generateClientFiles";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");

describe("generateClientFiles", () => {
    itFernETE("posts", {
        directory: path.join(MOCK_APIS_DIR, "posts"),
        generateFiles: ({ directory, intermediateRepresentation }) => {
            generateClientFiles({
                directory,
                intermediateRepresentation,
            });
        },
        outputToDisk: true,
    });

    itFernETE("no errors", {
        directory: path.join(MOCK_APIS_DIR, "no-errors"),
        generateFiles: ({ directory, intermediateRepresentation }) => {
            generateClientFiles({
                directory,
                intermediateRepresentation,
            });
        },
    });
});
