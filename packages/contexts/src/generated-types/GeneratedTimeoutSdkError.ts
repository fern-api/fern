import { ts } from "ts-morph";
import { TimeoutSdkErrorContext } from "../contexts/TimeoutSdkErrorContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedTimeoutSdkError extends GeneratedFile<TimeoutSdkErrorContext> {
    build: (context: TimeoutSdkErrorContext) => ts.NewExpression;
}
