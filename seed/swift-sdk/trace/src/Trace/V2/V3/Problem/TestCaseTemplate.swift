public struct TestCaseTemplate: Codable, Hashable {
    public let templateId: TestCaseTemplateId
    public let name: String
    public let implementation: TestCaseImplementation
}