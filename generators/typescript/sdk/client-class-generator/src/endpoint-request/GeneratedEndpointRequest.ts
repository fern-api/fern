import { FernIr } from "@fern-fern/ir-sdk";
import { Fetcher, GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, TypeParameterDeclarationStructure, ts } from "ts-morph";

export interface GeneratedEndpointRequest {
    getBuildRequestStatements: (context: FileContext) => ts.Statement[];
    getBuildHeaderStatements: (context: FileContext) => ts.Statement[];
    getRequestParameter(context: FileContext): ts.TypeNode | undefined;
    getEndpointParameters(context: FileContext): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[];
    /**
     * Method-level type parameters this request contributes, e.g. `<S extends UserSelect>` for GraphQL
     * operations whose result type is inferred from the caller's selection. Only the default (JSON)
     * request builder produces these; other request kinds (file upload, bytes) cannot be GraphQL, so
     * this is optional.
     */
    getTypeParameters?(context: FileContext): OptionalKind<TypeParameterDeclarationStructure>[];
    getFetcherRequestArgs: (
        context: FileContext
    ) => Pick<Fetcher.Args, "headers" | "body" | "contentType" | "requestType" | "queryString">;
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
