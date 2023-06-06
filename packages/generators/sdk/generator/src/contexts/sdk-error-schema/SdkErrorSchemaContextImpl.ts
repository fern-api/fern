import { GenericAPISdkErrorContextMixin, SdkErrorSchemaContext } from "@fern-typescript/contexts";
import { GenericAPISdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/sdk-error-schema-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { GenericAPISdkErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { GenericAPISdkErrorContextMixinImpl } from "../generic-api-sdk-error/GenericAPISdkErrorContextMixinImpl";
import { SdkErrorContextMixinImpl } from "../sdk-error/SdkErrorContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type-schema/TypeSchemaContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { SdkErrorSchemaContextMixinImpl } from "./SdkErrorSchemaContextMixinImpl";

export declare namespace SdkErrorSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        treatUnknownAsAny: boolean;
    }
}

export class SdkErrorSchemaContextImpl extends BaseContextImpl implements SdkErrorSchemaContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly sdkError: SdkErrorContextMixinImpl;
    public readonly sdkErrorSchema: SdkErrorSchemaContextMixinImpl;
    public readonly genericAPISdkError: GenericAPISdkErrorContextMixin;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeReferenceExampleGenerator,
        errorDeclarationReferencer,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        sdkErrorGenerator,
        errorResolver,
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        treatUnknownAsAny,
        ...superInit
    }: SdkErrorSchemaContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
            treatUnknownAsAny,
        });
        this.typeSchema = new TypeSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            coreUtilities: this.base.coreUtilities,
            importsManager: this.importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
            typeDeclarationReferencer,
            typeGenerator,
            typeSchemaGenerator,
            treatUnknownAsAny,
        });
        this.sdkError = new SdkErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            sdkErrorGenerator,
            errorResolver,
        });
        this.sdkErrorSchema = new SdkErrorSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.base.coreUtilities,
            sdkErrorSchemaDeclarationReferencer,
            sdkErrorSchemaGenerator,
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
