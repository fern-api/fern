/* eslint-disable jest/no-conditional-expect */
import { vi } from "vitest";

import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { convertGeneratorsConfiguration } from "../convertGeneratorsConfiguration";

describe("convertGeneratorsConfiguration", () => {
    it("local-file-system allows absolute download path", async () => {
        const context = createMockTaskContext();
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
            },
            context
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/output");
    });

    it("local-file-system resolves relative download path", async () => {
        const context = createMockTaskContext();
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
            },
            context
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/repo/output");
    });

    it("MIT license", async () => {
        const context = createMockTaskContext();
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
            },
            context
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Apache-2.0 license", async () => {
        const context = createMockTaskContext();
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
            },
            context
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Custom license", async () => {
        const context = createMockTaskContext();
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
            },
            context
        });

        expect(converted.groups[0]?.generators[0]?.outputMode?.type).toEqual("githubV2");
    });

    it("Maven URL", async () => {
        const context = createMockTaskContext();
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
            },
            context
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
        const context = createMockTaskContext();
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
            },
            context
        });
        const output = converted.groups[0]?.generators[0]?.outputMode;
        expect(output?.type).toEqual("githubV2");
        if (output?.type === "githubV2") {
            expect(output.githubV2.license?.type === "basic" && output.githubV2.license.id === "MIT").toEqual(true);
        }
    });

    it("Reviewers", async () => {
        const context = createMockTaskContext();
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
            },
            context
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
        const context = createMockTaskContext();
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
            },
            context
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

    it("logs deprecation warnings for deprecated generators yml configuration", async () => {
        const mockLogger: Logger = {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            enable: vi.fn(),
            disable: vi.fn(),
            log: vi.fn()
        };
        const context = createMockTaskContext({ logger: mockLogger });

        await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                "api-settings": {},
                "async-api": "path/to/asyncapi.yml",
                openapi: "path/to/openapi.yml",
                "openapi-overrides": "path/to/openapi-overrides.yml",
                "spec-origin": "some-origin",
                api: "path/to/api.yml"
            },
            context
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Warnings for generators.yml:"));
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('"api-settings" is deprecated. Please use "api.specs[].settings" instead.')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('"async-api" is deprecated. Please use "api.specs[].asyncapi" instead.')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('"openapi" is deprecated. Please use "api.specs[].openapi" instead.')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('"openapi-overrides" is deprecated. Please use "api.specs[].overrides" instead.')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining('"spec-origin" is deprecated. Please use "api.specs[].origin" instead.')
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
                'Using an OpenAPI or AsyncAPI path string for "api" is deprecated. Please use "api.specs[].openapi" or "api.specs[].asyncapi" instead.'
            )
        );
    });

    it("logs deprecation warnings for deprecated generators yml configuration with api as an object", async () => {
        const mockLogger: Logger = {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            enable: vi.fn(),
            disable: vi.fn(),
            log: vi.fn()
        };
        const context = createMockTaskContext({ logger: mockLogger });

        await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                api: {
                    path: "path/to/openapi.yml"
                }
            },
            context
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Warnings for generators.yml:"));
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
                'Using "api.path" is deprecated. Please use "api.specs[].openapi" or "api.specs[].asyncapi" instead.'
            )
        );
    });

    it("logs deprecation warnings for deprecated generators yml configuration with api as an array", async () => {
        const mockLogger: Logger = {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            enable: vi.fn(),
            disable: vi.fn(),
            log: vi.fn()
        };
        const context = createMockTaskContext({ logger: mockLogger });

        await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                api: [
                    "path/to/openapi.yml",
                    { path: "path/to/openapi.yml" },
                    { path: "path/to/asyncapi.yml" },
                    {
                        proto: {
                            root: "path/to/proto",
                            target: "path/to/target"
                        }
                    }
                ]
            },
            context
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Warnings for generators.yml:"));
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
                'Using an array for "api" is deprecated. Please use "api.specs[].openapi", "api.specs[].asyncapi", or "api.specs[].proto" instead.'
            )
        );
    });

    it("logs deprecation warnings for deprecated generators yml configuration with api namespaces", async () => {
        const mockLogger: Logger = {
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            enable: vi.fn(),
            disable: vi.fn(),
            log: vi.fn()
        };
        const context = createMockTaskContext({ logger: mockLogger });

        await convertGeneratorsConfiguration({
            absolutePathToGeneratorsConfiguration: AbsoluteFilePath.of("/path/to/repo/fern/api/generators.yml"),
            rawGeneratorsConfiguration: {
                api: {
                    namespaces: {
                        namespace1: "path/to/openapi.yml",
                        namespace2: { path: "path/to/openapi.yml" },
                        namespace3: { path: "path/to/asyncapi.yml" },
                        namespace4: {
                            proto: {
                                root: "path/to/proto",
                                target: "path/to/target"
                            }
                        }
                    }
                }
            },
            context
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Warnings for generators.yml:"));
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
                'Using "api.namespaces" is deprecated. Please use "api.specs[].openapi", "api.specs[].asyncapi", or "api.specs[].proto" with the "namespace" property instead.'
            )
        );
    });
});
