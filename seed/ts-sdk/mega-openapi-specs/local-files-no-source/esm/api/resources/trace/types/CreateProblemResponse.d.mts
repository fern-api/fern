import type * as SeedApi from "../../../index.mjs";
export type CreateProblemResponse = SeedApi.trace.CreateProblemResponse.Success | SeedApi.trace.CreateProblemResponse.Error;
export declare namespace CreateProblemResponse {
    interface Success {
        type: "success";
        value?: SeedApi.trace.ProblemId | undefined;
    }
    interface Error {
        type: "error";
        value?: SeedApi.trace.CreateProblemError | undefined;
    }
}
