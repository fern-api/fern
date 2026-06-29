import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    ExportsManager,
    getTextOfTsNode,
    ImportsManager,
    NpmPackage,
    Reference,
    TypeReferenceNode
} from "@fern-typescript/commons";
import { BaseContext, GeneratedType, GeneratedTypeReferenceExample, TypeContext } from "@fern-typescript/contexts";
import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import {
    TypeReferenceToParsedTypeNodeConverter,
    TypeReferenceToStringExpressionConverter
} from "@fern-typescript/type-reference-converters";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { SourceFile, ts } from "ts-morph";
import { ArgTypeDeclarationReferencer } from "../../declaration-referencers/ArgTypeDeclarationReferencer.js";
import { SelectTypeDeclarationReferencer } from "../../declaration-referencers/SelectTypeDeclarationReferencer.js";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer.js";

export declare namespace TypeContextImpl {
    export interface Init {
        npmPackage: NpmPackage | undefined;
        isForSnippet: boolean;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        selectTypeDeclarationReferencer: SelectTypeDeclarationReferencer;
        argTypeDeclarationReferencer: ArgTypeDeclarationReferencer;
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
        generateReadWriteOnlyTypes: boolean;
        caseConverter: CaseConverter;
    }
}

export class TypeContextImpl implements TypeContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private selectTypeDeclarationReferencer: SelectTypeDeclarationReferencer;
    private argTypeDeclarationReferencer: ArgTypeDeclarationReferencer;
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
    private readonly case: CaseConverter;
    private requestResponseVariantCache: Map<FernIr.TypeId, { request: boolean; response: boolean }> = new Map();
    private requestResponseVariantInProgress: Set<FernIr.TypeId> = new Set();

    constructor({
        npmPackage,
        isForSnippet,
        sourceFile,
        importsManager,
        exportsManager,
        typeResolver,
        typeDeclarationReferencer,
        selectTypeDeclarationReferencer,
        argTypeDeclarationReferencer,
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
        context,
        generateReadWriteOnlyTypes,
        caseConverter
    }: TypeContextImpl.Init) {
        this.npmPackage = npmPackage;
        this.isForSnippet = isForSnippet;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.selectTypeDeclarationReferencer = selectTypeDeclarationReferencer;
        this.argTypeDeclarationReferencer = argTypeDeclarationReferencer;
        this.typeGenerator = typeGenerator;
        this.typeReferenceExampleGenerator = typeReferenceExampleGenerator;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.useDefaultRequestParameterValues = useDefaultRequestParameterValues;
        this.context = context;
        this.case = caseConverter;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToNamedType(typeName).getEntityName(),
            generateForInlineUnion: (typeName) => this.generateForInlineUnion(typeName),
            context,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined,
            generateReadWriteOnlyTypes
        });
        this.typeReferenceToStringExpressionConverter = new TypeReferenceToStringExpressionConverter({
            context,
            treatUnknownAsAny,
            includeSerdeLayer,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined,
            generateReadWriteOnlyTypes
        });
    }

    public getReferenceToType(typeReference: FernIr.TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({ typeReference });
    }

    public getReferenceToInlinePropertyType(
        typeReference: FernIr.TypeReference,
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

    public getReferenceToInlineAliasType(
        typeReference: FernIr.TypeReference,
        aliasTypeName: string
    ): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({
            typeReference,
            type: "inlineAliasParams",
            aliasTypeName
        });
    }

    public getReferenceToTypeForInlineUnion(typeReference: FernIr.TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert({
            typeReference,
            type: "forInlineUnionParams"
        });
    }

    public getTypeDeclaration(typeName: FernIr.DeclaredTypeName): FernIr.TypeDeclaration {
        return this.typeResolver.getTypeDeclarationFromName(typeName);
    }

    public getReferenceToNamedType(typeName: FernIr.DeclaredTypeName): Reference {
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

    /**
     * Returns a reference to the generated `<Name>Select` field-selection type for a named type.
     * Mirrors {@link getReferenceToNamedType} (same import strategy / single Select file).
     */
    public getReferenceToGraphqlSelectType(typeName: FernIr.DeclaredTypeName): Reference {
        if (this.isForSnippet) {
            return this.selectTypeDeclarationReferencer.getReferenceToType({
                name: typeName,
                importStrategy: {
                    type: "fromPackage",
                    namespaceImport: this.selectTypeDeclarationReferencer.namespaceExport,
                    packageName: this.npmPackage?.packageName ?? "api"
                },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager
            });
        }
        return this.selectTypeDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.selectTypeDeclarationReferencer.namespaceExport
            },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }

    /**
     * Resolves a (possibly container-wrapped) type reference to the `<Name>Select` type of its
     * underlying named object/union, or `undefined` if it does not resolve to one. Used to type the
     * GraphQL `select` argument against the operation's return type.
     */
    public getReferenceToGraphqlSelectTypeForReference(typeReference: FernIr.TypeReference): Reference | undefined {
        const named = this.resolveToNamedTypeForSelect(typeReference);
        if (named == null) {
            return undefined;
        }
        return this.getReferenceToGraphqlSelectType(named);
    }

    /**
     * Returns a reference to the generated `<Name>DefaultSelection` const for a named type. Mirrors
     * {@link getReferenceToGraphqlSelectType}'s import strategy (same single Select file).
     */
    public getReferenceToGraphqlDefaultSelection(typeName: FernIr.DeclaredTypeName): Reference {
        if (this.isForSnippet) {
            return this.selectTypeDeclarationReferencer.getReferenceToDefaultSelection({
                name: typeName,
                importStrategy: {
                    type: "fromPackage",
                    namespaceImport: this.selectTypeDeclarationReferencer.namespaceExport,
                    packageName: this.npmPackage?.packageName ?? "api"
                },
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager
            });
        }
        return this.selectTypeDeclarationReferencer.getReferenceToDefaultSelection({
            name: typeName,
            importStrategy: {
                type: "fromRoot",
                namespaceImport: this.selectTypeDeclarationReferencer.namespaceExport
            },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }

    /**
     * Resolves a (possibly container-wrapped) type reference to the `<Name>DefaultSelection` const of
     * its underlying named object/union, or `undefined` if it does not resolve to one. Used to default
     * the GraphQL `selection` argument (and its type parameter) when the caller omits it.
     */
    public getReferenceToGraphqlDefaultSelectionForReference(
        typeReference: FernIr.TypeReference
    ): Reference | undefined {
        const named = this.resolveToNamedTypeForSelect(typeReference);
        if (named == null) {
            return undefined;
        }
        return this.getReferenceToGraphqlDefaultSelection(named);
    }

    /**
     * Returns an expression referencing the generated GraphQL arg-type registry const
     * (`GRAPHQL_ARG_TYPES`), managing the import on the current file. Used as the `registry` of the
     * `argContext` passed to `buildGraphqlQuery` so nested `$args` resolve to GraphQL variables.
     */
    public getReferenceToGraphqlArgTypes(): ts.Expression {
        const importStrategy = this.isForSnippet
            ? ({
                  type: "fromPackage",
                  namespaceImport: this.argTypeDeclarationReferencer.namespaceExport,
                  packageName: this.npmPackage?.packageName ?? "api"
              } as const)
            : ({ type: "fromRoot", namespaceImport: this.argTypeDeclarationReferencer.namespaceExport } as const);
        return this.argTypeDeclarationReferencer
            .getReferenceToArgTypes({
                name: undefined,
                importStrategy,
                referencedIn: this.sourceFile,
                importsManager: this.importsManager,
                exportsManager: this.exportsManager
            })
            .getExpression();
    }

    /**
     * Resolves a (possibly container-wrapped) type reference to the GraphQL type name (registry key)
     * of its underlying named object/union, or `undefined`. Used to derive the `rootType` for a
     * GraphQL operation's response when building the arg context.
     */
    public getGraphqlTypeNameForReference(typeReference: FernIr.TypeReference): string | undefined {
        const named = this.resolveToNamedTypeForSelect(typeReference);
        if (named == null) {
            return undefined;
        }
        return this.case.pascalSafe(named.name);
    }

    private resolveToNamedTypeForSelect(typeReference: FernIr.TypeReference): FernIr.DeclaredTypeName | undefined {
        return typeReference._visit<FernIr.DeclaredTypeName | undefined>({
            container: (container) =>
                container._visit<FernIr.DeclaredTypeName | undefined>({
                    list: (inner) => this.resolveToNamedTypeForSelect(inner),
                    set: (inner) => this.resolveToNamedTypeForSelect(inner),
                    optional: (inner) => this.resolveToNamedTypeForSelect(inner),
                    nullable: (inner) => this.resolveToNamedTypeForSelect(inner),
                    map: () => undefined,
                    literal: () => undefined,
                    _other: () => undefined
                }),
            named: (named) => {
                const declaration = this.typeResolver.getTypeDeclarationFromId(named.typeId);
                return declaration.shape._visit<FernIr.DeclaredTypeName | undefined>({
                    object: () => declaration.name,
                    union: () => declaration.name,
                    undiscriminatedUnion: () => declaration.name,
                    alias: (alias) => this.resolveToNamedTypeForSelect(alias.aliasOf),
                    enum: () => undefined,
                    _other: () => undefined
                });
            },
            primitive: () => undefined,
            unknown: () => undefined,
            _other: () => undefined
        });
    }

    public generateForInlineUnion(typeName: FernIr.DeclaredTypeName): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    } {
        const generatedType = this.getGeneratedType(typeName);
        return generatedType.generateForInlineUnion(this.context);
    }

    public resolveTypeReference(typeReference: FernIr.TypeReference): FernIr.ResolvedTypeReference {
        return this.typeResolver.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: FernIr.DeclaredTypeName): FernIr.ResolvedTypeReference {
        return this.typeResolver.resolveTypeName(typeName);
    }

    public getGeneratedTypeById(typeId: string): GeneratedType {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeId);
        return this.getGeneratedType(typeDeclaration.name);
    }

    public getGeneratedType(typeName: FernIr.DeclaredTypeName, typeNameOverride?: string): GeneratedType {
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
        valueType: FernIr.TypeReference,
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

    public getGeneratedExample(example: FernIr.ExampleTypeReference): GeneratedTypeReferenceExample {
        return this.typeReferenceExampleGenerator.generateExample(example);
    }

    public isOptional(typeReference: FernIr.TypeReference): boolean {
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

    public isNullable(typeReference: FernIr.TypeReference): boolean {
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

    public isLiteral(typeReference: FernIr.TypeReference): boolean {
        const resolvedType = this.resolveTypeReference(typeReference);
        return resolvedType.type === "container" && resolvedType.container.type === "literal";
    }

    public hasDefaultValue(typeReference: FernIr.TypeReference): boolean {
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

    public needsRequestResponseTypeVariant(typeReference: FernIr.TypeReference): {
        request: boolean;
        response: boolean;
    } {
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

    public needsRequestResponseTypeVariantById(typeId: FernIr.TypeId): { request: boolean; response: boolean } {
        // Check cache first
        if (this.requestResponseVariantCache.has(typeId)) {
            return this.requestResponseVariantCache.get(typeId) as { request: boolean; response: boolean };
        }
        // Prevent infinite recursion: if already visiting, return default
        if (this.requestResponseVariantInProgress.has(typeId)) {
            return { request: false, response: false };
        }
        this.requestResponseVariantInProgress.add(typeId);
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(typeId);
        const result = this.needsRequestResponseTypeVariantByType(typeDeclaration.shape);
        this.requestResponseVariantCache.set(typeId, result);
        this.requestResponseVariantInProgress.delete(typeId);
        return result;
    }

    public needsRequestResponseTypeVariantByType(type: FernIr.Type): { request: boolean; response: boolean } {
        switch (type.type) {
            case "object": {
                let request = false;
                let response = false;
                // Check properties
                for (const prop of type.properties) {
                    if (prop.propertyAccess === "READ_ONLY") {
                        request = true;
                    }
                    if (prop.propertyAccess === "WRITE_ONLY") {
                        response = true;
                    }
                    const result = this.needsRequestResponseTypeVariant(prop.valueType);
                    request = request || result.request;
                    response = response || result.response;
                    if (request && response) {
                        // no need to continue checking
                        break;
                    }
                }
                // Check extends
                if (type.extends != null) {
                    for (const extTypeName of type.extends) {
                        const extTypeRef = { type: "named", typeId: extTypeName.typeId } as FernIr.TypeReference;
                        const result = this.needsRequestResponseTypeVariant(extTypeRef);
                        request = request || result.request;
                        response = response || result.response;
                        if (request && response) {
                            // no need to continue checking
                            break;
                        }
                    }
                }
                return { request, response };
            }
            case "union": {
                let request = false;
                let response = false;
                for (const member of type.types) {
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
                    if (request && response) {
                        // no need to continue checking
                        break;
                    }
                }
                return { request, response };
            }
            case "undiscriminatedUnion": {
                let request = false;
                let response = false;
                for (const member of type.members) {
                    const result = this.needsRequestResponseTypeVariant(member.type);
                    request = request || result.request;
                    response = response || result.response;
                    if (request && response) {
                        // no need to continue checking
                        break;
                    }
                }
                return { request, response };
            }
            case "enum":
                return { request: false, response: false };
            case "alias": {
                return this.needsRequestResponseTypeVariant(type.aliasOf);
            }
            default:
                assertNever(type);
        }
    }

    public typeNameToTypeReference(typeName: FernIr.DeclaredTypeName): FernIr.TypeReference {
        return FernIr.TypeReference.named({
            default: undefined,
            displayName: typeName.displayName,
            fernFilepath: typeName.fernFilepath,
            inline: undefined,
            name: typeName.name,
            typeId: typeName.typeId
        });
    }

    public generateGetterForResponsePropertyAsString({
        variable,
        isVariableOptional,
        property,
        noOptionalChaining = false
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.ResponseProperty;
        noOptionalChaining?: boolean;
    }): string {
        return (
            (typeof variable === "undefined"
                ? ""
                : variable + (noOptionalChaining ? "." : isVariableOptional ? "?." : ".")) +
            (property.propertyPath ?? [])
                .map((item) => ({
                    ...item,
                    isOptionalOrNullable: this.isOptional(item.type) || this.isNullable(item.type)
                }))
                .map(
                    (item) =>
                        `${this.getPropertyName({ name: item.name })}${noOptionalChaining ? "." : item.isOptionalOrNullable ? "?." : "."}`
                )
                .join("") +
            this.getNameFromWireValue({ name: property.property.name })
        );
    }

    public generateGetterForResponseProperty({
        variable,
        isVariableOptional,
        property,
        noOptionalChaining = false
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.ResponseProperty;
        noOptionalChaining?: boolean;
    }): ts.Expression {
        return ts.factory.createIdentifier(
            this.generateGetterForResponsePropertyAsString({
                variable,
                isVariableOptional,
                property,
                noOptionalChaining
            })
        );
    }

    public generateGetterForRequestProperty({
        variable,
        isVariableOptional,
        property
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.RequestProperty;
    }): ts.Expression {
        return ts.factory.createIdentifier(
            (typeof variable === "undefined" ? "" : variable + (isVariableOptional ? "?." : ".")) +
                (property.propertyPath ?? [])
                    .map((item) => ({
                        ...item,
                        isOptionalOrNullable: this.isOptional(item.type) || this.isNullable(item.type)
                    }))
                    .map(
                        (item) =>
                            `${this.getPropertyName({ name: item.name })}${item.isOptionalOrNullable ? "?." : "."}`
                    )
                    .join("") +
                this.getNameFromWireValue({ name: property.property.name })
        );
    }

    public generateSetterForRequestPropertyAsString({
        variable,
        property
    }: {
        variable?: string;
        property: FernIr.RequestProperty;
    }): string {
        return (
            (typeof variable === "undefined" ? "" : variable + ".") +
            (property.propertyPath ?? []).map((item) => `${this.getPropertyName({ name: item.name })}.`).join("") +
            this.getNameFromWireValue({ name: property.property.name })
        );
    }

    public generateSetterForRequestProperty({
        variable,
        property
    }: {
        variable?: string;
        property: FernIr.RequestProperty;
    }): ts.Expression {
        return ts.factory.createIdentifier(this.generateSetterForRequestPropertyAsString({ variable, property }));
    }

    private getPropertyName({ name }: { name: FernIr.NameOrString }): string {
        return this.retainOriginalCasing || !this.includeSerdeLayer ? getOriginalName(name) : this.case.camelSafe(name);
    }

    private getNameFromWireValue({ name }: { name: FernIr.NameAndWireValueOrString }): string {
        return this.retainOriginalCasing || !this.includeSerdeLayer ? getWireValue(name) : this.case.camelSafe(name);
    }

    public getReferenceToResponsePropertyType({
        responseType,
        property
    }: {
        responseType: ts.TypeNode;
        property: FernIr.ResponseProperty;
    }): ts.TypeNode {
        const propertyPath = [
            ...(property.propertyPath ?? []),
            {
                name: (typeof property.property.name === "string"
                    ? property.property.name
                    : property.property.name.name) as FernIr.Name,
                type: property.property.valueType
            } as FernIr.PropertyPathItem
        ];
        let rootNotInlinePropertyPathItem;
        const inlinePropertyPathItems = [];
        for (let i = propertyPath.length - 1; i >= 0; i--) {
            const item = propertyPath[i] as FernIr.PropertyPathItem;
            if (!this.isInline(item.type)) {
                // the root type is not inline, stop here
                rootNotInlinePropertyPathItem = item;
                break;
            }
            inlinePropertyPathItems.unshift(item);
        }

        let currentParentTypeNode =
            typeof rootNotInlinePropertyPathItem === "undefined"
                ? responseType
                : this.getReferenceToType(rootNotInlinePropertyPathItem.type).typeNode;
        for (const inlinePropertyPathItem of inlinePropertyPathItems) {
            const ref = this.getReferenceToInlinePropertyType(
                inlinePropertyPathItem.type,
                getTextOfTsNode(currentParentTypeNode),
                this.case.pascalSafe(inlinePropertyPathItem.name)
            );
            currentParentTypeNode = ref.responseTypeNode ?? ref.typeNode;
        }

        return currentParentTypeNode;
    }

    private isInline(type: FernIr.TypeReference): boolean {
        return type._visit({
            container: (container) =>
                container._visit({
                    list: (value: FernIr.TypeReference) => this.isInline(value),
                    map: (value: FernIr.MapType) => this.isInline(value.keyType) || this.isInline(value.valueType),
                    nullable: (value: FernIr.TypeReference) => this.isInline(value),
                    optional: (value: FernIr.TypeReference) => this.isInline(value),
                    set: (value: FernIr.TypeReference) => this.isInline(value),
                    literal: () => false,
                    _other: () => false
                }),
            named: (named) => {
                const typeDeclaration = this.typeResolver.getTypeDeclarationFromId(named.typeId);
                return typeDeclaration.inline === true;
            },
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }
}
