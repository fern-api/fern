public struct ProblemInfo {
    public let problemId: ProblemId
    public let problemDescription: ProblemDescription
    public let problemName: String
    public let problemVersion: Int
    public let files: Any
    public let inputParams: [VariableTypeAndName]
    public let outputType: VariableType
    public let testcases: [TestCaseWithExpectedResult]
    public let methodName: String
    public let supportsCustomTestCases: Bool
}