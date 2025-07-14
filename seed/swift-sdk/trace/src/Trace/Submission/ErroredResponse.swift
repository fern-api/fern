public struct ErroredResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let errorInfo: ErrorInfo
}