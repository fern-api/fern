import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/http";
import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { RequestWrapperContext } from "./RequestWrapperContext";
import { RequestWrapperNonBodyProperty } from "./types";

export interface GeneratedRequestWrapper extends GeneratedFile<RequestWrapperContext> {
    areAllPropertiesOptional: (context: RequestWrapperContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    getAllQueryParameters: () => QueryParameter[];
    getAllHeaders: () => HttpHeader[];
    getNonBodyKeys: () => RequestWrapperNonBodyProperty[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
    getPropertyNameOfQueryParameter: (queryParameter: QueryParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfHeader: (header: HttpHeader) => RequestWrapperNonBodyProperty;
    withQueryParameter: (args: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: RequestWrapperContext;
        callback: (value: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
}
