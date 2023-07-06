import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/http";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface RequestParameter {
    getInitialStatements: (context: SdkContext, args: { variablesInScope: string[] }) => ts.Statement[];
    getParameterDeclaration: (context: SdkContext) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: SdkContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkContext) => ts.Expression;
    getAllQueryParameters: (context: SdkContext) => QueryParameter[];
    getReferenceToNonLiteralHeader: (header: HttpHeader, context: SdkContext) => ts.Expression;
    withQueryParameter: (
        queryParameter: QueryParameter,
        context: SdkContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ) => ts.Statement[];
}
