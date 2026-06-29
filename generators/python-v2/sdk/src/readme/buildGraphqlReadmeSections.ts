import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * GraphQL-specific README sections for a GraphQL-generated Python SDK (field selection,
 * pagination, subscriptions, error handling, raw queries) — the Python analog of the TypeScript
 * generator's GraphQL README sections. Each section is gated on the SDK having the capability and
 * uses real operation names + scalar fields from the IR. The graphql transport is read structurally
 * since the pinned ir-sdk does not type the graphql Transport variant.
 */

interface StructuralGraphqlTransport {
    type: string;
    operationType?: string;
    operationName?: string;
}

function getGraphqlTransport(endpoint: FernIr.HttpEndpoint): StructuralGraphqlTransport | undefined {
    const transport = (endpoint as unknown as { transport?: StructuralGraphqlTransport }).transport;
    if (transport != null && transport.type === "graphql") {
        return transport;
    }
    return undefined;
}

function operationType(endpoint: FernIr.HttpEndpoint): string | undefined {
    return getGraphqlTransport(endpoint)?.operationType?.toUpperCase();
}

function toSnakeCase(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .toLowerCase();
}

function nameToSnake(name: FernIr.NameOrString): string {
    return typeof name === "string" ? toSnakeCase(name) : name.snakeCase.safeName;
}

function propertySnake(name: FernIr.NameAndWireValueOrString): string {
    return typeof name === "string" ? toSnakeCase(name) : nameToSnake(name.name);
}

