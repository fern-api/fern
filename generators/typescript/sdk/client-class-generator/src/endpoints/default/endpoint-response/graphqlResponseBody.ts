import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

/**
 * Name of the method-level type parameter that captures the caller's GraphQL field selection literal,
 * e.g. `user<S extends UserSelect>(...)`. The selection parameter is typed `S` and the result data
 * type is `core.Result<<Model>, S>`, so the result is narrowed to exactly the selected fields. Shared
 * between the request (which declares the type parameter + types the `selection` param) and the
 * response (which builds the `Result<Model, S>` return type) so they stay in lockstep.
 */
export const GRAPHQL_SELECTION_TYPE_PARAMETER_NAME = "S";

/**
 * Transport-level metadata for a GraphQL endpoint. Declared locally because the
 * published `@fern-fern/ir-sdk` types this generator compiles against may predate the
 * `graphql` variant of `Transport`; at runtime the IR JSON carries these fields. The
 * shape mirrors `FernIr.GraphqlTransport` in `@fern-api/ir-sdk` (IR >= 67.7.0).
 */
export interface GraphqlTransport {
    query: string;
    operationName: string;
    /** "QUERY" | "MUTATION" | "SUBSCRIPTION". May be absent on older IRs. */
    operationType?: string;
    /** GraphQL variable definitions without parentheses, e.g. "$id: ID!". May be absent on older IRs. */
    variableDefinitions?: string;
    /** Root-field argument passthrough including parentheses, e.g. "(id: $id)". May be absent on older IRs. */
    arguments?: string;
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
    return {
        query: transport.query,
        operationName: transport.operationName,
        operationType: readOptionalStringField(transport, "operationType"),
        variableDefinitions: readOptionalStringField(transport, "variableDefinitions"),
        arguments: readOptionalStringField(transport, "arguments")
    };
}

/**
 * True when the endpoint is a GraphQL subscription. Subscriptions stream `Result<Model, S>` events and
 * are intentionally NOT wrapped in the `{ data, errors }` envelope (the envelope is for the
 * request/response query+mutation path; subscription error events are a separate channel).
 */
export function isGraphqlSubscription(endpoint: FernIr.HttpEndpoint): boolean {
    const graphqlTransport = getGraphqlTransport(endpoint);
    return graphqlTransport?.operationType === "SUBSCRIPTION";
}

function hasGraphqlFields(transport: object): transport is GraphqlTransport {
    if (!("query" in transport) || !("operationName" in transport)) {
        return false;
    }
    return typeof transport.query === "string" && typeof transport.operationName === "string";
}

/**
 * Reads an optional string field from the transport object structurally. The published IR types
 * this generator compiles against may predate `operationType`/`variableDefinitions`/`arguments`,
 * but the IR JSON passes them through (parsed with `unrecognizedObjectKeys: "passthrough"`).
 */
