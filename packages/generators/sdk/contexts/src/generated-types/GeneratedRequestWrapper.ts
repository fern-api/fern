import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/services/http";
import { ts } from "ts-morph";
import { RequestWrapperContext } from "../contexts/RequestWrapperContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedRequestWrapper extends GeneratedFile<RequestWrapperContext> {
    areAllPropertiesOptional: (context: RequestWrapperContext) => boolean;
    getReferenceToBody: (args: {
        requestParameter: ts.Expression;
        isRequestParameterNullable: boolean;
        context: RequestWrapperContext;
    }) => ts.Expression | undefined;
    getReferenceToQueryParameter: (args: {
        queryParameter: QueryParameter;
        requestParameter: ts.Expression;
        isRequestParameterNullable: boolean;
    }) => ts.Expression;
    getReferenceToHeader: (args: {
        header: HttpHeader;
        requestParameter: ts.Expression;
        isRequestParameterNullable: boolean;
    }) => ts.Expression;
    getNonBodyKeys: () => string[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
}
