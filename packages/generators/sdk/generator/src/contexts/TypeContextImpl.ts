import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import { CoreUtilities, ExternalDependencies, Reference, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { TypeReferenceToParsedTypeNodeConverter } from "@fern-typescript/type-reference-converters";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { createExternalDependencies } from "../external-dependencies/createExternalDependencies";
import { ImportsManager } from "../imports-manager/ImportsManager";

export declare namespace TypeContextImpl {
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

export class TypeContextImpl implements TypeContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernConstants;

    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeReferenceToParsedTypeNodeConverter: TypeReferenceToParsedTypeNodeConverter;
    private importsManager: ImportsManager;
    private typeResolver: TypeResolver;

    constructor({
        sourceFile,
        coreUtilitiesManager,
        fernConstants,
        importsManager,
        dependencyManager,
        typeResolver,
        typeDeclarationReferencer,
    }: TypeContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager,
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager,
        });
        this.fernConstants = fernConstants;

        this.importsManager = importsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToNamedType(typeName).getEntityName(),
            typeResolver,
        });
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeResolver.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeResolver.resolveTypeName(typeName);
    }
}
