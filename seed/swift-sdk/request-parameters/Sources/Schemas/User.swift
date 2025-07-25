public struct User: Codable, Hashable {
    public let name: String
    public let tags: [String]
    public let additionalProperties: [String: JSONValue]

    public init(name: String, tags: [String], additionalProperties: [String: JSONValue] = .init()) {
        self.name = name
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.tags = try container.decode([String].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.tags, forKey: .tags)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case tags
    }
}