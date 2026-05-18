export type CodeExecutionUpdate = {
    type: "buildingExecutor";
} | {
    type: "running";
} | {
    type: "errored";
} | {
    type: "stopped";
} | {
    type: "graded";
} | {
    type: "gradedV2";
} | {
    type: "workspaceRan";
} | {
    type: "recording";
} | {
    type: "recorded";
} | {
    type: "invalidRequest";
} | {
    type: "finished";
};
