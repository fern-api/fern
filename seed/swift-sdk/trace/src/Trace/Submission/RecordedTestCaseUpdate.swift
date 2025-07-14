public struct RecordedTestCaseUpdate: Codable, Hashable {
    public let testCaseId: TestCaseId
    public let traceResponsesSize: Int
}