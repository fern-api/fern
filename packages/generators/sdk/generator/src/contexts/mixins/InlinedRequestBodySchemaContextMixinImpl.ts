import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedInlinedRequestBodySchema, InlinedRequestBodySchemaContextMixin } from "@fern-typescript/contexts";
import { InlinedRequestBodySchemaGenerator } from "@fern-typescript/inlined-request-schema-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { InlinedRequestBodySchemaDeclarationReferencer } from "../../declaration-referencers/InlinedRequestBodySchemaDeclarationReferencer";
import { getSchemaImportStrategy } from "./getSchemaImportStrategy";

export declare namespace InlinedRequestBodySchemaContextMixinImpl {
    export interface Init {
        inlinedRequestBodySchemaGenerator: InlinedRequestBodySchemaGenerator;
        inlinedRequestBodySchemaDeclarationReferencer: InlinedRequestBodySchemaDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class InlinedRequestBodySchemaContextMixinImpl implements InlinedRequestBodySchemaContextMixin {
    private inlinedRequestBodySchemaGenerator: InlinedRequestBodySchemaGenerator;
    private inlinedRequestBodySchemaDeclarationReferencer: InlinedRequestBodySchemaDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        importsManager,
        serviceResolver,
        sourceFile,
        inlinedRequestBodySchemaDeclarationReferencer,
        inlinedRequestBodySchemaGenerator,
    }: InlinedRequestBodySchemaContextMixinImpl.Init) {
        this.inlinedRequestBodySchemaGenerator = inlinedRequestBodySchemaGenerator;
        this.inlinedRequestBodySchemaDeclarationReferencer = inlinedRequestBodySchemaDeclarationReferencer;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedInlinedRequestBodySchema(
        service: FernFilepath,
        endpointName: Name
    ): GeneratedInlinedRequestBodySchema {
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
        return this.inlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema({
            service: serviceDeclaration.originalService,
            endpoint,
            typeName: this.inlinedRequestBodySchemaDeclarationReferencer.getExportedName({
                service: serviceDeclaration.originalService.name.fernFilepath,
                endpoint,
            }),
        });
    }

    public getReferenceToInlinedRequestBodySchema(service: FernFilepath, endpointName: Name): Reference {
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
        return this.inlinedRequestBodySchemaDeclarationReferencer.getReferenceToInlinedRequestBodySchema({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
        });
    }
}
