export type SubmissionRequest = {
    type: "initializeProblemRequest";
} | {
    type: "initializeWorkspaceRequest";
} | {
    type: "submitV2";
} | {
    type: "workspaceSubmit";
} | {
    type: "stop";
};
