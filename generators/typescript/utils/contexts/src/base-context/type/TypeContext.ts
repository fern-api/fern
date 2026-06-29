import { FernIr } from "@fern-fern/ir-sdk";
import { Reference, TypeReferenceNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedType } from "./GeneratedType.js";
import { GeneratedTypeReferenceExample } from "./GeneratedTypeReferenceExample.js";

export interface TypeContext {
    getReferenceToType: (typeReference: FernIr.TypeReference) => TypeReferenceNode;
    getReferenceToInlinePropertyType: (
        typeReference: FernIr.TypeReference,
        parentTypeName: string,
        propertyName: string
    ) => TypeReferenceNode;
    getReferenceToInlineAliasType: (typeReference: FernIr.TypeReference, aliasTypeName: string) => TypeReferenceNode;
    getReferenceToTypeForInlineUnion: (typeReference: FernIr.TypeReference) => TypeReferenceNode;
    stringify: (
        valueToStringify: ts.Expression,
        valueType: FernIr.TypeReference,
        opts: { includeNullCheckIfOptional: boolean }
    ) => ts.Expression;
    getReferenceToNamedType: (typeName: FernIr.DeclaredTypeName) => Reference;
    /** Reference to the generated `<Name>Select` GraphQL field-selection type for a named type. */
    getReferenceToGraphqlSelectType: (typeName: FernIr.DeclaredTypeName) => Reference;
    /**
     * Reference to the `<Name>Select` type for the underlying named object/union of a (possibly
     * container-wrapped) type reference, or `undefined` if it does not resolve to a named type with
     * a Select type. Used to type the GraphQL `select` argument against an operation's return type.
     */
    getReferenceToGraphqlSelectTypeForReference: (typeReference: FernIr.TypeReference) => Reference | undefined;
    /** Reference to the generated `<Name>DefaultSelection` const for a named type. */
    getReferenceToGraphqlDefaultSelection: (typeName: FernIr.DeclaredTypeName) => Reference;
    /**
     * Reference to the `<Name>DefaultSelection` const for the underlying named object/union of a
     * (possibly container-wrapped) type reference, or `undefined` if it does not resolve to a named
     * type with a Select type. Used to default the GraphQL `selection` argument when it is omitted.
     */
    getReferenceToGraphqlDefaultSelectionForReference: (typeReference: FernIr.TypeReference) => Reference | undefined;
    /**
     * Expression referencing the generated GraphQL arg-type registry const (`GRAPHQL_ARG_TYPES`),
     * managing the import on the current file. Used as the `registry` of the `argContext` passed to
     * `buildGraphqlQuery`.
     */
    getReferenceToGraphqlArgTypes: () => ts.Expression;
    /**
     * GraphQL type name (arg-type registry key) for the underlying named object/union of a (possibly
     * container-wrapped) type reference, or `undefined`. Used to derive the `rootType` for a GraphQL
     * operation's response.
     */
    getGraphqlTypeNameForReference: (typeReference: FernIr.TypeReference) => string | undefined;
    resolveTypeReference: (typeReference: FernIr.TypeReference) => FernIr.ResolvedTypeReference;
    resolveTypeName: (typeName: FernIr.DeclaredTypeName) => FernIr.ResolvedTypeReference;
    getTypeDeclaration: (typeName: FernIr.DeclaredTypeName) => FernIr.TypeDeclaration;
    getGeneratedType: (typeName: FernIr.DeclaredTypeName, typeNameOverride?: string) => GeneratedType;
    getGeneratedTypeById: (typeId: FernIr.TypeId) => GeneratedType;
    getGeneratedExample: (example: FernIr.ExampleTypeReference) => GeneratedTypeReferenceExample;
    isNullable: (typeReference: FernIr.TypeReference) => boolean;
    isOptional: (typeReference: FernIr.TypeReference) => boolean;
    isLiteral: (typeReference: FernIr.TypeReference) => boolean;
    hasDefaultValue: (typeReference: FernIr.TypeReference) => boolean;
    needsRequestResponseTypeVariant: (typeReference: FernIr.TypeReference) => { request: boolean; response: boolean };
    needsRequestResponseTypeVariantById: (typeId: FernIr.TypeId) => { request: boolean; response: boolean };
    needsRequestResponseTypeVariantByType(type: FernIr.Type): { request: boolean; response: boolean };
    typeNameToTypeReference(typeName: FernIr.DeclaredTypeName): FernIr.TypeReference;
    generateGetterForResponsePropertyAsString({
        variable,
        isVariableOptional,
        property,
        noOptionalChaining
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.ResponseProperty;
        noOptionalChaining?: boolean;
    }): string;
    generateGetterForResponseProperty({
        variable,
        isVariableOptional,
        property,
        noOptionalChaining
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.ResponseProperty;
        noOptionalChaining?: boolean;
    }): ts.Expression;
    generateGetterForRequestProperty({
        variable,
        isVariableOptional,
        property
    }: {
        variable?: string;
        isVariableOptional?: boolean;
        property: FernIr.RequestProperty;
    }): ts.Expression;
    generateSetterForRequestPropertyAsString({
        variable,
        property
    }: {
        variable?: string;
        property: FernIr.RequestProperty;
    }): string;
    generateSetterForRequestProperty({
        variable,
        property
    }: {
        variable?: string;
        property: FernIr.RequestProperty;
    }): ts.Expression;

    getReferenceToResponsePropertyType({
        responseType,
        property
    }: {
        responseType: ts.TypeNode;
        property: FernIr.ResponseProperty;
    }): ts.TypeNode;
}
