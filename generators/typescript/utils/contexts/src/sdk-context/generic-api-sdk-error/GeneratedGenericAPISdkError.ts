import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedGenericAPISdkError extends GeneratedFile<FileContext> {
    build: (
        context: FileContext,
        args: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
            rawResponse: ts.Expression | undefined;
        }
    ) => ts.NewExpression;
    buildConstructorArguments: (args: {
        message: ts.Expression | undefined;
        statusCode: ts.Expression | undefined;
        responseBody: ts.Expression | undefined;
        rawResponse: ts.Expression | undefined;
    }) => ts.Expression[];
}
