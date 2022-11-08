import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { itFernETE } from "@fern-typescript/testing-utils";
import { generateModelProject } from "../generateModelProject";

const FIXTURES_DIR = RelativeFilePath.of("fixtures");

// eslint-disable-next-line jest/no-disabled-tests
describe.skip("generateModelProject", () => {
    itFernETE("posts", {
        testFile: AbsoluteFilePath.of(__filename),
        pathToFixture: join(FIXTURES_DIR, "fern", RelativeFilePath.of("posts")),
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
        pathToFixture: join(FIXTURES_DIR, "fern", RelativeFilePath.of("fern-ir")),
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
