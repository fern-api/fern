import { FernIr } from "@fern-fern/ir-sdk";

import {
    GraphqlTransport,
    getGraphqlResponseBodyType,
    getGraphqlTransport
} from "../endpoints/default/endpoint-response/graphqlResponseBody.js";

/**
 * Relay connection metadata for a GraphQL query endpoint, extracted structurally (PRD §10.3). Drives
 * the generated `paginate.<field>(...)` auto-iterator: the node type is what the caller selects and what
 * the iterator yields; `nodesAccessor` is how each page's nodes are reached on the connection object.
 */
export interface GraphqlConnectionInfo {
    /** The node type — the caller selects on it and the iterator yields `Result<Node, S>`. */
    nodeType: FernIr.TypeReference;
    /** How a page's nodes are reached on the connection: `edges[].node` or a direct `nodes` list. */
    nodesAccessor: "edges" | "nodes";
}

function unwrapToNamed(typeReference: FernIr.TypeReference): FernIr.DeclaredTypeName | undefined {
    return typeReference._visit<FernIr.DeclaredTypeName | undefined>({
        container: (container) =>
            container._visit<FernIr.DeclaredTypeName | undefined>({
                list: (inner) => unwrapToNamed(inner),
                set: (inner) => unwrapToNamed(inner),
                optional: (inner) => unwrapToNamed(inner),
                nullable: (inner) => unwrapToNamed(inner),
                map: () => undefined,
                literal: () => undefined,
                _other: () => undefined
            }),
        named: (named) => named,
        primitive: () => undefined,
        unknown: () => undefined,
        _other: () => undefined
    });
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
    return declaration.shape._visit<FernIr.ObjectTypeDeclaration | undefined>({
        object: (object) => object,
        alias: (alias) => getObjectDeclaration(alias.aliasOf, types),
        union: () => undefined,
        undiscriminatedUnion: () => undefined,
        enum: () => undefined,
        _other: () => undefined
    });
}

function getWireValue(name: FernIr.NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

/**
 * Returns up to `max` scalar-leaf field wire names of the object `typeReference` resolves to — fields
 * whose value is a scalar/enum/list-of-scalars (not a selectable object). Used to build representative,
 * valid field selections for documentation examples. Empty when the type has no scalar leaves.
 */
export function getScalarFieldNames(
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
            names.push(getWireValue(property.name));
            if (names.length >= max) {
                break;
            }
        }
    }
    return names;
}

function findProperty(object: FernIr.ObjectTypeDeclaration, wireValue: string): FernIr.ObjectProperty | undefined {
    return [...(object.extendedProperties ?? []), ...object.properties].find(
        (property) => getWireValue(property.name) === wireValue
    );
}

/** A page-info object qualifies when it carries both `hasNextPage` and `endCursor` (forward cursoring). */
function isPageInfo(object: FernIr.ObjectTypeDeclaration): boolean {
    return findProperty(object, "hasNextPage") != null && findProperty(object, "endCursor") != null;
}

/**
 * If `object` is a Relay connection (a `pageInfo` with `hasNextPage`+`endCursor`, plus `edges[].node`
 * or `nodes`), returns its node type and how nodes are reached; otherwise `undefined`.
 */
function connectionNodeInfo(
    object: FernIr.ObjectTypeDeclaration,
    types: Record<string, FernIr.TypeDeclaration>
): { nodeType: FernIr.TypeReference; nodesAccessor: "edges" | "nodes" } | undefined {
    const pageInfoProperty = findProperty(object, "pageInfo");
    const pageInfo = pageInfoProperty != null ? getObjectDeclaration(pageInfoProperty.valueType, types) : undefined;
    if (pageInfo == null || !isPageInfo(pageInfo)) {
        return undefined;
    }
    const edgesProperty = findProperty(object, "edges");
    if (edgesProperty != null) {
        const edge = getObjectDeclaration(edgesProperty.valueType, types);
        const nodeProperty = edge != null ? findProperty(edge, "node") : undefined;
        if (nodeProperty != null) {
            return { nodeType: nodeProperty.valueType, nodesAccessor: "edges" };
        }
    }
    const nodesProperty = findProperty(object, "nodes");
    if (nodesProperty != null) {
        return { nodeType: nodesProperty.valueType, nodesAccessor: "nodes" };
    }
    return undefined;
}

function acceptsAfterArgument(endpoint: FernIr.HttpEndpoint, transport: GraphqlTransport): boolean {
    if ((transport.arguments ?? "").includes("after:")) {
        return true;
    }
    const body = endpoint.requestBody;
    if (body == null) {
        return false;
    }
    return body._visit<boolean>({
        inlinedRequestBody: (inlined) => inlined.properties.some((property) => getWireValue(property.name) === "after"),
        reference: () => false,
        fileUpload: () => false,
        bytes: () => false,
        _other: () => false
    });
}

