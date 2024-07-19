import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { parse } from "@fern-api/openapi-parser";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { convert } from "../convert";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line jest/no-export
export function testConvertOpenAPI(fixtureName: string, filename: string, asyncApiFilename?: string): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const mockTaskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            const absolutePathToAsyncAPI =
                asyncApiFilename != null
                    ? join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(asyncApiFilename))
                    : undefined;

            const specs = [];
            specs.push({
                absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                absoluteFilepathToOverrides: undefined
            });
            if (absolutePathToAsyncAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToAsyncAPI,
                    absoluteFilepathToOverrides: undefined
                });
            }

            const openApiIr = await parse({
                specs,
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER })
            });
            const fernDefinition = convert({
                ir: openApiIr,
                taskContext: mockTaskContext,
                enableUniqueErrorsPerEndpoint: false,
                detectGlobalHeaders: true
            });
            expect(fernDefinition).toMatchSnapshot();
        });

        it("docs", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);
            const mockTaskContext = createMockTaskContext({ logger: CONSOLE_LOGGER });

            const absolutePathToAsyncAPI =
                asyncApiFilename != null
                    ? join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(asyncApiFilename))
                    : undefined;

            const specs = [];
            specs.push({
                absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                absoluteFilepathToOverrides: undefined
            });
            if (absolutePathToAsyncAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToAsyncAPI,
                    absoluteFilepathToOverrides: undefined
                });
            }

            const openApiIr = await parse({
                specs,
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER })
            });
            const fernDefinition = convert({
                ir: openApiIr,
                taskContext: mockTaskContext,
                enableUniqueErrorsPerEndpoint: true,
                detectGlobalHeaders: false
            });
            expect(fernDefinition).toMatchSnapshot();
        });
    });
}
