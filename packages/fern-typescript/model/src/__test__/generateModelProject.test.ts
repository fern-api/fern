import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateModelProject } from "../generateModelProject";

const FIXTURES_DIR = "fixtures";

describe("generateModelProject", () => {
    itFernETE("posts", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "posts"),
        generateFiles: async ({ volume, intermediateRepresentation }) => {
            await generateModelProject({
                packageName: "posts",
                packageVersion: "0.0.0",
                volume,
                intermediateRepresentation,
            });
        },
        outputToDisk: true,
    });

    itFernETE("fern IR", {
        testFile: __filename,
        pathToFixture: path.join(FIXTURES_DIR, "fern-ir"),
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
