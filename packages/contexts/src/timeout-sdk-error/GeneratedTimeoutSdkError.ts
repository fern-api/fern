import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { TimeoutSdkErrorContext } from "./TimeoutSdkErrorContext";

export interface GeneratedTimeoutSdkError extends GeneratedFile<TimeoutSdkErrorContext> {
    build: (context: TimeoutSdkErrorContext) => ts.NewExpression;
}
