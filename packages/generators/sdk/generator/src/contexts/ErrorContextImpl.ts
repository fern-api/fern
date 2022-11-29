import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { ErrorContext, GeneratedError, GeneratedType, Reference } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { ErrorReferencingContextMixinImpl } from "./mixins/ErrorReferencingContextMixinImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";

export declare namespace ErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ErrorContextImpl extends BaseContextImpl implements ErrorContext {
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private errorReferencingContextMixin: ErrorReferencingContextMixinImpl;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        errorDeclarationReferencer,
        errorGenerator,
        errorResolver,
        ...superInit
    }: ErrorContextImpl.Init) {
        super(superInit);
        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
        });
        this.errorReferencingContextMixin = new ErrorReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
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

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorReferencingContextMixin.getReferenceToError(errorName);
    }

    public getGeneratedError(errorName: DeclaredErrorName): GeneratedError | undefined {
        return this.errorReferencingContextMixin.getGeneratedError(errorName);
    }
}
