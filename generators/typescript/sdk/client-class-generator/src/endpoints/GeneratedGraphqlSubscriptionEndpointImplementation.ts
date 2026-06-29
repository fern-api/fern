import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { EndpointSampleCode, FileContext, GeneratedEndpointImplementation } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse.js";
import { GraphqlTransport } from "./default/endpoint-response/graphqlResponseBody.js";
import { getAvailabilityDocs } from "./utils/getAvailabilityDocs.js";
import { getAbortSignalExpression, getRequestOptionsParameter } from "./utils/requestOptionsParameter.js";

export declare namespace GeneratedGraphqlSubscriptionEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        graphqlTransport: GraphqlTransport;
        response: GeneratedEndpointResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        request: GeneratedEndpointRequest;
    }
}

const REQUEST_ENVELOPE_VARIABLE_NAME = "_request";
const HEADERS_VARIABLE_NAME = "_headers";
const CONNECTION_HEADERS_VARIABLE_NAME = "_connectionHeaders";

/**
 * Generates a GraphQL subscription method. Unlike queries/mutations (which POST `{query, variables}`
 * once and unwrap `.data[operationName]`), a subscription opens a WebSocket using the
 * `graphql-transport-ws` subprotocol and returns an `AsyncIterableIterator` of unwrapped events,
 * consumed via `for await (const event of client.x.onFoo({ ...args }))`.
 *
 * The method is intentionally NOT wrapped in `HttpResponsePromise`/`Promise`: it returns the async
 * iterable synchronously so the socket is opened lazily on first iteration. The factory in
 * `GeneratedSdkClientClassImpl` special-cases this implementation when emitting the class method.
 */
export class GeneratedGraphqlSubscriptionEndpointImplementation implements GeneratedEndpointImplementation {
    /** Discriminant so the method-generation loop can detect subscriptions structurally. */
    public readonly isGraphqlSubscription = true as const;

    public readonly endpoint: FernIr.HttpEndpoint;
    public readonly response: GeneratedEndpointResponse;
    private readonly graphqlTransport: GraphqlTransport;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly request: GeneratedEndpointRequest;

    constructor({
        endpoint,
        graphqlTransport,
        response,
        generatedSdkClientClass,
        request
    }: GeneratedGraphqlSubscriptionEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.graphqlTransport = graphqlTransport;
        this.response = response;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.request = request;
    }

