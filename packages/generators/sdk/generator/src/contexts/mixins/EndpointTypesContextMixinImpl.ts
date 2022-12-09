import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { EndpointTypesContextMixin, GeneratedEndpointTypes, Reference } from "@fern-typescript/contexts";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace EndpointTypesContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypesContextMixinImpl implements EndpointTypesContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private endpointDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointTypesGenerator: EndpointTypesGenerator;
    private serviceResolver: ServiceResolver;

    constructor({
        sourceFile,
        importsManager,
        endpointDeclarationReferencer,
        endpointTypesGenerator,
        serviceResolver,
    }: EndpointTypesContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.endpointDeclarationReferencer = endpointDeclarationReferencer;
        this.endpointTypesGenerator = endpointTypesGenerator;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedEndpointTypes(serviceName: DeclaredServiceName, endpointId: string): GeneratedEndpointTypes {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        if (service.originalService == null) {
            throw new Error("Service is a wrapper");
        }
        const endpoint = service.originalService.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.endpointTypesGenerator.generateEndpointTypes({ service: service.originalService, endpoint });
    }

    public getReferenceToEndpointTypeExport(
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
        return this.endpointDeclarationReferencer.getReferenceToEndpointExport({
            name: { serviceName, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
