public struct Inlined: Codable, Hashable, Sendable {
    public let unique: String
    public let additionalProperties: [String: JSONValue]

    public init(
        unique: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.unique = unique
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.unique = try container.decode(String.self, forKey: .unique)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.unique, forKey: .unique)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case unique
    }
}