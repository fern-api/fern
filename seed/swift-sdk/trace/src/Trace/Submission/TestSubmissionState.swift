public struct TestSubmissionState: Codable, Hashable {
    public let problemId: ProblemId
    public let defaultTestCases: [TestCase]
    public let customTestCases: [TestCase]
    public let status: TestSubmissionStatus
}