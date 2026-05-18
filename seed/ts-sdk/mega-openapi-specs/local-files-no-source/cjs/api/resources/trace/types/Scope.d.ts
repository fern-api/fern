import type * as SeedApi from "../../../index.js";
export interface Scope {
    variables: Record<string, SeedApi.trace.DebugVariableValue>;
}
