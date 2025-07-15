public struct TracedTestCase: Codable, Hashable {
    public let result: TestCaseResultWithStdout
    public let traceResponsesSize: Int
}