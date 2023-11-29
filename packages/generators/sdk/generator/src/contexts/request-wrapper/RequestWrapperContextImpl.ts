import { ExampleHeader, ExampleInlinedRequestBody, ExampleQueryParameter, Name } from "@fern-fern/ir-sdk/api";
import { ImportsManager, PackageId } from "@fern-typescript/commons";
import {
    GeneratedRequestWrapper,
    GeneratedRequestWrapperExample,
    RequestWrapperContext,
} from "@fern-typescript/contexts";
import { RequestWrapperExampleGenerator } from "@fern-typescript/request-wrapper-example-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile, ts } from "ts-morph";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";

export declare namespace RequestWrapperContextImpl {
    export interface Init {
        requestWrapperGenerator: RequestWrapperGenerator;
        requestWrapperExampleGenerator: RequestWrapperExampleGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        packageResolver: PackageResolver;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class RequestWrapperContextImpl implements RequestWrapperContext {
    private requestWrapperGenerator: RequestWrapperGenerator;
    private requestWrapperExampleGenerator: RequestWrapperExampleGenerator;
    private requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        requestWrapperGenerator,
        requestWrapperExampleGenerator,
        requestWrapperDeclarationReferencer,
        packageResolver,
        importsManager,
        sourceFile,
    }: RequestWrapperContextImpl.Init) {
        this.requestWrapperGenerator = requestWrapperGenerator;
        this.requestWrapperExampleGenerator = requestWrapperExampleGenerator;
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
            packageId,
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

    public getGeneratedExample({
        exampleHeaders,
        exampleBody,
        exampleQueryParameters,
        packageId,
        endpointName,
    }: {
        exampleBody: ExampleInlinedRequestBody | undefined;
        exampleQueryParameters: ExampleQueryParameter[] | undefined;
        exampleHeaders: ExampleHeader[] | undefined;
        packageId: PackageId;
        endpointName: Name;
    }): GeneratedRequestWrapperExample {
        return this.requestWrapperExampleGenerator.generateExample({
            exampleHeaders: exampleHeaders ?? [],
            exampleBody,
            exampleQueryParameters: exampleQueryParameters ?? [],
            packageId,
            endpointName,
        });
    }
}
