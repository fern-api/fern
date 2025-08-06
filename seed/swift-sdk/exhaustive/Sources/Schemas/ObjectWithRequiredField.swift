public struct ObjectWithRequiredField: Codable, Hashable, Sendable {
    public let string: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        string: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.string = string
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decode(String.self, forKey: .string)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.string, forKey: .string)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
    }
}