public struct BasicTestCaseTemplate: Codable, Hashable, Sendable {
    public let templateId: TestCaseTemplateId
    public let name: String
    public let description: TestCaseImplementationDescription
    public let expectedValueParameterId: ParameterId
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        templateId: TestCaseTemplateId,
        name: String,
        description: TestCaseImplementationDescription,
        expectedValueParameterId: ParameterId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.templateId = templateId
        self.name = name
        self.description = description
        self.expectedValueParameterId = expectedValueParameterId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.templateId = try container.decode(TestCaseTemplateId.self, forKey: .templateId)
        self.name = try container.decode(String.self, forKey: .name)
        self.description = try container.decode(TestCaseImplementationDescription.self, forKey: .description)
        self.expectedValueParameterId = try container.decode(ParameterId.self, forKey: .expectedValueParameterId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.templateId, forKey: .templateId)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.description, forKey: .description)
        try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case templateId
        case name
        case description
        case expectedValueParameterId
    }
}