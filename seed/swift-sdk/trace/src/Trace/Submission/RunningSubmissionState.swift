public enum RunningSubmissionState: String, Codable, Hashable, Sendable, CaseIterable {
    case queueingSubmission = "QUEUEING_SUBMISSION"
    case killingHistoricalSubmissions = "KILLING_HISTORICAL_SUBMISSIONS"
    case writingSubmissionToFile = "WRITING_SUBMISSION_TO_FILE"
    case compilingSubmission = "COMPILING_SUBMISSION"
    case runningSubmission = "RUNNING_SUBMISSION"
}