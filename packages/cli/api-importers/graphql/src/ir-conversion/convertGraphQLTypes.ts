import {
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType
} from "graphql";

/**
 * Converts all user-defined types in a GraphQL schema to IR TypeDeclarations.
 *
 * Handles:
 * - Object types → IR object type with properties
 * - Enum types → IR enum type with values
 * - Union types → IR undiscriminated union
 * - Interface types → IR object type (with extended properties from implementors)
 * - Input object types → IR object type (used for request variable types)
 * - Custom scalars → IR alias to primitive (string by default)
 *
 * Skips:
 * - Built-in scalars (String, Int, Float, Boolean, ID)
 * - Introspection types (__Type, __Field, etc.)
 * - Root types (Query, Mutation, Subscription) — these become services, not types
 * - Namespace types (arg-less fields whose return types group operations)
 *
 * @param schema - The parsed GraphQL schema
 * @param namespace - Optional namespace prefix for type IDs (for multi-schema support)
 * @returns Record<TypeId, TypeDeclaration> ready for the IR
 */
export function convertGraphQLTypes({
    schema,
    namespace
}: {
    schema: GraphQLSchema;
    namespace: string | undefined;
}): Record<string, unknown> {
    // TODO: Implement type conversion
    //
    // High-level steps:
    // 1. Iterate schema.getTypeMap()
    // 2. Skip built-in/introspection types (names starting with "__")
    // 3. Skip root types (Query, Mutation, Subscription)
    // 4. Skip namespace types (detected via isNamespaceType heuristic)
    // 5. For each remaining type, convert based on its kind:
    //    - GraphQLObjectType → convertObjectType()
    //    - GraphQLEnumType → convertEnumType()
    //    - GraphQLUnionType → convertUnionType()
    //    - GraphQLInterfaceType → convertInterfaceType()
    //    - GraphQLInputObjectType → convertInputObjectType()
    //    - GraphQLScalarType → convertCustomScalar()
    //
    // NOTE: This reuses logic from the existing GraphQLConverter's collectTypeDefinitions(),
    // but produces IR TypeDeclarations (from @fern-api/ir-sdk) instead of FDR types.

    void schema;
    void namespace;
    return {};
}

/**
 * Converts a GraphQL object type to an IR TypeDeclaration.
 * Each field becomes a property with its corresponding IR TypeReference.
 */
function convertObjectType(_type: GraphQLObjectType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // - Map each field to an ObjectProperty with:
    //   - name (with casings)
    //   - valueType: convertOutputTypeToTypeReference(field.type)
    //   - docs: field.description
    // - Handle field arguments (rare for non-root fields, but valid in GraphQL)
    return undefined;
}

/**
 * Converts a GraphQL enum type to an IR TypeDeclaration.
 */
function convertEnumType(_type: GraphQLEnumType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // - Map each enum value to an EnumValue with name and docs
    return undefined;
}

/**
 * Converts a GraphQL union type to an IR TypeDeclaration.
 * Uses __typename as the discriminant field.
 */
function convertUnionType(_type: GraphQLUnionType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // - Each union member becomes a variant
    // - __typename is the discriminant
    return undefined;
}

/**
 * Converts a GraphQL interface type to an IR TypeDeclaration.
 */
function convertInterfaceType(_type: GraphQLInterfaceType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // - Convert interface fields as base properties
    // - May also generate discriminated union for implementing types
    return undefined;
}

/**
 * Converts a GraphQL input object type to an IR TypeDeclaration.
 * Input types are used for request variable types (operation arguments).
 */
function convertInputObjectType(_type: GraphQLInputObjectType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // - Map each input field to an ObjectProperty
    // - Handles nested input objects, lists, enums, scalars
    return undefined;
}

/**
 * Converts a custom GraphQL scalar to an IR TypeDeclaration.
 * Maps known scalars (DateTime, JSON, etc.) to appropriate primitives.
 * Unknown custom scalars default to string.
 */
function convertCustomScalar(_type: GraphQLScalarType, _namespace: string | undefined): unknown {
    // TODO: Implement
    // Known scalar mappings:
    //   DateTime/Date → string (with format hint)
    //   JSON/JSONObject → unknown/map
    //   BigInt/Long → long
    //   URL/URI → string
    //   Everything else → string (safest default)
    return undefined;
}
