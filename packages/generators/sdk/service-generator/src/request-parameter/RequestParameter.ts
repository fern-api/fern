import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/services/http";
import { ServiceContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export interface RequestParameter {
    getParameterDeclaration: (context: ServiceContext) => OptionalKind<ParameterDeclarationStructure>;
    getReferenceToRequestBody: (context: ServiceContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameter: QueryParameter, context: ServiceContext) => ts.Expression;
    getReferenceToHeader: (header: HttpHeader, context: ServiceContext) => ts.Expression;
}
