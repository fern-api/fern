public struct TestSubmissionStatusV2 {
    public let updates: [TestSubmissionUpdate]
    public let problemId: ProblemId
    public let problemVersion: Int
    public let problemInfo: ProblemInfoV2
}