import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";
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

export interface GeneratedRequestWrapper extends GeneratedFile<FileContext> {
    areAllPropertiesOptional: (context: FileContext) => boolean;
    areBodyPropertiesInlined: () => boolean;
    getReferencedBodyPropertyName: () => string;
    hasBodyProperty(context: FileContext): boolean;
    getAllQueryParameters: () => FernIr.QueryParameter[];
    getNonBodyKeys: (context: FileContext) => RequestWrapperNonBodyProperty[];
    getNonBodyKeysWithData: (context: FileContext) => RequestWrapperNonBodyPropertyWithData[];
    getInlinedRequestBodyPropertyKey: (property: FernIr.InlinedRequestBodyProperty) => RequestWrapperBodyProperty;
    getInlinedRequestBodyPropertyKeyFromName: (name: FernIr.NameAndWireValueOrString) => RequestWrapperBodyProperty;
    shouldInlinePathParameters: (context: FileContext) => boolean;
    getPropertyNameOfFileParameter: (fileProperty: FernIr.FileProperty) => RequestWrapperNonBodyProperty;
    getPropertyNameOfFileParameterFromName: (name: FernIr.NameAndWireValueOrString) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameter: (queryParameter: FernIr.QueryParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfQueryParameterFromName: (name: FernIr.NameAndWireValueOrString) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameter: (pathParameter: FernIr.PathParameter) => RequestWrapperNonBodyProperty;
    getPropertyNameOfPathParameterFromName: (name: FernIr.NameOrString) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeader: (header: FernIr.HttpHeader) => RequestWrapperNonBodyProperty;
    getPropertyNameOfNonLiteralHeaderFromName: (name: FernIr.NameAndWireValueOrString) => RequestWrapperNonBodyProperty;
    withQueryParameter: (args: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: FileContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }) => ts.Statement[];
    generateExample: (example: FernIr.ExampleEndpointCall) => GeneratedRequestWrapperExample | undefined;
    getRequestProperties(context: FileContext): GeneratedRequestWrapper.Property[];
}
