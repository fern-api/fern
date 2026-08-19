import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedTimeoutSdkError extends GeneratedFile<FileContext> {
    build: (context: FileContext, message: string, cause?: ts.Expression) => ts.NewExpression;
}
