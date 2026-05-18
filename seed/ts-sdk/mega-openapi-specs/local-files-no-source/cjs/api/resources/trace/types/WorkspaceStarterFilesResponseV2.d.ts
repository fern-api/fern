import type * as SeedApi from "../../../index.js";
export interface WorkspaceStarterFilesResponseV2 {
    filesByLanguage: Record<string, SeedApi.trace.V2Files>;
}
