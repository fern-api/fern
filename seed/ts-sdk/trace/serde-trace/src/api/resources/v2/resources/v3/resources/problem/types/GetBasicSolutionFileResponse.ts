/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedTrace from "../../../../../../../index.js";

export interface GetBasicSolutionFileResponse {
    solutionFileByLanguage: Record<SeedTrace.Language, SeedTrace.v2.v3.FileInfoV2 | undefined>;
}
