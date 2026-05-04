import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface RequestParameter {
    getInitialStatements: (context: FileContext, args: { variablesInScope: string[] }) => ts.Statement[];
    getType(context: FileContext): ts.TypeNode;
    getParameterDeclaration: (context: FileContext) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: FileContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: FileContext) => ts.Expression;
    getReferenceToPathParameter: (pathParameterKey: string, context: FileContext) => ts.Expression;
    getAllQueryParameters: (context: FileContext) => FernIr.QueryParameter[];
    getReferenceToNonLiteralHeader: (header: FernIr.HttpHeader, context: FileContext) => ts.Expression;
    withQueryParameter: (
        queryParameter: FernIr.QueryParameter,
        context: FileContext,
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[]
    ) => ts.Statement[];
    generateExample({
        context,
        example,
        opts
    }: {
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined;
    isOptional({ context }: { context: FileContext }): boolean;
}
