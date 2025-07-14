public struct TestCaseWithExpectedResult: Codable, Hashable {
    public let testCase: TestCase
    public let expectedResult: VariableValue
}