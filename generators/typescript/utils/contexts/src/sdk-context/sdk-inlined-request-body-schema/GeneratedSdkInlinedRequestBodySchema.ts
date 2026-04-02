import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedSdkInlinedRequestBodySchema extends GeneratedFile<FileContext> {
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: FileContext) => ts.Expression;
}
