import { Fetcher, GetReferenceOpts, PackageId } from "@fern-typescript/commons";
import { EndpointSignature, GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { ExampleEndpointCall, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse";
import { buildUrl } from "./utils/buildUrl";
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression
} from "./utils/requestOptionsParameter";

export declare namespace GeneratedStreamingEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response: GeneratedEndpointResponse;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
    }
}

export class GeneratedStreamingEndpointImplementation implements GeneratedEndpointImplementation {
    public static DATA_PARAMETER_NAME = "data";

    public readonly endpoint: HttpEndpoint;

    public response: GeneratedEndpointResponse;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private defaultTimeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private omitUndefined: boolean;

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        response,
        defaultTimeoutInSeconds,
        request,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined
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
    }
    public isPaginated(context: SdkContext): boolean {
        return false;
    }

    public getExample(args: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
        clientReference: ts.Identifier;
    }): ts.Expression | undefined {
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: args.opts
        });
        if (exampleParameters == null) {
            return undefined;
        }
        return ts.factory.createAwaitExpression(
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
        );
    }

    public maybeLeverageInvocation({
        invocation,
        context
    }: {
        invocation: ts.Expression;
        context: SdkContext;
    }): ts.Node[] {
        const responseVariableName = "response";
        const itemVaribaleName = "item";
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
                            ts.factory.createIdentifier(itemVaribaleName),
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
                                [ts.factory.createIdentifier(itemVaribaleName)]
                            )
                        )
                    ],
                    true
                )
            )
        ];
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): EndpointSignature {
        return {
            parameters: this.getEndpointParameters(context),
            returnTypeWithoutPromise: this.response.getReturnType(context)
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
        return this.endpoint.docs ?? undefined;
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        return [
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context),
            ...this.response.getReturnResponseStatements(context)
        ];
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
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(pathParameter.name.originalName, context);
            }
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
                )
            }),
            maxRetries: getMaxRetriesExpression({
                maxRetriesReference: this.generatedSdkClientClass.getReferenceToMaxRetries.bind(
                    this.generatedSdkClientClass
                )
            }),
            abortSignal: getAbortSignalExpression({
                abortSignalReference: this.generatedSdkClientClass.getReferenceToAbortSignal.bind(
                    this.generatedSdkClientClass
                )
            }),
            responseType: "sse",
            withCredentials: this.includeCredentialsOnCrossOriginRequests
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
                                cast: context.externalDependencies.stream.Readable._getReferenceToType()
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
