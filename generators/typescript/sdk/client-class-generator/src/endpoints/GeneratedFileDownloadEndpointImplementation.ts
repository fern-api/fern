import { Fetcher, GetReferenceOpts } from '@fern-typescript/commons'
import { GeneratedEndpointImplementation, SdkContext } from '@fern-typescript/contexts'
import { ts } from 'ts-morph'

import { assertNever } from '@fern-api/core-utils'

import { ExampleEndpointCall, HttpEndpoint } from '@fern-fern/ir-sdk/api'

import { GeneratedSdkClientClassImpl } from '../GeneratedSdkClientClassImpl'
import { GeneratedEndpointRequest } from '../endpoint-request/GeneratedEndpointRequest'
import { getReadableTypeNode } from '../getReadableTypeNode'
import { GeneratedEndpointResponse } from './default/endpoint-response/GeneratedEndpointResponse'
import { buildUrl } from './utils/buildUrl'
import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression
} from './utils/requestOptionsParameter'

export declare namespace GeneratedFileDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint
        generatedSdkClientClass: GeneratedSdkClientClassImpl
        includeCredentialsOnCrossOriginRequests: boolean
        defaultTimeoutInSeconds: number | 'infinity' | undefined
        request: GeneratedEndpointRequest
        response: GeneratedEndpointResponse
        includeSerdeLayer: boolean
        retainOriginalCasing: boolean
        omitUndefined: boolean
        streamType: 'wrapper' | 'web'
        fileResponseType: 'stream' | 'binary-response'
    }
}

export class GeneratedFileDownloadEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint
    public response: GeneratedEndpointResponse
    private generatedSdkClientClass: GeneratedSdkClientClassImpl
    private includeCredentialsOnCrossOriginRequests: boolean
    private defaultTimeoutInSeconds: number | 'infinity' | undefined
    private request: GeneratedEndpointRequest
    private includeSerdeLayer: boolean
    private retainOriginalCasing: boolean
    private omitUndefined: boolean
    private streamType: 'wrapper' | 'web'
    private readonly fileResponseType: 'stream' | 'binary-response'

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        defaultTimeoutInSeconds,
        request,
        response,
        includeSerdeLayer,
        retainOriginalCasing,
        omitUndefined,
        streamType,
        fileResponseType
    }: GeneratedFileDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint
        this.generatedSdkClientClass = generatedSdkClientClass
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests
        this.defaultTimeoutInSeconds = defaultTimeoutInSeconds
        this.request = request
        this.response = response
        this.includeSerdeLayer = includeSerdeLayer
        this.retainOriginalCasing = retainOriginalCasing
        this.omitUndefined = omitUndefined
        this.streamType = streamType
        this.fileResponseType = fileResponseType
    }
    public isPaginated(context: SdkContext): boolean {
        return false
    }

    public getExample(args: {
        context: SdkContext
        example: ExampleEndpointCall
        opts: GetReferenceOpts
        clientReference: ts.Identifier
    }): ts.Expression | undefined {
        const exampleParameters = this.request.getExampleEndpointParameters({
            context: args.context,
            example: args.example,
            opts: args.opts
        })
        if (exampleParameters == null) {
            return undefined
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
        )
    }

    public maybeLeverageInvocation({
        invocation,
        context
    }: {
        invocation: ts.Expression
        context: SdkContext
    }): undefined {
        return undefined
    }

    public getOverloads(): GeneratedEndpointImplementation.EndpointSignature[] {
        return []
    }

    public getSignature(context: SdkContext): GeneratedEndpointImplementation.EndpointSignature {
        return {
            parameters: [
                ...this.request.getEndpointParameters(context),
                getRequestOptionsParameter({
                    requestOptionsReference: this.generatedSdkClientClass.getReferenceToRequestOptions(this.endpoint)
                })
            ],
            returnTypeWithoutPromise: this.response.getReturnType(context)
        }
    }

    public getDocs(context: SdkContext): string | undefined {
        const lines: string[] = []
        if (this.endpoint.docs != null) {
            lines.push(this.endpoint.docs)
        }

        for (const errorName of this.response.getNamesOfThrownExceptions(context)) {
            lines.push(`@throws {@link ${errorName}}`)
        }

        if (lines.length === 0) {
            return undefined
        }

        return lines.join('\n')
    }

    public getStatements(context: SdkContext): ts.Statement[] {
        return [
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context),
            ...this.response.getReturnResponseStatements(context)
        ]
    }

    public getRequestBuilderStatements(context: SdkContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context)
    }

    private getReferenceToBaseUrl(context: SdkContext): ts.Expression {
        const baseUrl = this.generatedSdkClientClass.getBaseUrl(this.endpoint, context)
        const url = buildUrl({
            endpoint: this.endpoint,
            generatedClientClass: this.generatedSdkClientClass,
            context,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            omitUndefined: this.omitUndefined,
            getReferenceToPathParameterVariableFromRequest: (pathParameter) => {
                return this.request.getReferenceToPathParameter(pathParameter.name.originalName, context)
            }
        })

        if (url != null) {
            return context.coreUtilities.urlUtils.join._invoke([baseUrl, url])
        } else {
            return baseUrl
        }
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
            responseType: (() => {
                switch (this.fileResponseType) {
                    case 'stream':
                        return 'streaming'
                    case 'binary-response':
                        return 'binary-response'
                    default:
                        assertNever(this.fileResponseType)
                }
            })()
        }

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
                                cast: (() => {
                                    switch (this.fileResponseType) {
                                        case 'stream':
                                            return getReadableTypeNode({
                                                typeArgument: ts.factory.createTypeReferenceNode('Uint8Array'),
                                                context,
                                                streamType: this.streamType
                                            })
                                        case 'binary-response':
                                            return context.coreUtilities.fetcher.BinaryResponse._getReferenceToType()
                                        default:
                                            assertNever(this.fileResponseType)
                                    }
                                })()
                            })
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ]
    }
}
