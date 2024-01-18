import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { parse } from "@fern-api/openapi-parser";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { convert } from "../convert";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line jest/no-export
export function testConvertOpenAPI(fixtureName: string, filename: string): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const mockTaskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            const openApiIr = await parse({
                absolutePathToOpenAPI: AbsoluteFilePath.of(openApiPath),
                absolutePathToAsyncAPI: undefined,
                absolutePathToOpenAPIOverrides: undefined,
                taskContext: mockTaskContext
            });
            const fernDefinition = convert({ openApiIr, taskContext: mockTaskContext });
            expect(fernDefinition).toMatchSnapshot();
        });
    });
}
