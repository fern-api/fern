import { ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { Fetcher, GetReferenceOpts, StreamingFetcher } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface GeneratedEndpointRequest {
    getBuildRequestStatements: (context: SdkContext) => ts.Statement[];
    getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[];
    getFetcherRequestArgs: (
        context: SdkContext
    ) => Pick<
        Fetcher.Args & StreamingFetcher.Args,
        "headers" | "queryParameters" | "body" | "contentType" | "onUploadProgress"
    >;
    getReferenceToRequestBody: (context: SdkContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkContext) => ts.Expression;
    getExampleEndpointParameters({
        context,
        example,
        opts,
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined;
}
