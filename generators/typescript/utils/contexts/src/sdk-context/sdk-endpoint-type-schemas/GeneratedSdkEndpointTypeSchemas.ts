import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedSdkEndpointTypeSchemas extends GeneratedFile<FileContext> {
    getReferenceToRawResponse: (context: FileContext) => ts.TypeNode;
    getReferenceToRawError: (context: FileContext) => ts.TypeNode;
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: FileContext) => ts.Expression;
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: FileContext) => ts.Expression;
    deserializeError: (referenceToRawError: ts.Expression, context: FileContext) => ts.Expression;
    deserializeStreamData(args: { referenceToRawStreamData: ts.Expression; context: FileContext }): ts.Expression;
}
