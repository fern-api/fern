import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import {
    GeneratedType,
    GeneratedTypeSchema,
    Reference,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";
import { TypeSchemaReferencingContextMixinImpl } from "./mixins/TypeSchemaReferencingContextMixinImpl";

export declare namespace TypeSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
    }
}

export class TypeSchemaContextImpl extends BaseContextImpl implements TypeSchemaContext {
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private typeSchemaReferencingContextMixin: TypeSchemaReferencingContextMixinImpl;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeGenerator,
        ...superInit
    }: TypeSchemaContextImpl.Init) {
        super(superInit);
        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
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
}