    public isPaginated(): boolean {
        return false;
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    /** The element type of the stream, e.g. `Message` in `AsyncIterableIterator<Message>`. */
    public getEventType(context: FileContext): ts.TypeNode {
        return this.response.getReturnType(context);
    }

    public getSignature(context: FileContext): GeneratedEndpointImplementation.EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context),
            returnTypeWithoutPromise: ts.factory.createTypeReferenceNode("AsyncIterableIterator", [
                this.getEventType(context)
            ]),
            // GraphQL subscriptions infer their event type from the caller's selection too, so they
            // carry the same `<S extends <Name>Select>` type parameter as queries/mutations.
            typeParameters: this.request.getTypeParameters?.(context) ?? []
        };
    }

    private getEndpointParameters(context: FileContext): OptionalKind<ParameterDeclarationStructure>[] {
        return [
            ...this.request.getEndpointParameters(context),
            getRequestOptionsParameter({
                requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
            })
        ];
    }

    public getDocs(): string | undefined {
        const groups: string[] = [];
        const availabilityDoc = getAvailabilityDocs(this.endpoint);
        if (availabilityDoc != null) {
            groups.push(availabilityDoc);
        }
        if (this.endpoint.docs) {
            groups.push(this.endpoint.docs);
        }
        if (groups.length === 0) {
            return undefined;
        }
        return groups.join("\n\n");
    }

    public getExample(args: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): EndpointSampleCode | undefined {
        const imports = this.request.getExampleEndpointImports({
            context: args.context,
            example: args.example,
            opts: { ...args.opts, isForRequest: true }
        });
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: { ...args.opts, isForRequest: true }
        });
        if (exampleParameters == null) {
            return undefined;
        }
        // for await (const event of client.x.onFoo(...)) {}
        return {
            imports,
            endpointInvocation: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    this.generatedSdkClientClass.accessFromRootClient({ referenceToRootClient: args.clientReference }),
                    ts.factory.createIdentifier(args.context.case.camelUnsafe(this.endpoint.name))
                ),
                undefined,
                exampleParameters
            )
        };
    }

    public maybeLeverageInvocation({ invocation }: { invocation: ts.Expression; context: FileContext }): ts.Node[] {
        const eventVariableName = "event";
        return [
            ts.factory.createForOfStatement(
                ts.factory.createToken(ts.SyntaxKind.AwaitKeyword),
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(eventVariableName),
                            undefined,
                            undefined,
                            undefined
                        )
                    ],
                    ts.NodeFlags.Const
                ),
                invocation,
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("console"),
                                    ts.factory.createIdentifier("log")
                                ),
                                undefined,
                                [ts.factory.createIdentifier(eventVariableName)]
                            )
                        )
                    ],
                    true
                )
            )
        ];
    }

    /**
     * Whether building this subscription's headers requires awaiting the auth provider. Mirrors the
     * auth condition in {@link generateHeaders}: when true, the header statements contain an `await`,
     * which cannot run inline in this synchronous method — so they are wrapped in an async supplier.
     */
    private needsAsyncAuthHeaders(context: FileContext): boolean {
        return (
            this.generatedSdkClientClass.hasAuthProvider() &&
            (this.endpoint.auth || this.generatedSdkClientClass.getAlwaysSendAuth()) &&
            context.authProvider.isAuthEndpoint(this.endpoint) === false
        );
    }

    public getStatements(context: FileContext): ts.Statement[] {
        const statements: ts.Statement[] = [];
        const useAsyncAuthHeaders = this.needsAsyncAuthHeaders(context);

        if (useAsyncAuthHeaders) {
            // Auth headers require awaiting the auth provider, but this method must return the iterable
            // synchronously. Wrap the (await-containing) header construction in an async supplier;
            // `subscribeGraphql` resolves it lazily on connect. NOTE: for GraphQL endpoints the request
            // builder emits no non-header statements (the envelope reads the request/selection params
            // directly), so deferring `getBuildHeaderStatements` here is complete.
            const headerStatements = this.request.getBuildHeaderStatements(context);
            const headersSupplier = ts.factory.createArrowFunction(
                [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(
                    [
                        ...headerStatements,
                        ts.factory.createReturnStatement(ts.factory.createIdentifier(HEADERS_VARIABLE_NAME))
                    ],
                    true
                )
            );
            statements.push(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier(CONNECTION_HEADERS_VARIABLE_NAME),
                                undefined,
                                undefined,
                                headersSupplier
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            );
        } else {
            // No auth headers: build `_headers` synchronously (the request builder initializes it).
            statements.push(...this.request.getBuildRequestStatements(context));
        }

        // const _request = { query, variables };  (reuses the same envelope as queries/mutations,
        // including select-driven query rebuilding when the caller passes `select`).
        const envelope = this.request.getFetcherRequestArgs(context).body;
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(REQUEST_ENVELOPE_VARIABLE_NAME),
                            undefined,
                            undefined,
                            envelope ?? ts.factory.createObjectLiteralExpression([], false)
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        const headersExpression = ts.factory.createIdentifier(
            useAsyncAuthHeaders ? CONNECTION_HEADERS_VARIABLE_NAME : HEADERS_VARIABLE_NAME
        );
        statements.push(ts.factory.createReturnStatement(this.buildSubscribeCall(context, headersExpression)));
        return statements;
    }

    private buildSubscribeCall(context: FileContext, headers: ts.Expression): ts.Expression {
        const requestEnvelope = ts.factory.createIdentifier(REQUEST_ENVELOPE_VARIABLE_NAME);

        const properties: ts.ObjectLiteralElementLike[] = [
            ts.factory.createPropertyAssignment(ts.factory.createIdentifier("url"), this.getWebSocketUrl(context)),
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("query"),
                ts.factory.createPropertyAccessExpression(requestEnvelope, ts.factory.createIdentifier("query"))
            ),
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("variables"),
                ts.factory.createPropertyAccessExpression(requestEnvelope, ts.factory.createIdentifier("variables"))
            ),
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("operationName"),
                ts.factory.createStringLiteral(this.graphqlTransport.operationName)
            ),
            // graphql-ws auth is conventionally passed in the connection_init payload, but we also pass
            // it as upgrade-request headers for servers that authenticate on the HTTP upgrade.
            ts.factory.createPropertyAssignment(ts.factory.createIdentifier("connectionParams"), headers),
            ts.factory.createPropertyAssignment(ts.factory.createIdentifier("headers"), headers)
        ];

        const abortSignal = getAbortSignalExpression({
            abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                this.generatedSdkClientClass
            )
        });
        if (abortSignal != null) {
            properties.push(
                ts.factory.createPropertyAssignment(ts.factory.createIdentifier("abortSignal"), abortSignal)
            );
        }

        return context.coreUtilities.graphqlUtils.subscribeGraphql._invoke({
            args: ts.factory.createObjectLiteralExpression(properties, true),
            typeArgument: this.getEventType(context)
        });
    }

    /**
     * Derives the WebSocket url from the GraphQL HTTP endpoint base url, rewriting the scheme
     * (`https`->`wss`, `http`->`ws`) while keeping the same path. Returned as an async url supplier
     * (`async () => ...`) so the (possibly async) base url is resolved lazily by `subscribeGraphql`
     * on first iteration, keeping the generated subscription method itself synchronous.
     */
    private getWebSocketUrl(context: FileContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context);
        // String(<baseUrl>).replace(/^http/, "ws")
        const urlExpression = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createCallExpression(ts.factory.createIdentifier("String"), undefined, [baseUrl]),
                ts.factory.createIdentifier("replace")
            ),
            undefined,
            [ts.factory.createRegularExpressionLiteral("/^http/"), ts.factory.createStringLiteral("ws")]
        );
        // async () => String(<baseUrl>).replace(/^http/, "ws")
        return ts.factory.createArrowFunction(
            [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            urlExpression
        );
    }

    public getReferenceToRequestBody(context: FileContext): ts.Expression | undefined {
        return this.request.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        return this.request.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
