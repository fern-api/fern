import type * as SeedApi from "../../../index.js";
export interface V2GetBasicSolutionFileResponse {
    solutionFileByLanguage: Record<string, SeedApi.trace.V2FileInfoV2>;
}
