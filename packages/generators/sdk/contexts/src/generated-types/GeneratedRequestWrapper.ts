import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/services/http";
import { ts } from "ts-morph";
import { RequestWrapperContext } from "../contexts/RequestWrapperContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedRequestWrapper extends GeneratedFile<RequestWrapperContext> {
    areAllPropertiesOptional: (context: RequestWrapperContext) => boolean;
    getReferenceToBody: (requestParameter: ts.Expression, context: RequestWrapperContext) => ts.Expression | undefined;
    getReferenceToQueryParameter: (queryParameter: QueryParameter, requestParameter: ts.Expression) => ts.Expression;
    getReferenceToHeader: (header: HttpHeader, requestParameter: ts.Expression) => ts.Expression;
    getNonBodyKeys: () => string[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
