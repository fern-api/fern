import { RequestWrapperContext } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { EndpointErrorUnionContextMixinImpl } from "../endpoint-error-union/EndpointErrorUnionContextMixinImpl";
import { SdkErrorContextMixinImpl } from "../sdk-error/SdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./RequestWrapperContextMixinImpl";

export declare namespace RequestWrapperContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorResolver: ErrorResolver;
        sdkErrorGenerator: SdkErrorGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class RequestWrapperContextImpl extends BaseContextImpl implements RequestWrapperContext {
    public readonly type: TypeContextMixinImpl;
    public readonly sdkError: SdkErrorContextMixinImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeReferenceExampleGenerator,
        errorDeclarationReferencer,
        sdkErrorGenerator,
        errorResolver,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        serviceResolver,
        endpointErrorUnionDeclarationReferencer,
        endpointErrorUnionGenerator,
        ...superInit
    }: RequestWrapperContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
        });
        this.sdkError = new SdkErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            sdkErrorGenerator,
            errorResolver,
        });
        this.endpointErrorUnion = new EndpointErrorUnionContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            endpointErrorUnionDeclarationReferencer,
            endpointErrorUnionGenerator,
            serviceResolver,
        });
        this.requestWrapper = new RequestWrapperContextMixinImpl({
            requestWrapperDeclarationReferencer,
            requestWrapperGenerator,
            serviceResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
    }
}
