import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/services/http";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointRequest {
    writeToFile(context: EndpointTypesContext): void;
    getRequestParameterType(context: EndpointTypesContext): TypeReferenceNode | undefined;
    getReferenceToRequestBody(requestParameter: ts.Expression): ts.Expression;
    getReferenceToQueryParameter(queryParameter: QueryParameter, requestParameter: ts.Expression): ts.Expression;
    getReferenceToPathParameter(pathParameterKey: string, requestParameter: ts.Expression): ts.Expression;
    getReferenceToHeader(header: HttpHeader, requestParameter: ts.Expression): ts.Expression;
}
