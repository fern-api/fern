import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export type GeneratedSdkError = GeneratedSdkErrorType | GeneratedSdkErrorClass;

export interface GeneratedSdkErrorType extends BaseGeneratedSdkError {
    type: "type";
}

export interface GeneratedSdkErrorClass extends BaseGeneratedSdkError {
    type: "class";
    build: (
        context: SdkContext,
        args: { referenceToBody: ts.Expression | undefined; referenceToRawResponse: ts.Expression | undefined }
    ) => ts.NewExpression;
}

export interface BaseGeneratedSdkError extends GeneratedFile<SdkContext> {}
