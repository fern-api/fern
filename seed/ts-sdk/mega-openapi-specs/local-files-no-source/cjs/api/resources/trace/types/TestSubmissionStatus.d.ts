import type * as SeedApi from "../../../index.js";
export type TestSubmissionStatus = SeedApi.trace.TestSubmissionStatus.Stopped | SeedApi.trace.TestSubmissionStatus.Errored | SeedApi.trace.TestSubmissionStatus.Running | SeedApi.trace.TestSubmissionStatus.TestCaseIdToState;
export declare namespace TestSubmissionStatus {
    interface Stopped {
        type: "stopped";
    }
    interface Errored {
        type: "errored";
        value?: SeedApi.trace.ErrorInfo | undefined;
    }
    interface Running {
        type: "running";
        value?: SeedApi.trace.RunningSubmissionState | undefined;
    }
    interface TestCaseIdToState {
        type: "testCaseIdToState";
        value?: Record<string, SeedApi.trace.SubmissionStatusForTestCase> | undefined;
    }
}
