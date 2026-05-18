import type * as SeedApi from "../../../index.mjs";
export interface ExecutionSessionResponse {
    sessionId: string;
    executionSessionUrl?: (string | null) | undefined;
    language: SeedApi.trace.Language;
    status: SeedApi.trace.ExecutionSessionStatus;
}
