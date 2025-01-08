import { AbsoluteFilePath } from "@fern-api/path-utils";

import { TestCase } from "./utils/TestCase";
import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY } from "./utils/constant";

describe("examples", () => {
    const testCases: TestCase[] = [
        {
            description: "GET /metadata (simple)",
            giveRequest: {
                endpoint: {
                    method: "GET",
                    path: "/metadata"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: {
                    shallow: false,
                    tag: "development"
                },
                headers: {
                    "X-API-Version": "0.0.1"
                },
                requestBody: undefined
            }
        },
        {
            description: "GET /metadata (allow-multiple)",
            giveRequest: {
                endpoint: {
                    method: "GET",
                    path: "/metadata"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: {
                    shallow: false,
                    tag: ["development", "public"]
                },
                headers: {
                    "X-API-Version": "0.0.1"
                },
                requestBody: undefined
            }
        },
        {
            description: "POST /movie (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/movie"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: {
                    id: "movie-c06a4ad7",
                    prequel: "movie-cv9b914f",
                    title: "The Boy and the Heron",
                    from: "Hayao Miyazaki",
                    rating: 8.0,
                    type: "movie",
                    tag: "development",
                    metadata: {
                        actors: ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
                        releaseDate: "2023-12-08",
                        ratings: {
                            rottenTomatoes: 97,
                            imdb: 7.6
                        }
                    },
                    revenue: 1000000
                }
            }
        },
        {
            description: "POST /big-entity (simple)",
            giveRequest: {
                endpoint: {
                    method: "POST",
                    path: "/big-entity"
                },
                baseURL: undefined,
                environment: undefined,
                auth: {
                    type: "bearer",
                    token: "<YOUR_API_KEY>"
                },
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: {
                    castMember: {
                        id: "john.doe",
                        name: "John Doe"
                    }
                }
            }
        }
    ];
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/examples.json`),
        config: buildGeneratorConfig()
    });
    test.each(testCases)("$description", async ({ giveRequest }) => {
        const response = await generator.generate(giveRequest);
        expect(response.snippet).toMatchSnapshot();
    });
});

describe("examples (errors)", () => {
    it("invalid request body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(`${DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY}/examples.json`),
            config: buildGeneratorConfig()
        });
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/movie"
            },
            auth: {
                type: "bearer",
                token: "<YOUR_API_KEY>"
            },
            baseURL: undefined,
            environment: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                id: "movie-c06a4ad7",
                prequel: "movie-cv9b914f",
                title: 42, // invalid
                from: "Hayao Miyazaki",
                rating: 8.0,
                type: "movie",
                tag: "development",
                metadata: {
                    actors: ["Christian Bale", "Florence Pugh", "Willem Dafoe"],
                    releaseDate: "2023-12-08",
                    ratings: {
                        rottenTomatoes: 97,
                        imdb: 7.6
                    }
                },
                revenue: 1000000
            }
        });
        expect(response.errors).toMatchSnapshot();
    });
});
