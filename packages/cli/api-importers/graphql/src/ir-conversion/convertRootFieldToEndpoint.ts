import { GraphQLField, GraphQLSchema } from "graphql";
import { generateSelectionQuery, QueryGenerationConfig } from "../query-generation/generateSelectionQuery.js";

/**
 * Converts a single GraphQL root field into a synthetic HttpEndpoint for the IR.
 *
 * A root field like `user(id: ID!): User` on Query becomes:
 * - method: POST
 * - path: /graphql
 * - requestBody: typed variables object { id: string }
 * - response: User (fully resolved type)
 * - transport: Transport.graphql({ query: "query user($id: ID!) { user(id: $id) { ... } }", operationType: "QUERY", operationName: "user" })
 *
 * @param field - The root field to convert (from Query/Mutation/Subscription)
 * @param operationType - "QUERY" | "MUTATION" | "SUBSCRIPTION"
 * @param schema - The full schema (for query generation and type resolution)
 * @param namespace - Optional namespace prefix for service/endpoint IDs
 * @param config - Query generation depth config
 * @returns An HttpEndpoint-shaped object ready for inclusion in an HttpService
 */
export function convertRootFieldToEndpoint({
    field,
    operationType,
    schema,
    namespace,
    config
}: {
    field: GraphQLField<unknown, unknown>;
    operationType: "QUERY" | "MUTATION" | "SUBSCRIPTION";
    schema: GraphQLSchema;
    namespace: string | undefined;
    config: QueryGenerationConfig;
}): unknown {
    // TODO: Implement endpoint conversion
    //
    // Steps:
    // 1. Generate the pre-built query string using generateSelectionQuery()
    const _queryString = generateSelectionQuery(
        field,
        schema,
        operationType.toLowerCase() as "query" | "mutation" | "subscription",
        config
    );

    // 2. Convert field.args → request body type (variables object)
    //    - Each arg becomes a property on a synthetic object type
    //    - Required args (NonNull without default) → required properties
    //    - Optional args → optional properties
    //    - The synthetic type is named `${FieldName}Variables`
    const _variablesType = convertFieldArgsToVariablesType(field, namespace);

    // 3. Resolve the return type to an IR TypeReference
    //    - Unwrap NonNull/List wrappers
    //    - Map to existing TypeDeclaration by name
    const _responseType = resolveReturnType(field);

    // 4. Build the HttpEndpoint object:
    //    {
    //      id: EndpointId (e.g., "endpoint_query_user")
    //      name: Name with casings
    //      method: "POST"
    //      headers: [] (auth headers handled separately)
    //      path: { head: "/graphql", parts: [] }
    //      queryParameters: []
    //      requestBody: InlinedRequestBody with variables properties
    //      response: JsonResponse with unwrapped return type
    //      transport: Transport.graphql({ query: queryString, operationType, operationName: field.name })
    //      sdkRequest, auth, errors, examples, etc.: defaults
    //    }

    // 5. Return the HttpEndpoint
    return undefined;
}

/**
 * Converts a root field's arguments into a synthetic "Variables" type.
 * This becomes the request body shape for the endpoint.
 *
 * Example: `user(id: ID!, includeDeleted: Boolean)` →
 * {
 *   properties: [
 *     { name: "id", valueType: TypeReference.primitive(string), required: true },
 *     { name: "includeDeleted", valueType: TypeReference.primitive(boolean), required: false }
 *   ]
 * }
 */
function convertFieldArgsToVariablesType(
    _field: GraphQLField<unknown, unknown>,
    _namespace: string | undefined
): unknown {
    // TODO: Implement
    // For each argument:
    //   - name: arg.name (with casings)
    //   - valueType: convertInputTypeToTypeReference(arg.type)
    //   - required: isNonNull(arg.type) && arg.defaultValue === undefined
    //   - docs: arg.description
    return undefined;
}

/**
 * Resolves a field's return type to an IR TypeReference.
 *
 * Unwraps NonNull/List wrappers and maps to:
 * - Named types → TypeReference.named(typeId)
 * - Lists → TypeReference.container(list(...))
 * - Scalars → TypeReference.primitive(...)
 */
function resolveReturnType(_field: GraphQLField<unknown, unknown>): unknown {
    // TODO: Implement
    // 1. Unwrap GraphQLNonNull wrapper (note optionality for the outer level)
    // 2. If List → recurse on inner type, wrap in TypeReference.container.list()
    // 3. If named type → look up by name, return TypeReference.named(typeId)
    // 4. If scalar → map to primitive TypeReference
    return undefined;
}
