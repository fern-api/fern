import { assertNever } from "@fern-api/core-utils";
import {
    DeclaredTypeName,
    ExampleTypeReference,
    ResolvedTypeReference,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { ExportsManager, ImportsManager, NpmPackage, Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { BaseContext, GeneratedType, GeneratedTypeReferenceExample, TypeContext } from "@fern-typescript/contexts";
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
        exportsManager: ExportsManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeGenerator: TypeGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        useBigInt: boolean;
        enableInlineTypes: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        useDefaultRequestParameterValues: boolean;
        context: BaseContext;
    }
}

export class TypeContextImpl implements TypeContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
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
    private context: BaseContext;
    private useDefaultRequestParameterValues: boolean;

    constructor({
        npmPackage,
        isForSnippet,
        sourceFile,
        importsManager,
        exportsManager,
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        typeReferenceExampleGenerator,
        treatUnknownAsAny,
        includeSerdeLayer,
        retainOriginalCasing,
        useBigInt,
        enableInlineTypes,
        allowExtraFields,
        omitUndefined,
        useDefaultRequestParameterValues,
        context
    }: TypeContextImpl.Init) {
        this.npmPackage = npmPackage;
        this.isForSnippet = isForSnippet;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeGenerator = typeGenerator;
        this.typeReferenceExampleGenerator = typeReferenceExampleGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.useDefaultRequestParameterValues = useDefaultRequestParameterValues;
        this.context = context;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToNamedType(typeName).getEntityName(),
            generateForInlineUnion: (typeName) => this.generateForInlineUnion(typeName),
            context,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined
        });
        this.typeReferenceToStringExpressionConverter = new TypeReferenceToStringExpressionConverter({
            context,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined
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
        if (this.isForSnippet) {
            return this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: {
                    type: "fromPackage",
                    namespaceImport: this.typeDeclarationReferencer.namespaceExport,
                    packageName: this.npmPackage?.packageName ?? "api"
                },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager
            });
        } else {
            return this.typeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: { type: "fromRoot", namespaceImport: this.typeDeclarationReferencer.namespaceExport },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager
            });
        }
    }

    public generateForInlineUnion(typeName: DeclaredTypeName): ts.TypeNode {
        const generatedType = this.getGeneratedType(typeName);
        return generatedType.generateForInlineUnion(this.context);
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

    public isOptional(typeReference: TypeReference): boolean {
        if (this.hasDefaultValue(typeReference) && this.useDefaultRequestParameterValues) {
            return true;
        }

        switch (typeReference.type) {
            case "named": {
                const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeReference.typeId);
                switch (typeDeclaration.shape.type) {
                    case "alias":
                        return this.isOptional(typeDeclaration.shape.aliasOf);
                    default:
                        return false;
                }
            }
            case "container": {
                switch (typeReference.container.type) {
                    case "nullable":
                        return this.isOptional(typeReference.container.nullable);
                    case "optional":
                        return true;
                    default:
                        return false;
                }
            }
            default:
                return false;
        }
    }

    public isNullable(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "named": {
                const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeReference.typeId);
                switch (typeDeclaration.shape.type) {
                    case "alias":
                        return this.isNullable(typeDeclaration.shape.aliasOf);
                    default:
                        return false;
                }
            }
            case "container": {
                switch (typeReference.container.type) {
                    case "nullable":
                        return true;
                    case "optional":
                        return this.isNullable(typeReference.container.optional);
                    default:
                        return false;
                }
            }
            default:
                return false;
        }
    }

    public isLiteral(typeReference: TypeReference): boolean {
        const resolvedType = this.resolveTypeReference(typeReference);
        return resolvedType.type === "container" && resolvedType.container.type === "literal";
    }

    public hasDefaultValue(typeReference: TypeReference): boolean {
        switch (typeReference.type) {
            case "primitive":
                return (
                    typeReference.primitive.v2 != null &&
                    typeof typeReference.primitive.v2 === "object" &&
                    "default" in typeReference.primitive.v2 &&
                    typeReference.primitive.v2.default != null
                );
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.hasDefaultValue(typeReference.container.optional);
                }
                if (typeReference.container.type === "nullable") {
                    return this.hasDefaultValue(typeReference.container.nullable);
                }
                return false;
            case "named": {
                const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.hasDefaultValue(typeDeclaration.shape.aliasOf);
                }
                return false;
            }
            default:
                return false;
        }
    }

    public needsRequestResponseTypeVariant(typeReference: TypeReference): { request: boolean; response: boolean } {
        switch (typeReference.type) {
            case "named": {
                return this.needsRequestResponseTypeVariantById(typeReference.typeId);
            }
            case "container": {
                if (typeReference.container.type === "optional") {
                    return this.needsRequestResponseTypeVariant(typeReference.container.optional);
                }
                if (typeReference.container.type === "nullable") {
                    return this.needsRequestResponseTypeVariant(typeReference.container.nullable);
                }
                if (typeReference.container.type === "list") {
                    return this.needsRequestResponseTypeVariant(typeReference.container.list);
                }
                if (typeReference.container.type === "map") {
                    const keyResult = this.needsRequestResponseTypeVariant(typeReference.container.keyType);
                    const valueResult = this.needsRequestResponseTypeVariant(typeReference.container.valueType);
                    return {
                        request: keyResult.request || valueResult.request,
                        response: keyResult.response || valueResult.response
                    };
                }
                return { request: false, response: false };
            }
            case "primitive":
                return { request: false, response: false };
            case "unknown":
                return { request: false, response: false };
            default:
                assertNever(typeReference);
        }
    }

    public needsRequestResponseTypeVariantById(typeId: TypeId): { request: boolean; response: boolean } {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeId);
        switch (typeDeclaration.shape.type) {
            case "object": {
                let request = false;
                let response = false;
                // Check properties
                for (const prop of typeDeclaration.shape.properties) {
                    if (prop.propertyAccess === "READ_ONLY") {
                        request = true;
                    }
                    if (prop.propertyAccess === "WRITE_ONLY") {
                        response = true;
                    }
                    const result = this.needsRequestResponseTypeVariant(prop.valueType);
                    request = request || result.request;
                    response = response || result.response;
                }
                // Check extends
                if (typeDeclaration.shape.extends != null) {
                    for (const extTypeName of typeDeclaration.shape.extends) {
                        const extTypeRef = { type: "named", typeId: extTypeName.typeId } as TypeReference;
                        const result = this.needsRequestResponseTypeVariant(extTypeRef);
                        request = request || result.request;
                        response = response || result.response;
                    }
                }
                return { request, response };
            }
            case "union": {
                let request = false;
                let response = false;
                for (const member of typeDeclaration.shape.types) {
                    switch (member.shape.propertiesType) {
                        case "noProperties":
                            break;
                        case "singleProperty": {
                            const result = this.needsRequestResponseTypeVariant(member.shape.type);
                            request = request || result.request;
                            response = response || result.response;
                            break;
                        }
                        case "samePropertiesAsObject": {
                            const result = this.needsRequestResponseTypeVariantById(member.shape.typeId);
                            request = request || result.request;
                            response = response || result.response;
                            break;
                        }
                    }
                }
                return { request, response };
            }
            case "undiscriminatedUnion": {
                let request = false;
                let response = false;
                for (const member of typeDeclaration.shape.members) {
                    const result = this.needsRequestResponseTypeVariant(member.type);
                    request = request || result.request;
                    response = response || result.response;
                }
                return { request, response };
            }
            case "enum":
                return { request: false, response: false };
            case "alias": {
                return this.needsRequestResponseTypeVariant(typeDeclaration.shape.aliasOf);
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
