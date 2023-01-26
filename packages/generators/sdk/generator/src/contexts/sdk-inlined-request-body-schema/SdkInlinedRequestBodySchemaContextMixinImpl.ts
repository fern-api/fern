import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import {
    GeneratedSdkInlinedRequestBodySchema,
    SdkInlinedRequestBodySchemaContextMixin,
} from "@fern-typescript/contexts";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { SourceFile } from "ts-morph";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace SdkInlinedRequestBodySchemaContextMixinImpl {
    export interface Init {
        sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
        sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class SdkInlinedRequestBodySchemaContextMixinImpl implements SdkInlinedRequestBodySchemaContextMixin {
    private sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
    private sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        importsManager,
        serviceResolver,
        sourceFile,
        sdkInlinedRequestBodySchemaDeclarationReferencer,
        sdkInlinedRequestBodySchemaGenerator,
    }: SdkInlinedRequestBodySchemaContextMixinImpl.Init) {
        this.sdkInlinedRequestBodySchemaGenerator = sdkInlinedRequestBodySchemaGenerator;
        this.sdkInlinedRequestBodySchemaDeclarationReferencer = sdkInlinedRequestBodySchemaDeclarationReferencer;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedInlinedRequestBodySchema(
        service: FernFilepath,
        endpointName: Name
    ): GeneratedSdkInlinedRequestBodySchema {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        if (serviceDeclaration.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = serviceDeclaration.originalService.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.sdkInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema({
            service: serviceDeclaration.originalService,
            endpoint,
            typeName: this.sdkInlinedRequestBodySchemaDeclarationReferencer.getExportedName({
                service: serviceDeclaration.originalService.name.fernFilepath,
                endpoint,
            }),
        });
    }

    public getReferenceToInlinedRequestBody(service: FernFilepath, endpointName: Name): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        if (serviceDeclaration.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = serviceDeclaration.originalService.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.sdkInlinedRequestBodySchemaDeclarationReferencer.getReferenceToInlinedRequestBody({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
        });
    }
}
