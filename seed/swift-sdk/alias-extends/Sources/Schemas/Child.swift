public struct Child: Codable, Hashable, Sendable {
    public let parent: String
    public let child: String
    public let additionalProperties: [String: JSONValue]

    public init(
        parent: String,
        child: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parent = parent
        self.child = child
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parent = try container.decode(String.self, forKey: .parent)
        self.child = try container.decode(String.self, forKey: .child)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parent, forKey: .parent)
        try container.encode(self.child, forKey: .child)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case parent
        case child
    }
}