public struct GetGeneratedTestCaseTemplateFileRequestType: Codable, Hashable, Sendable {
    public let template: TestCaseTemplateType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        template: TestCaseTemplateType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.template = template
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.template = try container.decode(TestCaseTemplateType.self, forKey: .template)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.template, forKey: .template)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case template
    }
}