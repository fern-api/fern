import { ts } from "ts-morph";
import { SdkErrorContext } from "../contexts/SdkErrorContext";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedType } from "./GeneratedType";

export type GeneratedSdkError = GeneratedSdkErrorType | GeneratedSdkErrorClass;

export interface GeneratedSdkErrorType extends BaseGeneratedSdkError {
    type: "type";
}

export interface GeneratedSdkErrorClass extends BaseGeneratedSdkError {
    type: "class";
    build: (context: SdkErrorContext, args: { referenceToBody: ts.Expression | undefined }) => ts.NewExpression;
}

export interface BaseGeneratedSdkError extends GeneratedFile<SdkErrorContext> {
    generateErrorBody: () => GeneratedType<SdkErrorContext>;
}
