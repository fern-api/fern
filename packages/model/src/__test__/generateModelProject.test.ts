import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { itFernETE } from "@fern-typescript/testing-utils";
import { generateModelProject } from "../generateModelProject";

const FIXTURES_DIR = RelativeFilePath.of("fixtures");

describe("generateModelProject", () => {
    itFernETE("posts", {
        testFile: AbsoluteFilePath.of(__filename),
        pathToFixture: join(FIXTURES_DIR, RelativeFilePath.of("posts")),
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
        testFile: AbsoluteFilePath.of(__filename),
        pathToFixture: join(FIXTURES_DIR, RelativeFilePath.of("fern-ir")),
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
