export type ErrorInfo = {
    type: "compileError";
} | {
    type: "runtimeError";
} | {
    type: "internalError";
};
