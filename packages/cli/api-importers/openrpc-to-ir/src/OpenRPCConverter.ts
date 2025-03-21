import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractConverter, ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenRPCConverterContext3_1 } from "./OpenRPCConverterContext3_1";

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">;

export declare namespace OpenRPCConverter {
    export interface Args {
        breadcrumbs: string[];
        context: OpenRPCConverterContext3_1;
    }
}

export class OpenRPCConverter extends AbstractConverter<OpenRPCConverterContext3_1, IntermediateRepresentation> {
    private ir: BaseIntermediateRepresentation;

    constructor({ breadcrumbs, context }: OpenRPCConverter.Args) {
        super({ breadcrumbs });
        this.ir = {
            auth: {
                docs: undefined,
                requirement: FernIr.AuthSchemesRequirement.All,
                schemes: []
            },
            types: {},
            services: {},
            errors: {},
            webhookGroups: {},
            websocketChannels: undefined,
            headers: [],
            idempotencyHeaders: [],
            apiVersion: undefined,
            apiDisplayName: undefined,
            apiDocs: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
            variables: [],
            serviceTypeReferenceInfo: {
                sharedTypes: [],
                typesReferencedOnlyByService: {}
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            environments: undefined,
            fdrApiDefinitionId: undefined,
            rootPackage: context.createPackage(),
            subpackages: {},
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: true,
                platformHeaders: {
                    language: "",
                    sdkName: "",
                    sdkVersion: "",
                    userAgent: undefined
                }
            }
        };
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenRPCConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<IntermediateRepresentation> {
        // TODO: Implement
        throw new Error("Not Implemented");
    }
}
