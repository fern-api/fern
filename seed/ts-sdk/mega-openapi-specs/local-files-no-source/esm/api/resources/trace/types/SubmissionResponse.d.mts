import type * as SeedApi from "../../../index.mjs";
export type SubmissionResponse = {
    type: "serverInitialized";
} | {
    type: "problemInitialized";
    value?: SeedApi.trace.ProblemId | undefined;
} | {
    type: "workspaceInitialized";
} | {
    type: "serverErrored";
} | {
    type: "codeExecutionUpdate";
    value?: SeedApi.trace.CodeExecutionUpdate | undefined;
} | {
    type: "terminated";
};
