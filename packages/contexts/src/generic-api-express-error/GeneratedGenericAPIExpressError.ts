import { MethodDeclarationStructure, OptionalKind, ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { GenericAPIExpressErrorContext } from "./GenericAPIExpressErrorContext";

export interface GeneratedGenericAPIExpressError extends GeneratedFile<GenericAPIExpressErrorContext> {
    implementSend: (
        context: GenericAPIExpressErrorContext,
        generateBody: (args: { expressResponse: ts.Expression }) => ts.Statement[]
    ) => OptionalKind<MethodDeclarationStructure>;
    send: (args: { error: ts.Expression; expressResponse: ts.Expression }) => ts.Expression;
    getConstructorArguments: (args: { errorName: string }) => ts.Expression[];
    getErrorClassName: (args: { referenceToError: ts.Expression }) => ts.Expression;
}
