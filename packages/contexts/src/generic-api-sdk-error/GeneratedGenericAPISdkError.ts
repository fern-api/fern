import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { GenericAPISdkErrorContext } from "./GenericAPISdkErrorContext";

export interface GeneratedGenericAPISdkError extends GeneratedFile<GenericAPISdkErrorContext> {
    build: (
        context: GenericAPISdkErrorContext,
        args: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
        }
    ) => ts.NewExpression;
}
