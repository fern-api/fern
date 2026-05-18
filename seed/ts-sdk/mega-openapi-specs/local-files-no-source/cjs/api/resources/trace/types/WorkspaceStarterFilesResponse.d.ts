import type * as SeedApi from "../../../index.js";
export interface WorkspaceStarterFilesResponse {
    files: Record<string, SeedApi.trace.WorkspaceFiles>;
}
