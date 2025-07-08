import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../_ModelCustomConfig";
import { ModelGeneratorContext } from "../_ModelGeneratorContext";

export function createSampleGeneratorContext() {
    const ir = createSampleIr();
    const generatorConfig = createSampleGeneratorConfig();
    const customConfig: ModelCustomConfigSchema = {};
    const notificationService = new GeneratorNotificationService({
        type: "local",
        _visit: (visitor) => visitor.local()
    });
    return new ModelGeneratorContext(ir, generatorConfig, customConfig, notificationService);
}

function createSampleIr(): IntermediateRepresentation {
    return {
        fdrApiDefinitionId: undefined,
        apiVersion: undefined,
        apiName: {
            originalName: "My API",
            camelCase: {
                safeName: "myApi",
                unsafeName: "MyApi"
            },
            pascalCase: {
                safeName: "MyApi",
                unsafeName: "MyApi"
            },
            snakeCase: {
                safeName: "my_api",
                unsafeName: "My_API"
            },
            screamingSnakeCase: {
                safeName: "MY_API",
                unsafeName: "MY_API"
            }
        },
        apiDisplayName: undefined,
        apiDocs: undefined,
        auth: {
            docs: undefined,
            requirement: "ANY",
            schemes: []
        },
        headers: [],
        idempotencyHeaders: [],
        types: {},
        services: {},
        webhookGroups: {},
        websocketChannels: {},
        errors: {},
        subpackages: {},
        rootPackage: {
            docs: undefined,
            fernFilepath: {
                allParts: [],
                file: undefined,
                packagePath: []
            },
            service: undefined,
            types: [],
            errors: [],
            webhooks: undefined,
            websocket: undefined,
            subpackages: [],
            hasEndpointsInTree: false,
            navigationConfig: undefined
        },
        constants: {
            errorInstanceIdKey: {
                name: {
                    originalName: "errorInstanceId",
                    camelCase: {
                        safeName: "errorInstanceId",
                        unsafeName: "errorInstanceId"
                    },
                    pascalCase: {
                        safeName: "ErrorInstanceId",
                        unsafeName: "ErrorInstanceId"
                    },
                    snakeCase: {
                        safeName: "error_instance_id",
                        unsafeName: "ERROR_INSTANCE_ID"
                    },
                    screamingSnakeCase: {
                        safeName: "ERROR_INSTANCE_ID",
                        unsafeName: "ERROR_INSTANCE_ID"
                    }
                },
                wireValue: "error_instance_id"
            }
        },
        environments: undefined,
        basePath: undefined,
        pathParameters: [],
        errorDiscriminationStrategy: {
            type: "statusCode",
            _visit: (visitor) => visitor.statusCode()
        },
        sdkConfig: {
            isAuthMandatory: false,
            hasStreamingEndpoints: false,
            hasPaginatedEndpoints: false,
            hasFileDownloadEndpoints: false,
            platformHeaders: {
                language: "swift",
                sdkName: "My SDK",
                sdkVersion: "1.0.0",
                userAgent: undefined
            }
        },
        variables: [],
        serviceTypeReferenceInfo: {
            typesReferencedOnlyByService: {},
            sharedTypes: []
        },
        readmeConfig: undefined,
        sourceConfig: undefined,
        publishConfig: undefined,
        dynamic: undefined,
        selfHosted: false
    };
}

function createSampleGeneratorConfig(): FernGeneratorExec.config.GeneratorConfig {
    return {
        dryRun: false,
        irFilepath: "ir.json",
        output: {
            path: AbsoluteFilePath.of(__dirname) + "/output",
            mode: {
                type: "downloadFiles",
                _visit: (visitor) => visitor.downloadFiles()
            }
        },
        workspaceName: "test",
        organization: "test",
        environment: {
            type: "local",
            _visit: (visitor) => visitor.local()
        },
        whitelabel: false,
        writeUnitTests: false,
        generateOauthClients: false
    };
}
