import type * as SeedApi from "../../../index.js";
export interface TestSubmissionStatusV2 {
    updates: SeedApi.trace.TestSubmissionUpdate[];
    problemId: SeedApi.trace.ProblemId;
    problemVersion: number;
    problemInfo: SeedApi.trace.V2ProblemInfoV2;
}
