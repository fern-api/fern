import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceStarterFilesResponse {
    files: Record<string, SeedApi.trace.WorkspaceFiles>;
}
