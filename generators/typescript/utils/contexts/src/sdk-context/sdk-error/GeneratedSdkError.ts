import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export type GeneratedSdkError = GeneratedSdkErrorType | GeneratedSdkErrorClass;

export interface GeneratedSdkErrorType extends BaseGeneratedSdkError {
    type: "type";
}

export interface GeneratedSdkErrorClass extends BaseGeneratedSdkError {
    type: "class";
    build: (context: SdkContext, args: { referenceToBody: ts.Expression | undefined }) => ts.NewExpression;
}

export interface BaseGeneratedSdkError extends GeneratedFile<SdkContext> {}
