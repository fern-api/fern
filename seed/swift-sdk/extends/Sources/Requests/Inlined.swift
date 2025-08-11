public struct Inlined: Codable, Hashable, Sendable {
    public let name: String
    public let docs: String
    public let unique: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        docs: String,
        unique: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.docs = docs
        self.unique = unique
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.docs = try container.decode(String.self, forKey: .docs)
        self.unique = try container.decode(String.self, forKey: .unique)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.docs, forKey: .docs)
        try container.encode(self.unique, forKey: .unique)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case docs
        case unique
    }
}