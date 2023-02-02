import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { ExpressEndpointTypeSchemasContextMixin, GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace ExpressEndpointTypeSchemasContextMixinImpl {
    export interface Init {
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class ExpressEndpointTypeSchemasContextMixinImpl implements ExpressEndpointTypeSchemasContextMixin {
    private expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
    private serviceResolver: ServiceResolver;
    private expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        sourceFile,
        importsManager,
        expressEndpointTypeSchemasGenerator,
        expressEndpointSchemaDeclarationReferencer,
        serviceResolver,
    }: ExpressEndpointTypeSchemasContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
        this.expressEndpointTypeSchemasGenerator = expressEndpointTypeSchemasGenerator;
        this.expressEndpointSchemaDeclarationReferencer = expressEndpointSchemaDeclarationReferencer;
    }

    public getGeneratedEndpointTypeSchemas(
        service: DeclaredServiceName,
        endpointName: Name
    ): GeneratedExpressEndpointTypeSchemas {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressEndpointTypeSchemasGenerator.generateEndpointTypeSchemas({
            service: serviceDeclaration,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeSchemaExport(
        service: DeclaredServiceName,
        endpointName: Name,
        export_: string | string[]
    ): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressEndpointSchemaDeclarationReferencer.getReferenceToEndpointExport({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
