import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedWebsocketTypeSchema extends GeneratedFile<FileContext> {
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: FileContext) => ts.Expression;
}
