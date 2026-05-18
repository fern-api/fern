import type * as SeedApi from "../../../index.mjs";
export interface GetDefaultStarterFilesResponse {
    files: Record<string, SeedApi.trace.ProblemFiles>;
}
