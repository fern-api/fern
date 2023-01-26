import { EndpointErrorUnionContext } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { SdkErrorContextMixinImpl } from "../sdk-error/SdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { EndpointErrorUnionContextMixinImpl } from "./EndpointErrorUnionContextMixinImpl";

export declare namespace EndpointErrorUnionContextImpl {
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
        serviceResolver: ServiceResolver;
    }
}

export class EndpointErrorUnionContextImpl extends BaseContextImpl implements EndpointErrorUnionContext {
    public readonly type: TypeContextMixinImpl;
    public readonly error: SdkErrorContextMixinImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextMixinImpl;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeReferenceExampleGenerator,
        sdkErrorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        endpointErrorUnionDeclarationReferencer,
        endpointErrorUnionGenerator,
        serviceResolver,
        ...superInit
    }: EndpointErrorUnionContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
        });
        this.error = new SdkErrorContextMixinImpl({
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
    }
}
