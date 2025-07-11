public struct TestCaseV2 {
    public let metadata: TestCaseMetadata
    public let implementation: TestCaseImplementationReference
    public let arguments: Any
    public let expects: TestCaseExpects?
}