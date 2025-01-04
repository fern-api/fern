import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { EndpointErrorUnionContext, GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { Name } from "@fern-fern/ir-sdk/api";

import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";

export declare namespace EndpointErrorUnionContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        packageResolver: PackageResolver;
    }
}

export class EndpointErrorUnionContextImpl implements EndpointErrorUnionContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
    private packageResolver: PackageResolver;

    constructor({
        sourceFile,
        importsManager,
        endpointErrorUnionDeclarationReferencer,
        endpointErrorUnionGenerator,
        packageResolver
    }: EndpointErrorUnionContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.endpointErrorUnionDeclarationReferencer = endpointErrorUnionDeclarationReferencer;
        this.endpointErrorUnionGenerator = endpointErrorUnionGenerator;
        this.packageResolver = packageResolver;
    }

    public getGeneratedEndpointErrorUnion(packageId: PackageId, endpointName: Name): GeneratedEndpointErrorUnion {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.endpointErrorUnionGenerator.generateEndpointErrorUnion({
            packageId,
            endpoint
        });
    }

    public getReferenceToEndpointTypeExport(
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ): Reference {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.endpointErrorUnionDeclarationReferencer.getReferenceToEndpointExport({
            name: { packageId, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.endpointErrorUnionDeclarationReferencer.namespaceExport
            },
            subImport: typeof export_ === "string" ? [export_] : export_
        });
    }
}
