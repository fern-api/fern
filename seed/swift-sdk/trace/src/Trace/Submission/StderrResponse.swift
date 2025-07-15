public struct StderrResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let stderr: String
}