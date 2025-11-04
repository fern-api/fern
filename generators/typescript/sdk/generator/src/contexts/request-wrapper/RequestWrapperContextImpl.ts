import { assertNever } from "@fern-api/core-utils";
import { Name, SdkRequest } from "@fern-fern/ir-sdk/api";
import { ExportsManager, ImportsManager, PackageId } from "@fern-typescript/commons";
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
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        inlinePathParameters: boolean;
        enableInlineTypes: boolean;
        formDataSupport: "Node16" | "Node18";
        flattenRequestParameters: boolean;
        isForSnippet: boolean;
    }
}

export class RequestWrapperContextImpl implements RequestWrapperContext {
    private requestWrapperGenerator: RequestWrapperGenerator;
    private requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
    private packageResolver: PackageResolver;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private inlineFileProperties: boolean;
    private inlinePathParameters: boolean;
    private enableInlineTypes: boolean;
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly flattenRequestParameters: boolean;
    private readonly isForSnippet: boolean;

    constructor({
        requestWrapperGenerator,
        requestWrapperDeclarationReferencer,
        packageResolver,
        importsManager,
        exportsManager,
        sourceFile,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        inlinePathParameters,
        enableInlineTypes,
        formDataSupport,
        flattenRequestParameters,
        isForSnippet
    }: RequestWrapperContextImpl.Init) {
        this.requestWrapperGenerator = requestWrapperGenerator;
        this.requestWrapperDeclarationReferencer = requestWrapperDeclarationReferencer;
        this.packageResolver = packageResolver;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sourceFile = sourceFile;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.inlinePathParameters = inlinePathParameters;
        this.enableInlineTypes = enableInlineTypes;
        this.formDataSupport = formDataSupport;
        this.flattenRequestParameters = flattenRequestParameters;
        this.isForSnippet = isForSnippet;
    }

    public shouldInlinePathParameters(sdkRequest: SdkRequest | undefined | null): boolean {
        if (!this.inlinePathParameters) {
            return false;
        }
        if (sdkRequest == null) {
            return false;
        }
        switch (sdkRequest.shape.type) {
            case "justRequestBody":
                return false;
            case "wrapper":
                break;
            default:
                assertNever(sdkRequest.shape);
        }
        if (sdkRequest.shape.onlyPathParameters) {
            return true;
        }
        if (sdkRequest.shape.includePathParameters) {
            return true;
        }
        return false;
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
                endpoint
            }),
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            inlineFileProperties: this.inlineFileProperties,
            enableInlineTypes: this.enableInlineTypes,
            shouldInlinePathParameters: this.shouldInlinePathParameters(endpoint.sdkRequest),
            formDataSupport: this.formDataSupport,
            flattenRequestParameters: this.flattenRequestParameters
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
        if (this.isForSnippet) {
            return this.requestWrapperDeclarationReferencer.getReferenceToRequestWrapperType({
                name: { packageId, endpoint },
                importsManager: this.importsManager,
                exportsManager: this.exportsManager,
                importStrategy: {
                    type: "fromRoot",
                    namespaceImport: this.requestWrapperDeclarationReferencer.namespaceExport
                },
                referencedIn: this.sourceFile
            });
        } else {
            return this.requestWrapperDeclarationReferencer.getReferenceToRequestWrapperType({
                name: { packageId, endpoint },
                importsManager: this.importsManager,
                exportsManager: this.exportsManager,
                importStrategy: { type: "direct" },
                referencedIn: this.sourceFile
            });
        }
    }
}
