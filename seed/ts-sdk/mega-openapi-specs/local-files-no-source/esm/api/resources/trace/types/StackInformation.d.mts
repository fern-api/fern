import type * as SeedApi from "../../../index.mjs";
export interface StackInformation {
    numStackFrames: number;
    topStackFrame?: (SeedApi.trace.StackFrame | null) | undefined;
}
