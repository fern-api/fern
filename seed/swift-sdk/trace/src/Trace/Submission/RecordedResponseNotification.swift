public struct RecordedResponseNotification: Codable, Hashable {
    public let submissionId: SubmissionId
    public let traceResponsesSize: Int
    public let testCaseId: String?
}