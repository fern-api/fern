import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { itFernETE } from "@fern-typescript/testing-utils";
import { generateServerProject } from "../generateServerProject";

const FIXTURES_DIR = RelativeFilePath.of("fixtures");
const FIXTURES = ["posts"].map(RelativeFilePath.of);

// eslint-disable-next-line jest/no-disabled-tests
describe.skip("generateServerProject", () => {
    for (const fixture of FIXTURES) {
        itFernETE(fixture, {
            testFile: AbsoluteFilePath.of(__filename),
            pathToFixture: join(FIXTURES_DIR, fixture),
            generateFiles: async ({ volume, intermediateRepresentation }) => {
                await generateServerProject({
                    packageName: fixture,
                    packageVersion: "0.0.0",
                    volume,
                    intermediateRepresentation,
                });
            },
        });
    }
});
