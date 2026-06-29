import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    Fetcher,
    GetReferenceOpts,
    getParameterNameForPositionalPathParameter,
    getPropertyKey,
    getTextOfTsNode,
    PackageId
} from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, TypeParameterDeclarationStructure, ts } from "ts-morph";
import {
    GRAPHQL_SELECTION_TYPE_PARAMETER_NAME,
    GraphqlTransport,
    getGraphqlResponseBodyType,
    getGraphqlTransport
} from "../endpoints/default/endpoint-response/graphqlResponseBody.js";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams.js";
import { generateHeaders, HEADERS_VAR_NAME } from "../endpoints/utils/generateHeaders.js";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter.js";
import { RequestParameter } from "../request-parameter/RequestParameter.js";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter.js";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest.js";

export declare namespace GeneratedDefaultEndpointRequest {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        packageId: PackageId;
        sdkRequest: FernIr.SdkRequest | undefined;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        retainOriginalCasing: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        caseConverter: CaseConverter;
    }
}

interface LiteralPropertyValue {
    propertyWireKey: string;
    propertyValue: boolean | string;
}

/**
 * Name of the dedicated GraphQL field-selection parameter appended to every GraphQL operation's
 * method signature. For operations with arguments it is the second parameter (after the request/args
 * wrapper); for no-argument operations it is the sole parameter. It is optional and defaults to the
 * operation return type's safe-scalar `<Name>DefaultSelection` const so a caller can omit it.
 */
const GRAPHQL_SELECTION_PARAMETER_NAME = "selection";

/**
 * Name of the IIFE parameter holding the `buildGraphqlQuery` result (`{ query, variables }`) so the
 * built query string and any nested-`$args` variable values can both be threaded into the request
 * envelope from a single call.
 */
const GRAPHQL_RESULT_VARIABLE_NAME = "_gqlQuery";

export class GeneratedDefaultEndpointRequest implements GeneratedEndpointRequest {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly packageId: PackageId;
    private readonly requestParameter: RequestParameter | undefined;
    private queryParams: GeneratedQueryParams | undefined;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;
    private readonly requestBody:
        | FernIr.HttpRequestBody.InlinedRequestBody
        | FernIr.HttpRequestBody.Reference
        | undefined;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly retainOriginalCasing: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly case: CaseConverter;

