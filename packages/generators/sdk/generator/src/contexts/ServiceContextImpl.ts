import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import {
    EnvironmentsContextMixin,
    GenericAPIErrorContextMixin,
    ServiceContext,
    ServiceContextMixin,
    TimeoutErrorContextMixin,
} from "@fern-typescript/contexts";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { GenericAPIErrorGenerator, TimeoutErrorGenerator } from "@fern-typescript/generic-error-generators";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { ServiceGenerator } from "@fern-typescript/service-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { EnvironmentsDeclarationReferencer } from "../declaration-referencers/EnvironmentsDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { GenericAPIErrorDeclarationReferencer } from "../declaration-referencers/GenericAPIErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { ServiceDeclarationReferencer } from "../declaration-referencers/ServiceDeclarationReferencer";
import { TimeoutErrorDeclarationReferencer } from "../declaration-referencers/TimeoutErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypeSchemasContextMixinImpl } from "./mixins/EndpointTypeSchemasContextMixinImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { EnvironmentsContextMixinImpl } from "./mixins/EnvironmentsContextMixinImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { ErrorSchemaContextMixinImpl } from "./mixins/ErrorSchemaContextMixinImpl";
import { GenericAPIErrorContextMixinImpl } from "./mixins/GenericAPIErrorContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./mixins/RequestWrapperContextMixinImpl";
import { ServiceContextMixinImpl } from "./mixins/ServiceContextMixinImpl";
import { TimeoutErrorContextMixinImpl } from "./mixins/TimeoutErrorContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace ServiceContextImpl {
    export interface Init extends BaseContextImpl.Init {
        intermediateRepresentation: IntermediateRepresentation;
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
        errorSchemaGenerator: ErrorSchemaGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        endpointTypesGenerator: EndpointTypesGenerator;
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceDeclarationReferencer: ServiceDeclarationReferencer;
        serviceGenerator: ServiceGenerator;
        serviceResolver: ServiceResolver;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        genericAPIErrorDeclarationReferencer: GenericAPIErrorDeclarationReferencer;
        genericAPIErrorGenerator: GenericAPIErrorGenerator;
        timeoutErrorDeclarationReferencer: TimeoutErrorDeclarationReferencer;
        timeoutErrorGenerator: TimeoutErrorGenerator;
    }
}

export class ServiceContextImpl extends BaseContextImpl implements ServiceContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly errorSchema: ErrorSchemaContextMixinImpl;
    public readonly endpointTypes: EndpointTypesContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly endpointTypeSchemas: EndpointTypeSchemasContextMixinImpl;
    public readonly service: ServiceContextMixin;
    public readonly environments: EnvironmentsContextMixin;
    public readonly genericAPIError: GenericAPIErrorContextMixin;
    public readonly timeoutError: TimeoutErrorContextMixin;

    constructor({
        intermediateRepresentation,
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        errorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        errorSchemaDeclarationReferencer,
        errorSchemaGenerator,
        endpointDeclarationReferencer,
        endpointSchemaDeclarationReferencer,
        endpointTypesGenerator,
        endpointTypeSchemasGenerator,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        serviceResolver,
        serviceDeclarationReferencer,
        serviceGenerator,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        genericAPIErrorDeclarationReferencer,
        genericAPIErrorGenerator,
        timeoutErrorDeclarationReferencer,
        timeoutErrorGenerator,
        ...superInit
    }: ServiceContextImpl.Init) {
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
        this.error = new ErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.errorSchema = new ErrorSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.base.coreUtilities,
            errorSchemaDeclarationReferencer,
            errorResolver,
            errorSchemaGenerator,
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
        this.service = new ServiceContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            serviceDeclarationReferencer,
            serviceGenerator,
            serviceResolver,
        });
        this.environments = new EnvironmentsContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            intermediateRepresentation,
            environmentsDeclarationReferencer,
            environmentsGenerator,
        });
        this.genericAPIError = new GenericAPIErrorContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            genericAPIErrorDeclarationReferencer,
            genericAPIErrorGenerator,
        });
        this.timeoutError = new TimeoutErrorContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            timeoutErrorDeclarationReferencer,
            timeoutErrorGenerator,
        });
    }
}
