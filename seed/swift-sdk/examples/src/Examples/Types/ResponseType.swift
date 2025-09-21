public struct ResponseType: Codable, Hashable {
    public let type: Type
    public let additionalProperties: [String: JSONValue]

    public init(type: Type, additionalProperties: [String: JSONValue] = .init()) {
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(Type.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}