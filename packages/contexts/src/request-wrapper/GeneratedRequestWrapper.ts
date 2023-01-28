import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/http";
import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { RequestWrapperContext } from "./RequestWrapperContext";

export interface GeneratedRequestWrapper extends GeneratedFile<RequestWrapperContext> {
    areAllPropertiesOptional: (context: RequestWrapperContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    getAllQueryParameters: () => QueryParameter[];
    getAllHeaders: () => HttpHeader[];
    getNonBodyKeys: () => string[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
    getPropertyNameOfQueryParameter: (queryParameter: QueryParameter) => string;
    getPropertyNameOfHeader: (header: HttpHeader) => string;
    withQueryParameter: (args: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        isRequestArgumentNullable: boolean;
        context: RequestWrapperContext;
        callback: (value: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
}
