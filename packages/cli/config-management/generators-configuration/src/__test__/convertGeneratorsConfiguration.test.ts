import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertGeneratorsConfiguration } from "../convertGeneratorsConfiguration";

describe("convertGeneratorsConfiguration", () => {
    it("local-file-system allows absolute download path", () => {
        const converted = convertGeneratorsConfiguration({
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
                                    path: "/path/to/output",
                                },
                            },
                        ],
                    },
                },
            },
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/output");
    });

    it("local-file-system resolves relative download path", () => {
        const converted = convertGeneratorsConfiguration({
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
                                    path: "../../output",
                                },
                            },
                        ],
                    },
                },
            },
        });

        expect(converted.groups[0]?.generators[0]?.absolutePathToLocalOutput).toEqual("/path/to/repo/output");
    });
});
