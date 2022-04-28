import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateModelFiles } from "../generateModelFiles";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");

describe("generateModelFiles", () => {
    itFernETE("posts", {
        directory: path.join(MOCK_APIS_DIR, "posts"),
        generateFiles: ({ directory, intermediateRepresentation }) => {
            generateModelFiles({
                directory,
                intermediateRepresentation,
            });
        },
    });

    itFernETE("fern IR", {
        directory: path.join(MOCK_APIS_DIR, "fern-ir"),
        generateFiles: ({ directory, intermediateRepresentation }) => {
            generateModelFiles({
                directory,
                intermediateRepresentation,
            });
        },
    });
});
