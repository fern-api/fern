import { FernIr } from "@fern-api/ir-sdk";
import {
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLInputType,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType
} from "graphql";

import { graphqlCasingsGenerator, ROOT_FERN_FILEPATH } from "./shared.js";

const BUILT_IN_SCALARS = new Set(["String", "Int", "Float", "Boolean", "ID"]);

export function isBuiltInScalar(typeName: string): boolean {
    return BUILT_IN_SCALARS.has(typeName);
}

/**
 * Applies the optional namespace prefix to a type name, mirroring
 * GraphQLConverter.getNamespacedTypeId.
 */
export function getNamespacedTypeId(originalName: string, namespace: string | undefined): string {
    return namespace ? `${namespace}_${originalName}` : originalName;
}

function isActualSubscriptionRootType(type: GraphQLObjectType): boolean {
    return type.getInterfaces().length === 0;
}

/**
 * A type is treated as a namespace (operation-grouping type) when ALL of its fields
 * accept arguments. Mirrors GraphQLConverter.isNamespaceType.
 */
function isNamespaceType(type: GraphQLObjectType): boolean {
    const fields = Object.values(type.getFields());
    if (fields.length === 0) {
        return false;
    }
    return fields.every((field) => field.args.length > 0);
}

function unwrapNonNullOutput(type: GraphQLOutputType): GraphQLOutputType {
    if (type instanceof GraphQLNonNull) {
        return type.ofType;
    }
    return type;
}

/**
 * Returns the names of object types consumed as namespace groupings (return types of
 * zero-arg root fields whose own fields all accept arguments). Mirrors
 * GraphQLConverter.collectNamespaceTypeNames.
 */
export function collectNamespaceTypeNames(schema: GraphQLSchema): Set<string> {
    const namespaceTypeNames = new Set<string>();
    const rootTypes: GraphQLObjectType[] = [];

    const queryType = schema.getQueryType();
    if (queryType != null) {
        rootTypes.push(queryType);
    }
    const mutationType = schema.getMutationType();
    if (mutationType != null) {
        rootTypes.push(mutationType);
    }
    const subscriptionType = schema.getSubscriptionType();
    if (subscriptionType != null && isActualSubscriptionRootType(subscriptionType)) {
        rootTypes.push(subscriptionType);
    }

    for (const rootType of rootTypes) {
        for (const field of Object.values(rootType.getFields())) {
            const returnRawType = unwrapNonNullOutput(field.type);
            if (
                returnRawType instanceof GraphQLObjectType &&
                field.args.length === 0 &&
                isNamespaceType(returnRawType)
            ) {
                namespaceTypeNames.add(returnRawType.name);
            }
        }
    }
    return namespaceTypeNames;
}

function namedTypeReference(name: string, namespace: string | undefined): FernIr.TypeReference {
    const typeId = getNamespacedTypeId(name, namespace);
    return FernIr.TypeReference.named({
        typeId,
        fernFilepath: ROOT_FERN_FILEPATH,
        name: getNamespacedTypeId(name, namespace),
        displayName: undefined,
        default: undefined,
        inline: undefined
    });
}

function primitiveReference(v1: FernIr.PrimitiveTypeV1): FernIr.TypeReference {
    return FernIr.TypeReference.primitive({ v1, v2: undefined });
}

/**
 * Maps a built-in GraphQL scalar to its IR primitive. Custom scalars are referenced
 * as named alias types.
 */
function convertScalarReference(type: GraphQLScalarType, namespace: string | undefined): FernIr.TypeReference {
    if (!isBuiltInScalar(type.name)) {
        return namedTypeReference(type.name, namespace);
    }
    switch (type.name) {
        case "String":
        case "ID":
            return primitiveReference(FernIr.PrimitiveTypeV1.String);
        case "Int":
            return primitiveReference(FernIr.PrimitiveTypeV1.Integer);
        case "Float":
            return primitiveReference(FernIr.PrimitiveTypeV1.Double);
        case "Boolean":
            return primitiveReference(FernIr.PrimitiveTypeV1.Boolean);
        default:
            return primitiveReference(FernIr.PrimitiveTypeV1.String);
    }
}

/**
 * Converts a GraphQL output type into an IR TypeReference.
 * - NonNull(inner) -> inner mapped as required (not wrapped in optional)
 * - nullable -> optional wrapper around the non-null mapping
 * - List(inner) -> list of the (output) mapping of inner
 */
