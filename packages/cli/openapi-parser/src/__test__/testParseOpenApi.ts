import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { serialization } from "@fern-api/openapi-ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { parse } from "../openapi/parse";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line jest/no-export
export function testParseOpenAPI(
    fixtureName: string,
    openApiFilename: string,
    asyncApiFilename?: string,
    useTitle?: boolean,
    useUndiscriminatedUnions?: boolean,
    sdkLanguage?: generatorsYml.GenerationLanguage
): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("parse open api", async () => {
            const absolutePathToOpenAPI = join(
                FIXTURES_PATH,
                RelativeFilePath.of(fixtureName),
                RelativeFilePath.of(openApiFilename)
            );
            const absolutePathToAsyncAPI =
                asyncApiFilename != null
                    ? join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(asyncApiFilename))
                    : undefined;
            const settings = {
                shouldUseTitleAsName: useTitle ?? true,
                audiences: [],
                shouldUseUndiscriminatedUnionsForDiscriminated: useUndiscriminatedUnions ?? false,
                sdkLanguage
            };
            const specs = [];
            if (absolutePathToOpenAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToOpenAPI,
                    absoluteFilepathToOverrides: undefined,
                    settings
                });
            }
            if (absolutePathToAsyncAPI != null) {
                specs.push({
                    absoluteFilepath: absolutePathToAsyncAPI,
                    absoluteFilepathToOverrides: undefined,
                    settings
                });
            }

            const openApiIr = await parse({
                workspace: {
                    specs
                },
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER })
            });
            const openApiIrJson = await serialization.OpenApiIntermediateRepresentation.jsonOrThrow(openApiIr, {
                skipValidation: true
            });
            expect(openApiIrJson).toMatchSnapshot();
        });
    });
}