    constructor({
        ir,
        packageId,
        sdkRequest,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        retainOriginalCasing,
        parameterNaming,
        caseConverter
    }: GeneratedDefaultEndpointRequest.Init) {
        this.ir = ir;
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.retainOriginalCasing = retainOriginalCasing;
        this.parameterNaming = parameterNaming;
        this.case = caseConverter;
        this.requestParameter =
            sdkRequest != null
                ? FernIr.SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) => {
                          if (requestBodyReference.type === "bytes") {
                              throw new Error("Bytes request is not supported");
                          }
                          return new RequestBodyParameter({
                              packageId,
                              requestBodyReference,
                              service,
                              endpoint,
                              sdkRequest,
                              caseConverter
                          });
                      },
                      wrapper: () =>
                          new RequestWrapperParameter({ packageId, service, endpoint, sdkRequest, caseConverter }),
                      _other: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      }
                  })
                : undefined;
    }

    public getRequestParameter(context: FileContext): ts.TypeNode | undefined {
        return this.requestParameter?.getType(context);
    }

    public getEndpointParameters(
        context: FileContext
    ): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing,
                    parameterNaming: this.parameterNaming,
                    caseConverter: this.case
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
                docs: pathParameter.docs
            });
        }
        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        // For GraphQL operations, append a dedicated `selection` parameter so callers choose which
        // fields to return. It comes after the args/request wrapper (if any), or is the sole parameter
        // for no-argument operations: `client.query.site(selection)`. The parameter is optional —
        // omitting it falls back to the return type's safe-scalar `<Name>DefaultSelection` const.
        if (getGraphqlTransport(this.endpoint) != null) {
            parameters.push(this.getGraphqlSelectionParameter(context));
        }
        return parameters;
    }

    private getGraphqlSelectionParameter(
        context: FileContext
    ): OptionalKind<ParameterDeclarationStructure & { docs?: string }> {
        return {
            name: GRAPHQL_SELECTION_PARAMETER_NAME,
            // Typed as the method-level generic `S` (constrained to the `<Name>Select` interface via
            // `getTypeParameters`) so the caller's exact selection literal is captured for result-type
            // inference, while autocomplete + field checking still come from the constraint.
            type: GRAPHQL_SELECTION_TYPE_PARAMETER_NAME,
            // Optional with a default: when omitted, `S` defaults to `typeof <Name>DefaultSelection`
            // (see `getTypeParameters`) so the result narrows precisely to the safe-scalar default, and
            // the runtime value defaults to that same const so the emitted query selects those fields.
            // The `as S` cast is required because `S` is a generic and the const is a concrete literal.
            hasQuestionToken: false,
            initializer: this.getGraphqlDefaultSelectionInitializer(context),
            docs: "GraphQL field selection — choose which fields to return. Defaults to all scalar fields."
        };
    }

    /**
     * Initializer expression for the optional `selection` parameter: `<Name>DefaultSelection as S`.
     * Returns `undefined` (parameter stays required) only when the response type has no resolvable
     * Select/default const — i.e. a non-named / loose `core.GraphqlSelection` response, which has no
     * safe-scalar default to fall back to.
     */
    private getGraphqlDefaultSelectionInitializer(context: FileContext): string | undefined {
        const defaultExpression = this.getGraphqlDefaultSelectionExpression(context);
        if (defaultExpression == null) {
            return undefined;
        }
        return `${getTextOfTsNode(defaultExpression)} as ${GRAPHQL_SELECTION_TYPE_PARAMETER_NAME}`;
    }

    /**
     * Expression referencing the operation return type's `<Name>DefaultSelection` const, or `undefined`
     * when the response is not a named object/union with a Select type.
     */
    private getGraphqlDefaultSelectionExpression(context: FileContext): ts.Expression | undefined {
        const responseBodyType = getGraphqlResponseBodyType(this.endpoint);
        if (responseBodyType == null) {
            return undefined;
        }
        const defaultReference = context.type.getReferenceToGraphqlDefaultSelectionForReference(responseBodyType);
        return defaultReference?.getExpression();
    }

    /**
     * Method-level type parameters contributed by this request. For GraphQL operations this is a single
     * `S extends <Name>Select` (defaulting to the loose `core.GraphqlSelection` when the response is not
     * a named object/union), which captures the caller's selection literal so the result type can be
     * narrowed to `core.Result<<Model>, S>`. Empty for non-GraphQL endpoints.
     *
     * When the response has a `<Name>DefaultSelection` const, `S` also gets a `= typeof
     * <Name>DefaultSelection` default so a caller that omits `selection` gets a result narrowed exactly
     * to the safe-scalar default — `field()` infers `S = typeof <Name>DefaultSelection` while
     * `field({ id: true })` still infers `S = { id: true }`.
     */
    public getTypeParameters(context: FileContext): OptionalKind<TypeParameterDeclarationStructure>[] {
        if (getGraphqlTransport(this.endpoint) == null) {
            return [];
        }
        const defaultExpression = this.getGraphqlDefaultSelectionExpression(context);
        return [
            {
                name: GRAPHQL_SELECTION_TYPE_PARAMETER_NAME,
                constraint: getTextOfTsNode(this.getGraphqlSelectionTypeNode(context)),
                default: defaultExpression != null ? `typeof ${getTextOfTsNode(defaultExpression)}` : undefined
            }
        ];
    }

    /**
     * Type node for the GraphQL `selection` parameter. Resolves to the operation's response
     * `<Name>Select` type for autocomplete + compile-time field checking, falling back to the loose
     * `core.GraphqlSelection` when the response is not a named object/union.
     */
    private getGraphqlSelectionTypeNode(context: FileContext): ts.TypeNode {
        const responseBodyType = getGraphqlResponseBodyType(this.endpoint);
        if (responseBodyType != null) {
            const selectReference = context.type.getReferenceToGraphqlSelectTypeForReference(responseBodyType);
            if (selectReference != null) {
                return selectReference.getTypeNode();
            }
        }
        return context.coreUtilities.graphqlUtils.GraphqlSelection._getReferenceToType();
    }

    public getExampleEndpointImports(): ts.Statement[] {
        return [];
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => getOriginalName(param.name) === getOriginalName(pathParameter.name)
            );
            if (exampleParameter == null) {
                result.push(ts.factory.createIdentifier("undefined"));
            } else {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                result.push(generatedExample.build(context, opts));
            }
        }
        if (this.requestParameter != null) {
            const requestParameterExample = this.requestParameter.generateExample({ context, example, opts });
            if (
                requestParameterExample != null &&
                getTextOfTsNode(requestParameterExample) === "{}" &&
                this.requestParameter.isOptional({ context })
            ) {
                // pass
            } else if (requestParameterExample != null) {
                result.push(requestParameterExample);
            } else if (!this.requestParameter.isOptional({ context })) {
                return undefined;
            }
        }
        return result;
    }

    public getBuildRequestStatements(context: FileContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(
                ...this.requestParameter.getInitialStatements(context, {
                    variablesInScope: this.getEndpointParameters(context).map((param) => param.name)
                })
            );
        }

        statements.push(...this.getQueryParams(context).getBuildStatements(context));

        statements.push(...this.initializeHeaders(context));

        return statements;
    }

    public getBuildHeaderStatements(context: FileContext): ts.Statement[] {
        return this.initializeHeaders(context);
    }

    public getFetcherRequestArgs(
        context: FileContext
    ): Pick<Fetcher.Args, "headers" | "body" | "contentType" | "requestType" | "queryString"> {
        const queryParams = this.getQueryParams(context);
        const graphqlTransport = getGraphqlTransport(this.endpoint);
        const serializedBody = this.getSerializedRequestBodyWithNullCheck(context);
        return {
            headers: ts.factory.createIdentifier(HEADERS_VAR_NAME),
            queryString: queryParams.getQueryStringExpression(context),
            body:
                graphqlTransport != null
                    ? this.wrapBodyInGraphqlEnvelope(graphqlTransport, serializedBody, context)
                    : serializedBody,
            contentType:
                graphqlTransport != null
                    ? "application/json"
                    : (this.requestBody?.contentType ?? this.getFallbackContentType()),
            requestType: graphqlTransport != null ? "json" : this.getRequestType()
        };
    }

    /**
     * Builds the GraphQL request envelope `{ query, variables }`. `buildGraphqlQuery` returns both the
     * query string AND any nested-`$args` variable values, so it must be invoked exactly once and both
     * results threaded out. We do this with an arrow IIFE bound to `_gql`:
     *
     *   ((_gql) => ({ query: _gql.query, variables: { ...body(minus select), ..._gql.variables } }))(
     *     core.buildGraphqlQuery(scaffolding, select, { rootType, registry })
     *   )
     */
    private wrapBodyInGraphqlEnvelope(
        graphqlTransport: GraphqlTransport,
        serializedBody: ts.Expression | undefined,
        context: FileContext
    ): ts.Expression {
        const buildQueryCall = this.getGraphqlBuildQueryCallExpression(graphqlTransport, context);
        const gqlResult = ts.factory.createIdentifier(GRAPHQL_RESULT_VARIABLE_NAME);

        const envelope = ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("query"),
                    ts.factory.createPropertyAccessExpression(gqlResult, ts.factory.createIdentifier("query"))
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("variables"),
                    this.getGraphqlVariablesExpression(serializedBody, gqlResult)
                )
            ],
            true
        );

        const arrow = ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier(GRAPHQL_RESULT_VARIABLE_NAME),
                    undefined,
                    undefined,
                    undefined
                )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createParenthesizedExpression(envelope)
        );

        return ts.factory.createCallExpression(ts.factory.createParenthesizedExpression(arrow), undefined, [
            buildQueryCall
        ]);
    }

    /**
     * Builds the GraphQL `variables` object. The field selection lives on a dedicated `selection`
     * parameter (not the request body), so the body now contains only the operation's arguments and is
     * spread straight in. Nested-field `$args` variables (carried on `_gql.variables`) are merged in.
     * When there is no body, variables is just `{ ..._gql.variables }`.
     */
    private getGraphqlVariablesExpression(
        serializedBody: ts.Expression | undefined,
        gqlResult: ts.Identifier
    ): ts.Expression {
        const nestedArgsSpread = ts.factory.createSpreadAssignment(
            ts.factory.createPropertyAccessExpression(gqlResult, ts.factory.createIdentifier("variables"))
        );
        if (serializedBody == null) {
            return ts.factory.createObjectLiteralExpression([nestedArgsSpread], false);
        }
        return ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(serializedBody)),
                nestedArgsSpread
            ],
            false
        );
    }

    /**
     * Returns the `core.buildGraphqlQuery(scaffolding, select, argContext)` call expression. `select`
     * is required on every GraphQL operation, so the query is always built at runtime from the caller's
     * selection — no over-fetching "select everything" query is ever embedded. The `argContext`
     * supplies the response `rootType` + the generated `GRAPHQL_ARG_TYPES` registry so nested `$args`
     * resolve to GraphQL variables; it is omitted when the response type name cannot be resolved (older
     * IRs / non-named responses), in which case `$args` are simply ignored at runtime.
     */
    private getGraphqlBuildQueryCallExpression(
        graphqlTransport: GraphqlTransport,
        context: FileContext
    ): ts.Expression {
        const selectReference = this.getReferenceToGraphqlSelect();
        if (selectReference == null) {
            // Unreachable: every GraphQL operation requires a `select`, so a graphql transport always
            // has a select reference. Guard so a future regression fails loudly at generation time.
            throw new Error(`Expected a GraphQL \`select\` reference for endpoint ${this.endpoint.id} but found none.`);
        }

        const scaffolding = this.buildGraphqlScaffoldingExpression(graphqlTransport);
        // The caller-provided `selection` is typed as the method-level generic `S` (constrained to the
        // operation's `<Name>Select` interface) so the exact selection literal is captured for result
        // inference. A generic constrained to a named interface is not structurally assignable to the
        // index-signature `GraphqlSelection` the core helper expects, so cast through `unknown` here
        // (the runtime shape is identical — an `S extends <Name>Select` *is* a `GraphqlSelection`).
        const selectionAsGraphqlSelection = ts.factory.createAsExpression(
            ts.factory.createAsExpression(
                selectReference,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            ),
            context.coreUtilities.graphqlUtils.GraphqlSelection._getReferenceToType()
        );
        const argContext = this.buildGraphqlArgContextExpression(context);
        return context.coreUtilities.graphqlUtils.buildGraphqlQuery._invoke({
            scaffolding,
            selection: selectionAsGraphqlSelection,
            argContext
        });
    }

    /**
     * Builds the `{ rootType: "<ResponseGraphQLTypeName>", registry: GRAPHQL_ARG_TYPES }` arg-context
     * literal, or `undefined` when the operation's response does not resolve to a named GraphQL type
     * (in which case nested `$args` cannot be resolved and are ignored at runtime).
     */
    private buildGraphqlArgContextExpression(context: FileContext): ts.Expression | undefined {
        const responseBodyType = getGraphqlResponseBodyType(this.endpoint);
        if (responseBodyType == null) {
            return undefined;
        }
        const rootType = context.type.getGraphqlTypeNameForReference(responseBodyType);
        if (rootType == null) {
            return undefined;
        }
        return ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("rootType"),
                    ts.factory.createStringLiteral(rootType)
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("registry"),
                    context.type.getReferenceToGraphqlArgTypes()
                )
            ],
            false
        );
    }

    /**
     * Builds the object literal passed as the scaffolding argument to `buildGraphqlQuery`:
     * `{ operationType, operationName, variableDefinitions, arguments }`. Fields absent on the
     * transport (older IRs) are emitted as empty strings so the helper degrades gracefully.
     */
    private buildGraphqlScaffoldingExpression(graphqlTransport: GraphqlTransport): ts.Expression {
        return ts.factory.createObjectLiteralExpression(
            [
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("operationType"),
                    ts.factory.createStringLiteral(graphqlTransport.operationType ?? "QUERY")
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("operationName"),
                    ts.factory.createStringLiteral(graphqlTransport.operationName)
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("variableDefinitions"),
                    ts.factory.createStringLiteral(graphqlTransport.variableDefinitions ?? "")
                ),
                ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("arguments"),
                    ts.factory.createStringLiteral(graphqlTransport.arguments ?? "")
                )
            ],
            false
        );
    }

    /**
     * Returns a reference to the caller-provided field selection — the dedicated `selection` parameter
     * present on every GraphQL operation's method. Returns `undefined` for non-GraphQL endpoints.
     */
    private getReferenceToGraphqlSelect(): ts.Expression | undefined {
        if (getGraphqlTransport(this.endpoint) == null) {
            return undefined;
        }
        return ts.factory.createIdentifier(GRAPHQL_SELECTION_PARAMETER_NAME);
    }

    private getFallbackContentType(): string | undefined {
        const requestBodyType = this.requestBody?.type ?? "undefined";
        switch (requestBodyType) {
            case "inlinedRequestBody":
                return "application/json";
            case "reference":
                return "application/json";
            case "undefined":
                return undefined;
            default:
                assertNever(requestBodyType);
        }
    }

    private getRequestType(): "json" | "form" | undefined {
        const contentType = this.requestBody?.contentType;
        if (contentType === "application/x-www-form-urlencoded") {
            return "form";
        }

        const requestBodyType = this.requestBody?.type ?? "undefined";
        switch (requestBodyType) {
            case "inlinedRequestBody":
                return "json";
            case "reference":
                return "json";
            case "undefined":
                return undefined;
            default:
                assertNever(requestBodyType);
        }
    }

    private initializeHeaders(context: FileContext): ts.Statement[] {
        return generateHeaders({
            context,
            intermediateRepresentation: this.ir,
            requestParameter: this.requestParameter,
            generatedSdkClientClass: this.generatedSdkClientClass,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            service: this.service,
            endpoint: this.endpoint
        });
    }

    private getSerializedRequestBodyWithNullCheck(context: FileContext): ts.Expression | undefined {
        if (this.requestParameter == null || this.requestBody == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        return this.getSerializedRequestBodyWithoutNullCheck(this.requestBody, referenceToRequestBody, context);
    }

    private getSerializedRequestBodyWithoutNullCheck(
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody | FernIr.HttpRequestBody.Reference,
        referenceToRequestBody: ts.Expression,
        context: FileContext
    ): ts.Expression {
        switch (requestBody.type) {
            case "inlinedRequestBody": {
                const serializeExpression = context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
                return this.serializeInlinedRequestBodyWithLiterals({
                    inlinedRequestBody: requestBody,
                    serializeExpression,
                    context
                });
            }
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            default:
                assertNever(requestBody);
        }
    }

    private serializeInlinedRequestBodyWithLiterals({
        inlinedRequestBody,
        serializeExpression,
        context
    }: {
        inlinedRequestBody: FernIr.InlinedRequestBody;
        serializeExpression: ts.Expression;
        context: FileContext;
    }): ts.Expression {
        const literalProperties = this.getLiteralProperties({ inlinedRequestBody, context });
        if (literalProperties.length > 0) {
            return ts.factory.createObjectLiteralExpression([
                ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(serializeExpression)),
                ...literalProperties.map((property) => {
                    return ts.factory.createPropertyAssignment(
                        getPropertyKey(property.propertyWireKey),
                        typeof property.propertyValue === "string"
                            ? ts.factory.createStringLiteral(property.propertyValue)
                            : property.propertyValue
                              ? ts.factory.createTrue()
                              : ts.factory.createFalse()
                    );
                })
            ]);
        } else {
            return serializeExpression;
        }
    }

    private getLiteralProperties({
        inlinedRequestBody,
        context
    }: {
        inlinedRequestBody: FernIr.InlinedRequestBody;
        context: FileContext;
    }): LiteralPropertyValue[] {
        const result: LiteralPropertyValue[] = [];
        for (const property of inlinedRequestBody.properties) {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
                result.push({
                    propertyValue: resolvedType.container.literal._visit<boolean | string>({
                        string: (val: string) => val,
                        boolean: (val: boolean) => val,
                        _other: () => {
                            throw new Error("Encountered non-boolean, non-string literal");
                        }
                    }),
                    propertyWireKey: getWireValue(property.name)
                });
            }
        }
        return result;
    }

    public getReferenceToRequestBody(context: FileContext): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }

    public getQueryParams(context: FileContext): GeneratedQueryParams {
        if (this.queryParams == null) {
            this.queryParams = new GeneratedQueryParams({
                queryParameters: this.requestParameter?.getAllQueryParameters(context),
                referenceToQueryParameterProperty: (key, context) => this.getReferenceToQueryParameter(key, context)
            });
        }
        return this.queryParams;
    }
}
