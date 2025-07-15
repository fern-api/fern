public struct StdoutResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let stdout: String
}