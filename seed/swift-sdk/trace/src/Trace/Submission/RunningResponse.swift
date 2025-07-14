public struct RunningResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let state: RunningSubmissionState
}