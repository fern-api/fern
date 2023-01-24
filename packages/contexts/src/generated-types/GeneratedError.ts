import { ts } from "ts-morph";
import { ErrorContext } from "../contexts/ErrorContext";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedType } from "./GeneratedType";

export type GeneratedError = GeneratedErrorType | GeneratedErrorClass;

export interface GeneratedErrorType extends BaseGeneratedError {
    type: "type";
}

export interface GeneratedErrorClass extends BaseGeneratedError {
    type: "class";
    build: (context: ErrorContext, args: { referenceToBody: ts.Expression | undefined }) => ts.NewExpression;
}

export interface BaseGeneratedError extends GeneratedFile<ErrorContext> {
    generateErrorBody: () => GeneratedType<ErrorContext>;
}
