import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
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

    public getGeneratedEndpointTypes(service: FernFilepath, endpointName: Name): GeneratedEndpointTypes {
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
        return this.endpointTypesGenerator.generateEndpointTypes({
            service: serviceDeclaration.originalService,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeExport(
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
        return this.endpointDeclarationReferencer.getReferenceToEndpointExport({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
