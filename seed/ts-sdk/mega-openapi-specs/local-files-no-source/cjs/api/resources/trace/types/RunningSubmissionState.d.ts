export declare const RunningSubmissionState: {
    readonly QueueingSubmission: "QUEUEING_SUBMISSION";
    readonly KillingHistoricalSubmissions: "KILLING_HISTORICAL_SUBMISSIONS";
    readonly WritingSubmissionToFile: "WRITING_SUBMISSION_TO_FILE";
    readonly CompilingSubmission: "COMPILING_SUBMISSION";
    readonly RunningSubmission: "RUNNING_SUBMISSION";
};
export type RunningSubmissionState = (typeof RunningSubmissionState)[keyof typeof RunningSubmissionState];
