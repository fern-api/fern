import { ts } from "ts-morph";
import { GenericAPISdkErrorContext } from "../contexts/GenericAPISdkErrorContext";
import { GeneratedFile } from "./GeneratedFile";

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
