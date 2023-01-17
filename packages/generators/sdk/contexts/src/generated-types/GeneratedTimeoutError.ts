import { ts } from "ts-morph";
import { TimeoutErrorContext } from "../contexts/TimeoutErrorContext";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedTimeoutError extends GeneratedFile<TimeoutErrorContext> {
    build: (context: TimeoutErrorContext) => ts.NewExpression;
}
