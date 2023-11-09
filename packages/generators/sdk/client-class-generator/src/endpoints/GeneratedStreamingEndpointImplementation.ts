import { HttpEndpoint, StreamingResponse } from "@fern-fern/ir-sdk/api";
import { Fetcher, PackageId } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";
import {
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression,
} from "./utils/requestOptionsParameter";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response: StreamingResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    private static DATA_PARAMETER_NAME = "data";
    private static RESPONSE_VARIABLE_NAME = "_response";

    public readonly endpoint: HttpEndpoint;
    private packageId: PackageId;
    private response: StreamingResponse;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private includeSerdeLayer: boolean;

    constructor({
        packageId,
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        response,
        defaultTimeoutInSeconds,
        request,
        includeSerdeLayer,
    }: GeneratedStreamingEndpointImplementation.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.response = response;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.request = request;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context),
            returnTypeWithoutPromise: context.coreUtilities.streamingFetcher.Stream._getReferenceToType(
                this.getResponseType(context)
            ),
        };
    }

    private getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        if (this.response.dataEventType.type === "text") {
            throw new Error("Non-json responses are not supportd");
        }
        return [
            ...this.request.getEndpointParameters(context),
            getRequestOptionsParameter({
                requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(),
            }),
        ];
    }

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        return [...this.getRequestBuilderStatements(context), ...this.invokeFetcher(context)];
    }

    public getRequestBuilderStatements(context: SdkContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToEnvironment(context: SdkContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
        });
        if (url != null) {
            return context.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    public invokeFetcher(context: SdkContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: getTimeoutExpression({
                defaultTimeoutInSeconds: this.defaultTimeoutInSeconds,
                timeoutInSecondsReference: this.generatedSdkClientClass.getReferenceToTimeoutInSeconds.bind(
                    this.generatedSdkClientClass
                ),
            }),
            maxRetries: getMaxRetriesExpression({
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                ),
            }),
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            GeneratedStreamingEndpointImplementation.RESPONSE_VARIABLE_NAME,
                            undefined,
                            undefined,
                            context.coreUtilities.streamingFetcher.streamingFetcher._invoke(
                                {
                                    ...fetcherArgs,
                                    abortController: undefined,
                                },
                                {
                                    referenceToFetcher:
                                        this.generatedSdkClientClass.getReferenceToStreamingFetcher(context),
                                }
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ts.factory.createReturnStatement(
                context.coreUtilities.streamingFetcher.Stream._construct({
                    stream: ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(GeneratedStreamingEndpointImplementation.RESPONSE_VARIABLE_NAME),
                        undefined,
                        ts.factory.createIdentifier(
                            context.coreUtilities.streamingFetcher.StreamingFetcher.Response.properties.data
                        )
                    ),
                    terminator: this.response.terminator ?? "\n",
                    parse: ts.factory.createArrowFunction(
                        [ts.factory.createToken(ts.SyntaxKind.AsyncKeyword)],
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                            ),
                        ],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createBlock(
                            [
                                ts.factory.createReturnStatement(
                                    context.sdkEndpointTypeSchemas
                                        .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                                        .deserializeStreamData({
                                            context,
                                            referenceToRawStreamData: ts.factory.createIdentifier(
                                                GeneratedStreamingEndpointImplementation.DATA_PARAMETER_NAME
                                            ),
                                        })
                                ),
                            ],
                            true
                        )
                    ),
                })
            ),
        ];
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        return this.request.getReferenceToRequestBody(context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        return this.request.getReferenceToQueryParameter(queryParameterKey, context);
    }

    public getResponseType(context: SdkContext): ts.TypeNode {
        const responseDataEventType = this.response.dataEventType;
        if (responseDataEventType.type === "text") {
            throw new Error("Cannot deserialize non-json stream data");
        }
        return context.type.getReferenceToType(responseDataEventType.json).typeNode;
    }
}
