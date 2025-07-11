public struct TestSubmissionState {
    public let problemId: ProblemId
    public let defaultTestCases: [TestCase]
    public let customTestCases: [TestCase]
    public let status: TestSubmissionStatus
}