import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasGenerator } from "@fern-typescript/endpoint-type-schemas-generator";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasContext,
    GeneratedEndpointTypes,
    GeneratedEndpointTypeSchemas,
    GeneratedError,
    GeneratedErrorSchema,
    GeneratedType,
    GeneratedTypeSchema,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypeSchemasReferencingContextMixinImpl } from "./mixins/EndpointTypeSchemasReferencingContextMixinImpl";
import { EndpointTypesReferencingContextMixinImpl } from "./mixins/EndpointTypesReferencingContextMixinImpl";
import { ErrorReferencingContextMixinImpl } from "./mixins/ErrorReferencingContextMixinImpl";
import { ErrorSchemaReferencingContextMixinImpl } from "./mixins/ErrorSchemaReferencingContextMixinImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";
import { TypeSchemaReferencingContextMixinImpl } from "./mixins/TypeSchemaReferencingContextMixinImpl";

export declare namespace EndpointTypeSchemasContextImpl {
    export interface Init extends BaseContextImpl.Init {
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
        endpointTypesGenerator: EndpointTypesGenerator;
        endpointTypeSchemasGenerator: EndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypeSchemasContextImpl extends BaseContextImpl implements EndpointTypeSchemasContext {
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private typeSchemaReferencingContextMixin: TypeSchemaReferencingContextMixinImpl;
    private errorReferencingContextMixin: ErrorReferencingContextMixinImpl;
    private errorSchemaReferencingContextMixin: ErrorSchemaReferencingContextMixinImpl;
    private endpointTypeReferencingContextMixin: EndpointTypesReferencingContextMixinImpl;
    private endpointTypeSchemasReferencingContextMixin: EndpointTypeSchemasReferencingContextMixinImpl;

    constructor({
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
        endpointTypesGenerator,
        endpointTypeSchemasGenerator,
        serviceResolver,
        ...superInit
    }: EndpointTypeSchemasContextImpl.Init) {
        super(superInit);

        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
        });
        this.typeSchemaReferencingContextMixin = new TypeSchemaReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager: this.importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
            typeDeclarationReferencer,
            typeGenerator,
            typeSchemaGenerator,
        });
        this.errorReferencingContextMixin = new ErrorReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.errorSchemaReferencingContextMixin = new ErrorSchemaReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.coreUtilities,
            errorSchemaDeclarationReferencer,
            errorResolver,
            errorSchemaGenerator,
        });
        this.endpointTypeReferencingContextMixin = new EndpointTypesReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            endpointDeclarationReferencer,
            endpointTypesGenerator,
            serviceResolver,
        });
        this.endpointTypeSchemasReferencingContextMixin = new EndpointTypeSchemasReferencingContextMixinImpl({
            serviceResolver,
            endpointTypeSchemasGenerator,
        });
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferencingContextMixin.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeReferencingContextMixin.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeReferencingContextMixin.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeReferencingContextMixin.resolveTypeName(typeName);
    }

    public getGeneratedType(typeName: DeclaredTypeName): GeneratedType {
        return this.typeReferencingContextMixin.getGeneratedType(typeName);
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeSchemaReferencingContextMixin.getReferenceToRawType(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaReferencingContextMixin.getReferenceToRawNamedType(typeName);
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.typeSchemaReferencingContextMixin.getSchemaOfTypeReference(typeReference);
    }

    public getSchemaOfNamedType(typeName: DeclaredTypeName): Zurg.Schema {
        return this.typeSchemaReferencingContextMixin.getSchemaOfNamedType(typeName);
    }

    public getGeneratedTypeSchema(typeName: DeclaredTypeName): GeneratedTypeSchema {
        return this.typeSchemaReferencingContextMixin.getGeneratedTypeSchema(typeName);
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorReferencingContextMixin.getReferenceToError(errorName);
    }

    public getGeneratedError(errorName: DeclaredErrorName): GeneratedError | undefined {
        return this.errorReferencingContextMixin.getGeneratedError(errorName);
    }

    public getReferenceToRawError(errorName: DeclaredErrorName): Reference {
        return this.errorSchemaReferencingContextMixin.getReferenceToRawError(errorName);
    }

    public getSchemaOfError(errorName: DeclaredErrorName): Zurg.Schema {
        return this.errorSchemaReferencingContextMixin.getSchemaOfError(errorName);
    }

    public getGeneratedErrorSchema(errorName: DeclaredErrorName): GeneratedErrorSchema | undefined {
        return this.errorSchemaReferencingContextMixin.getGeneratedErrorSchema(errorName);
    }

    public getGeneratedEndpointTypes(serviceName: DeclaredServiceName, endpointId: string): GeneratedEndpointTypes {
        return this.endpointTypeReferencingContextMixin.getGeneratedEndpointTypes(serviceName, endpointId);
    }

    public getReferenceToEndpointTypeExport(
        serviceName: DeclaredServiceName,
        endpointId: string,
        export_: string | string[]
    ): Reference {
        return this.endpointTypeReferencingContextMixin.getReferenceToEndpointTypeExport(
            serviceName,
            endpointId,
            export_
        );
    }

    public getGeneratedEndpointTypeSchemas(
        serviceName: DeclaredServiceName,
        endpointId: string
    ): GeneratedEndpointTypeSchemas {
        return this.endpointTypeSchemasReferencingContextMixin.getGeneratedEndpointTypeSchemas(serviceName, endpointId);
    }
}
