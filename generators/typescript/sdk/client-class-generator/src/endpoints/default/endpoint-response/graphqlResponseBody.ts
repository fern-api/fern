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
 * `{ data: { [operationName]: <value> }, errors?: [...] }`, so we unwrap `.data?.[operationName]`.
 * Optional chaining is used so that a null/absent `data` (e.g. a pure-error GraphQL response that
 * slipped past the error guard) yields `undefined` rather than throwing a `TypeError`.
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
    // unwrapping `.data?.[operationName]`. The downstream deserializer re-applies the correct output type.
    return ts.factory.createElementAccessChain(
        ts.factory.createPropertyAccessChain(
            ts.factory.createParenthesizedExpression(
                ts.factory.createAsExpression(
                    referenceToRawBody,
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                )
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier("data")
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createStringLiteral(graphqlTransport.operationName)
    );
}

/**
 * GraphQL servers respond with HTTP 200 even when an operation fails, returning
 * `{ data: null, errors: [...] }` (or partial data + errors). For a GraphQL endpoint this returns
 * the statements that must run at the top of the success (`_response.ok`) branch, before the data is
 * unwrapped/returned: a check for a non-empty `errors` array that surfaces the failure through the
 * SDK's normal error channel via `buildErrorHandlerStatements` (provided by the caller so throwing vs
 * non-throwing behavior stays consistent with that generator). The callback receives an expression
 * referencing the full GraphQL body (cast to `any`) so it can populate the error/result body.
 *
 * For non-GraphQL endpoints this returns `[]`, keeping output byte-identical.
 */
export function getGraphqlErrorGuardStatements({
    endpoint,
    referenceToRawResponseBody,
    buildErrorHandlerStatements
}: {
    endpoint: FernIr.HttpEndpoint;
    referenceToRawResponseBody: ts.Expression;
    buildErrorHandlerStatements: (referenceToGraphqlBody: ts.Expression) => ts.Statement[];
}): ts.Statement[] {
    const graphqlTransport = getGraphqlTransport(endpoint);
    if (graphqlTransport == null) {
        return [];
    }

    const graphqlBodyIdentifier = ts.factory.createIdentifier(GRAPHQL_BODY_VARIABLE_NAME);

    // const _gqlBody = _response.body as any;
    const declareGraphqlBody = ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration(
                    graphqlBodyIdentifier,
                    undefined,
                    undefined,
                    ts.factory.createAsExpression(
                        referenceToRawResponseBody,
                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    )
                )
            ],
            ts.NodeFlags.Const
        )
    );

    // _gqlBody?.errors
    const errorsAccess = ts.factory.createPropertyAccessChain(
        graphqlBodyIdentifier,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier("errors")
    );

    // _gqlBody?.errors != null && _gqlBody.errors.length > 0
    const guardCondition = ts.factory.createBinaryExpression(
        ts.factory.createBinaryExpression(
            errorsAccess,
            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            ts.factory.createNull()
        ),
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(graphqlBodyIdentifier, ts.factory.createIdentifier("errors")),
                ts.factory.createIdentifier("length")
            ),
            ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
            ts.factory.createNumericLiteral("0")
        )
    );

    return [
        declareGraphqlBody,
        ts.factory.createIfStatement(
            guardCondition,
            ts.factory.createBlock(buildErrorHandlerStatements(graphqlBodyIdentifier), true)
        )
    ];
}

const GRAPHQL_BODY_VARIABLE_NAME = "_gqlBody";
