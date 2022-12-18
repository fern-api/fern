import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/services/http";
import { ServiceContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface RequestParameter {
    getParameterDeclaration: (context: ServiceContext) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: ServiceContext) => ts.Expression | undefined;
    getAllQueryParameters: (context: ServiceContext) => QueryParameter[];
    getAllHeaders: (context: ServiceContext) => HttpHeader[];
    getReferenceToHeader: (header: HttpHeader, context: ServiceContext) => ts.Expression;
    withQueryParameter: (
        queryParameter: QueryParameter,
        context: ServiceContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ) => ts.Statement[];
}
