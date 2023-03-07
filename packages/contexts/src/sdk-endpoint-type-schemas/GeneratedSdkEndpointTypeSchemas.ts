import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { SdkEndpointTypeSchemasContext } from "./SdkEndpointTypeSchemasContext";

export interface GeneratedSdkEndpointTypeSchemas extends GeneratedFile<SdkEndpointTypeSchemasContext> {
    getReferenceToRawResponse: (context: SdkEndpointTypeSchemasContext) => ts.TypeNode;
    getReferenceToRawError: (context: SdkEndpointTypeSchemasContext) => ts.TypeNode;
    serializeRequest: (
        referenceToParsedRequest: ts.Expression,
        context: SdkEndpointTypeSchemasContext
    ) => ts.Expression;
    deserializeResponse: (
        referenceToRawResponse: ts.Expression,
        context: SdkEndpointTypeSchemasContext
    ) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: SdkEndpointTypeSchemasContext) => ts.Expression;
    deserializeStreamData: (
        referenceToRawStreamData: ts.Expression,
        context: SdkEndpointTypeSchemasContext
    ) => ts.Expression;
}
