public struct TestCaseResult: Codable, Hashable {
    public let expectedResult: VariableValue
    public let actualResult: ActualResult
    public let passed: Bool
}