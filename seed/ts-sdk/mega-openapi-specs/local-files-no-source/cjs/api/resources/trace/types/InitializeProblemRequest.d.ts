import type * as SeedApi from "../../../index.js";
export interface InitializeProblemRequest {
    problemId: SeedApi.trace.ProblemId;
    problemVersion?: (number | null) | undefined;
}
