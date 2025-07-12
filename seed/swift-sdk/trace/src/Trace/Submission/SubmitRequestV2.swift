public struct SubmitRequestV2 {
    public let submissionId: SubmissionId
    public let language: Language
    public let submissionFiles: [SubmissionFileInfo]
    public let problemId: ProblemId
    public let problemVersion: Int?
    public let userId: String?
}