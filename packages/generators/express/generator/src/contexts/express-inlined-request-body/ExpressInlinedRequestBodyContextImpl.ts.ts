import { Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { ExpressInlinedRequestBodyContext, GeneratedExpressInlinedRequestBody } from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";

export declare namespace ExpressInlinedRequestBodyContextImpl {
    export interface Init {
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        packageResolver: PackageResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class ExpressInlinedRequestBodyContextImpl implements ExpressInlinedRequestBodyContext {
    private expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
    private expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        expressInlinedRequestBodyGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        packageResolver,
        importsManager,
        sourceFile,
    }: ExpressInlinedRequestBodyContextImpl.Init) {
        this.expressInlinedRequestBodyGenerator = expressInlinedRequestBodyGenerator;
        this.expressInlinedRequestBodyDeclarationReferencer = expressInlinedRequestBodyDeclarationReferencer;
        this.packageResolver = packageResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
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
                endpoint,
            }),
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
                namespaceImport: this.expressInlinedRequestBodyDeclarationReferencer.namespaceExport,
            },
            referencedIn: this.sourceFile,
        });
    }
}
