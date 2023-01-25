import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/http";
import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { RequestWrapperContext } from "./RequestWrapperContext";

export interface GeneratedRequestWrapper extends GeneratedFile<RequestWrapperContext> {
    areAllPropertiesOptional: (context: RequestWrapperContext) => boolean;
    getReferenceToBody: (args: {
        requestArgument: ts.Expression;
        isRequestArgumentNullable: boolean;
        context: RequestWrapperContext;
    }) => ts.Expression | undefined;
    getAllQueryParameters: () => QueryParameter[];
    getAllHeaders: () => HttpHeader[];
    getReferenceToHeader: (args: {
        header: HttpHeader;
        requestArgument: ts.Expression;
        isRequestArgumentNullable: boolean;
    }) => ts.Expression;
    getNonBodyKeys: () => string[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
    withQueryParameter: (args: {
        queryParameter: QueryParameter;
        requestArgument: ts.Expression;
        isRequestArgumentNullable: boolean;
        context: RequestWrapperContext;
        callback: (value: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
}
