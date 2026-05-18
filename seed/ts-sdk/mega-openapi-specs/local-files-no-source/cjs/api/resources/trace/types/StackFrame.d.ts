import type * as SeedApi from "../../../index.js";
export interface StackFrame {
    methodName: string;
    lineNumber: number;
    scopes: SeedApi.trace.Scope[];
}
