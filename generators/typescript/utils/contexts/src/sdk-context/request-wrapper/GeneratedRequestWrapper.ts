import {
    ExampleEndpointCall,
    FileProperty,
    FileUploadBodyProperty,
    HttpHeader,
    HttpRequestBodyReference,
    InlinedRequestBodyProperty,
    Name,
    NameAndWireValue,
    PathParameter,
    QueryParameter
} from "@fern-fern/ir-sdk/api";
import { InterfaceDeclarationStructure, PropertySignatureStructure, ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";
import { GeneratedRequestWrapperExample } from "./GeneratedRequestWrapperExample";
import {
    RequestWrapperBodyProperty,
    RequestWrapperNonBodyProperty,
    RequestWrapperNonBodyPropertyWithData
} from "./types";

export namespace GeneratedRequestWrapper {
    export interface Property {
        name: string;
        safeName: string;
        type: ts.TypeNode;
        isOptional: boolean;
        docs: string[] | undefined;
    }
}

export interface GeneratedRequestWrapper extends GeneratedFile<SdkContext> {
    areAllPropertiesOptional: (context: SdkContext) => boolean;
    hasDefaults: (context: SdkContext) => boolean;
    hasLiterals: (context: SdkContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    getAllQueryParameters: () => QueryParameter[];
    getNonBodyKeys: (context: SdkContext) => RequestWrapperNonBodyProperty[];
    getNonBodyKeysWithData: (context: SdkContext) => RequestWrapperNonBodyPropertyWithData[];
    getInlinedRequestBodyPropertyKey: (property: InlinedRequestBodyProperty) => RequestWrapperBodyProperty;
    getInlinedRequestBodyPropertyKeyFromName: (name: NameAndWireValue) => RequestWrapperBodyProperty;
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
    getRequestProperties(context: SdkContext): GeneratedRequestWrapper.Property[];
}
