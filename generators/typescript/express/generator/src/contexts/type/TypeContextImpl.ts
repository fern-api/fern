import { ImportsManager, Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { BaseContext, GeneratedType, GeneratedTypeReferenceExample, TypeContext } from "@fern-typescript/contexts";
import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import {
    TypeReferenceToParsedTypeNodeConverter,
    TypeReferenceToStringExpressionConverter
} from "@fern-typescript/type-reference-converters";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { SourceFile, ts } from "ts-morph";

import {
    DeclaredTypeName,
    ExampleTypeReference,
    ObjectProperty,
    ResolvedTypeReference,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";

export declare namespace TypeContextImpl {
    export interface Init {
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
        context: BaseContext;
        enableInlineTypes: boolean;
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
    private context: BaseContext;

    constructor({
        sourceFile,
        importsManager,
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        typeReferenceExampleGenerator,
        treatUnknownAsAny,
        includeSerdeLayer,
        retainOriginalCasing,
        useBigInt,
        enableInlineTypes,
        context
    }: TypeContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeGenerator = typeGenerator;
        this.typeReferenceExampleGenerator = typeReferenceExampleGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.context = context;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToNamedType(typeName).getEntityName(),
            generateForInlineUnion: (typeName) => this.generateForInlineUnion(typeName),
            typeResolver,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes
        });
        this.typeReferenceToStringExpressionConverter = new TypeReferenceToStringExpressionConverter({
            typeResolver,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes
        });
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({ typeReference });
    }

    public getReferenceToInlinePropertyType(
        typeReference: TypeReference,
        parentTypeName: string,
        propertyName: string
    ): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({
            typeReference,
            type: "inlinePropertyParams",
            parentTypeName,
            propertyName
        });
    }

    public getReferenceToInlineAliasType(typeReference: TypeReference, aliasTypeName: string): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({
            typeReference,
            type: "inlineAliasParams",
            aliasTypeName
        });
    }

    public generateForInlineUnion(typeName: DeclaredTypeName): ts.TypeNode {
        const generatedType = this.getGeneratedType(typeName);
        return generatedType.generateForInlineUnion(this.context);
    }

    public getReferenceToTypeForInlineUnion(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({
            typeReference,
            type: "forInlineUnionParams"
        });
    }

    public getTypeDeclaration(typeName: DeclaredTypeName): TypeDeclaration {
        return this.typeResolver.getTypeDeclarationFromName(typeName);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: { type: "fromRoot", namespaceImport: this.typeDeclarationReferencer.namespaceExport },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager
        });
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
            return this.typeReferenceToStringExpressionConverter.convertWithNullCheckIfOptional({
                typeReference: valueType
            })(valueToStringify);
        } else {
            return this.typeReferenceToStringExpressionConverter.convert({
                typeReference: valueType
            })(valueToStringify);
        }
    }

    public getGeneratedExample(example: ExampleTypeReference): GeneratedTypeReferenceExample {
        return this.typeReferenceExampleGenerator.generateExample(example);
    }
}
