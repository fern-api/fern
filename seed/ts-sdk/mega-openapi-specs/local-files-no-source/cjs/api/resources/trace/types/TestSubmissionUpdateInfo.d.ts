import type * as SeedApi from "../../../index.js";
export type TestSubmissionUpdateInfo = {
    type: "running";
    value?: SeedApi.trace.RunningSubmissionState | undefined;
} | {
    type: "stopped";
} | {
    type: "errored";
    value?: SeedApi.trace.ErrorInfo | undefined;
} | {
    type: "gradedTestCase";
} | {
    type: "recordedTestCase";
} | {
    type: "finished";
};
