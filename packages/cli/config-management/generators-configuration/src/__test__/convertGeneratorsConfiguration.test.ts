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
});
