import type * as SeedApi from "../../../index.mjs";
export interface Scope {
    variables: Record<string, SeedApi.trace.DebugVariableValue>;
}
