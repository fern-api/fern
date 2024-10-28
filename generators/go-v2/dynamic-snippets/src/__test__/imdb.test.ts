import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { AuthValues } from "@fern-fern/ir-sdk/api/resources/dynamic";
import { TestCase } from "./utils/TestCase";

describe("imdb", () => {
    const testCases: TestCase[] = [
        {
            description: "GET /movies/{movieId} (simple)",
            giveRequest: {
                endpoint: {
                    method: "GET",
                    path: "/movies/{movieId}"
                },
                auth: AuthValues.bearer({
                    token: "<YOUR_API_KEY>"
                }),
                pathParameters: {
                    movieId: "movie_xyz"
                },
                queryParameters: undefined,
                headers: undefined,
                requestBody: undefined
            }
        },
        {
            description: "POST /movies/create-movie (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/movies/create-movie"
                },
                auth: AuthValues.bearer({
                    token: "<YOUR_API_KEY>"
                }),
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: {
                    title: "The Matrix",
                    rating: 8.2
                }
            }
        }
    ];
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, RelativeFilePath.of("imdb.json")),
        config: buildGeneratorConfig()
    });
    test.each(testCases)("$description", async ({ giveRequest }) => {
        const response = await generator.generate(giveRequest);
        expect(response.snippet).toMatchSnapshot();
    });
});
