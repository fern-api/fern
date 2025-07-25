public struct GeneratedFiles: Codable, Hashable {
    public let generatedTestCaseFiles: Any
    public let generatedTemplateFiles: Any
    public let other: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        generatedTestCaseFiles: Any,
        generatedTemplateFiles: Any,
        other: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.generatedTestCaseFiles = generatedTestCaseFiles
        self.generatedTemplateFiles = generatedTemplateFiles
        self.other = other
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.generatedTestCaseFiles = try container.decode(Any.self, forKey: .generatedTestCaseFiles)
        self.generatedTemplateFiles = try container.decode(Any.self, forKey: .generatedTemplateFiles)
        self.other = try container.decode(Any.self, forKey: .other)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.generatedTestCaseFiles, forKey: .generatedTestCaseFiles)
        try container.encode(self.generatedTemplateFiles, forKey: .generatedTemplateFiles)
        try container.encode(self.other, forKey: .other)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case generatedTestCaseFiles
        case generatedTemplateFiles
        case other
    }
}