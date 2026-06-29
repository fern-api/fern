/**
 * A caller-provided GraphQL field selection. Keys are field names; a value of `true`
 * selects a scalar/leaf field, a nested object recurses into an object field, and the
 * reserved `__on` key selects fields on specific concrete types of an interface/union
 * via inline fragments, e.g. `{ __on: { User: { id: true }, Post: { title: true } } }`.
 *
 * The reserved `__args` key supplies arguments for a field, e.g.
 * `{ posts: { __args: { first: 10 }, edges: { node: { title: true } } } }`. Argument values are
 * emitted as GraphQL variables (declared with their SDL type) rather than inlined literals so that
 * enums, input objects, and lists serialize correctly for free.
 *
 * The generated per-type `<Type>Select` types are structurally compatible with this.
 */
export type GraphqlSelection = {
    [field: string]: boolean | GraphqlSelection | GraphqlArgs | undefined;
};

/** Argument values for a field, supplied under the reserved `__args` key. */
export type GraphqlArgs = {
    [argName: string]: unknown;
};

export interface GraphqlQueryScaffolding {
    /** "QUERY" | "MUTATION" | "SUBSCRIPTION" (case-insensitive). */
    operationType: string;
    /** The root field / operation name, e.g. "user". */
    operationName: string;
    /** GraphQL variable definitions without parentheses, e.g. "$id: ID!". */
    variableDefinitions?: string;
    /** Root-field argument passthrough including parentheses, e.g. "(id: $id)". */
    arguments?: string;
}

/**
 * Per-type, per-field metadata the runtime needs to resolve nested `$args`:
 * - `type` is the child GraphQL type name (for descending the selection)
 * - `args` maps an argument's wire name to its GraphQL SDL type (for declaring the variable)
 */
export type GraphqlArgTypeRegistry = Record<string, Record<string, { type?: string; args?: Record<string, string> }>>;

/**
 * Context required to resolve nested `$args`. `rootType` is the GraphQL type name of the operation's
 * response; `registry` is the generated arg-type registry.
 */
export interface GraphqlArgContext {
    rootType: string;
    registry: GraphqlArgTypeRegistry;
    /**
     * Client-side document size guard (PRD §10.11): the maximum length, in characters, of the built
     * GraphQL document. A runtime-built selection can become one request the server rejects for
     * exceeding its size/complexity limits; this fails fast with a clear error before the round-trip
     * instead. Defaults to {@link DEFAULT_MAX_GRAPHQL_DOCUMENT_LENGTH}; set to `0` to disable.
     */
    maxDocumentLength?: number;
}

const ON_KEY = "__on";
const ARGS_KEY = "__args";
const ALL_KEY = "__all";

/**
 * Default ceiling for {@link GraphqlArgContext.maxDocumentLength}. Generous enough never to trip a
 * legitimate selection (depth is already bounded at generation time), but it catches a pathological or
 * accidentally-unbounded document before it becomes a rejected request.
 */
export const DEFAULT_MAX_GRAPHQL_DOCUMENT_LENGTH = 1_000_000;

/**
 * Builds a GraphQL operation string from a field selection, reusing the operation's
 * variable definitions and argument passthrough so only the selection set differs from
 * the pre-built query.
 *
 * Returns `{ query, variables }`. `variables` carries the values for any nested-field `$args`
 * (allocated as `gqlArg<N>` variables); it is empty when there are no `$args`. The operation
 * signature merges the scaffolding's operation-level variable definitions with the newly allocated
 * nested ones.
 */
export function buildGraphqlQuery(
    scaffolding: GraphqlQueryScaffolding,
    selection: GraphqlSelection,
    argContext?: GraphqlArgContext,
): { query: string; variables: Record<string, unknown> } {
    const state: ArgState = {
        counter: 0,
        variables: {},
        variableDefinitions: [],
        registry: argContext?.registry,
    };
    const selectionSet = buildSelectionSet(selection, argContext?.rootType, state);

    const scaffoldingVariableDefinitions =
        scaffolding.variableDefinitions != null && scaffolding.variableDefinitions.length > 0
            ? [scaffolding.variableDefinitions]
            : [];
    const allVariableDefinitions = [...scaffoldingVariableDefinitions, ...state.variableDefinitions];
    const variableDefinitions = allVariableDefinitions.length > 0 ? `(${allVariableDefinitions.join(", ")})` : "";

    const args = scaffolding.arguments ?? "";
    const operationType = scaffolding.operationType.toLowerCase();
    const query = `${operationType} ${scaffolding.operationName}${variableDefinitions} {\n  ${scaffolding.operationName}${args} ${selectionSet}\n}`;

    const maxDocumentLength = argContext?.maxDocumentLength ?? DEFAULT_MAX_GRAPHQL_DOCUMENT_LENGTH;
    if (maxDocumentLength > 0 && query.length > maxDocumentLength) {
        throw new Error(
            `GraphQL document for "${scaffolding.operationName}" is ${query.length} characters, exceeding the ` +
                `${maxDocumentLength}-character limit. Narrow the field selection, or raise the limit via the ` +
                `maxDocumentLength option.`,
        );
    }

    return { query, variables: state.variables };
}

