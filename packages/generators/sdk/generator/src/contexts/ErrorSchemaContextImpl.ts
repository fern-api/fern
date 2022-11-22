import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { ErrorSchemaContext, GeneratedError, Reference } from "@fern-typescript/sdk-declaration-handler";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";
import { TypeSchemaReferencingContextMixinImpl } from "./mixins/TypeSchemaReferencingContextMixinImpl";

export declare namespace ErrorSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
        errorBeingGenerated: DeclaredErrorName;
    }
}

export class ErrorSchemaContextImpl extends BaseContextImpl implements ErrorSchemaContext {
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private typeSchemaReferencingContextMixin: TypeSchemaReferencingContextMixinImpl;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
    private errorGenerator: ErrorGenerator;
    private errorResolver: ErrorResolver;
    private errorBeingGenerated: DeclaredErrorName;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        errorDeclarationReferencer,
        errorGenerator,
        errorResolver,
        errorBeingGenerated,
        ...superInit
    }: ErrorSchemaContextImpl.Init) {
        super(superInit);
        this.errorGenerator = errorGenerator;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.errorResolver = errorResolver;
        this.errorBeingGenerated = errorBeingGenerated;
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

    public getErrorBeingGenerated(): GeneratedError {
        const generatedError = this.errorGenerator.generateError({
            errorName: this.errorDeclarationReferencer.getExportedName(this.errorBeingGenerated),
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(this.errorBeingGenerated),
        });
        if (generatedError == null) {
            throw new Error(
                "No error was generated for name: " + this.errorBeingGenerated.nameV3.unsafeName.originalValue
            );
        }
        return generatedError;
    }
}
