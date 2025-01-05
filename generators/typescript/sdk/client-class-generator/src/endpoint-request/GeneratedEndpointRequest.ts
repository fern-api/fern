import { Fetcher, GetReferenceOpts } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { ExampleEndpointCall } from "@fern-fern/ir-sdk/api";

export interface GeneratedEndpointRequest {
    getBuildRequestStatements: (context: SdkContext) => ts.Statement[];
    getRequestParameter(context: SdkContext): ts.TypeNode | undefined;
    getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    getFetcherRequestArgs: (
        context: SdkContext
    ) => Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "requestType">;
    getReferenceToRequestBody: (context: SdkContext) => ts.Expression | undefined;
    getReferenceToPathParameter: (pathParameterKey: string, context: SdkContext) => ts.Expression;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkContext) => ts.Expression;
    getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined;
}
