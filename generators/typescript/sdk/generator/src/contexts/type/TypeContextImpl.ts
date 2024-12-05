import {
    DeclaredTypeName,
    ExampleTypeReference,
    ObjectProperty,
    ResolvedTypeReference,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { ImportsManager, NpmPackage, Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { GeneratedType, GeneratedTypeReferenceExample, ModelContext, TypeContext } from "@fern-typescript/contexts";
import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import {
    TypeReferenceToParsedTypeNodeConverter,
    TypeReferenceToStringExpressionConverter
} from "@fern-typescript/type-reference-converters";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { SourceFile, ts } from "ts-morph";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";

export declare namespace TypeContextImpl {
    export interface Init {
        npmPackage: NpmPackage | undefined;
        isForSnippet: boolean;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeGenerator: TypeGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        useBigInt: boolean;
    }
}

export class TypeContextImpl implements TypeContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeReferenceToParsedTypeNodeConverter: TypeReferenceToParsedTypeNodeConverter;
    private typeReferenceToStringExpressionConverter: TypeReferenceToStringExpressionConverter;
    private typeResolver: TypeResolver;
    private typeGenerator: TypeGenerator;
    private typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private isForSnippet: boolean;
    private npmPackage: NpmPackage | undefined;

    constructor({
        npmPackage,
        isForSnippet,
        sourceFile,
        importsManager,
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        typeReferenceExampleGenerator,
        treatUnknownAsAny,
        includeSerdeLayer,
        retainOriginalCasing,
        useBigInt
    }: TypeContextImpl.Init) {
        this.npmPackage = npmPackage;
        this.isForSnippet = isForSnippet;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeGenerator = typeGenerator;
        this.typeReferenceExampleGenerator = typeReferenceExampleGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName, options) =>
                this.getReferenceToNamedTypeWithInline(typeName, options).getEntityName(),
            typeResolver,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt
        });
        this.typeReferenceToStringExpressionConverter = new TypeReferenceToStringExpressionConverter({
            typeResolver,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt
        });
    }
    public getReferenceToTypeFromProperty(objectProperty: ObjectProperty): TypeReferenceNode {
        const ref = this.typeReferenceToParsedTypeNodeConverter.convert(objectProperty.valueType);
        switch (objectProperty.valueType.type) {
            case "named":
                const declaration = this.getTypeDeclaration(objectProperty.valueType);
                if (declaration.inline) {
                    return {
                        isOptional: ref.isOptional,
                        typeNode: ts.factory.createTypeReferenceNode(
                            `${objectProperty.name.name.pascalCase.safeName}.${ref.typeNode.getText()}`
                        ),
                        typeNodeWithoutUndefined: ts.factory.createTypeReferenceNode(
                            `${objectProperty.name.name.pascalCase.safeName}.${ref.typeNodeWithoutUndefined.getText()}`
                        )
                    };
                }
        }
        return ref;
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert(typeReference);
    }

    public getReferenceToInlineType(typeReference: TypeReference, parentInlineTypeName: string): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert(typeReference, { parentInlineTypeName });
    }

    public getTypeDeclaration(typeName: DeclaredTypeName): TypeDeclaration {
        return this.typeResolver.getTypeDeclarationFromName(typeName);
    }

    public getReferenceToNamedTypeWithInline(
        typeName: DeclaredTypeName,
        options?: TypeReferenceToParsedTypeNodeConverter.ConvertOptions
    ): Reference {
        if (options?.parentInlineTypeName) {
            return this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: {
                    type: "direct",
                    alias: options.parentInlineTypeName
                },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager
            });
        }
        return this.getReferenceToNamedType(typeName);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        if (this.isForSnippet) {
            return this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: {
                    type: "fromPackage",
                    namespaceImport: this.typeDeclarationReferencer.namespaceExport,
                    packageName: this.npmPackage?.packageName ?? "api"
                },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager
            });
        } else {
            return this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: { type: "fromRoot", namespaceImport: this.typeDeclarationReferencer.namespaceExport },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager
            });
        }
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeResolver.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeResolver.resolveTypeName(typeName);
    }

    public getGeneratedTypeById(typeId: string): GeneratedType {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeId);
        return this.getGeneratedType(typeDeclaration.name);
    }

    public getGeneratedType(typeName: DeclaredTypeName, typeNameOverride?: string): GeneratedType {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromName(typeName);
        const examples = typeDeclaration.userProvidedExamples;
        if (examples.length === 0) {
            examples.push(...typeDeclaration.autogeneratedExamples);
        }
        return this.typeGenerator.generateType({
            shape: typeDeclaration.shape,
            docs: typeDeclaration.docs ?? undefined,
            typeName: typeNameOverride ?? this.typeDeclarationReferencer.getExportedName(typeDeclaration.name),
            examples,
            fernFilepath: typeDeclaration.name.fernFilepath,
            getReferenceToSelf: (context) => context.type.getReferenceToNamedType(typeName),
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            inline: typeDeclaration.inline ?? false
        });
    }

    public stringify(
        valueToStringify: ts.Expression,
        valueType: TypeReference,
        { includeNullCheckIfOptional }: { includeNullCheckIfOptional: boolean }
    ): ts.Expression {
        if (includeNullCheckIfOptional) {
            return this.typeReferenceToStringExpressionConverter.convertWithNullCheckIfOptional(valueType)(
                valueToStringify
            );
        } else {
            return this.typeReferenceToStringExpressionConverter.convert(valueType)(valueToStringify);
        }
    }

    public getGeneratedExample(example: ExampleTypeReference): GeneratedTypeReferenceExample {
        return this.typeReferenceExampleGenerator.generateExample(example);
    }
}