function propertyWireValue(name: FernIr.NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

function methodName(endpoint: FernIr.HttpEndpoint): string {
    return nameToSnake(endpoint.name);
}

function responseType(endpoint: FernIr.HttpEndpoint): FernIr.TypeReference | undefined {
    const body = endpoint.response?.body;
    if (body == null || body.type !== "json") {
        return undefined;
    }
    return body.value.responseBodyType;
}

function unwrapToNamed(typeReference: FernIr.TypeReference): FernIr.DeclaredTypeName | undefined {
    switch (typeReference.type) {
        case "named":
            return typeReference;
        case "container":
            switch (typeReference.container.type) {
                case "list":
                    return unwrapToNamed(typeReference.container.list);
                case "set":
                    return unwrapToNamed(typeReference.container.set);
                case "optional":
                    return unwrapToNamed(typeReference.container.optional);
                case "nullable":
                    return unwrapToNamed(typeReference.container.nullable);
                default:
                    return undefined;
            }
        default:
            return undefined;
    }
}

function getObjectDeclaration(
    typeReference: FernIr.TypeReference,
    types: Record<string, FernIr.TypeDeclaration>
): FernIr.ObjectTypeDeclaration | undefined {
    const named = unwrapToNamed(typeReference);
    if (named == null) {
        return undefined;
    }
    const declaration = types[named.typeId];
    if (declaration == null) {
        return undefined;
    }
    if (declaration.shape.type === "object") {
        return declaration.shape;
    }
    if (declaration.shape.type === "alias") {
        return getObjectDeclaration(declaration.shape.aliasOf, types);
    }
    return undefined;
}

function getScalarFieldNames(
    typeReference: FernIr.TypeReference,
    types: Record<string, FernIr.TypeDeclaration>,
    max: number
): string[] {
    const object = getObjectDeclaration(typeReference, types);
    if (object == null) {
        return [];
    }
    const names: string[] = [];
    for (const property of [...(object.extendedProperties ?? []), ...object.properties]) {
        if (getObjectDeclaration(property.valueType, types) == null) {
            names.push(propertySnake(property.name));
            if (names.length >= max) {
                break;
            }
        }
    }
    return names;
}

function isConnection(
    typeReference: FernIr.TypeReference,
    types: Record<string, FernIr.TypeDeclaration>
): boolean {
    const object = getObjectDeclaration(typeReference, types);
    if (object == null) {
        return false;
    }
    const properties = [...(object.extendedProperties ?? []), ...object.properties];
    const pageInfoProperty = properties.find((property) => propertyWireValue(property.name) === "pageInfo");
    if (pageInfoProperty == null) {
        return false;
    }
    const pageInfo = getObjectDeclaration(pageInfoProperty.valueType, types);
    if (pageInfo == null) {
        return false;
    }
    const pageInfoWireNames = new Set(
        [...(pageInfo.extendedProperties ?? []), ...pageInfo.properties].map((property) => propertyWireValue(property.name))
    );
    return pageInfoWireNames.has("hasNextPage") && pageInfoWireNames.has("endCursor");
}

function selectionLambda(typeReference: FernIr.TypeReference | undefined, types: Record<string, FernIr.TypeDeclaration>): string {
    const fields = typeReference != null ? getScalarFieldNames(typeReference, types, 2) : [];
    const chain = fields.length > 0 ? fields.map((field) => `.${field}()`).join("") : ".all_()";
    return `lambda x: x${chain}`;
}

function section(name: string, description: string, code: string): FernGeneratorCli.CustomSection {
    return {
        name,
        language: FernGeneratorCli.Language.Python,
        content: `${description}\n\n\`\`\`python\n${code}\n\`\`\``
    };
}

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

    const types = ir.types;
    const queryEndpoint = graphqlEndpoints.find((endpoint) => operationType(endpoint) === "QUERY");
    const mutationEndpoint = graphqlEndpoints.find((endpoint) => operationType(endpoint) === "MUTATION");
    const subscriptionEndpoint = graphqlEndpoints.find((endpoint) => operationType(endpoint) === "SUBSCRIPTION");
    const connectionEndpoint = graphqlEndpoints.find((endpoint) => {
        if (operationType(endpoint) !== "QUERY") {
            return false;
        }
        const response = responseType(endpoint);
        return response != null && isConnection(response, types);
    });

    const primary = queryEndpoint ?? mutationEndpoint;
    const sections: FernGeneratorCli.CustomSection[] = [];

    if (primary != null) {
        const group = queryEndpoint != null ? "query" : "mutation";
        sections.push(
            section(
                "GraphQL Field Selection",
                "Operations take a fluent **field selection** — chain field methods on the builder to choose " +
                    "exactly which fields come back in a single GraphQL document (deeply, in one request). Omit " +
                    "`selection` to fetch a safe default. Nested objects take their own selection lambda; use " +
                    "`.all_()` to select every scalar at a level.",
                `data = client.${group}.${methodName(primary)}(selection=${selectionLambda(responseType(primary), types)})`
            )
        );
    }

    if (connectionEndpoint != null) {
        sections.push(
            section(
                "GraphQL Pagination",
                "Relay connections expose auto-pagination under `paginate`. The returned pager follows " +
                    "`pageInfo.endCursor` across pages, fetching lazily as you iterate, and yields each node. Use " +
                    "the async client for an `async for` pager.",
                `for node in client.query.paginate.${methodName(connectionEndpoint)}(first=50):\n    print(node)`
            )
        );
    }

    if (subscriptionEndpoint != null) {
        sections.push(
            section(
                "GraphQL Subscriptions",
                "Subscription operations stream over a WebSocket (`graphql-transport-ws`) on the **async** client " +
                    "and return an `AsyncIterator` of events typed to your selection. Breaking out of the loop tears " +
                    "down the socket.",
                `async for event in async_client.subscription.${methodName(subscriptionEndpoint)}(\n` +
                    `    selection=${selectionLambda(responseType(subscriptionEndpoint), types)},\n` +
                    `):\n    print(event)`
            )
        );
    }

    if (primary != null) {
        const group = queryEndpoint != null ? "query" : "mutation";
        sections.push(
            section(
                "Handling GraphQL Errors",
                "GraphQL is a partial-success protocol: a response can carry both data and errors. Operations raise " +
                    "a `GraphqlError` (carrying `.errors` and any partial `.data`) when the response contains errors.",
                "from .core.graphql import GraphqlError\n\n" +
                    "try:\n" +
                    `    data = client.${group}.${methodName(primary)}()\n` +
                    "except GraphqlError as error:\n" +
                    "    print(error.errors)  # operation errors\n" +
                    "    print(error.data)  # partial data, if any"
            )
        );

        sections.push(
            section(
                "Raw GraphQL Queries",
                "Power users can send a hand-written GraphQL document with `client.raw`, bypassing the typed " +
                    "operation surface. It reuses the SDK's auth, retries, and base URL, and returns the response " +
                    "`data` (or the full `{data, errors}` envelope with `throw_on_error=False`).",
                'data = client.raw(\n' +
                    '    "query ($id: ID!) { order(id: $id) { id } }",\n' +
                    '    variables={"id": "order-123"},\n' +
                    ")"
            )
        );
    }

    return sections;
}
