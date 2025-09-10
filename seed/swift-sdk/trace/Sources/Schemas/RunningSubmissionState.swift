import Foundation

public enum RunningSubmissionState: String, Codable, Hashable, CaseIterable, Sendable {
    case queueingSubmission = "QUEUEING_SUBMISSION"
    case killingHistoricalSubmissions = "KILLING_HISTORICAL_SUBMISSIONS"
    case writingSubmissionToFile = "WRITING_SUBMISSION_TO_FILE"
    case compilingSubmission = "COMPILING_SUBMISSION"
    case runningSubmission = "RUNNING_SUBMISSION"
}