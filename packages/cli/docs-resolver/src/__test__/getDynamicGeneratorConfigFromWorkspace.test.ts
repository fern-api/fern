import { GeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernWorkspace } from "@fern-api/workspace-loader";

import { getDynamicGeneratorConfigFromWorkspace } from "../DocsDefinitionResolver";

describe("getDynamicGeneratorConfigFromWorkspace", () => {
    it("returns undefined when workspace has no generators configuration", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: undefined
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeUndefined();
    });

    it("returns undefined when generators configuration has no groups", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: undefined
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeUndefined();
    });

    it("returns undefined when generators have no config", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "ts-sdk",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: undefined
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeUndefined();
    });

    it("returns dynamic generator config with namespaceExport when present", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "ts-sdk",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: {
                                    namespaceExport: "MyProduct"
                                }
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeDefined();
        expect(result?.apiName).toBe("test-api");
        expect(result?.organization).toBe("");
        expect(result?.customConfig).toEqual({ namespaceExport: "MyProduct" });
        expect(result?.outputConfig.type).toBe("local");
    });

    it("returns first generator config when multiple generators have configs", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "ts-sdk",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: {
                                    namespaceExport: "FirstProduct"
                                }
                            },
                            {
                                name: "fernapi/fern-python-sdk",
                                version: "1.0.0",
                                config: {
                                    client_class_name: "SecondProduct"
                                }
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeDefined();
        expect(result?.customConfig).toEqual({ namespaceExport: "FirstProduct" });
    });

    it("skips generators without config and returns first with config", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "ts-sdk",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: undefined
                            },
                            {
                                name: "fernapi/fern-python-sdk",
                                version: "1.0.0",
                                config: {
                                    client_class_name: "MyPythonClient"
                                }
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeDefined();
        expect(result?.customConfig).toEqual({ client_class_name: "MyPythonClient" });
    });

    it("uses empty string for workspaceName when undefined", () => {
        const workspace = createMockWorkspace({
            workspaceName: undefined,
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "ts-sdk",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: { namespaceExport: "Test" }
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeDefined();
        expect(result?.apiName).toBe("");
    });

    it("searches across multiple groups to find config", () => {
        const workspace = createMockWorkspace({
            workspaceName: "test-api",
            generatorsConfiguration: {
                groups: [
                    {
                        groupName: "group1",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-typescript-sdk",
                                version: "1.0.0",
                                config: undefined
                            }
                        ],
                        reviewers: undefined
                    },
                    {
                        groupName: "group2",
                        audiences: { type: "all" },
                        generators: [
                            {
                                name: "fernapi/fern-python-sdk",
                                version: "1.0.0",
                                config: {
                                    client_class_name: "FoundInSecondGroup"
                                }
                            }
                        ],
                        reviewers: undefined
                    }
                ]
            } as unknown as GeneratorsConfiguration
        });

        const result = getDynamicGeneratorConfigFromWorkspace({ workspace });

        expect(result).toBeDefined();
        expect(result?.customConfig).toEqual({ client_class_name: "FoundInSecondGroup" });
    });
});

function createMockWorkspace({
    workspaceName,
    generatorsConfiguration
}: {
    workspaceName: string | undefined;
    generatorsConfiguration: GeneratorsConfiguration | undefined;
}): FernWorkspace {
    return {
        workspaceName,
        generatorsConfiguration,
        absoluteFilePath: AbsoluteFilePath.of("/mock/path"),
        cliVersion: "1.0.0",
        definition: {} as FernWorkspace["definition"],
        dependenciesConfiguration: { dependencies: {} },
        type: "fern"
    } as FernWorkspace;
}
