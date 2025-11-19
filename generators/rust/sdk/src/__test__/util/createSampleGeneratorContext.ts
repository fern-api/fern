import { EnvironmentsConfig, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

interface CreateSampleGeneratorContextArgs {
    environments?: EnvironmentsConfig;
}

export function createSampleGeneratorContext(args: CreateSampleGeneratorContextArgs = {}): SdkGeneratorContext {
    const mockIR: IntermediateRepresentation = {
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
    } as unknown as IntermediateRepresentation;

    return {
        ir: mockIR,
        getClientName: () => "TestClient",
        getApiClientBuilderClientName: () => "TestClient",
        customConfig: {}
    } as SdkGeneratorContext;
}
