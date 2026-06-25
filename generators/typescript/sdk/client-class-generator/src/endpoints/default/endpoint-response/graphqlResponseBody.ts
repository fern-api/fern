import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

/**
 * Transport-level metadata for a GraphQL endpoint. Declared locally because the
 * published `@fern-fern/ir-sdk` types this generator compiles against may predate the
 * `graphql` variant of `Transport`; at runtime the IR JSON carries these fields. The
 * shape mirrors `FernIr.GraphqlTransport` in `@fern-api/ir-sdk` (IR >= 67.7.0).
 */
export interface GraphqlTransport {
    query: string;
    operationName: string;
}

/**
 * Returns the GraphQL transport metadata when the endpoint uses the `graphql` transport,
 * or `undefined` for HTTP/gRPC endpoints. Reads the transport discriminant structurally so
 * it works regardless of whether the compiled-against IR types include the `graphql` variant.
 */
export function getGraphqlTransport(endpoint: FernIr.HttpEndpoint): GraphqlTransport | undefined {
    const transport = endpoint.transport;
    if (transport == null) {
        return undefined;
    }
    const discriminant: string = transport.type;
    if (discriminant !== "graphql") {
        return undefined;
    }
    if (!hasGraphqlFields(transport)) {
        return undefined;
    }
    return { query: transport.query, operationName: transport.operationName };
}

function hasGraphqlFields(transport: object): transport is GraphqlTransport {
    if (!("query" in transport) || !("operationName" in transport)) {
        return false;
    }
    return typeof transport.query === "string" && typeof transport.operationName === "string";
}

/**
 * Given a reference to the raw successful JSON response body, returns the expression that should be
 * fed to the response deserializer. For GraphQL endpoints, the HTTP body is
 * `{ data: { [operationName]: <value> }, errors?: [...] }`, so we unwrap `.data[operationName]`.
 * For all other endpoints, the raw body reference is returned unchanged.
 */
export function maybeUnwrapGraphqlResponseBody({
    endpoint,
    referenceToRawBody
}: {
    endpoint: FernIr.HttpEndpoint;
    referenceToRawBody: ts.Expression;
}): ts.Expression {
    const graphqlTransport = getGraphqlTransport(endpoint);
    if (graphqlTransport == null) {
        return referenceToRawBody;
    }
    // The raw response body is typed `unknown` (the fetcher does not know the wire shape). A GraphQL
    // success body is `{ data: { [operationName]: <value> }, errors?: [...] }`, so cast to `any` before
    // unwrapping `.data[operationName]`. The downstream deserializer re-applies the correct output type.
    return ts.factory.createElementAccessExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createParenthesizedExpression(
                ts.factory.createAsExpression(
                    referenceToRawBody,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ),
            ts.factory.createIdentifier("data")
        ),
        ts.factory.createStringLiteral(graphqlTransport.operationName)
    );
}
