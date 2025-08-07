public struct GetFunctionSignatureResponse: Codable, Hashable, Sendable {
    public let functionByLanguage: [Language: String]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        functionByLanguage: [Language: String],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.functionByLanguage = functionByLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.functionByLanguage = try container.decode([Language: String].self, forKey: .functionByLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.functionByLanguage, forKey: .functionByLanguage)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case functionByLanguage
    }
}