/**
 * Detects whether a GraphQL endpoint's response is a Relay connection and, if so, returns the metadata
 * needed to generate its auto-pagination iterator. A connection is an object with a `pageInfo`
 * (`hasNextPage` + `endCursor`) and either `edges[].node` or a `nodes` list; the endpoint must accept an
 * `after` cursor argument. Returns `undefined` for non-connection (or non-GraphQL) endpoints.
 */
export function detectGraphqlConnection(
    endpoint: FernIr.HttpEndpoint,
    types: Record<string, FernIr.TypeDeclaration>
): GraphqlConnectionInfo | undefined {
    const transport = getGraphqlTransport(endpoint);
    if (transport == null || !acceptsAfterArgument(endpoint, transport)) {
        return undefined;
    }

    const responseType = getGraphqlResponseBodyType(endpoint);
    if (responseType == null) {
        return undefined;
    }
    const connection = getObjectDeclaration(responseType, types);
    if (connection == null) {
        return undefined;
    }
    return connectionNodeInfo(connection, types);
}

/**
 * A Relay connection reachable through a chain of single-valued object fields under a NO-ARG root field
 * (e.g. `viewer.posts`, `site.products`). Generated as `paginate.<root><Path>(args, selection)`, where
 * `args` are the connection field's own GraphQL arguments (`first`/`after`/filters).
 */
export interface NestedGraphqlConnection {
    /** Field path (wire names) from the root field's response down to the connection field. */
    path: string[];
    /** Name of the GraphQL type that owns the connection field — used to name its `<Parent><Field>Args`. */
    parentTypeName: FernIr.DeclaredTypeName["name"];
    /** Wire name of the connection field (last path segment). */
    connectionFieldName: string;
    nodeType: FernIr.TypeReference;
    nodesAccessor: "edges" | "nodes";
}

/**
 * Walks a NO-ARG root field's response type for Relay connections reachable through single-valued object
 * fields, so they can be auto-paginated (e.g. BigCommerce's `site.products`). Bounded by `maxDepth` and
 * cycle-protected. A connection field qualifies only if it accepts an `after` argument (checked via
 * `fieldHasAfterArg`, since cursor pagination needs it). Does not recurse into connections or lists.
 */
export function findNestedGraphqlConnections({
    endpoint,
    types,
    fieldHasAfterArg,
    maxDepth = 2
}: {
    endpoint: FernIr.HttpEndpoint;
    types: Record<string, FernIr.TypeDeclaration>;
    fieldHasAfterArg: (parentTypeId: string, fieldWireName: string) => boolean;
    maxDepth?: number;
}): NestedGraphqlConnection[] {
    // Only no-arg root fields: their generated method takes `selection` as the first parameter, so the
    // pagination helper can call `this.<root>(drillSelection)` without threading root arguments.
    if (getGraphqlTransport(endpoint) == null || endpoint.requestBody != null) {
        return [];
    }
    const responseType = getGraphqlResponseBodyType(endpoint);
    const responseObject = responseType != null ? getObjectDeclaration(responseType, types) : undefined;
    const responseNamed = responseType != null ? unwrapToNamed(responseType) : undefined;
    if (responseObject == null || responseNamed == null) {
        return [];
    }

    const found: NestedGraphqlConnection[] = [];
    const visit = (
        object: FernIr.ObjectTypeDeclaration,
        typeId: string,
        typeName: FernIr.DeclaredTypeName["name"],
        path: string[],
        visited: ReadonlySet<string>
    ): void => {
        if (path.length >= maxDepth || visited.has(typeId)) {
            return;
        }
        const nextVisited = new Set(visited).add(typeId);
        for (const property of [...(object.extendedProperties ?? []), ...object.properties]) {
            const fieldWire = getWireValue(property.name);
            const fieldObject = getObjectDeclaration(property.valueType, types);
            if (fieldObject == null) {
                continue;
            }
            const nodeInfo = connectionNodeInfo(fieldObject, types);
            if (nodeInfo != null) {
                if (fieldHasAfterArg(typeId, fieldWire)) {
                    found.push({
                        path: [...path, fieldWire],
                        parentTypeName: typeName,
                        connectionFieldName: fieldWire,
                        nodeType: nodeInfo.nodeType,
                        nodesAccessor: nodeInfo.nodesAccessor
                    });
                }
                // Do not recurse into a connection's own subtree.
                continue;
            }
            const fieldNamed = unwrapToNamed(property.valueType);
            if (fieldNamed != null) {
                visit(fieldObject, fieldNamed.typeId, fieldNamed.name, [...path, fieldWire], nextVisited);
            }
        }
    };

    visit(responseObject, responseNamed.typeId, responseNamed.name, [], new Set());
    return found;
}
