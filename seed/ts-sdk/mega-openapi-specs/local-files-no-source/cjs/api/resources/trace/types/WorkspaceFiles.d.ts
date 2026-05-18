import type * as SeedApi from "../../../index.js";
export interface WorkspaceFiles {
    mainFile: SeedApi.trace.FileInfo;
    readOnlyFiles: SeedApi.trace.FileInfo[];
}
