import { GetReferenceOpts } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { ExampleEndpointCall, HttpHeader, QueryParameter } from "@fern-fern/ir-sdk/api";

export interface RequestParameter {
    getInitialStatements: (context: SdkContext, args: { variablesInScope: string[] }) => ts.Statement[];
    getType(context: SdkContext): ts.TypeNode;
    getParameterDeclaration: (context: SdkContext) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: SdkContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkContext) => ts.Expression;
    getReferenceToPathParameter: (pathParameterKey: string, context: SdkContext) => ts.Expression;
    getAllQueryParameters: (context: SdkContext) => QueryParameter[];
    getReferenceToNonLiteralHeader: (header: HttpHeader, context: SdkContext) => ts.Expression;
    withQueryParameter: (
        queryParameter: QueryParameter,
        context: SdkContext,
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[]
    ) => ts.Statement[];
    generateExample({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined;
    isOptional({ context }: { context: SdkContext }): boolean;
}
