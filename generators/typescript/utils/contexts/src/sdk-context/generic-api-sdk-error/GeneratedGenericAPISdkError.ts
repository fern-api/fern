import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedGenericAPISdkError extends GeneratedFile<SdkContext> {
    build: (
        context: SdkContext,
        args: {
            message: ts.Expression | undefined;
            statusCode: ts.Expression | undefined;
            responseBody: ts.Expression | undefined;
        }
    ) => ts.NewExpression;
    buildConstructorArguments: (args: {
        message: ts.Expression | undefined;
        statusCode: ts.Expression | undefined;
        responseBody: ts.Expression | undefined;
    }) => ts.Expression[];
}
