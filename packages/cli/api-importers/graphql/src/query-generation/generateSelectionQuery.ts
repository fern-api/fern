import {
    GraphQLEnumType,
    GraphQLField,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLScalarType,
    GraphQLSchema,
    GraphQLUnionType
} from "graphql";

/**
 * Configuration for query generation depth limiting.
 */
export interface QueryGenerationConfig {
    /** Maximum depth to recurse into nested object types. Default: 4 */
    maxDepth: number;
}

const DEFAULT_CONFIG: QueryGenerationConfig = {
    maxDepth: 4
};

/**
 * Generates a full-selection GraphQL query string for a root field.
 *
 * Strategy: Hybrid depth limiting (cycle detection + max depth cap).
 * - Selects all scalar fields at every level
 * - Recurses into object/interface fields up to maxDepth
 * - Stops recursing if a type has already been seen in the current path (cycle detection)
 * - Emits inline fragments for union and interface types
 * - Includes __typename for union/interface selections
 *
 * @param field - The root field (e.g., a field on Query/Mutation/Subscription)
 * @param schema - The full GraphQL schema (for resolving types)
 * @param operationType - "query" | "mutation" | "subscription"
 * @param config - Optional depth/recursion configuration
 * @returns The full GraphQL query/mutation/subscription string
 *
 * @example
 * // For a field `user(id: ID!): User` on Query where User has {id, name, posts: [Post]}
 * // Returns:
 * // query user($id: ID!) {
 * //   user(id: $id) {
 * //     id
 * //     name
 * //     posts {
 * //       id
 * //       title
 * //     }
 * //   }
 * // }
 */
export function generateSelectionQuery(
    field: GraphQLField<unknown, unknown>,
    schema: GraphQLSchema,
    operationType: "query" | "mutation" | "subscription",
    config: QueryGenerationConfig = DEFAULT_CONFIG
): string {
    // TODO: Implement query generation
    // 1. Build the variable definitions string from field.args
    // 2. Build the selection set using SelectionSetBuilder
    // 3. Assemble into full query string

    const variableDefinitions = buildVariableDefinitions(field);
    const selectionSet = buildSelectionSet(field, schema, config);

    const operationName = field.name;
    const varDefsStr = variableDefinitions.length > 0 ? `(${variableDefinitions})` : "";
    const argsStr = buildArgumentsPassthrough(field);

    return `${operationType} ${operationName}${varDefsStr} {\n  ${operationName}${argsStr} ${selectionSet}\n}`;
}

/**
 * Builds the variable definitions string (e.g., "$id: ID!, $limit: Int").
 * Maps each field argument to a GraphQL variable definition.
 */
function buildVariableDefinitions(_field: GraphQLField<unknown, unknown>): string {
    // TODO: Implement
    // For each arg in field.args:
    //   - Format as "$argName: ArgType" (including ! for NonNull, [Type] for lists)
    //   - Join with ", "
    return "";
}

/**
 * Builds the arguments passthrough string (e.g., "(id: $id, limit: $limit)").
 * Each argument is passed through as a variable reference.
 */
function buildArgumentsPassthrough(_field: GraphQLField<unknown, unknown>): string {
    // TODO: Implement
    // For each arg in field.args:
    //   - Format as "argName: $argName"
    //   - Wrap in parentheses, join with ", "
    return "";
}

/**
 * Builds the selection set for a field's return type.
 * This is the core recursive function that implements depth limiting.
 */
function buildSelectionSet(
    _field: GraphQLField<unknown, unknown>,
    _schema: GraphQLSchema,
    _config: QueryGenerationConfig
): string {
    // TODO: Delegate to SelectionSetBuilder
    return "{ __typename }";
}

/**
 * Recursive selection set builder with cycle detection and depth limiting.
 *
 * Maintains a "visited types" set for the current path to detect cycles,
 * and a current depth counter to enforce the max depth cap.
 */
export class SelectionSetBuilder {
    private schema: GraphQLSchema;
    private config: QueryGenerationConfig;

    constructor(schema: GraphQLSchema, config: QueryGenerationConfig) {
        this.schema = schema;
        this.config = config;
    }

    /**
     * Builds a selection set string for the given output type.
     *
     * @param type - The GraphQL output type to generate selections for
     * @param currentDepth - Current recursion depth (starts at 1)
     * @param visitedTypes - Set of type names in the current path (for cycle detection)
     * @returns The selection set string (e.g., "{ id name posts { id title } }")
     */
    public buildForType(_type: GraphQLOutputType, _currentDepth: number, _visitedTypes: Set<string>): string {
        // TODO: Implement recursive selection building
        //
        // Algorithm:
        // 1. Unwrap NonNull and List wrappers to get the named type
        // 2. If scalar/enum → return empty (scalars don't have selection sets)
        // 3. If object type:
        //    a. Check if type name is in visitedTypes → stop (cycle)
        //    b. Check if currentDepth >= maxDepth → select only scalar fields
        //    c. Otherwise: add type to visitedTypes, iterate fields:
        //       - Scalar/enum fields: add field name to selection
        //       - Object/interface/union fields: recursively build sub-selection
        //    d. Remove type from visitedTypes (backtrack)
        // 4. If union type:
        //    a. Add __typename
        //    b. For each member type, emit inline fragment: ... on TypeName { selections }
        // 5. If interface type:
        //    a. Add __typename + interface's own scalar fields
        //    b. For each implementing type, emit inline fragment with type-specific fields
        //
        // Returns formatted selection set string with proper indentation

        return "{ __typename }";
    }

    /**
     * Unwraps NonNull and List wrappers to get the underlying named type.
     */
    private unwrapType(
        _type: GraphQLOutputType
    ): GraphQLObjectType | GraphQLUnionType | GraphQLInterfaceType | GraphQLScalarType | GraphQLEnumType {
        // TODO: Implement type unwrapping
        // Strip GraphQLNonNull and GraphQLList wrappers recursively
        throw new Error("Not yet implemented");
    }

    /**
     * Returns true if the given type is a scalar or enum (leaf type).
     */
    private isLeafType(_type: GraphQLOutputType): boolean {
        // TODO: Implement
        return false;
    }
}
