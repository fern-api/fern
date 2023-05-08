import { Fetcher, StreamingFetcher } from "@fern-typescript/commons";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface GeneratedEndpointRequest {
    getBuildRequestStatements: (context: SdkClientClassContext) => ts.Statement[];
    getEndpointParameters(
        context: SdkClientClassContext,
        {
            requestParameterIntersection,
            excludeInitializers,
        }: { requestParameterIntersection: ts.TypeNode | undefined; excludeInitializers: boolean }
    ): OptionalKind<ParameterDeclarationStructure>[];
    getFetcherRequestArgs: (
        context: SdkClientClassContext
    ) => Pick<
        Fetcher.Args & StreamingFetcher.Args,
        "headers" | "queryParameters" | "body" | "contentType" | "onUploadProgress"
    >;
    getReferenceToRequestBody: (context: SdkClientClassContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkClientClassContext) => ts.Expression;
}
