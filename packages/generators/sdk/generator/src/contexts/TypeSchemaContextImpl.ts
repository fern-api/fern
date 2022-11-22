import { FernConstants } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, ResolvedTypeReference, ShapeType, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import {
    CoreUtilities,
    ExternalDependencies,
    GeneratedType,
    Reference,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import {
    TypeReferenceToRawTypeNodeConverter,
    TypeReferenceToSchemaConverter,
} from "@fern-typescript/type-reference-converters";
import { getSubImportPathToRawSchema } from "@fern-typescript/types-v2";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { ImportStrategy } from "../declaration-referencers/DeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { TypeContextImpl } from "./TypeContextImpl";

export declare namespace TypeSchemaContextImpl {
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
        typeBeingGenerated: DeclaredTypeName;
    }
}

export class TypeSchemaContextImpl implements TypeSchemaContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernConstants;

    private typeContext: TypeContextImpl;
    private typeGenerator: TypeGenerator;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private importsManager: ImportsManager;
    private typeResolver: TypeResolver;
    private typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
    private typeReferenceToRawTypeNodeConverter: TypeReferenceToRawTypeNodeConverter;
    private typeReferenceToSchemaConverter: TypeReferenceToSchemaConverter;
    private typeBeingGenerated: DeclaredTypeName;

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
        typeBeingGenerated,
    }: TypeSchemaContextImpl.Init) {
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
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeResolver = typeResolver;
        this.importsManager = importsManager;

        this.typeGenerator = typeGenerator;
        this.typeReferenceToRawTypeNodeConverter = new TypeReferenceToRawTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToRawNamedType(typeName).getEntityName(),
            typeResolver,
        });
        this.typeReferenceToSchemaConverter = new TypeReferenceToSchemaConverter({
            getSchemaOfNamedType: (typeName) => this.getSchemaOfNamedType(typeName),
            zurg: this.coreUtilities.zurg,
            typeResolver,
        });

        this.typeSchemaDeclarationReferencer = typeSchemaDeclarationReferencer;
        this.typeBeingGenerated = typeBeingGenerated;
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

    public getTypeBeingGenerated(): GeneratedType {
        return this.typeGenerator.generateType({
            typeName: this.typeDeclarationReferencer.getExportedName(this.typeBeingGenerated),
            typeDeclaration: this.typeResolver.getTypeDeclarationFromName(this.typeBeingGenerated),
        });
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToRawTypeNodeConverter.convert(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: this.getSchemaImportStrategy({
                // dynamic import not needed for types
                useDynamicImport: false,
            }),
            subImport: getSubImportPathToRawSchema(),
            importsManager: this.importsManager,
            referencedIn: this.sourceFile,
        });
    }

    private getSchemaImportStrategy({ useDynamicImport }: { useDynamicImport: boolean }): ImportStrategy {
        return {
            type: "fromRoot",
            namespaceImport: "serializers",
            useDynamicImport,
        };
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.typeReferenceToSchemaConverter.convert(typeReference);
    }

    public getSchemaOfNamedType(typeName: DeclaredTypeName): Zurg.Schema {
        const referenceToSchema = this.typeSchemaDeclarationReferencer
            .getReferenceToType({
                name: typeName,
                importStrategy: this.getSchemaImportStrategy({
                    // use dynamic imports when referencing schemas insides schemas,
                    // to avoid issues with circular imports
                    useDynamicImport: true,
                }),
                importsManager: this.importsManager,
                referencedIn: this.sourceFile,
            })
            .getExpression();

        const schema = this.coreUtilities.zurg.Schema._fromExpression(referenceToSchema);

        // when generating schemas, wrapped named types with lazy() to prevent issues with circular imports
        return this.wrapSchemaWithLazy(schema, typeName);
    }

    private wrapSchemaWithLazy(schema: Zurg.Schema, typeName: DeclaredTypeName): Zurg.Schema {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        return resolvedType._type === "named" && resolvedType.shape === ShapeType.Object
            ? this.coreUtilities.zurg.lazyObject(schema)
            : this.coreUtilities.zurg.lazy(schema);
    }
}
