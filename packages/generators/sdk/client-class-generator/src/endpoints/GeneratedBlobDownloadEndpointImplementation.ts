import { HttpEndpoint } from "@fern-fern/ir-model/http";
import { Fetcher } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { GeneratedEndpointResponse } from "./default/endpoint-response/GeneratedEndpointResponse";
import { EndpointSignature, GeneratedEndpointImplementation } from "./GeneratedEndpointImplementation";
import { buildUrl } from "./utils/buildUrl";

export declare namespace GeneratedBlobDownloadEndpointImplementation {
    export interface Init {
        endpoint: HttpEndpoint;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        response: GeneratedEndpointResponse;
    }
}

export class GeneratedBlobDownloadEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private timeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private response: GeneratedEndpointResponse;

    constructor({
        endpoint,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        timeoutInSeconds,
        request,
        response,
    }: GeneratedBlobDownloadEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.timeoutInSeconds = timeoutInSeconds;
        this.request = request;
        this.response = response;
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
            returnTypeWithoutPromise: this.response.getReturnType(context),
        };
    }

    public getDocs(context: SdkClientClassContext): string | undefined {
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

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        return [
            ...this.getRequestBuilderStatements(context),
            ...this.invokeFetcher(context),
            ...this.response.getReturnResponseStatements(context),
        ];
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
            responseType: "blob",
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
                            context.base.coreUtilities.fetcher.fetcher._invoke(fetcherArgs, {
                                referenceToFetcher: this.generatedSdkClientClass.getReferenceToFetcher(context),
                            })
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
        ];
    }
}
