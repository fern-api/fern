import type * as SeedApi from "../../../index.js";
export interface V2V3GetBasicSolutionFileResponse {
    solutionFileByLanguage: Record<string, SeedApi.trace.V2V3FileInfoV2>;
}
