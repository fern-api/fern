/* eslint-disable jest/no-conditional-expect */
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { convertGeneratorsConfiguration } from "../convertGeneratorsConfiguration";

describe("convertGeneratorsConfiguration", () => {
    it("local-file-system allows absolute download path", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                groups: {
                    group1: {
                        generators: [
                            {
                                name: "generator-name",
                                version: "0.0.1",
                                output: {
                                    location: "local-file-system",
                                    path: "/path/to/output"
                                }
                            }
                        ]
                    }
                }
            }
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/output");
    });

    it("local-file-system resolves relative download path", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                groups: {
                    group1: {
                        generators: [
                            {
                                name: "generator-name",
                                version: "0.0.1",
                                output: {
                                    location: "local-file-system",
                                    path: "../../output"
                                }
                            }
                        ]
                    }
                }
            }
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/repo/output");
    });

    it("MIT license", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                groups: {
                    group1: {
                        generators: [
                            {
                                name: "generator-name",
                                version: "0.0.1",
                                github: {
                                    repository: "fern-api/fern",
                                    license: "MIT"
                                }
                            }
                        ]
                    }
                }
            }
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Apache-2.0 license", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                groups: {
                    group1: {
                        generators: [
                            {
                                name: "generator-name",
                                version: "0.0.1",
                                github: {
                                    repository: "fern-api/fern",
                                    license: "Apache-2.0"
                                }
                            }
                        ]
                    }
                }
            }
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Custom license", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                groups: {
                    group1: {
                        generators: [
                            {
                                name: "generator-name",
                                version: "0.0.1",
                                github: {
                                    repository: "fern-api/fern",
                                    license: {
                                        custom: "testdata/LICENSE"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Maven URL", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                groups: {
                    "stage:java": {
                        generators: [
                            {
                                name: "fernapi/fern-java-sdk",
                                version: "0.8.8-rc0",
                                config: {
                                    "package-prefix": "com.test.sdk"
                                },
                                output: {
                                    location: "maven",
                                    coordinate: "com.test:sdk",
                                    url: "https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/",
                                    username: "username",
                                    password: "password",
                                    signature: {
                                        keyId: "keyId",
                                        password: "password",
                                        secretKey: "secretKey"
                                    }
                                },
                                github: {
                                    repository: "fern-api/github-app-test"
                                }
                            }
                        ]
                    }
                }
            }
        });

        const output = converted.groups[0]?.generators[0]?.outputMode;
        expect(output?.type).toEqual("githubV2");
        if (output?.type === "githubV2") {
            const publishInfo = output.githubV2.publishInfo;
            expect(publishInfo?.type).toEqual("maven");
            if (publishInfo?.type === "maven") {
                expect(publishInfo.registryUrl).toEqual(
                    "https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/"
                );
            }
        }
    });

    it("License Metadata", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                groups: {
                    "stage:java": {
                        generators: [
                            {
                                name: "fernapi/fern-java-sdk",
                                version: "0.8.8-rc0",
                                config: {
                                    "package-prefix": "com.test.sdk"
                                },
                                metadata: {
                                    license: "MIT"
                                },
                                github: {
                                    repository: "fern-api/github-app-test"
                                }
                            }
                        ]
                    }
                }
            }
        });
        const output = converted.groups[0]?.generators[0]?.outputMode;
        expect(output?.type).toEqual("githubV2");
        if (output?.type === "githubV2") {
            expect(output.githubV2.license?.type === "basic" && output.githubV2.license.id === "MIT").toEqual(true);
        }
    });

    it("Reviewers", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                reviewers: {
                    teams: [{ name: "fern-eng" }],
                    users: [{ name: "armando" }]
                },
                groups: {
                    "stage:java": {
                        generators: [
                            {
                                name: "fernapi/fern-java-sdk",
                                version: "0.8.8-rc0",
                                config: {
                                    "package-prefix": "com.test.sdk"
                                },
                                metadata: {
                                    license: "MIT"
                                },
                                github: {
                                    repository: "fern-api/github-app-test",
                                    mode: "pull-request",
                                    reviewers: {
                                        users: [{ name: "deep" }]
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        });
        const output = converted.groups[0]?.generators[0]?.outputMode;
        expect(output?.type).toEqual("githubV2");
        if (output?.type === "githubV2" && output.githubV2.type === "pullRequest") {
            expect(output.githubV2.reviewers != null).toBeTruthy();
            expect(output.githubV2.reviewers?.length).toEqual(3);

            const reviewerNames = output.githubV2.reviewers?.map((reviewer) => reviewer.name);
            expect(reviewerNames).toEqual(["fern-eng", "armando", "deep"]);
        }
    });

    it("Output Metadata", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                groups: {
                    "stage:python": {
                        metadata: {
                            description: "test that's top level"
                        },
                        generators: [
                            {
                                output: {
                                    location: "pypi",
                                    "package-name": "test",
                                    metadata: {
                                        description: "test that's low level",
                                        keywords: ["test"],
                                        "documentation-link": "https://test.com"
                                    }
                                },
                                name: "fernapi/fern-python-sdk",
                                version: "0.8.8-rc0",
                                config: {
                                    "package-prefix": "com.test.sdk"
                                },
                                github: {
                                    repository: "fern-api/github-app-test"
                                }
                            }
                        ]
                    }
                }
            }
        });
        const output = converted.groups[0]?.generators[0]?.outputMode;
        expect(output?.type).toEqual("githubV2");
        if (output?.type === "githubV2") {
            expect(
                output.githubV2.publishInfo?.type === "pypi" &&
                    output.githubV2.publishInfo.pypiMetadata?.documentationLink === "https://test.com" &&
                    output.githubV2.publishInfo.pypiMetadata?.description === "test that's low level"
            ).toEqual(true);
        }
    });

    it("Settings should be inherited for api", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: {
                    path: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml")
                },
                "api-settings": {
                    filter: {
                        endpoints: ["POST /openapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /openapi"]
            }
        });
    });

    it("Settings should be inherited for api list", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: [
                    {
                        path: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml")
                    }
                ],
                "api-settings": {
                    filter: {
                        endpoints: ["POST /openapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /openapi"]
            }
        });
    });

    it("Settings should be inherited and overwritten for api list", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: [
                    {
                        path: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml"),
                        settings: {
                            filter: {
                                endpoints: ["POST /openapi"]
                            }
                        }
                    }
                ],
                "api-settings": {
                    filter: {
                        endpoints: ["POST /anyapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /openapi"]
            }
        });
    });

    it("Settings should be inherited for specs list", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: {
                    specs: [
                        {
                            openapi: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml")
                        },
                        {
                            asyncapi: AbsoluteFilePath.of("/path/to/repo/fern/api/asyncapi.yml")
                        }
                    ]
                },
                "api-settings": {
                    filter: {
                        endpoints: ["POST /anyapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /anyapi"]
            }
        });
        expect(definitions[1]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /anyapi"]
            }
        });
    });

    it("Settings should be inherited and overwritten for specs list", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: {
                    specs: [
                        {
                            openapi: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml"),
                            settings: {
                                filter: {
                                    endpoints: ["POST /openapi"]
                                }
                            }
                        },
                        {
                            asyncapi: AbsoluteFilePath.of("/path/to/repo/fern/api/asyncapi.yml"),
                            settings: {
                                "message-naming": "v2"
                            }
                        }
                    ]
                },
                "api-settings": {
                    filter: {
                        endpoints: ["POST /anyapi"]
                    },
                    "message-naming": "v1"
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /openapi"]
            },
            asyncApiMessageNaming: "v1"
        });
        expect(definitions[1]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /anyapi"]
            },
            asyncApiMessageNaming: "v2"
        });
    });

    it("Settings should be inherited and overwritten for api", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                api: {
                    path: AbsoluteFilePath.of("/path/to/repo/fern/api/openapi.yml"),
                    settings: {
                        filter: {
                            endpoints: ["POST /openapi"]
                        }
                    }
                },
                "api-settings": {
                    filter: {
                        endpoints: ["POST /anyapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /openapi"]
            }
        });
    });

    it("Settings should be inherited for asyncapi", async () => {
        const converted = await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of(__filename),
            rawGeneratorsConfiguration: {
                "async-api": AbsoluteFilePath.of("/path/to/repo/fern/api/asyncapi.yml"),
                "api-settings": {
                    filter: {
                        endpoints: ["POST /asyncapi"]
                    }
                }
            }
        });
        if (typeof converted.api === "undefined") {
            throw new Error("api is undefined");
        }
        if (!("definitions" in converted.api)) {
            throw new Error("definitions is not in api");
        }
        const definitions = converted.api.definitions as generatorsYml.APIDefinitionLocation[];
        expect(definitions[0]?.settings).toMatchObject({
            filter: {
                endpoints: ["POST /asyncapi"]
            }
        });
    });
});
