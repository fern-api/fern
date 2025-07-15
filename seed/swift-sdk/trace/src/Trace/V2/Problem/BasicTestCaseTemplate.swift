public struct BasicTestCaseTemplate: Codable, Hashable {
    public let templateId: TestCaseTemplateId
    public let name: String
    public let description: TestCaseImplementationDescription
    public let expectedValueParameterId: ParameterId
}