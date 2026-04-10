import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExportsManager, ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { EndpointErrorUnionContext, GeneratedEndpointErrorUnion } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer.js";

export declare namespace EndpointErrorUnionContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        packageResolver: PackageResolver;
    }
}

export class EndpointErrorUnionContextImpl implements EndpointErrorUnionContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
    private packageResolver: PackageResolver;

    constructor({
        sourceFile,
        importsManager,
        exportsManager,
        endpointErrorUnionDeclarationReferencer,
        endpointErrorUnionGenerator,
        packageResolver
    }: EndpointErrorUnionContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.endpointErrorUnionDeclarationReferencer = endpointErrorUnionDeclarationReferencer;
        this.endpointErrorUnionGenerator = endpointErrorUnionGenerator;
        this.packageResolver = packageResolver;
    }

    public getGeneratedEndpointErrorUnion(
        packageId: PackageId,
        endpointName: FernIr.NameOrString
    ): GeneratedEndpointErrorUnion {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => getOriginalName(endpoint.name) === getOriginalName(endpointName)
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${getOriginalName(endpointName)} does not exist`);
        }
        return this.endpointErrorUnionGenerator.generateEndpointErrorUnion({
            packageId,
            endpoint
        });
    }

    public getReferenceToEndpointTypeExport(
        packageId: PackageId,
        endpointName: FernIr.NameOrString,
        export_: string | string[]
    ): Reference {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => getOriginalName(endpoint.name) === getOriginalName(endpointName)
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${getOriginalName(endpointName)} does not exist`);
        }
        return this.endpointErrorUnionDeclarationReferencer.getReferenceToEndpointExport({
            name: { packageId, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.endpointErrorUnionDeclarationReferencer.namespaceExport
            },
            subImport: typeof export_ === "string" ? [export_] : export_
        });
    }
}
