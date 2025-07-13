public struct WorkspaceSubmitRequest: Codable, Hashable {
    public let submissionId: SubmissionId
    public let language: Language
    public let submissionFiles: [SubmissionFileInfo]
    public let userId: String?
}