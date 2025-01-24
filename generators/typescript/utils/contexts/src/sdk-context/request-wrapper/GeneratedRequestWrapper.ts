import { ts } from "ts-morph";

import {
    ExampleEndpointCall,
    FileProperty,
    HttpHeader,
    InlinedRequestBodyProperty,
    Name,
    NameAndWireValue,
    PathParameter,
    QueryParameter
} from "@fern-fern/ir-sdk/api";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";
import { GeneratedRequestWrapperExample } from "./GeneratedRequestWrapperExample";
import { RequestWrapperNonBodyProperty } from "./types";

export interface GeneratedRequestWrapper extends GeneratedFile<SdkContext> {
    areAllPropertiesOptional: (context: SdkContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    getAllQueryParameters: () => QueryParameter[];
    getNonBodyKeys: (context: SdkContext) => RequestWrapperNonBodyProperty[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => string;
    getInlinedRequestBodyPropertyKeyFromName: (name: NameAndWireValue) => string;
    shouldInlinePathParameters: () => boolean;
    getPropertyNameOfFileParameter: (fileProperty: FileProperty) => RequestWrapperNonBodyProperty;
    getPropertyNameOfFileParameterFromName: (name: NameAndWireValue) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameter: (queryParameter: QueryParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameterFromName: (name: NameAndWireValue) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameter: (pathParameter: PathParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameterFromName: (name: Name) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeader: (header: HttpHeader) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeaderFromName: (name: NameAndWireValue) => RequestWrapperNonBodyProperty;
    withQueryParameter: (args: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: SdkContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
    generateExample: (example: ExampleEndpointCall) => GeneratedRequestWrapperExample | undefined;
}
