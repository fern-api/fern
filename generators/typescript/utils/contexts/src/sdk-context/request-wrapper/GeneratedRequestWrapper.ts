import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";
import { GeneratedRequestWrapperExample } from "./GeneratedRequestWrapperExample.js";
import {
    RequestWrapperBodyProperty,
    RequestWrapperNonBodyProperty,
    RequestWrapperNonBodyPropertyWithData
} from "./types.js";

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
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    hasBodyProperty(context: SdkContext): boolean;
    getAllQueryParameters: () => FernIr.QueryParameter[];
    getNonBodyKeys: (context: SdkContext) => RequestWrapperNonBodyProperty[];
    getNonBodyKeysWithData: (context: SdkContext) => RequestWrapperNonBodyPropertyWithData[];
    getInlinedRequestBodyPropertyKey: (property: FernIr.InlinedRequestBodyProperty) => RequestWrapperBodyProperty;
    getInlinedRequestBodyPropertyKeyFromName: (name: FernIr.NameAndWireValue) => RequestWrapperBodyProperty;
    shouldInlinePathParameters: (context: SdkContext) => boolean;
    getPropertyNameOfFileParameter: (fileProperty: FernIr.FileProperty) => RequestWrapperNonBodyProperty;
    getPropertyNameOfFileParameterFromName: (name: FernIr.NameAndWireValue) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameter: (queryParameter: FernIr.QueryParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameterFromName: (name: FernIr.NameAndWireValue) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameter: (pathParameter: FernIr.PathParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameterFromName: (name: FernIr.Name) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeader: (header: FernIr.HttpHeader) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeaderFromName: (name: FernIr.NameAndWireValue) => RequestWrapperNonBodyProperty;
    withQueryParameter: (args: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: SdkContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
    generateExample: (example: FernIr.ExampleEndpointCall) => GeneratedRequestWrapperExample | undefined;
    getRequestProperties(context: SdkContext): GeneratedRequestWrapper.Property[];
}
