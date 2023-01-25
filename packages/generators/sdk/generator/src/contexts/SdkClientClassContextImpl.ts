import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import {
    EnvironmentsContextMixin,
    GenericAPISdkErrorContextMixin,
    SdkClientClassContext,
    SdkClientClassContextMixin,
    TimeoutSdkErrorContextMixin,
} from "@fern-typescript/contexts";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { GenericAPISdkErrorGenerator, TimeoutSdkErrorGenerator } from "@fern-typescript/generic-error-generators";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { EnvironmentsDeclarationReferencer } from "../declaration-referencers/EnvironmentsDeclarationReferencer";
import { GenericAPISdkErrorDeclarationReferencer } from "../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkClientClassDeclarationReferencer } from "../declaration-referencers/SdkClientClassDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../declaration-referencers/SdkErrorDeclarationReferencer";
import { TimeoutSdkErrorDeclarationReferencer } from "../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypeSchemasContextMixinImpl } from "./mixins/EndpointTypeSchemasContextMixinImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { EnvironmentsContextMixinImpl } from "./mixins/EnvironmentsContextMixinImpl";
import { GenericAPISdkErrorContextMixinImpl } from "./mixins/GenericAPISdkErrorContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./mixins/RequestWrapperContextMixinImpl";
import { SdkClientClassContextMixinImpl } from "./mixins/SdkClientClassContextMixinImpl";
import { SdkErrorContextMixinImpl } from "./mixins/SdkErrorContextMixinImpl";
import { SdkErrorSchemaContextMixinImpl } from "./mixins/SdkErrorSchemaContextMixinImpl";
import { TimeoutSdkErrorContextMixinImpl } from "./mixins/TimeoutSdkErrorContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace SdkClientClassContextImpl {
    export interface Init extends BaseContextImpl.Init {
        intermediateRepresentation: IntermediateRepresentation;
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        SdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        endpointTypesGenerator: EndpointTypesGenerator;
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
    public readonly endpointTypes: EndpointTypesContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
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
        SdkErrorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        endpointDeclarationReferencer,
        endpointSchemaDeclarationReferencer,
        endpointTypesGenerator,
        endpointTypeSchemasGenerator,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
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
            SdkErrorGenerator,
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
