import type * as SeedApi from "../../../index.mjs";
export interface GetExecutionSessionStateResponse {
    states: Record<string, SeedApi.trace.ExecutionSessionState>;
    numWarmingInstances?: (number | null) | undefined;
    warmingSessionIds: string[];
}
