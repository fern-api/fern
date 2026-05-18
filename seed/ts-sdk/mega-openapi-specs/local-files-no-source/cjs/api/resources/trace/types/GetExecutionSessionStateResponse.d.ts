import type * as SeedApi from "../../../index.js";
export interface GetExecutionSessionStateResponse {
    states: Record<string, SeedApi.trace.ExecutionSessionState>;
    numWarmingInstances?: (number | null) | undefined;
    warmingSessionIds: string[];
}
