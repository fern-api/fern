import type * as SeedApi from "../../../index.mjs";
export interface InitializeProblemRequest {
    problemId: SeedApi.trace.ProblemId;
    problemVersion?: (number | null) | undefined;
}
