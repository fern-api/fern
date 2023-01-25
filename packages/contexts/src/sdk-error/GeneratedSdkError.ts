import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { GeneratedType } from "../type/GeneratedType";
import { SdkErrorContext } from "./SdkErrorContext";

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
