import { SdkEndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkEndpointTypeSchemasGenerator } from "@fern-typescript/sdk-endpoint-type-schemas-generator";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { EndpointErrorUnionContextMixinImpl } from "../endpoint-error-union/EndpointErrorUnionContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "../request-wrapper/RequestWrapperContextMixinImpl";
import { SdkErrorSchemaContextMixinImpl } from "../sdk-error-schema/SdkErrorSchemaContextMixinImpl";
import { SdkErrorContextMixinImpl } from "../sdk-error/SdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type/TypeSchemaContextMixinImpl";
import { SdkEndpointTypeSchemasContextMixinImpl } from "./SdkEndpointTypeSchemasContextMixinImpl";

export declare namespace SdkEndpointTypeSchemasContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        sdkEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        sdkEndpointTypeSchemasGenerator: SdkEndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class SdkEndpointTypeSchemasContextImpl extends BaseContextImpl implements SdkEndpointTypeSchemasContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: SdkErrorContextMixinImpl;
    public readonly sdkErrorSchema: SdkErrorSchemaContextMixinImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        sdkErrorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        endpointErrorUnionDeclarationReferencer,
        sdkEndpointSchemaDeclarationReferencer,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        endpointErrorUnionGenerator,
        sdkEndpointTypeSchemasGenerator,
        serviceResolver,
        ...superInit
    }: SdkEndpointTypeSchemasContextImpl.Init) {
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
        this.error = new SdkErrorContextMixinImpl({
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
            errorResolver,
            sdkErrorSchemaGenerator,
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
        this.sdkEndpointTypeSchemas = new SdkEndpointTypeSchemasContextMixinImpl({
            serviceResolver,
            sdkEndpointTypeSchemasGenerator,
            sdkEndpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
    }
}
