import {
    GraphQLField,
    GraphQLInterfaceType,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLSchema,
    GraphQLUnionType,
    getNamedType,
    isInterfaceType,
    isLeafType,
    isObjectType,
    isUnionType
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

const INDENT = "  ";

/**
 * Generates a full-selection GraphQL query string for a root field.
 *
 * Strategy: Hybrid depth limiting (cycle detection + max depth cap).
 * - Selects all scalar/enum fields at every level
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
 */
export function generateSelectionQuery(
    field: GraphQLField<unknown, unknown>,
    schema: GraphQLSchema,
    operationType: "query" | "mutation" | "subscription",
    config: QueryGenerationConfig = DEFAULT_CONFIG
): string {
    const variableDefinitions = buildVariableDefinitions(field);
    const builder = new SelectionSetBuilder(schema, config);
    const selectionSet = builder.buildForType(field.type, 1, new Set());

    const operationName = field.name;
    const varDefsStr = variableDefinitions.length > 0 ? `(${variableDefinitions})` : "";
    const argsStr = buildArgumentsPassthrough(field);
    const selectionSuffix = selectionSet.length > 0 ? ` ${selectionSet}` : "";

    return `${operationType} ${operationName}${varDefsStr} {\n${INDENT}${operationName}${argsStr}${selectionSuffix}\n}`;
}

/**
 * Builds the variable definitions string (e.g., "$id: ID!, $limit: Int").
 * Relies on graphql-js's SDL stringification of the argument type.
 */
function buildVariableDefinitions(field: GraphQLField<unknown, unknown>): string {
    return field.args.map((arg) => `$${arg.name}: ${arg.type.toString()}`).join(", ");
}

/**
 * Builds the arguments passthrough string (e.g., "(id: $id, limit: $limit)").
 * Each argument is passed through as a variable reference.
 */
function buildArgumentsPassthrough(field: GraphQLField<unknown, unknown>): string {
    if (field.args.length === 0) {
        return "";
    }
    return `(${field.args.map((arg) => `${arg.name}: $${arg.name}`).join(", ")})`;
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
     * @returns The selection set string (e.g., "{ id name posts { id title } }") or "" for leaf types
     */
    public buildForType(type: GraphQLOutputType, currentDepth: number, visitedTypes: Set<string>): string {
        const namedType = getNamedType(type);

        // Scalars and enums are leaves — they have no selection set.
        if (isLeafType(namedType)) {
            return "";
        }

        if (isUnionType(namedType)) {
            return this.buildUnionSelection(namedType, currentDepth, visitedTypes);
        }

        if (isObjectType(namedType) || isInterfaceType(namedType)) {
            return this.buildObjectSelection(namedType, currentDepth, visitedTypes);
        }

        // Fallback for anything unexpected: select the typename so the query is still valid.
        return `{\n${INDENT.repeat(currentDepth)}__typename\n${INDENT.repeat(currentDepth - 1)}}`;
    }

    private buildObjectSelection(
        type: GraphQLObjectType | GraphQLInterfaceType,
        currentDepth: number,
        visitedTypes: Set<string>
    ): string {
        const childIndent = INDENT.repeat(currentDepth);
        const closingIndent = INDENT.repeat(currentDepth - 1);
        const lines: string[] = [];

        const recurse = currentDepth < this.config.maxDepth && !visitedTypes.has(type.name);
        const nextVisited = new Set(visitedTypes);
        nextVisited.add(type.name);

        for (const field of Object.values(type.getFields())) {
            const fieldNamedType = getNamedType(field.type);
            if (isLeafType(fieldNamedType)) {
                lines.push(`${childIndent}${field.name}`);
            } else if (recurse) {
                const subSelection = this.buildForType(field.type, currentDepth + 1, nextVisited);
                if (subSelection.length > 0) {
                    lines.push(`${childIndent}${field.name} ${subSelection}`);
                }
            }
            // If we cannot recurse (depth/cycle), skip composite fields entirely —
            // a composite field with no sub-selection would be an invalid query.
        }

        // An interface selection should still know its concrete type.
        if (isInterfaceType(type)) {
            lines.unshift(`${childIndent}__typename`);
        }

        if (lines.length === 0) {
            // Guarantee a non-empty, valid selection set.
            lines.push(`${childIndent}__typename`);
        }

        return `{\n${lines.join("\n")}\n${closingIndent}}`;
    }

    private buildUnionSelection(type: GraphQLUnionType, currentDepth: number, visitedTypes: Set<string>): string {
        const childIndent = INDENT.repeat(currentDepth);
        const closingIndent = INDENT.repeat(currentDepth - 1);
        const lines: string[] = [`${childIndent}__typename`];

        const recurse = currentDepth < this.config.maxDepth && !visitedTypes.has(type.name);
        if (recurse) {
            const nextVisited = new Set(visitedTypes);
            nextVisited.add(type.name);
            for (const member of type.getTypes()) {
                const subSelection = this.buildObjectSelection(member, currentDepth + 1, nextVisited);
                lines.push(`${childIndent}... on ${member.name} ${subSelection}`);
            }
        }

        return `{\n${lines.join("\n")}\n${closingIndent}}`;
    }
}
