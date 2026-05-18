import type * as SeedApi from "../../../../../../../../../../index.mjs";
/**
 * @example
 *     {
 *         problemId: "problemId",
 *         problemVersion: 1
 *     }
 */
export interface GetProblemVersionProblemRequest {
    problemId: SeedApi.trace.ProblemId;
    problemVersion: number;
}
