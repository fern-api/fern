import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export type GeneratedSdkError = GeneratedSdkErrorType | GeneratedSdkErrorClass;

export interface GeneratedSdkErrorType extends BaseGeneratedSdkError {
    type: "type";
}

export interface GeneratedSdkErrorClass extends BaseGeneratedSdkError {
    type: "class";
    build: (
        context: FileContext,
        args: { referenceToBody: ts.Expression | undefined; referenceToRawResponse: ts.Expression | undefined }
    ) => ts.NewExpression;
}

export interface BaseGeneratedSdkError extends GeneratedFile<FileContext> {}
