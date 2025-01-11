import { Fetcher, GetReferenceOpts, visitJavaScriptRuntime } from "@fern-typescript/commons";
import { EndpointSignature, GeneratedEndpointImplementation, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

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

export declare namespace GeneratedFileDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        defaultTimeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        response: GeneratedEndpointResponse;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        omitUndefined: boolean;
    }
}

export class GeneratedFileDownloadEndpointImplementation implements GeneratedEndpointImplementation {
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
        defaultTimeoutInSeconds,
        request,
        response,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined
    }: GeneratedFileDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds;
        this.request = request;
        this.response = response;
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
    }): undefined {
        return undefined;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(context: SdkContext): EndpointSignature {
        return {
            parameters: [
                ...this.request.getEndpointParameters(context),
                getRequestOptionsParameter({
                    requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
                })
            ],
            returnTypeWithoutPromise: this.response.getReturnType(context)
        };
    }

    public getDocs(context: SdkContext): string | undefined {
        const lines: string[] = [];
        if (this.endpoint.docs != null) {
            lines.push(this.endpoint.docs);
        }

        for (const errorName of this.response.getNamesOfThrownExceptions(context)) {
            lines.push(`@throws {@link ${errorName}}`);
        }

        if (lines.length === 0) {
            return undefined;
        }

        return lines.join("\n");
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
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
            responseType: visitJavaScriptRuntime(context.targetRuntime, {
                browser: () => "blob",
                node: () => "streaming"
            })
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
                                cast: visitJavaScriptRuntime(context.targetRuntime, {
                                    browser: () => ts.factory.createTypeReferenceNode("Blob"),
                                    node: () => context.externalDependencies.stream.Readable._getReferenceToType()
                                })
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }
}
