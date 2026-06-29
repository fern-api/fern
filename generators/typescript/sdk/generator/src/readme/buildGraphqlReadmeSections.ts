import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    detectGraphqlConnection,
    findNestedGraphqlConnections,
    getGraphqlResponseBodyType,
    getGraphqlTransport,
    getScalarFieldNames
} from "@fern-typescript/sdk-client-class-generator";

/**
 * Builds GraphQL-specific README sections (field selection, pagination, subscriptions, error handling,
 * raw queries) for a GraphQL-generated SDK. These features have no equivalent in the REST README
 * feature set, so they are emitted as custom sections, each gated on the SDK actually having the
 * capability. Examples use representative operation/connection names and real scalar fields from the IR.
 */
export function buildGraphqlReadmeSections(ir: FernIr.IntermediateRepresentation): FernGeneratorCli.CustomSection[] {
    const graphqlEndpoints: FernIr.HttpEndpoint[] = [];
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            if (getGraphqlTransport(endpoint) != null) {
                graphqlEndpoints.push(endpoint);
            }
        }
    }
    if (graphqlEndpoints.length === 0) {
        return [];
    }

    const operationType = (endpoint: FernIr.HttpEndpoint): string | undefined =>
        getGraphqlTransport(endpoint)?.operationType?.toUpperCase();
    const queryEndpoint = graphqlEndpoints.find((endpoint) => operationType(endpoint) === "QUERY");
    const subscriptionEndpoint = graphqlEndpoints.find((endpoint) => operationType(endpoint) === "SUBSCRIPTION");
    const hasQueryOrMutation = graphqlEndpoints.some(
        (endpoint) => operationType(endpoint) === "QUERY" || operationType(endpoint) === "MUTATION"
    );

    const queryMethod = queryEndpoint != null ? methodName(queryEndpoint) : "yourQuery";
    const querySelection = endpointSelection(queryEndpoint, ir);
    const paginate = findPaginateMethod(graphqlEndpoints, ir);

    const sections: FernGeneratorCli.CustomSection[] = [];

    if (hasQueryOrMutation) {
        sections.push(
            section(
                "GraphQL Field Selection",
                `Operations take a typed **field selection** — you choose exactly which fields come back, and the result type is narrowed to match (unselected fields are absent, not \`undefined\`). Omit the selection to get a safe default (all scalar fields). Use \`__on\` for unions/interfaces, \`__args\` for nested-field arguments, and \`__all\` to take every scalar at a level.`,
                `const { data } = await client.query.${queryMethod}(${querySelection});
// \`data\` is typed to exactly the fields you selected`
            )
        );
    }

    if (paginate != null) {
        sections.push(
            section(
                "GraphQL Pagination",
                `Relay connections expose auto-pagination under \`paginate\`. The returned \`AsyncIterableIterator\` yields each node (typed to your selection) and follows \`pageInfo.endCursor\` across pages, fetching lazily as you iterate. Works for connections nested under a root field too (e.g. \`site.products\`).`,
                `for await (const node of client.query.paginate.${paginate.method}({ first: 50 }, ${selectionLiteral(
                    getScalarFieldNames(paginate.nodeType, ir.types, 2)
                )})) {
    console.log(node);
}`
            )
        );
    }

    if (subscriptionEndpoint != null) {
        sections.push(
            section(
                "GraphQL Subscriptions",
                `Subscription operations stream over a WebSocket (\`graphql-transport-ws\`) and return an \`AsyncIterableIterator\` of events typed to your selection. Breaking out of the loop tears down the socket.`,
                `for await (const event of client.subscription.${methodName(subscriptionEndpoint)}(
    { /* args */ },
    ${endpointSelection(subscriptionEndpoint, ir)},
)) {
    console.log(event);
}`
            )
        );
    }

    if (hasQueryOrMutation) {
        sections.push(
            section(
                "Handling GraphQL Errors",
                `GraphQL is a partial-success protocol: a single response can carry both \`data\` and \`errors\`. Operations return a \`{ data, errors }\` envelope rather than throwing, so you can handle partial data. Pass \`throwOnError: true\` to throw a \`GraphqlError\` instead.`,
                `const { data, errors } = await client.query.${queryMethod}(${querySelection});
if (errors != null && errors.length > 0) {
    // handle GraphQL operation errors (data may still be partially present)
}

// Or opt into exceptions:
const strict = await client.query.${queryMethod}(${querySelection}, { throwOnError: true });`
            )
        );

        sections.push(
            section(
                "Raw GraphQL Queries",
                `Power users can send a hand-written GraphQL document with \`client.raw\`, bypassing the typed operation surface. It returns the same \`{ data, errors }\` envelope and reuses the SDK's auth, retries, and base URL.`,
                `const { data } = await client.raw<{ order: { id: string } }>(
    \`query (\\$id: ID!) { order(id: \\$id) { id } }\`,
    { id: "order-123" },
);`
            )
        );
    }

    return sections;
}

