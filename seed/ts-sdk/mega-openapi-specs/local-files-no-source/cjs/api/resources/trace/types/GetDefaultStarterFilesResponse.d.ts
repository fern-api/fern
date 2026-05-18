import type * as SeedApi from "../../../index.js";
export interface GetDefaultStarterFilesResponse {
    files: Record<string, SeedApi.trace.ProblemFiles>;
}
