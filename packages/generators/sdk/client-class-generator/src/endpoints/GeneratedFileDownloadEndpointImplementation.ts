import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { Fetcher } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";

export declare namespace GeneratedFileDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
    }
}

export class GeneratedFileDownloadEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private timeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        timeoutInSeconds,
        request,
    }: GeneratedFileDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.timeoutInSeconds = timeoutInSeconds;
        this.request = request;
    }

    public getOverloads(): EndpointSignature[] {
        return [];
    }

    public getSignature(
        context: SdkClientClassContext,
        {
            requestParameterIntersection,
            excludeInitializers = false,
        }: { requestParameterIntersection?: ts.TypeNode; excludeInitializers?: boolean } = {}
    ): EndpointSignature {
        return {
            parameters: this.request.getEndpointParameters(context, {
                requestParameterIntersection,
                excludeInitializers,
            }),
            returnTypeWithoutPromise: context.base.externalDependencies.stream.Readable._getReferenceToType(),
        };
    }

    public getDocs(): string | undefined {
        return this.endpoint.docs ?? undefined;
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        return [...this.getRequestBuilderStatements(context), ...this.invokeFetcher(context)];
    }

    public getRequestBuilderStatements(context: SdkClientClassContext): ts.Statement[] {
        return this.request.getBuildRequestStatements(context);
    }

    private getReferenceToEnvironment(context: SdkClientClassContext): ts.Expression {
        const referenceToEnvironment = this.generatedSdkClientClass.getEnvironment(this.endpoint, context);
        const url = buildUrl({ endpoint: this.endpoint, generatedClientClass: this.generatedSdkClientClass, context });
        if (url != null) {
            return context.base.externalDependencies.urlJoin.invoke([referenceToEnvironment, url]);
        } else {
            return referenceToEnvironment;
        }
    }

    public invokeFetcher(context: SdkClientClassContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
        };

        return [
            ts.factory.createReturnStatement(
                context.base.coreUtilities.streamingFetcher.streamingFetcher._invoke(
                    {
                        ...fetcherArgs,
                        onData: undefined,
                        onError: undefined,
                        onFinish: undefined,
                        abortController: undefined,
                        terminator: undefined,
                    },
                    {
                        referenceToFetcher: this.generatedSdkClientClass.getReferenceToStreamingFetcher(context),
                    }
                )
            ),
        ];
    }
}
