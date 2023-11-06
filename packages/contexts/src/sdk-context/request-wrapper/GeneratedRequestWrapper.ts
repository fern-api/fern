import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-sdk/api";
import { ts } from "ts-morph";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";
import { RequestWrapperNonBodyProperty } from "./types";

export interface GeneratedRequestWrapper extends GeneratedFile<SdkContext> {
    areAllPropertiesOptional: (context: SdkContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    getAllQueryParameters: () => QueryParameter[];
    getNonBodyKeys: (context: SdkContext) => RequestWrapperNonBodyProperty[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
    getPropertyNameOfQueryParameter: (queryParameter: QueryParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeader: (header: HttpHeader) => RequestWrapperNonBodyProperty;
    withQueryParameter: (args: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: SdkContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
}
