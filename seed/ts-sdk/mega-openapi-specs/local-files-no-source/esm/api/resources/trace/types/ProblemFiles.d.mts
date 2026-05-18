import type * as SeedApi from "../../../index.mjs";
export interface ProblemFiles {
    solutionFile: SeedApi.trace.FileInfo;
    readOnlyFiles: SeedApi.trace.FileInfo[];
}
