public struct CreateProblemRequest {
    public let problemName: String
    public let problemDescription: ProblemDescription
    public let files: Any
    public let inputParams: [VariableTypeAndName]
    public let outputType: VariableType
    public let testcases: [TestCaseWithExpectedResult]
    public let methodName: String
}