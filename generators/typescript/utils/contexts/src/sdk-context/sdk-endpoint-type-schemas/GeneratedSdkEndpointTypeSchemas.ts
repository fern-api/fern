import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedSdkEndpointTypeSchemas extends GeneratedFile<SdkContext> {
    getReferenceToRawResponse: (context: SdkContext) => ts.TypeNode;
    getReferenceToRawError: (context: SdkContext) => ts.TypeNode;
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: SdkContext) => ts.Expression;
    deserializeStreamData(args: { referenceToRawStreamData: ts.Expression; context: SdkContext }): ts.Expression;
}
