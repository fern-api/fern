import type * as SeedApi from "../../../index.js";
export type SubmissionStatusForTestCase = {
    type: "graded";
} | {
    type: "gradedV2";
    value?: SeedApi.trace.TestCaseGrade | undefined;
} | {
    type: "traced";
};
