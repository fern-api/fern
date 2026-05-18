export type InvalidRequestCause = {
    type: "submissionIdNotFound";
} | {
    type: "customTestCasesUnsupported";
} | {
    type: "unexpectedLanguage";
};
