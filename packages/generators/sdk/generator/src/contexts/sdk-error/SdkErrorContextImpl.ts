import { GenericAPISdkErrorContextMixin, SdkErrorContext } from "@fern-typescript/contexts";
import { GenericAPISdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { GenericAPISdkErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { GenericAPISdkErrorContextMixinImpl } from "../generic-api-sdk-error/GenericAPISdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { SdkErrorContextMixinImpl } from "./SdkErrorContextMixinImpl";

export declare namespace SdkErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        treatUnknownAsAny: boolean;
    }
}

export class SdkErrorContextImpl extends BaseContextImpl implements SdkErrorContext {
    public readonly type: TypeContextMixinImpl;
    public readonly sdkError: SdkErrorContextMixinImpl;
    public readonly genericAPISdkError: GenericAPISdkErrorContextMixin;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        errorDeclarationReferencer,
        sdkErrorGenerator,
        errorResolver,
        typeReferenceExampleGenerator,
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        treatUnknownAsAny,
        ...superInit
    }: SdkErrorContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
            typeReferenceExampleGenerator,
            treatUnknownAsAny,
        });
        this.sdkError = new SdkErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            sdkErrorGenerator,
            errorResolver,
        });
        this.genericAPISdkError = new GenericAPISdkErrorContextMixinImpl({
            genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
