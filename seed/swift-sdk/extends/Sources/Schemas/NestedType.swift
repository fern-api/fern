public struct NestedType: Codable, Hashable, Sendable {
    public let raw: String
    public let docs: String
    public let name: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        raw: String,
        docs: String,
        name: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.raw = raw
        self.docs = docs
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.raw = try container.decode(String.self, forKey: .raw)
        self.docs = try container.decode(String.self, forKey: .docs)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.raw, forKey: .raw)
        try container.encode(self.docs, forKey: .docs)
        try container.encode(self.name, forKey: .name)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case raw
        case docs
        case name
    }
}