import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import {
    EnvironmentsContextMixin,
    GenericAPISdkErrorContextMixin,
    SdkClientClassContext,
    SdkClientClassContextMixin,
    SdkInlinedRequestBodySchemaContextMixin,
    TimeoutSdkErrorContextMixin,
} from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { GenericAPISdkErrorGenerator, TimeoutSdkErrorGenerator } from "@fern-typescript/generic-error-generators";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointErrorUnionDeclarationReferencer } from "../../declaration-referencers/EndpointErrorUnionDeclarationReferencer";
import { EnvironmentsDeclarationReferencer } from "../../declaration-referencers/EnvironmentsDeclarationReferencer";
import { GenericAPISdkErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkClientClassDeclarationReferencer } from "../../declaration-referencers/SdkClientClassDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer";
import { TimeoutSdkErrorDeclarationReferencer } from "../../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { EndpointErrorUnionContextMixinImpl } from "../endpoint-error-union/EndpointErrorUnionContextMixinImpl";
import { EndpointTypeSchemasContextMixinImpl } from "../endpoint-type-schemas/EndpointTypeSchemasContextMixinImpl";
import { EnvironmentsContextMixinImpl } from "../environments/EnvironmentsContextMixinImpl";
import { GenericAPISdkErrorContextMixinImpl } from "../generic-api-sdk-error/GenericAPISdkErrorContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "../request-wrapper/RequestWrapperContextMixinImpl";
import { SdkErrorSchemaContextMixinImpl } from "../sdk-error-schema/SdkErrorSchemaContextMixinImpl";
import { SdkErrorContextMixinImpl } from "../sdk-error/SdkErrorContextMixinImpl";
import { SdkInlinedRequestBodySchemaContextMixinImpl } from "../sdk-inlined-request-body-schema/SdkInlinedRequestBodySchemaContextMixinImpl";
import { TimeoutSdkErrorContextMixinImpl } from "../timeout-sdk-error/TimeoutSdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type/TypeSchemaContextMixinImpl";
import { SdkClientClassContextMixinImpl } from "./SdkClientClassContextMixinImpl";

export declare namespace SdkClientClassContextImpl {
    export interface Init extends BaseContextImpl.Init {
        intermediateRepresentation: IntermediateRepresentation;
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
        endpointErrorUnionDeclarationReferencer: EndpointErrorUnionDeclarationReferencer;
        endpointSchemaDeclarationReferencer: EndpointErrorUnionDeclarationReferencer;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
        sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        SdkClientClassGenerator: SdkClientClassGenerator;
        serviceResolver: ServiceResolver;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
        timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
    }
}

export class SdkClientClassContextImpl extends BaseContextImpl implements SdkClientClassContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: SdkErrorContextMixinImpl;
    public readonly sdkErrorSchema: SdkErrorSchemaContextMixinImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextMixin;
    public readonly endpointTypeSchemas: EndpointTypeSchemasContextMixinImpl;
    public readonly service: SdkClientClassContextMixin;
    public readonly environments: EnvironmentsContextMixin;
    public readonly genericAPISdkError: GenericAPISdkErrorContextMixin;
    public readonly timeoutSdkError: TimeoutSdkErrorContextMixin;

    constructor({
        intermediateRepresentation,
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
        endpointSchemaDeclarationReferencer,
        endpointErrorUnionGenerator,
        endpointTypeSchemasGenerator,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        sdkInlinedRequestBodySchemaDeclarationReferencer,
        sdkInlinedRequestBodySchemaGenerator,
        serviceResolver,
        sdkClientClassDeclarationReferencer,
        SdkClientClassGenerator,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        timeoutSdkErrorDeclarationReferencer,
        timeoutSdkErrorGenerator,
        ...superInit
    }: SdkClientClassContextImpl.Init) {
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
        this.sdkInlinedRequestBodySchema = new SdkInlinedRequestBodySchemaContextMixinImpl({
            importsManager: this.importsManager,
            serviceResolver,
            sourceFile: this.sourceFile,
            sdkInlinedRequestBodySchemaDeclarationReferencer,
            sdkInlinedRequestBodySchemaGenerator,
        });
        this.endpointTypeSchemas = new EndpointTypeSchemasContextMixinImpl({
            serviceResolver,
            endpointTypeSchemasGenerator,
            endpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
        this.service = new SdkClientClassContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            sdkClientClassDeclarationReferencer,
            SdkClientClassGenerator,
            serviceResolver,
        });
        this.environments = new EnvironmentsContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            intermediateRepresentation,
            environmentsDeclarationReferencer,
            environmentsGenerator,
        });
        this.genericAPISdkError = new GenericAPISdkErrorContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator,
        });
        this.timeoutSdkError = new TimeoutSdkErrorContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            timeoutSdkErrorDeclarationReferencer,
            timeoutSdkErrorGenerator,
        });
    }
}
