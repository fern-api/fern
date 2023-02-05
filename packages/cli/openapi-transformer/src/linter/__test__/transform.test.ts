import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import path from "path";
import { isOpenApiV3 } from "../../transform";
import { lint } from "../lint";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), "fixtures");
const OPENAPI_JSON_FILENAME = "openapi.json";

describe("open api converter", () => {
    testFixture("flagright");
});

function testFixture(fixtureName: string) {
    // eslint-disable-next-line jest/valid-title
    describe(fixtureName, () => {
        it("simple", async () => {
            const openApiPath = path.join(FIXTURES_PATH, fixtureName, OPENAPI_JSON_FILENAME);
            const raw = await readFile(openApiPath);
            const document = await SwaggerParser.parse(openApiPath);
            if (isOpenApiV3(document)) {
                const violations = await lint({
                    context: createMockTaskContext({ logger: CONSOLE_LOGGER }),
                    document,
                    rawContents: raw.toString(),
                    format: openApiPath.endsWith("yaml") ? "yaml" : "json",
                });
                // eslint-disable-next-line jest/no-conditional-expect
                expect(violations).toMatchSnapshot();
            } else {
                throw new Error(`${openApiPath} is not V3. Failing.`);
            }
        });
    });
}
