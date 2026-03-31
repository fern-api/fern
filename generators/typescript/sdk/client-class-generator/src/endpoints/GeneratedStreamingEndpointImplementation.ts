import { FernIr } from "@fern-fern/ir-sdk";
import { Fetcher, GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { EndpointSampleCode, GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest.js";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl.js";
import { getReadableTypeNode } from "../getReadableTypeNode.js";
import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse.js";
import { buildUrl } from "./utils/buildUrl.js";
import { generateEndpointMetadata } from "./utils/generateEndpointMetadata.js";
import { getAvailabilityDocs } from "./utils/getAvailabilityDocs.js";
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression
} from "./utils/requestOptionsParameter.js";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        response: GeneratedEndpointResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
        streamType: "wrapper" | "web";
        generateEndpointMetadata: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    }
}

export class GeneratedStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    public static readonly DATA_PARAMETER_NAME = "data";

    public readonly endpoint: FernIr.HttpEndpoint;

    public readonly response: GeneratedEndpointResponse;
    private readonly generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private readonly includeCredentialsOnCrossOriginRequests: boolean;
    private readonly defaultTimeoutInSeconds: number | "infinity" | undefined;
    private readonly request: GeneratedEndpointRequest;
    private readonly includeSerdeLayer: boolean;
    private readonly retainOriginalCasing: boolean;
    private readonly omitUndefined: boolean;
    private readonly streamType: "wrapper" | "web";
    private readonly generateEndpointMetadata: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        response,
        defaultTimeoutInSeconds,
        request,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        streamType,
        generateEndpointMetadata,
        parameterNaming
    }: GeneratedStreamingEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.response = response;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.request = request;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.streamType = streamType;
        this.generateEndpointMetadata = generateEndpointMetadata;
        this.parameterNaming = parameterNaming;
    }

    public isPaginated(context: SdkContext): boolean {
        return false;
    }

    public getExample(args: {
        context: SdkContext;
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
        return {
            imports,
            endpointInvocation: ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        this.generatedSdkClientClass.accessFromRootClient({
                            referenceToRootClient: args.clientReference
                        }),
                        ts.factory.createIdentifier(this.endpoint.name.camelCase.unsafeName)
                    ),
                    undefined,
                    exampleParameters
                )
            )
        };
    }

    public maybeLeverageInvocation({
        invocation,
        context
    }: {
        invocation: ts.Expression;
        context: SdkContext;
    }): ts.Node[] {
        const responseVariableName = "response";
        const itemVariableName = "item";
        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(responseVariableName),
                            undefined,
                            undefined,
                            invocation
                        )
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createForOfStatement(
                ts.factory.createToken(ts.SyntaxKind.AwaitKeyword),
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createIdentifier(itemVariableName),
                            undefined,
                            undefined,
                            undefined
                        )
                    ],
                    ts.NodeFlags.Const
                ),
                ts.factory.createIdentifier(responseVariableName),
                ts.factory.createBlock(
                    [
                        ts.factory.createExpressionStatement(
                            ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("console"),
                                    ts.factory.createIdentifier("log")
                                ),
                                undefined,
                                [ts.factory.createIdentifier(itemVariableName)]
                            )
                        )
                    ],
                    true
                )
            )
        ];
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): GeneratedEndpointImplementation.EndpointSignature {
        const returnType = this.response.getReturnType(context);
        return {
            parameters: this.getEndpointParameters(context),
            returnTypeWithoutPromise: returnType
        };
    }

    private getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
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

    public getStatements(context: SdkContext): ts.Statement[] {
        return [
            ...(this.generateEndpointMetadata
                ? generateEndpointMetadata({
                      httpEndpoint: this.endpoint,
                      context
                  })
                : []),
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context),
            ...this.response.getReturnResponseStatements(context)
        ];
    }

    public getRequestBuilderStatements(context: SdkContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context);
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(pathParameter.name.originalName, context);
            },
            parameterNaming: this.parameterNaming
        });
        if (url != null) {
            return context.coreUtilities.urlUtils.join._invoke([baseUrl, url]);
        } else {
            return baseUrl;
        }
    }

    private getResponseTypeForStreaming(): Fetcher.Args["responseType"] {
        const responseBody = this.endpoint.response?.body;
        if (responseBody?.type === "streaming" && responseBody.value.type === "sse") {
            return "sse";
        }
        if (responseBody?.type === "streamParameter" && responseBody.streamResponse.type === "sse") {
            return "sse";
        }
        return "streaming";
    }

    public invokeFetcher(context: SdkContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToBaseUrl(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: getTimeoutExpression({
                defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
                timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                    this.generatedSdkClientClass
                ),
                referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
            }),
            maxRetries: getMaxRetriesExpression({
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                ),
                referenceToOptions: this.generatedSdkClientClass.getReferenceToOptions()
            }),
            abortSignal: getAbortSignalExpression({
                abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                    this.generatedSdkClientClass
                )
            }),
            fetchFn: this.generatedSdkClientClass.getReferenceToFetch(),
            logging: this.generatedSdkClientClass.getReferenceToLogger(context),
            responseType: this.getResponseTypeForStreaming(),
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            endpointMetadata: this.generateEndpointMetadata
                ? this.generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
                : undefined
        };

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            this.response.getResponseVariableName(),
                            undefined,
                            undefined,
                            context.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                                cast: getReadableTypeNode({
                                    typeArgument: undefined,
                                    context,
                                    streamType: this.streamType
                                })
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        return this.request.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        return this.request.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