function section(name: string, description: string, code: string): FernGeneratorCli.CustomSection {
    return {
        name,
        language: FernGeneratorCli.Language.Typescript,
        content: `${description}\n\n\`\`\`typescript\n${code}\n\`\`\``
    };
}

/** A representative selection literal for an endpoint's response type, e.g. `{ id: true, name: true }`. */
function endpointSelection(endpoint: FernIr.HttpEndpoint | undefined, ir: FernIr.IntermediateRepresentation): string {
    const responseType = endpoint != null ? getGraphqlResponseBodyType(endpoint) : undefined;
    return selectionLiteral(responseType != null ? getScalarFieldNames(responseType, ir.types, 2) : []);
}

/** `{ a: true, b: true }`, falling back to `{ __typename: true }` when no scalar leaves are known. */
function selectionLiteral(fieldNames: string[]): string {
    const fields = fieldNames.length > 0 ? fieldNames : ["__typename"];
    return `{ ${fields.map((name) => `${name}: true`).join(", ")} }`;
}

/** Finds a representative `paginate.*` method (root or nested connection) and its node type. */
function findPaginateMethod(
    endpoints: FernIr.HttpEndpoint[],
    ir: FernIr.IntermediateRepresentation
): { method: string; nodeType: FernIr.TypeReference } | undefined {
    const hasAfterArg = makeFieldHasAfterArg(ir);
    for (const endpoint of endpoints) {
        const root = detectGraphqlConnection(endpoint, ir.types);
        if (root != null) {
            return { method: methodName(endpoint), nodeType: root.nodeType };
        }
        const nested = findNestedGraphqlConnections({ endpoint, types: ir.types, fieldHasAfterArg: hasAfterArg });
        const first = nested[0];
        if (first != null) {
            return { method: methodName(endpoint) + first.path.map(pascalCase).join(""), nodeType: first.nodeType };
        }
    }
    return undefined;
}

function makeFieldHasAfterArg(ir: FernIr.IntermediateRepresentation): (parentTypeId: string, field: string) => boolean {
    const graphqlFieldArguments = (
        ir as unknown as {
            graphqlFieldArguments?: Record<
                string,
                { fields: Record<string, Array<{ name: string | { wireValue?: string } }>> }
            >;
        }
    ).graphqlFieldArguments;
    return (parentTypeId, field) => {
        const args = graphqlFieldArguments?.[parentTypeId]?.fields?.[field];
        return (
            args != null &&
            args.some((arg) => (typeof arg.name === "string" ? arg.name : arg.name.wireValue) === "after")
        );
    };
}

function methodName(endpoint: FernIr.HttpEndpoint): string {
    const name = endpoint.name;
    if (typeof name === "string") {
        return camelCase(name);
    }
    return name.camelCase?.unsafeName ?? camelCase(name.originalName);
}

function splitWords(value: string): string[] {
    return value.split(/[^a-zA-Z0-9]+/).filter((part) => part.length > 0);
}

function camelCase(value: string): string {
    return splitWords(value)
        .map((word, index) =>
            index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");
}

function pascalCase(value: string): string {
    return splitWords(value)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}
