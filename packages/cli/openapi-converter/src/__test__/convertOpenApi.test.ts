import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { convertOpenApi } from "../convertOpenApi";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), "fixtures");
const OPENAPI_JSON_FILENAME = "openapi.json";

describe("open api converter", () => {
    // testFixture("telematica");
    testFixture("rivet");
});

function testFixture(fixtureName: string) {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, OPENAPI_JSON_FILENAME);
            const fernDefinition = await convertOpenApi({
                openApiPath: AbsoluteFilePath.of(openApiPath),
                taskContext: createMockTaskContext(),
            });
            expect(fernDefinition).toMatchSnapshot();
        });
    });
}
