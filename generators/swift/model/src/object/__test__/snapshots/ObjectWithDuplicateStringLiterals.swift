public struct ObjectWithDuplicateStringLiterals: Codable, Hashable, Sendable {
    public let field1: String
    public let field2: String?
    public let literalField1: Usa
    public let literalField2: Usa
    public let literalField3: UsaLiteral
    public let literalField4: UsaEnum
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        field1: String,
        field2: String? = nil,
        literalField1: Usa,
        literalField2: Usa,
        literalField3: UsaLiteral,
        literalField4: UsaEnum,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.field1 = field1
        self.field2 = field2
        self.literalField1 = literalField1
        self.literalField2 = literalField2
        self.literalField3 = literalField3
        self.literalField4 = literalField4
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.field1 = try container.decode(String.self, forKey: .field1)
        self.field2 = try container.decodeIfPresent(String.self, forKey: .field2)
        self.literalField1 = try container.decode(Usa.self, forKey: .literalField1)
        self.literalField2 = try container.decode(Usa.self, forKey: .literalField2)
        self.literalField3 = try container.decode(UsaLiteral.self, forKey: .literalField3)
        self.literalField4 = try container.decode(UsaEnum.self, forKey: .literalField4)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.field1, forKey: .field1)
        try container.encodeIfPresent(self.field2, forKey: .field2)
        try container.encode(self.literalField1, forKey: .literalField1)
        try container.encode(self.literalField2, forKey: .literalField2)
        try container.encode(self.literalField3, forKey: .literalField3)
        try container.encode(self.literalField4, forKey: .literalField4)
    }

    public enum Usa: String, Codable, Hashable, CaseIterable, Sendable {
        case usa
    }

    public enum UsaEnum: String, Codable, Hashable, CaseIterable, Sendable {
        case usa = "Usa"
    }

    public enum UsaLiteral: String, Codable, Hashable, CaseIterable, Sendable {
        case usa = "USA"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case field1
        case field2
        case literalField1
        case literalField2
        case literalField3
        case literalField4
    }
}