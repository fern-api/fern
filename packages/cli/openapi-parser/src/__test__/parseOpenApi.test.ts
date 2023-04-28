import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { parse } from "../parse";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

describe("open api parser", () => {
    testFixture("vellum", "openapi.yml");
    testFixture("devrev", "openapi.yml");
});

function testFixture(fixtureName: string, filename: string) {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const openApiIr = await parse({
                root: {
                    file: {
                        absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                        contents: "",
                        relativeFilepath: RelativeFilePath.of(filename),
                    },
                    subDirectories: [],
                },
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER }),
            });
            expect(openApiIr).toMatchSnapshot();
        });
    });
}
