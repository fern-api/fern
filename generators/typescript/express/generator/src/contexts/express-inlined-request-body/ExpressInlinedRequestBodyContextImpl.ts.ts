import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { ExpressInlinedRequestBodyContext, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { Name } from "@fern-fern/ir-sdk/api";

import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";

export declare namespace ExpressInlinedRequestBodyContextImpl {
    export interface Init {
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        packageResolver: PackageResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
        retainOriginalCasing: boolean;
        includeSerdeLayer: boolean;
    }
}

export class ExpressInlinedRequestBodyContextImpl implements ExpressInlinedRequestBodyContext {
    private expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
    private expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;
    private retainOriginalCasing: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        expressInlinedRequestBodyGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        packageResolver,
        importsManager,
        sourceFile,
        retainOriginalCasing,
        includeSerdeLayer
    }: ExpressInlinedRequestBodyContextImpl.Init) {
        this.expressInlinedRequestBodyGenerator = expressInlinedRequestBodyGenerator;
        this.expressInlinedRequestBodyDeclarationReferencer = expressInlinedRequestBodyDeclarationReferencer;
        this.packageResolver = packageResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.retainOriginalCasing = retainOriginalCasing;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getGeneratedInlinedRequestBody(
        packageId: PackageId,
        endpointName: Name
    ): GeneratedExpressInlinedRequestBody {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        if (endpoint.requestBody?.type !== "inlinedRequestBody") {
            throw new Error("Request is not inlined");
        }
        return this.expressInlinedRequestBodyGenerator.generateInlinedRequestBody({
            requestBody: endpoint.requestBody,
            typeName: this.expressInlinedRequestBodyDeclarationReferencer.getExportedName({
                packageId,
                endpoint
            }),
            retainOriginalCasing: this.retainOriginalCasing,
            includeSerdeLayer: this.includeSerdeLayer
        });
    }

    public getReferenceToInlinedRequestBodyType(packageId: PackageId, endpointName: Name): Reference {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressInlinedRequestBodyDeclarationReferencer.getReferenceToInlinedRequestBody({
            name: { packageId, endpoint },
            importsManager: this.importsManager,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.expressInlinedRequestBodyDeclarationReferencer.namespaceExport
            },
            referencedIn: this.sourceFile
        });
    }
}
