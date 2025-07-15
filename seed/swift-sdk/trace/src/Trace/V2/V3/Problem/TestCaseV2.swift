public struct TestCaseV2: Codable, Hashable {
    public let metadata: TestCaseMetadata
    public let implementation: TestCaseImplementationReference
    public let arguments: Any
    public let expects: TestCaseExpects?
}