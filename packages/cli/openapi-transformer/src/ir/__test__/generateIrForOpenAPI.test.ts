import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import * as FernOpenapiIrSerializers from "@fern-fern/openapi-ir-sdk/serialization";
import path from "path";
import { generateIrForOpenAPI } from "../generateIrForOpenAPI";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), "fixtures");
const OPENAPI_JSON_FILENAME = "openapi.json";

describe("open api ir generator", () => {
    testFixture("flagright");
});

function testFixture(fixtureName: string) {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, OPENAPI_JSON_FILENAME);
            const fernDefinition = await generateIrForOpenAPI({
                openApiPath: AbsoluteFilePath.of(openApiPath),
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER }),
            });
            if (fernDefinition == null) {
                return;
            }
            const jsonFernDefinition = await FernOpenapiIrSerializers.IntermediateRepresentation.jsonOrThrow(
                fernDefinition
            );
            expect(jsonFernDefinition).toMatchSnapshot();
        });
    });
}
