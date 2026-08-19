public struct ObjectWithCodingKeysLiteral: Codable, Hashable, Sendable {
    public let field1: String
    public let field2: String?
    public let literalField1: CodingKeysLiteral
    public let literalField2: CodingKeysEnum
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        field1: String,
        field2: String? = nil,
        literalField1: CodingKeysLiteral,
        literalField2: CodingKeysEnum,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.field1 = field1
        self.field2 = field2
        self.literalField1 = literalField1
        self.literalField2 = literalField2
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.field1 = try container.decode(String.self, forKey: .field1)
        self.field2 = try container.decodeIfPresent(String.self, forKey: .field2)
        self.literalField1 = try container.decode(CodingKeysLiteral.self, forKey: .literalField1)
        self.literalField2 = try container.decode(CodingKeysEnum.self, forKey: .literalField2)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.field1, forKey: .field1)
        try container.encodeIfPresent(self.field2, forKey: .field2)
        try container.encode(self.literalField1, forKey: .literalField1)
        try container.encode(self.literalField2, forKey: .literalField2)
    }

    public enum CodingKeysEnum: String, Codable, Hashable, CaseIterable, Sendable {
        case codingKeys
    }

    public enum CodingKeysLiteral: String, Codable, Hashable, CaseIterable, Sendable {
        case codingKeys = "CodingKeys"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case field1
        case field2
        case literalField1
        case literalField2
    }
}