import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasContextMixin,
    GeneratedEndpointTypeSchemas,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";
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

    public getGeneratedEndpointTypeSchemas(
        serviceName: DeclaredServiceName,
        endpointId: string
    ): GeneratedEndpointTypeSchemas {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.endpointTypeSchemasGenerator.generateEndpointTypeSchemas({
            service: service.originalService,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeSchemaExport(
        serviceName: DeclaredServiceName,
        endpointId: string,
        export_: string | string[]
    ): Reference {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.endpointSchemaDeclarationReferencer.getReferenceToEndpointExport({
            name: { serviceName, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
