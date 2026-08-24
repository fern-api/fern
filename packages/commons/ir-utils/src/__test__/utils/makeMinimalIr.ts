import { constructCasingsGenerator } from "@fern-api/casings-generator";
import * as FernIr from "@fern-api/ir-sdk";

export const casingsGenerator = constructCasingsGenerator({
    generationLanguage: undefined,
    keywords: undefined,
    smartCasing: false
});

export const EMPTY_FERN_FILEPATH: FernIr.FernFilepath = { allParts: [], packagePath: [], file: undefined };

export function makeMinimalIr(
    overrides: Partial<FernIr.IntermediateRepresentation> = {}
): FernIr.IntermediateRepresentation {
    return {
        fdrApiDefinitionId: undefined,
        apiVersion: undefined,
        specVersion: undefined,
        apiName: "test-api",
        apiDisplayName: undefined,
        apiDocs: undefined,
        auth: { requirement: "ALL", schemes: [], docs: undefined },
        headers: [],
        idempotencyHeaders: [],
        types: {},
        services: {},
        webhookGroups: {},
        websocketChannels: undefined,
        errors: {},
        subpackages: {},
        rootPackage: {
            fernFilepath: EMPTY_FERN_FILEPATH,
            service: undefined,
            types: [],
            errors: [],
            subpackages: [],
            webhooks: undefined,
            websocket: undefined,
            hasEndpointsInTree: false,
            hasWebSocketInTree: undefined,
            navigationConfig: undefined,
            docs: undefined
        },
        constants: {
            errorInstanceIdKey: {
                wireValue: "errorInstanceId",
                name: casingsGenerator.generateName("errorInstanceId")
            }
        },
        environments: undefined,
        basePath: undefined,
        pathParameters: [],
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
        sdkConfig: {
            isAuthMandatory: false,
            hasStreamingEndpoints: false,
            hasPaginatedEndpoints: false,
            hasFileDownloadEndpoints: false,
            idempotencyKeyGeneration: undefined,
            platformHeaders: {
                language: "X-Fern-Language",
                sdkName: "X-Fern-SDK-Name",
                sdkVersion: "X-Fern-SDK-Version",
                userAgent: undefined
            }
        },
        variables: [],
        globalParameters: undefined,
        serviceTypeReferenceInfo: {
            typesReferencedOnlyByService: {},
            sharedTypes: []
        },
        readmeConfig: undefined,
        sourceConfig: undefined,
        publishConfig: undefined,
        dynamic: undefined,
        selfHosted: undefined,
        audiences: undefined,
        generationMetadata: undefined,
        apiPlayground: undefined,
        casingsConfig: undefined,
        ...overrides
    };
}
