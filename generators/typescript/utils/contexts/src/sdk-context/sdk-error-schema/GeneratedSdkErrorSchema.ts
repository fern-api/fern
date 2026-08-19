import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedSdkErrorSchema extends GeneratedFile<FileContext> {
    deserializeBody: (context: FileContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
