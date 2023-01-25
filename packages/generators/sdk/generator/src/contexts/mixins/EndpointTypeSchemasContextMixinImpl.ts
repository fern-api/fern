import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { EndpointTypeSchemasContextMixin, GeneratedEndpointTypeSchemas } from "@fern-typescript/contexts";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { getSchemaImportStrategy } from "./getSchemaImportStrategy";

export declare namespace EndpointTypeSchemasContextMixinImpl {
    export interface Init {
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class EndpointTypeSchemasContextMixinImpl implements EndpointTypeSchemasContextMixin {
    private endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
    private serviceResolver: ServiceResolver;
    private endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        sourceFile,
        importsManager,
        endpointTypeSchemasGenerator,
        endpointSchemaDeclarationReferencer,
        serviceResolver,
    }: EndpointTypeSchemasContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
        this.endpointTypeSchemasGenerator = endpointTypeSchemasGenerator;
        this.endpointSchemaDeclarationReferencer = endpointSchemaDeclarationReferencer;
    }

    public getGeneratedEndpointTypeSchemas(service: FernFilepath, endpointName: Name): GeneratedEndpointTypeSchemas {
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
        return this.endpointTypeSchemasGenerator.generateEndpointTypeSchemas({
            service: serviceDeclaration.originalService,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeSchemaExport(
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ): Reference {
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
        return this.endpointSchemaDeclarationReferencer.getReferenceToEndpointExport({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
