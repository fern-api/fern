import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

interface CreateSampleGeneratorContextArgs {
    environments?: FernIr.EnvironmentsConfig;
}

export function createSampleGeneratorContext(args: CreateSampleGeneratorContextArgs = {}): SdkGeneratorContext {
    const mockIR: FernIr.IntermediateRepresentation = {
        apiName: {
            originalName: "TestAPI",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" },
            pascalCase: { unsafeName: "TestAPI", safeName: "TestAPI" }
        },
        apiVersion: "1.0.0",
        environments: args.environments,
        errors: {},
        types: {},
        services: {},
        rootPackage: {
            fernFilepath: {
                allParts: [],
                file: undefined,
                packagePath: []
            },
            service: undefined,
            subpackages: [],
            hasEndpointsInTree: false,
            navigationConfig: undefined
        },
        subpackages: {}
    } as unknown as FernIr.IntermediateRepresentation;

    return {
        ir: mockIR,
        getClientName: () => "TestClient",
        getApiClientBuilderClientName: () => "TestClient",
        getCrateName: () => "test_api",
        getCrateVersion: () => "0.1.0",
        customConfig: {},
        hasEnvironments: () => mockIR.environments?.environments != null,
        hasMultipleBaseUrls: () => mockIR.environments?.environments?.type === "multipleBaseUrls",
        getEnvironmentEnumName: () => "Environment"
    } as SdkGeneratorContext;
}
