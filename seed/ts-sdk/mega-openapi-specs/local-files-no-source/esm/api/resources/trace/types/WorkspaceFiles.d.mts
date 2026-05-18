import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceFiles {
    mainFile: SeedApi.trace.FileInfo;
    readOnlyFiles: SeedApi.trace.FileInfo[];
}
