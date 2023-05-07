import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface RequestParameter {
    getInitialStatements: (context: SdkClientClassContext) => ts.Statement[];
    getParameterDeclaration: (
        context: SdkClientClassContext,
        opts?: { typeIntersection?: ts.TypeNode; excludeInitializers?: boolean }
    ) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: SdkClientClassContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameterKey: string, context: SdkClientClassContext) => ts.Expression;
    getAllQueryParameters: (context: SdkClientClassContext) => QueryParameter[];
    getReferenceToNonLiteralHeader: (header: HttpHeader, context: SdkClientClassContext) => ts.Expression;
    withQueryParameter: (
        queryParameter: QueryParameter,
        context: SdkClientClassContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ) => ts.Statement[];
}
