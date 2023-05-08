import { HttpEndpoint, JsonResponse } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { Fetcher, PackageId } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointRequest } from "../../endpoint-request/GeneratedEndpointRequest";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { EndpointSignature, GeneratedEndpointImplementation } from "../GeneratedEndpointImplementation";
import { buildUrl } from "../utils/buildUrl";
import { GeneratedEndpointResponse } from "./endpoint-response/GeneratedEndpointResponse";
import { GeneratedNonThrowingEndpointResponse } from "./endpoint-response/GeneratedNonThrowingEndpointResponse";
import { GeneratedThrowingEndpointResponse } from "./endpoint-response/GeneratedThrowingEndpointResponse";

export declare namespace GeneratedDefaultEndpointImplementation {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        response: JsonResponse | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        includeCredentialsOnCrossOriginRequests: boolean;
        timeoutInSeconds: number | "infinity" | undefined;
        request: GeneratedEndpointRequest;
        neverThrowErrors: boolean;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        errorResolver: ErrorResolver;
    }
}

export class GeneratedDefaultEndpointImplementation implements GeneratedEndpointImplementation {
    public readonly endpoint: HttpEndpoint;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private includeCredentialsOnCrossOriginRequests: boolean;
    private timeoutInSeconds: number | "infinity" | undefined;
    private request: GeneratedEndpointRequest;
    private response: GeneratedEndpointResponse;

    constructor({
        packageId,
        endpoint,
        response,
        generatedSdkClientClass,
        includeCredentialsOnCrossOriginRequests,
        timeoutInSeconds,
        request,
        neverThrowErrors,
        errorDiscriminationStrategy,
        errorResolver,
    }: GeneratedDefaultEndpointImplementation.Init) {
        this.endpoint = endpoint;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.includeCredentialsOnCrossOriginRequests = includeCredentialsOnCrossOriginRequests;
        this.timeoutInSeconds = timeoutInSeconds;
        this.request = request;
        this.response = neverThrowErrors
            ? new GeneratedNonThrowingEndpointResponse({
                  packageId,
                  endpoint,
                  response,
                  errorDiscriminationStrategy,
                  errorResolver,
              })
            : new GeneratedThrowingEndpointResponse({
                  packageId,
                  endpoint,
                  response,
                  errorDiscriminationStrategy,
                  errorResolver,
              });
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
            lines.push(`@throws {${errorName}}`);
        }

        if (lines.length === 0) {
            return undefined;
        }

        return lines.join("\n");
    }

    public getStatements(context: SdkClientClassContext): ts.Statement[] {
        return [...this.request.getBuildRequestStatements(context), ...this.invokeFetcherAndReturnResponse(context)];
    }

    public invokeFetcherAndReturnResponse(context: SdkClientClassContext): ts.Statement[] {
        return [...this.invokeFetcher(context), ...this.response.getReturnResponseStatements(context)];
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

    private invokeFetcher(context: SdkClientClassContext): ts.Statement[] {
        const fetcherArgs: Fetcher.Args = {
            ...this.request.getFetcherRequestArgs(context),
            url: this.getReferenceToEnvironment(context),
            method: ts.factory.createStringLiteral(this.endpoint.method),
            timeoutInSeconds: this.timeoutInSeconds,
            withCredentials: this.includeCredentialsOnCrossOriginRequests,
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
