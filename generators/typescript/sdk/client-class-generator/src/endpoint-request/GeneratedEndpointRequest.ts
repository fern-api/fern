import { FernIr } from "@fern-fern/ir-sdk";
import { Fetcher, GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface GeneratedEndpointRequest {
    getBuildRequestStatements: (context: FileContext) => ts.Statement[];
    getBuildHeaderStatements: (context: FileContext) => ts.Statement[];
    getRequestParameter(context: FileContext): ts.TypeNode | undefined;
    getEndpointParameters(context: FileContext): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    getFetcherRequestArgs: (
        context: FileContext
    ) => Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "requestType">;
    getReferenceToRequestBody: (context: FileContext) => ts.Expression | undefined;
    getReferenceToPathParameter: (pathParameterKey: string, context: FileContext) => ts.Expression;
    getReferenceToQueryParameter: (queryParameterKey: string, context: FileContext) => ts.Expression;
    getExampleEndpointImports({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Statement[];
    getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined;
}
