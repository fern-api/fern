public struct TestCaseResultWithStdout: Codable, Hashable {
    public let result: TestCaseResult
    public let stdout: String
}