function readOptionalStringField(transport: object, key: string): string | undefined {
    if (!(key in transport)) {
        return undefined;
    }
    const value = (transport as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
}

/**
 * Returns the JSON response body's value type for a GraphQL endpoint, used to type the runtime
 * `select` argument against the operation's return type. Returns `undefined` for non-GraphQL
 * endpoints or non-JSON / absent response bodies.
 */
export function getGraphqlResponseBodyType(endpoint: FernIr.HttpEndpoint): FernIr.TypeReference | undefined {
    if (getGraphqlTransport(endpoint) == null) {
        return undefined;
    }
    const body = endpoint.response?.body;
    if (body == null) {
        return undefined;
    }
    return FernIr.HttpResponseBody._visit<FernIr.TypeReference | undefined>(body, {
        json: (json) =>
            FernIr.JsonResponse._visit<FernIr.TypeReference | undefined>(json, {
                response: (response) => response.responseBodyType,
                nestedPropertyAsResponse: (response) => response.responseBodyType,
                _other: () => undefined
            }),
        fileDownload: () => undefined,
        text: () => undefined,
        bytes: () => undefined,
        streaming: () => undefined,
        streamParameter: () => undefined,
        _other: () => undefined
    });
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
 * Per-call request option that opts a GraphQL endpoint back into throw-on-error behavior. When
 * `requestOptions.throwOnError` is `true`, a non-empty GraphQL `errors[]` throws {@link GraphqlError}
 * instead of being returned on the `{ data, errors }` envelope. Default (`false`/absent) returns the
 * envelope so callers can read partial `data` alongside `errors` without a try/catch.
 */
export const GRAPHQL_THROW_ON_ERROR_REQUEST_OPTION = "throwOnError";

/**
 * GraphQL servers respond with HTTP 200 even when an operation fails, returning
 * `{ data: null, errors: [...] }` (or partial data + errors). For a GraphQL endpoint this returns the
 * statements that declare the GraphQL body and, when the caller opted in via
 * `requestOptions.throwOnError`, throw on a non-empty `errors[]` (restoring the legacy behavior). By
 * default no throw is emitted — operation errors are surfaced on the returned `{ data, errors }`
 * envelope (see {@link buildGraphqlEnvelopeProperties}).
 *
 * The `buildThrowStatements` callback receives an expression referencing the full GraphQL body (cast
 * to `any`) so the caller can construct the appropriate throw (throwing vs non-throwing generators
 * differ). For non-GraphQL endpoints this returns `[]`, keeping output byte-identical.
 */
export function getGraphqlErrorGuardStatements({
    endpoint,
    referenceToRawResponseBody,
    referenceToRequestOptions,
    buildThrowStatements
}: {
    endpoint: FernIr.HttpEndpoint;
    referenceToRawResponseBody: ts.Expression;
    referenceToRequestOptions: ts.Expression;
    buildThrowStatements: (referenceToGraphqlBody: ts.Expression) => ts.Statement[];
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

    // requestOptions?.throwOnError && _gqlBody?.errors != null && _gqlBody.errors.length > 0
    const guardCondition = ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessChain(
            referenceToRequestOptions,
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(GRAPHQL_THROW_ON_ERROR_REQUEST_OPTION)
        ),
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        buildHasErrorsCondition(graphqlBodyIdentifier)
    );

    return [
        declareGraphqlBody,
        ts.factory.createIfStatement(
            guardCondition,
            ts.factory.createBlock(buildThrowStatements(graphqlBodyIdentifier), true)
        )
    ];
}

/** `<gqlBody>?.errors != null && <gqlBody>.errors.length > 0` */
function buildHasErrorsCondition(graphqlBodyIdentifier: ts.Identifier): ts.Expression {
    const errorsAccess = ts.factory.createPropertyAccessChain(
        graphqlBodyIdentifier,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier("errors")
    );
    return ts.factory.createBinaryExpression(
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
}

/**
 * For a GraphQL endpoint, wraps the operation's success data type in the `{ data, errors }` envelope
 * `core.GraphqlResponse<<dataType>>`. `dataType` is the current narrowed/unwrapped data type (e.g.
 * `core.Result<Model, S> | undefined`). For non-GraphQL endpoints the type is returned unchanged,
 * keeping output byte-identical.
 */
export function maybeWrapGraphqlResponseType({
    endpoint,
    dataType,
    context
}: {
    endpoint: FernIr.HttpEndpoint;
    dataType: ts.TypeNode;
    context: FileContext;
}): ts.TypeNode {
    if (getGraphqlTransport(endpoint) == null || isGraphqlSubscription(endpoint)) {
        return dataType;
    }
    return context.coreUtilities.graphqlUtils.GraphqlResponse._getReferenceToType(dataType);
}

/**
 * Builds the `{ data, errors }` envelope object literal for a GraphQL endpoint's success response.
 * `data` is the deserialized + selection-narrowed value (the same expression non-graphql endpoints use
 * directly as `data`); `errors` is `<gqlBody>?.errors`, typed `GraphqlResponseError[] | undefined`.
 * The GraphQL body variable (`_gqlBody`) is declared by {@link getGraphqlErrorGuardStatements}, which
 * always runs first in the success branch for GraphQL endpoints.
 */
export function buildGraphqlEnvelope(dataExpression: ts.Expression): ts.Expression {
    return ts.factory.createObjectLiteralExpression(
        [
            ts.factory.createPropertyAssignment(ts.factory.createIdentifier("data"), dataExpression),
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("errors"),
                ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier(GRAPHQL_BODY_VARIABLE_NAME),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier("errors")
                )
            )
        ],
        false
    );
}

const GRAPHQL_BODY_VARIABLE_NAME = "_gqlBody";

/**
 * For a GraphQL endpoint, wraps the operation's success data type `<Model>` in
 * `core.Result<<Model>, S>` so the result is narrowed to exactly the caller's selection (unselected
 * fields are absent). The outer optionality of the model type is preserved: a `<Model> | undefined`
 * return becomes `core.Result<<Model>, S> | undefined`. For non-GraphQL endpoints the success type is
 * returned unchanged, keeping output byte-identical.
 *
 * `S` is the method-level type parameter declared by the request builder (see
 * {@link GRAPHQL_SELECTION_TYPE_PARAMETER_NAME}); this only references it by name, so it must only be
 * called for types that appear in a method whose signature declares that type parameter.
 */
export function maybeWrapGraphqlResultType({
    endpoint,
    successType,
    context
}: {
    endpoint: FernIr.HttpEndpoint;
    successType: ts.TypeNode;
    context: FileContext;
}): ts.TypeNode {
    if (getGraphqlTransport(endpoint) == null) {
        return successType;
    }
    const selectionTypeReference = ts.factory.createTypeReferenceNode(GRAPHQL_SELECTION_TYPE_PARAMETER_NAME);
    return wrapInnermostModel(successType, (model) =>
        context.coreUtilities.graphqlUtils.Result._getReferenceToType(model, selectionTypeReference)
    );
}

/**
 * Applies `wrap` to the non-`undefined` model member of `successType`, preserving an outer
 * `| undefined` (the convention for nullable GraphQL operation results, e.g. `User | undefined`). A
 * bare model type is wrapped directly. Other union shapes are wrapped as a whole (defensive; GraphQL
 * operation success types are either a bare model or `Model | undefined`).
 */
function wrapInnermostModel(successType: ts.TypeNode, wrap: (model: ts.TypeNode) => ts.TypeNode): ts.TypeNode {
    if (!ts.isUnionTypeNode(successType)) {
        return wrap(successType);
    }
    const undefinedMembers = successType.types.filter(isUndefinedKeyword);
    const modelMembers = successType.types.filter((member) => !isUndefinedKeyword(member));
    if (undefinedMembers.length === 0 || modelMembers.length !== 1) {
        // Not the simple `Model | undefined` shape; wrap the whole union to stay sound.
        return wrap(successType);
    }
    const modelMember = modelMembers[0];
    if (modelMember == null) {
        return wrap(successType);
    }
    return ts.factory.createUnionTypeNode([wrap(modelMember), ...undefinedMembers]);
}

function isUndefinedKeyword(node: ts.TypeNode): boolean {
    return node.kind === ts.SyntaxKind.UndefinedKeyword;
}

/**
 * For a GraphQL endpoint, asserts the deserialized success value (typed as the full `<Model>`) to the
 * selection-inferred `core.Result<<Model>, S>` so it satisfies the method's narrowed return type. The
 * narrowing is purely compile-time: the runtime always deserializes the full model shape (the server
 * only returns the selected fields, so the unselected ones are absent at runtime, matching the type).
 * The assertion goes through `unknown` because the full model and the narrowed result do not
 * sufficiently overlap for a direct `as`. For non-GraphQL endpoints the expression is returned
 * unchanged, keeping output byte-identical.
 *
 * `modelType` is the unwrapped success model type (without the outer `| undefined`); `S` is referenced
 * by name (see {@link GRAPHQL_SELECTION_TYPE_PARAMETER_NAME}).
 */
export function maybeCastGraphqlResultValue({
    endpoint,
    expression,
    modelType,
    context
}: {
    endpoint: FernIr.HttpEndpoint;
    expression: ts.Expression;
    modelType: ts.TypeNode;
    context: FileContext;
}): ts.Expression {
    if (getGraphqlTransport(endpoint) == null) {
        return expression;
    }
    const unwrappedModel = stripOuterUndefined(modelType);
    const resultType = context.coreUtilities.graphqlUtils.Result._getReferenceToType(
        unwrappedModel,
        ts.factory.createTypeReferenceNode(GRAPHQL_SELECTION_TYPE_PARAMETER_NAME)
    );
    return ts.factory.createAsExpression(
        ts.factory.createAsExpression(expression, ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)),
        resultType
    );
}

/** Returns the single non-`undefined` member of a `Model | undefined` union, or the type unchanged. */
function stripOuterUndefined(typeNode: ts.TypeNode): ts.TypeNode {
    if (!ts.isUnionTypeNode(typeNode)) {
        return typeNode;
    }
    const modelMembers = typeNode.types.filter((member) => !isUndefinedKeyword(member));
    if (modelMembers.length === 1 && modelMembers[0] != null) {
        return modelMembers[0];
    }
    return typeNode;
}
