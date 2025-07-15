public struct GetSubmissionStateResponse: Codable, Hashable {
    public let timeSubmitted: Date?
    public let submission: String
    public let language: Language
    public let submissionTypeState: SubmissionTypeState
}