interface ArgState {
    /** Monotonic counter for allocating unique `gqlArg<N>` variable names across the whole query. */
    counter: number;
    /** Collected nested-arg variable values, keyed by variable name (without `$`). */
    variables: Record<string, unknown>;
    /** Collected nested-arg variable definitions, e.g. `$gqlArg0: Int`. */
    variableDefinitions: string[];
    /** The arg-type registry, if `$args` support is enabled for this query. */
    registry: GraphqlArgTypeRegistry | undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === "object";
}

/**
 * Builds a selection set. `currentType` is the GraphQL type name of the selection's parent (used to
 * resolve `$args` SDL types and to descend into child types); it is `undefined` when no arg context
 * was supplied, in which case `$args` is ignored.
 */
function buildSelectionSet(selection: GraphqlSelection, currentType: string | undefined, state: ArgState): string {
    const parts: string[] = [];
    let hasInlineFragments = false;
    let expandAll = false;

    for (const [key, value] of Object.entries(selection)) {
        if (value == null || value === false) {
            continue;
        }
        if (key === ARGS_KEY) {
            // `$args` is consumed by the field that owns this selection object, not emitted as a field.
            continue;
        }
        if (key === ALL_KEY) {
            // `__all: true` expands to the type's scalar fields; deferred until after explicit fields so
            // it can dedupe against them.
            if (value === true) {
                expandAll = true;
            }
            continue;
        }
        if (key === ON_KEY) {
            if (isPlainObject(value)) {
                for (const [typeName, fragmentSelection] of Object.entries(value)) {
                    if (isPlainObject(fragmentSelection)) {
                        hasInlineFragments = true;
                        // Within an inline fragment the current type is the fragment's concrete type.
                        parts.push(
                            `... on ${typeName} ${buildSelectionSet(fragmentSelection as GraphqlSelection, typeName, state)}`,
                        );
                    }
                }
            }
            continue;
        }
        if (value === true) {
            parts.push(key);
        } else if (isPlainObject(value)) {
            const fieldSelection = value as GraphqlSelection;
            const fieldArgs = buildFieldArgs(key, fieldSelection, currentType, state);
            const childType = resolveChildType(currentType, key, state);
            parts.push(`${key}${fieldArgs} ${buildSelectionSet(fieldSelection, childType, state)}`);
        }
    }

    // Expand `__all` to the current type's scalar leaf fields (registry entries with no child `type`),
    // skipping any already selected explicitly. Requires the arg-type registry + a known current type.
    if (expandAll && state.registry != null && currentType != null) {
        const typeFields = state.registry[currentType];
        if (typeFields != null) {
            for (const [fieldName, entry] of Object.entries(typeFields)) {
                if (entry.type == null && !parts.includes(fieldName)) {
                    parts.push(fieldName);
                }
            }
        }
    }

    // Inline fragments require __typename to discriminate at runtime.
    if (hasInlineFragments && !parts.includes("__typename")) {
        parts.unshift("__typename");
    }
    // A selection set may never be empty in GraphQL.
    if (parts.length === 0) {
        parts.push("__typename");
    }

    return `{ ${parts.join(" ")} }`;
}

/**
 * If `fieldSelection` carries a `$args` object, allocates a `gqlArg<N>` variable for each argument,
 * records its value and SDL-typed definition, and returns the field's argument list including
 * parentheses (e.g. `(first: $gqlArg0, after: $gqlArg1)`). Returns `""` when there are no args (or no
 * arg context / registry entry to resolve their SDL types).
 */
function buildFieldArgs(
    fieldName: string,
    fieldSelection: GraphqlSelection,
    currentType: string | undefined,
    state: ArgState,
): string {
    const rawArgs = fieldSelection[ARGS_KEY];
    if (!isPlainObject(rawArgs) || state.registry == null || currentType == null) {
        return "";
    }
    const argSdlTypes = state.registry[currentType]?.[fieldName]?.args;
    if (argSdlTypes == null) {
        return "";
    }
    const argParts: string[] = [];
    for (const [argName, argValue] of Object.entries(rawArgs)) {
        if (argValue === undefined) {
            continue;
        }
        const sdlType = argSdlTypes[argName];
        if (sdlType == null) {
            // No SDL type known for this arg name; skip rather than emit an undeclared variable.
            continue;
        }
        const variableName = `gqlArg${state.counter++}`;
        argParts.push(`${argName}: $${variableName}`);
        state.variableDefinitions.push(`$${variableName}: ${sdlType}`);
        state.variables[variableName] = argValue;
    }
    return argParts.length > 0 ? `(${argParts.join(", ")})` : "";
}

/** Resolves the GraphQL type name of a field's children for continued descent, or `undefined`. */
function resolveChildType(currentType: string | undefined, fieldName: string, state: ArgState): string | undefined {
    if (state.registry == null || currentType == null) {
        return undefined;
    }
    return state.registry[currentType]?.[fieldName]?.type;
}
