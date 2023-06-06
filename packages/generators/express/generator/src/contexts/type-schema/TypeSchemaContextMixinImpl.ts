import { DeclaredTypeName, ShapeType, TypeReference } from "@fern-fern/ir-model/types";
import { ImportsManager, Reference, TypeReferenceNode, Zurg } from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { GeneratedTypeSchema, TypeSchemaContextMixin } from "@fern-typescript/contexts";
import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import {
    TypeReferenceToRawTypeNodeConverter,
    TypeReferenceToSchemaConverter,
} from "@fern-typescript/type-reference-converters";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { SourceFile } from "ts-morph";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace TypeSchemaContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        coreUtilities: CoreUtilities;
        importsManager: ImportsManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeGenerator: TypeGenerator;
        typeSchemaGenerator: TypeSchemaGenerator;
        treatUnknownAsAny: boolean;
    }
}

export class TypeSchemaContextMixinImpl implements TypeSchemaContextMixin {
    private sourceFile: SourceFile;
    private coreUtilities: CoreUtilities;
    private importsManager: ImportsManager;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
    private typeReferenceToRawTypeNodeConverter: TypeReferenceToRawTypeNodeConverter;
    private typeReferenceToSchemaConverter: TypeReferenceToSchemaConverter;
    private typeResolver: TypeResolver;
    private typeGenerator: TypeGenerator;
    private typeSchemaGenerator: TypeSchemaGenerator;

    constructor({
        sourceFile,
        coreUtilities,
        importsManager,
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        treatUnknownAsAny,
    }: TypeSchemaContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.coreUtilities = coreUtilities;
        this.importsManager = importsManager;
        this.typeReferenceToRawTypeNodeConverter = new TypeReferenceToRawTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToRawNamedType(typeName).getEntityName(),
            typeResolver,
            treatUnknownAsAny,
        });
        this.typeReferenceToSchemaConverter = new TypeReferenceToSchemaConverter({
            getSchemaOfNamedType: (typeName) => this.getSchemaOfNamedType(typeName, { isGeneratingSchema: true }),
            zurg: this.coreUtilities.zurg,
            typeResolver,
            treatUnknownAsAny,
        });
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeSchemaDeclarationReferencer = typeSchemaDeclarationReferencer;
        this.typeResolver = typeResolver;
        this.typeGenerator = typeGenerator;
        this.typeSchemaGenerator = typeSchemaGenerator;
    }

    public getGeneratedTypeSchema(typeName: DeclaredTypeName): GeneratedTypeSchema {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromName(typeName);
        return this.typeSchemaGenerator.generateTypeSchema({
            shape: typeDeclaration.shape,
            typeName: this.typeSchemaDeclarationReferencer.getExportedName(typeDeclaration.name),
            getGeneratedType: () =>
                this.typeGenerator.generateType({
                    shape: typeDeclaration.shape,
                    docs: typeDeclaration.docs ?? undefined,
                    examples: typeDeclaration.examples,
                    fernFilepath: typeDeclaration.name.fernFilepath,
                    typeName: this.typeDeclarationReferencer.getExportedName(typeDeclaration.name),
                    getReferenceToSelf: (context) => context.type.getReferenceToNamedType(typeName),
                }),
            getReferenceToGeneratedType: () =>
                this.typeDeclarationReferencer
                    .getReferenceToType({
                        name: typeDeclaration.name,
                        importsManager: this.importsManager,
                        referencedIn: this.sourceFile,
                        importStrategy: {
                            type: "fromRoot",
                            namespaceImport: this.typeDeclarationReferencer.namespaceExport,
                        },
                    })
                    .getTypeNode(),
            getReferenceToGeneratedTypeSchema: () =>
                this.typeSchemaDeclarationReferencer.getReferenceToType({
                    name: typeDeclaration.name,
                    importsManager: this.importsManager,
                    referencedIn: this.sourceFile,
                    importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
                }),
        });
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToRawTypeNodeConverter.convert(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: getSchemaImportStrategy({
                // dynamic import not needed for types
                useDynamicImport: false,
            }),
            // TODO this should not be hardcoded here
            subImport: ["Raw"],
            importsManager: this.importsManager,
            referencedIn: this.sourceFile,
        });
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.typeReferenceToSchemaConverter.convert(typeReference);
    }

    public getSchemaOfNamedType(
        typeName: DeclaredTypeName,
        { isGeneratingSchema }: { isGeneratingSchema: boolean }
    ): Zurg.Schema {
        const referenceToSchema = this.typeSchemaDeclarationReferencer
            .getReferenceToType({
                name: typeName,
                importStrategy: getSchemaImportStrategy({
                    // use dynamic imports with schemas insides schemas,
                    // to avoid issues with circular imports
                    useDynamicImport: isGeneratingSchema,
                }),
                importsManager: this.importsManager,
                referencedIn: this.sourceFile,
            })
            .getExpression();

        let schema = this.coreUtilities.zurg.Schema._fromExpression(referenceToSchema);

        // when generating schemas, wrap named types with lazy() to prevent issues with circular imports
        if (isGeneratingSchema) {
            schema = this.wrapSchemaWithLazy(schema, typeName);
        }

        return schema;
    }

    private wrapSchemaWithLazy(schema: Zurg.Schema, typeName: DeclaredTypeName): Zurg.Schema {
        const resolvedType = this.typeResolver.resolveTypeName(typeName);
        return resolvedType._type === "named" && resolvedType.shape === ShapeType.Object
            ? this.coreUtilities.zurg.lazyObject(schema)
            : this.coreUtilities.zurg.lazy(schema);
    }
}
