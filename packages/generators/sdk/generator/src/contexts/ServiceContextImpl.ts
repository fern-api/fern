import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import {
    EnvironmentsContextMixin,
    ServiceContext,
    ServiceContextMixin,
} from "@fern-typescript/sdk-declaration-handler";
import { ServiceGenerator } from "@fern-typescript/service-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { EnvironmentEnumDeclarationReferencer } from "../declaration-referencers/EnvironmentEnumDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { ServiceDeclarationReferencer } from "../declaration-referencers/ServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypeSchemasContextMixinImpl } from "./mixins/EndpointTypeSchemasContextMixinImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { EnvironmentsContextMixinImpl } from "./mixins/EnvironmentsContextMixinImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { ErrorSchemaContextMixinImpl } from "./mixins/ErrorSchemaContextMixinImpl";
import { ServiceContextMixinImpl } from "./mixins/ServiceContextMixinImpl";
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
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
        errorSchemaGenerator: ErrorSchemaGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceDeclarationReferencer: ServiceDeclarationReferencer;
        serviceGenerator: ServiceGenerator;
        serviceResolver: ServiceResolver;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsEnumDeclarationReferencer: EnvironmentEnumDeclarationReferencer;
    }
}

export class ServiceContextImpl extends BaseContextImpl implements ServiceContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly errorSchema: ErrorSchemaContextMixinImpl;
    public readonly endpointTypes: EndpointTypesContextMixinImpl;
    public readonly endpointTypeSchemas: EndpointTypeSchemasContextMixinImpl;
    public readonly service: ServiceContextMixin;
    public readonly environments: EnvironmentsContextMixin;

    constructor({
        intermediateRepresentation,
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        errorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        errorSchemaDeclarationReferencer,
        errorSchemaGenerator,
        endpointDeclarationReferencer,
        endpointSchemaDeclarationReferencer,
        endpointTypesGenerator,
        endpointTypeSchemasGenerator,
        serviceResolver,
        serviceDeclarationReferencer,
        serviceGenerator,
        environmentsGenerator,
        environmentsEnumDeclarationReferencer,
        ...superInit
    }: ServiceContextImpl.Init) {
        super(superInit);

        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
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
            environmentsEnumDeclarationReferencer,
            environmentsGenerator,
        });
    }
}
