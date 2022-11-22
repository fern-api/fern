import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import { CoreUtilities, ErrorContext, ExternalDependencies, Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { TypeContextImpl } from "./TypeContextImpl";

export declare namespace ErrorContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernConstants;
    }
}

export class ErrorContextImpl implements ErrorContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernConstants;

    private typeContext: TypeContextImpl;

    constructor({
        sourceFile,
        coreUtilitiesManager,
        fernConstants,
        importsManager,
        dependencyManager,
        typeResolver,
        typeDeclarationReferencer,
    }: ErrorContextImpl.Init) {
        this.typeContext = new TypeContextImpl({
            sourceFile,
            coreUtilitiesManager,
            fernConstants,
            importsManager,
            dependencyManager,
            typeResolver,
            typeDeclarationReferencer,
        });

        this.sourceFile = sourceFile;
        this.externalDependencies = this.typeContext.externalDependencies;
        this.coreUtilities = this.typeContext.coreUtilities;
        this.fernConstants = this.typeContext.fernConstants;
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeContext.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeContext.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeContext.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeContext.resolveTypeName(typeName);
    }
}
