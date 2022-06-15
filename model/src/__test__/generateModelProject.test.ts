import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateModelProject } from "../generateModelProject";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");

describe("generateModelProject", () => {
    itFernETE("posts", {
        directory: path.join(MOCK_APIS_DIR, "posts"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateModelProject({
                packageName: "posts",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
            });
        },
    });

    itFernETE("fern IR", {
        directory: path.join(MOCK_APIS_DIR, "fern-ir"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateModelProject({
                packageName: "posts",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
            });
        },
    });
});
