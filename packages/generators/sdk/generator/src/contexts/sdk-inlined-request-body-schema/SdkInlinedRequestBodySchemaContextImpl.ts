import { SdkInlinedRequestBodySchemaContext } from "@fern-typescript/contexts";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { RequestWrapperContextMixinImpl } from "../request-wrapper/RequestWrapperContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type/TypeSchemaContextMixinImpl";
import { SdkInlinedRequestBodySchemaContextMixinImpl } from "./SdkInlinedRequestBodySchemaContextMixinImpl";

export declare namespace SdkInlinedRequestBodySchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
        sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
        serviceResolver: ServiceResolver;
    }
}

export class SdkInlinedRequestBodySchemaContextImpl
    extends BaseContextImpl
    implements SdkInlinedRequestBodySchemaContext
{
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        requestWrapperDeclarationReferencer,
        sdkInlinedRequestBodySchemaGenerator,
        sdkInlinedRequestBodySchemaDeclarationReferencer,
        requestWrapperGenerator,
        serviceResolver,
        ...superInit
    }: SdkInlinedRequestBodySchemaContextImpl.Init) {
        super(superInit);

        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
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
        });
        this.requestWrapper = new RequestWrapperContextMixinImpl({
            requestWrapperDeclarationReferencer,
            requestWrapperGenerator,
            serviceResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
        this.sdkInlinedRequestBodySchema = new SdkInlinedRequestBodySchemaContextMixinImpl({
            serviceResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            sdkInlinedRequestBodySchemaGenerator,
            sdkInlinedRequestBodySchemaDeclarationReferencer,
        });
    }
}
