import { ts } from "ts-morph";
import { GenericAPIErrorContext } from "../contexts/GenericAPIErrorContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedGenericAPIError extends GeneratedFile<GenericAPIErrorContext> {
    build: (
        context: GenericAPIErrorContext,
        args: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
        }
    ) => ts.NewExpression;
}
