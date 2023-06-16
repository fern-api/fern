import { Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, RequestWrapperContext } from "@fern-typescript/contexts";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";

export declare namespace RequestWrapperContextImpl {
    export interface Init {
        requestWrapperGenerator: RequestWrapperGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        packageResolver: PackageResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class RequestWrapperContextImpl implements RequestWrapperContext {
    private requestWrapperGenerator: RequestWrapperGenerator;
    private requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        requestWrapperGenerator,
        requestWrapperDeclarationReferencer,
        packageResolver,
        importsManager,
        sourceFile,
    }: RequestWrapperContextImpl.Init) {
        this.requestWrapperGenerator = requestWrapperGenerator;
        this.requestWrapperDeclarationReferencer = requestWrapperDeclarationReferencer;
        this.packageResolver = packageResolver;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedRequestWrapper(packageId: PackageId, endpointName: Name): GeneratedRequestWrapper {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.requestWrapperGenerator.generateRequestWrapper({
            service: serviceDeclaration,
            endpoint,
            wrapperName: this.requestWrapperDeclarationReferencer.getExportedName({
                packageId,
                endpoint,
            }),
        });
    }

    public getReferenceToRequestWrapper(packageId: PackageId, endpointName: Name): ts.TypeNode {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.requestWrapperDeclarationReferencer.getReferenceToRequestWrapperType({
            name: { packageId, endpoint },
            importsManager: this.importsManager,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.requestWrapperDeclarationReferencer.namespaceExport,
            },
            referencedIn: this.sourceFile,
        });
    }
}
