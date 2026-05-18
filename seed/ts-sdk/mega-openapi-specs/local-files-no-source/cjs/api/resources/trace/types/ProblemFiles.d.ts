import type * as SeedApi from "../../../index.js";
export interface ProblemFiles {
    solutionFile: SeedApi.trace.FileInfo;
    readOnlyFiles: SeedApi.trace.FileInfo[];
}