export function convertOutputTypeToTypeReference(
    type: GraphQLOutputType,
    namespace: string | undefined
): FernIr.TypeReference {
    if (type instanceof GraphQLNonNull) {
        return convertNonNullOutputType(type.ofType, namespace);
    }
    return FernIr.TypeReference.container(FernIr.ContainerType.optional(convertNonNullOutputType(type, namespace)));
}

function convertNonNullOutputType(type: GraphQLOutputType, namespace: string | undefined): FernIr.TypeReference {
    if (type instanceof GraphQLList) {
        return FernIr.TypeReference.container(
            FernIr.ContainerType.list(convertOutputTypeToTypeReference(type.ofType, namespace))
        );
    }
    if (type instanceof GraphQLScalarType) {
        return convertScalarReference(type, namespace);
    }
    if (
        type instanceof GraphQLEnumType ||
        type instanceof GraphQLObjectType ||
        type instanceof GraphQLInterfaceType ||
        type instanceof GraphQLUnionType
    ) {
        return namedTypeReference(type.name, namespace);
    }
    return FernIr.TypeReference.unknown();
}

/**
 * Converts a GraphQL input type into an IR TypeReference (same shape rules as output).
 */
export function convertInputTypeToTypeReference(
    type: GraphQLInputType,
    namespace: string | undefined
): FernIr.TypeReference {
    if (type instanceof GraphQLNonNull) {
        return convertNonNullInputType(type.ofType, namespace);
    }
    return FernIr.TypeReference.container(FernIr.ContainerType.optional(convertNonNullInputType(type, namespace)));
}

function convertNonNullInputType(type: GraphQLInputType, namespace: string | undefined): FernIr.TypeReference {
    if (type instanceof GraphQLList) {
        return FernIr.TypeReference.container(
            FernIr.ContainerType.list(convertInputTypeToTypeReference(type.ofType, namespace))
        );
    }
    if (type instanceof GraphQLScalarType) {
        return convertScalarReference(type, namespace);
    }
    if (type instanceof GraphQLEnumType || type instanceof GraphQLInputObjectType) {
        return namedTypeReference(type.name, namespace);
    }
    return FernIr.TypeReference.unknown();
}

function makeTypeDeclaration({
    name,
    namespace,
    shape,
    docs
}: {
    name: string;
    namespace: string | undefined;
    shape: FernIr.Type;
    docs: string | undefined;
}): FernIr.TypeDeclaration {
    const namespacedName = getNamespacedTypeId(name, namespace);
    return {
        name: {
            typeId: namespacedName,
            fernFilepath: ROOT_FERN_FILEPATH,
            name: namespacedName,
            displayName: undefined
        },
        shape,
        autogeneratedExamples: [],
        userProvidedExamples: [],
        v2Examples: undefined,
        referencedTypes: new Set<string>(),
        encoding: undefined,
        source: undefined,
        inline: undefined,
        docs,
        availability: undefined
    };
}

function convertObjectType(type: GraphQLObjectType, namespace: string | undefined): FernIr.Type {
    const properties: FernIr.ObjectProperty[] = Object.entries(type.getFields()).map(([fieldName, field]) => ({
        name: graphqlCasingsGenerator.generateNameAndWireValue({ name: fieldName, wireValue: fieldName }),
        valueType: convertOutputTypeToTypeReference(field.type, namespace),
        propertyAccess: undefined,
        defaultValue: undefined,
        v2Examples: undefined,
        docs: field.description ?? undefined,
        availability: undefined
    }));
    return FernIr.Type.object({
        extends: [],
        properties,
        extendedProperties: undefined,
        extraProperties: false
    });
}

function convertInterfaceType(type: GraphQLInterfaceType, namespace: string | undefined): FernIr.Type {
    const properties: FernIr.ObjectProperty[] = Object.entries(type.getFields()).map(([fieldName, field]) => ({
        name: graphqlCasingsGenerator.generateNameAndWireValue({ name: fieldName, wireValue: fieldName }),
        valueType: convertOutputTypeToTypeReference(field.type, namespace),
        propertyAccess: undefined,
        defaultValue: undefined,
        v2Examples: undefined,
        docs: field.description ?? undefined,
        availability: undefined
    }));
    return FernIr.Type.object({
        extends: [],
        properties,
        extendedProperties: undefined,
        extraProperties: false
    });
}

