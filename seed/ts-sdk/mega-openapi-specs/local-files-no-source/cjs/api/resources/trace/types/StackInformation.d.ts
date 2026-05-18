import type * as SeedApi from "../../../index.js";
export interface StackInformation {
    numStackFrames: number;
    topStackFrame?: (SeedApi.trace.StackFrame | null) | undefined;
}
