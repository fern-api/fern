import type * as SeedApi from "../../../index.mjs";
export type WorkspaceSubmissionUpdateInfo = {
    type: "running";
    value?: SeedApi.trace.RunningSubmissionState | undefined;
} | {
    type: "ran";
} | {
    type: "stopped";
} | {
    type: "traced";
} | {
    type: "tracedV2";
} | {
    type: "errored";
    value?: SeedApi.trace.ErrorInfo | undefined;
} | {
    type: "finished";
};