function convertInputObjectType(type: GraphQLInputObjectType, namespace: string | undefined): FernIr.Type {
    const properties: FernIr.ObjectProperty[] = Object.entries(type.getFields()).map(([fieldName, field]) => ({
        name: graphqlCasingsGenerator.generateNameAndWireValue({ name: fieldName, wireValue: fieldName }),
        valueType: convertInputTypeToTypeReference(field.type, namespace),
        propertyAccess: undefined,
        defaultValue: undefined,
        v2Examples: undefined,
        docs: field.description ?? undefined,
        availability: undefined
    }));
    return FernIr.Type.object({
        extends: [],
        properties,
        extendedProperties: undefined,
        extraProperties: false
    });
}

function convertEnumType(type: GraphQLEnumType): FernIr.Type {
    const values: FernIr.EnumValue[] = type.getValues().map((value) => ({
        name: graphqlCasingsGenerator.generateNameAndWireValue({ name: value.name, wireValue: value.name }),
        docs: value.description ?? undefined,
        availability: undefined
    }));
    return FernIr.Type.enum({
        default: undefined,
        values,
        forwardCompatible: undefined
    });
}

function convertUnionType(type: GraphQLUnionType, namespace: string | undefined): FernIr.Type {
    const members: FernIr.UndiscriminatedUnionMember[] = type.getTypes().map((member) => ({
        type: namedTypeReference(member.name, namespace),
        docs: member.description ?? undefined
    }));
    return FernIr.Type.undiscriminatedUnion({
        members,
        baseProperties: undefined
    });
}

/**
 * Custom scalars are emitted as aliases to the string primitive. Mirrors
 * GraphQLConverter's default scalar handling (string is the safe default).
 */
function convertCustomScalar(): FernIr.Type {
    return FernIr.Type.alias({
        aliasOf: primitiveReference(FernIr.PrimitiveTypeV1.String),
        resolvedType: FernIr.ResolvedTypeReference.primitive({
            v1: FernIr.PrimitiveTypeV1.String,
            v2: undefined
        })
    });
}

/**
 * Converts all user-defined types in a GraphQL schema to IR TypeDeclarations.
 */
export function convertGraphQLTypes({
    schema,
    namespace
}: {
    schema: GraphQLSchema;
    namespace: string | undefined;
}): Record<string, FernIr.TypeDeclaration> {
    const result: Record<string, FernIr.TypeDeclaration> = {};

    const namespaceTypeNames = collectNamespaceTypeNames(schema);
    const queryType = schema.getQueryType();
    const mutationType = schema.getMutationType();
    const subscriptionType = schema.getSubscriptionType();

    for (const [typeName, type] of Object.entries(schema.getTypeMap())) {
        if (typeName.startsWith("__")) {
            continue;
        }
        if (type === queryType || type === mutationType) {
            continue;
        }
        if (
            type === subscriptionType &&
            type instanceof GraphQLObjectType &&
            isActualSubscriptionRootType(type)
        ) {
            continue;
        }
        if (type instanceof GraphQLObjectType && namespaceTypeNames.has(typeName)) {
            continue;
        }
        if (type instanceof GraphQLScalarType && isBuiltInScalar(typeName)) {
            continue;
        }

        const typeId = getNamespacedTypeId(typeName, namespace);
        const docs = type.description ?? undefined;

        if (type instanceof GraphQLEnumType) {
            result[typeId] = makeTypeDeclaration({ name: typeName, namespace, shape: convertEnumType(type), docs });
        } else if (type instanceof GraphQLInterfaceType) {
            result[typeId] = makeTypeDeclaration({
                name: typeName,
                namespace,
                shape: convertInterfaceType(type, namespace),
                docs
            });
        } else if (type instanceof GraphQLObjectType) {
            result[typeId] = makeTypeDeclaration({
                name: typeName,
                namespace,
                shape: convertObjectType(type, namespace),
                docs
            });
        } else if (type instanceof GraphQLInputObjectType) {
            result[typeId] = makeTypeDeclaration({
                name: typeName,
                namespace,
                shape: convertInputObjectType(type, namespace),
                docs
            });
        } else if (type instanceof GraphQLUnionType) {
            result[typeId] = makeTypeDeclaration({
                name: typeName,
                namespace,
                shape: convertUnionType(type, namespace),
                docs
            });
        } else if (type instanceof GraphQLScalarType) {
            result[typeId] = makeTypeDeclaration({ name: typeName, namespace, shape: convertCustomScalar(), docs });
        }
    }

    return result;
}
