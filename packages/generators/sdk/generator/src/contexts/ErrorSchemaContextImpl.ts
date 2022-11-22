import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import {
    CoreUtilities,
    ErrorSchemaContext,
    ExternalDependencies,
    GeneratedError,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { TypeSchemaContextImpl } from "./TypeSchemaContextImpl";

export declare namespace ErrorSchemaContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernConstants;
        typeGenerator: TypeGenerator;
        errorBeingGenerated: DeclaredErrorName;
        errorGenerator: ErrorGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorResolver: ErrorResolver;
    }
}

export class ErrorSchemaContextImpl implements ErrorSchemaContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernConstants;

    private errorBeingGenerated: DeclaredErrorName;
    private typeSchemaContext: TypeSchemaContextImpl;
    private errorGenerator: ErrorGenerator;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        coreUtilitiesManager,
        fernConstants,
        importsManager,
        dependencyManager,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeGenerator,
        errorGenerator,
        errorDeclarationReferencer,
        errorResolver,
        errorBeingGenerated,
    }: ErrorSchemaContextImpl.Init) {
        this.typeSchemaContext = new TypeSchemaContextImpl({
            sourceFile,
            coreUtilitiesManager,
            fernConstants,
            importsManager,
            dependencyManager,
            typeResolver,
            typeDeclarationReferencer,
            typeSchemaDeclarationReferencer,
            typeGenerator,
            // TODO this is confusing and we should delete
            // once we have context mixins
            typeBeingGenerated: errorBeingGenerated,
        });

        this.sourceFile = sourceFile;
        this.externalDependencies = this.typeSchemaContext.externalDependencies;
        this.coreUtilities = this.typeSchemaContext.coreUtilities;
        this.fernConstants = this.typeSchemaContext.fernConstants;

        this.errorGenerator = errorGenerator;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.errorResolver = errorResolver;
        this.errorBeingGenerated = errorBeingGenerated;
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeSchemaContext.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaContext.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeSchemaContext.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeSchemaContext.resolveTypeName(typeName);
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeSchemaContext.getReferenceToRawType(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaContext.getReferenceToRawNamedType(typeName);
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.typeSchemaContext.getSchemaOfTypeReference(typeReference);
    }

    public getSchemaOfNamedType(typeName: DeclaredTypeName): Zurg.Schema {
        return this.typeSchemaContext.getSchemaOfNamedType(typeName);
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
