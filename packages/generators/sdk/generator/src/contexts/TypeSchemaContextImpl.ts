import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import { GeneratedType, Reference, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";
import { TypeSchemaReferencingContextMixinImpl } from "./mixins/TypeSchemaReferencingContextMixinImpl";

export declare namespace TypeSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeGenerator: TypeGenerator;
        typeBeingGenerated: DeclaredTypeName;
    }
}

export class TypeSchemaContextImpl extends BaseContextImpl implements TypeSchemaContext {
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private typeSchemaReferencingContextMixin: TypeSchemaReferencingContextMixinImpl;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeGenerator: TypeGenerator;
    private typeResolver: TypeResolver;
    private typeBeingGenerated: DeclaredTypeName;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeGenerator,
        typeBeingGenerated,
        ...superInit
    }: TypeSchemaContextImpl.Init) {
        super(superInit);
        this.typeGenerator = typeGenerator;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeResolver = typeResolver;
        this.typeBeingGenerated = typeBeingGenerated;
        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
        });
        this.typeSchemaReferencingContextMixin = new TypeSchemaReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager: this.importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
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

    public getTypeBeingGenerated(): GeneratedType {
        return this.typeGenerator.generateType({
            typeName: this.typeDeclarationReferencer.getExportedName(this.typeBeingGenerated),
            typeDeclaration: this.typeResolver.getTypeDeclarationFromName(this.typeBeingGenerated),
        });
    }
}
