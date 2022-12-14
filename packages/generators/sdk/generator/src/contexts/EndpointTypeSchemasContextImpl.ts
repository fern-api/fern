import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypeSchemasContextMixinImpl } from "./mixins/EndpointTypeSchemasContextMixinImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { ErrorSchemaContextMixinImpl } from "./mixins/ErrorSchemaContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./mixins/RequestWrapperContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace EndpointTypeSchemasContextImpl {
    export interface Init extends BaseContextImpl.Init {
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
        endpointTypesGenerator: EndpointTypesGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        endpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypeSchemasContextImpl extends BaseContextImpl implements EndpointTypeSchemasContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly errorSchema: ErrorSchemaContextMixinImpl;
    public readonly endpointTypes: EndpointTypesContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly endpointTypeSchemas: EndpointTypeSchemasContextMixinImpl;

    constructor({
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
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        endpointTypesGenerator,
        endpointTypeSchemasGenerator,
        serviceResolver,
        ...superInit
    }: EndpointTypeSchemasContextImpl.Init) {
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
    }
}
