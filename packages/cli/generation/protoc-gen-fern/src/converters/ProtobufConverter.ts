import { BaseIntermediateRepresentation } from "@fern-api/v2-importer-commons/lib/AbstractConverter";
import { ProtobufConverterContext } from "../ProtobufConverterContext";
import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";
import { MessageConverter } from "./MessageConverter";

export declare namespace ProtobufConverter {
    export interface Args {
        breadcrumbs: string[];
        context: ProtobufConverterContext;
    }
}

export class ProtobufConverter {
    private ir: BaseIntermediateRepresentation;
    private breadcrumbs: string[];
    private context: ProtobufConverterContext;

    constructor({ breadcrumbs, context }: ProtobufConverter.Args) {
        this.breadcrumbs = breadcrumbs;
        this.context = context;
        this.ir = this.initializeBaseIR();
    }

    public convert(): IntermediateRepresentation {
        this.convertOptions();
        this.convertEnums();
        this.convertMessages();
        this.convertServices();
        this.addToPackage();
        return this.finalizeIr();
    }

    private convertOptions() {
        // TODO: convert options
    }
    
    private convertEnums() {
        // TODO: convert enums
        // TODO: add to IR as type/schema
    }

    private convertMessages() {
        for (const protoFile of this.context.spec.protoFile) {
            for (const message of protoFile.messageType) {
                // TODO: use MessageConverter to convert message
                // TODO: add to IR as type/schema
            }
        }
    }

    private convertServices() {
        for (const protoFile of this.context.spec.protoFile) {
            for (const service of protoFile.service) {
                // TODO: use ServiceConverter to convert service
                // TODO: add to IR similar to path
            }
        }
    }

    private addToPackage() {
        // TODO: add to correct (sub)package
    }

    private finalizeIr(): IntermediateRepresentation {
        return {
            ...this.ir,
            apiName: this.context.casingsGenerator.generateName(this.ir.apiDisplayName ?? ""),
            constants: {
                errorInstanceIdKey: this.context.casingsGenerator.generateNameAndWireValue({
                    wireValue: "errorInstanceId",
                    name: "errorInstanceId"
                })
            }
        }
    }

    public createPackage(args: { name?: string } = {}): Package {
        return {
            fernFilepath: this.context.createFernFilepath(args),
            service: undefined,
            types: [],
            errors: [],
            subpackages: [],
            docs: undefined,
            webhooks: undefined,
            websocket: undefined,
            hasEndpointsInTree: false,
            navigationConfig: undefined
        };
    }

    private initializeBaseIR(): BaseIntermediateRepresentation {
        return {
            auth: {
                docs: undefined,
                requirement: FernIr.AuthSchemesRequirement.Any,
                schemes: []
            },
            selfHosted: false,
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
            rootPackage: this.createPackage(),
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
        }
    }

}