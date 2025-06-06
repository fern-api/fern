/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as SeedTrace from "../../../index.js";

export interface SubmitRequestV2 {
    submissionId: SeedTrace.SubmissionId;
    language: SeedTrace.Language;
    submissionFiles: SeedTrace.SubmissionFileInfo[];
    problemId: SeedTrace.ProblemId;
    problemVersion?: number;
    userId?: string;
}
