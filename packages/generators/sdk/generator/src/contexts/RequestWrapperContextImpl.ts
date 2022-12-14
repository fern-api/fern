import { RequestWrapperContext } from "@fern-typescript/contexts";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./mixins/RequestWrapperContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";

export declare namespace RequestWrapperContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorResolver: ErrorResolver;
        errorGenerator: ErrorGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class RequestWrapperContextImpl extends BaseContextImpl implements RequestWrapperContext {
    public readonly type: TypeContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly endpointTypes: EndpointTypesContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeReferenceExampleGenerator,
        errorDeclarationReferencer,
        errorGenerator,
        errorResolver,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        serviceResolver,
        endpointDeclarationReferencer,
        endpointTypesGenerator,
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
        this.error = new ErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.endpointTypes = new EndpointTypesContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            endpointDeclarationReferencer,
            endpointTypesGenerator,
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
