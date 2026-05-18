import type * as SeedApi from "../../../index.js";
export type WorkspaceSubmissionStatus = {
    type: "stopped";
} | {
    type: "errored";
    value?: SeedApi.trace.ErrorInfo | undefined;
} | {
    type: "running";
    value?: SeedApi.trace.RunningSubmissionState | undefined;
} | {
    type: "ran";
} | {
    type: "traced";
};
