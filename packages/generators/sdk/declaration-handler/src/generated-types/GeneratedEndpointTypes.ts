import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/services/http";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { ts } from "ts-morph";
import { EndpointTypesContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedUnion } from "./GeneratedUnion";

export interface GeneratedEndpointTypes extends BaseGenerated<EndpointTypesContext> {
    getErrorUnion: () => GeneratedUnion<EndpointTypesContext>;
    getReferenceToRequestType: (context: EndpointTypesContext) => TypeReferenceNode | undefined;
    getReferenceToResponseType: (context: EndpointTypesContext) => ts.TypeNode;
    getReferenceToRequestBody: (requestParameter: ts.Expression) => ts.Expression;
    getReferenceToQueryParameter: (queryParameter: QueryParameter, requestParameter: ts.Expression) => ts.Expression;
    getReferenceToPathParameter: (pathParameterKey: string, requestParameter: ts.Expression) => ts.Expression;
    getReferenceToHeader: (header: HttpHeader, requestParameter: ts.Expression) => ts.Expression;
}
