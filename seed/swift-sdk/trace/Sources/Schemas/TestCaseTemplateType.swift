public struct TestCaseTemplateType: Codable, Hashable, Sendable {
    public let templateId: TestCaseTemplateIdType
    public let name: String
    public let implementation: TestCaseImplementationType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        templateId: TestCaseTemplateIdType,
        name: String,
        implementation: TestCaseImplementationType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.templateId = templateId
        self.name = name
        self.implementation = implementation
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.templateId = try container.decode(TestCaseTemplateIdType.self, forKey: .templateId)
        self.name = try container.decode(String.self, forKey: .name)
        self.implementation = try container.decode(TestCaseImplementationType.self, forKey: .implementation)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.templateId, forKey: .templateId)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.implementation, forKey: .implementation)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case templateId
        case name
        case implementation
    }
}