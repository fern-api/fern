import { Name } from "@fern-fern/ir-model/commons";
import { DeclaredServiceName } from "@fern-fern/ir-model/http";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { EndpointErrorUnionContextMixin, GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";

export declare namespace EndpointErrorUnionContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointErrorUnionContextMixinImpl implements EndpointErrorUnionContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
    private serviceResolver: ServiceResolver;

    constructor({
        sourceFile,
        importsManager,
        endpointErrorUnionDeclarationReferencer,
        endpointErrorUnionGenerator,
        serviceResolver,
    }: EndpointErrorUnionContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.endpointErrorUnionDeclarationReferencer = endpointErrorUnionDeclarationReferencer;
        this.endpointErrorUnionGenerator = endpointErrorUnionGenerator;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedEndpointErrorUnion(
        service: DeclaredServiceName,
        endpointName: Name
    ): GeneratedEndpointErrorUnion {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.endpointErrorUnionGenerator.generateEndpointErrorUnion({
            service: serviceDeclaration,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeExport(
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
        return this.endpointErrorUnionDeclarationReferencer.getReferenceToEndpointExport({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
