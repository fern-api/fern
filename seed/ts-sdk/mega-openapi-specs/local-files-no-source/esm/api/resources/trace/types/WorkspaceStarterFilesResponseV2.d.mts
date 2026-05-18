import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceStarterFilesResponseV2 {
    filesByLanguage: Record<string, SeedApi.trace.V2Files>;
}
