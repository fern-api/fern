import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { bundle, Config } from "@redocly/openapi-core";
import path from "path";
import { parse } from "../parse";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line jest/no-export
export function testParseOpenAPI(fixtureName: string, filename: string): void {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("parse open api", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, filename);

            const result = await bundle({
                config: new Config({ apis: {}, styleguide: {} }, undefined),
                ref: openApiPath,
                dereference: false,
                removeUnusedComponents: false,
                keepUrlRefs: true,
            });

            const openApiIr = await parse({
                asyncApiFile: undefined,
                openApiFile: {
                    absoluteFilepath: AbsoluteFilePath.of(openApiPath),
                    contents: JSON.stringify(result.bundle.parsed),
                },
                taskContext: createMockTaskContext({ logger: CONSOLE_LOGGER }),
            });
            expect(openApiIr).toMatchSnapshot();
        });
    });
}
