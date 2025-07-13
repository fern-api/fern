public struct GradedTestCaseUpdate: Codable, Hashable {
    public let testCaseId: TestCaseId
    public let grade: TestCaseGrade
}