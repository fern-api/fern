import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypesReferencingContextMixin,
    GeneratedEndpointTypes,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace EndpointTypesReferencingContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypesReferencingContextMixinImpl implements EndpointTypesReferencingContextMixin {
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
    }: EndpointTypesReferencingContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.endpointDeclarationReferencer = endpointDeclarationReferencer;
        this.endpointTypesGenerator = endpointTypesGenerator;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedEndpointTypes(serviceName: DeclaredServiceName, endpointId: string): GeneratedEndpointTypes {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        const endpoint = service.endpoints.find((endpoint) => endpoint.id === endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return this.endpointTypesGenerator.generateEndpointTypes({ service, endpoint });
    }

    public getReferenceToEndpointTypeExport(
        serviceName: DeclaredServiceName,
        endpointId: string,
        export_: string | string[]
    ): Reference {
        const service = this.serviceResolver.getServiceDeclarationFromName(serviceName);
        const endpoint = service.endpoints.find((endpoint) => endpoint.id === endpointId);
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
