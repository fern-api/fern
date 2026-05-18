import type * as SeedApi from "../../../index.mjs";
export interface StackFrame {
    methodName: string;
    lineNumber: number;
    scopes: SeedApi.trace.Scope[];
}
