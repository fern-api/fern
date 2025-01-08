import { AbsoluteFilePath } from "@fern-api/path-utils";

import { TestCase } from "./utils/TestCase";
import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";

describe("imdb (success)", () => {
    const testCases: TestCase[] = [
        {
            description: "GET /movies/{movieId} (simple)",
            giveRequest: {
                endpoint: {
                    method: "GET",
                    path: "/movies/{movieId}"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: {
                    movieId: "movie_xyz"
                },
                queryParameters: undefined,
                headers: undefined,
                requestBody: undefined
            }
        }
    ];
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/imdb.json`),
        config: buildGeneratorConfig()
    });
    test.each(testCases)("$description", async ({ giveRequest }) => {
        const response = await generator.generate(giveRequest);
        expect(response.snippet).toMatchSnapshot();
    });
});
