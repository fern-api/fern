public struct StuntDouble: Codable, Hashable {
    public let name: String
    public let actorOrActressId: String
    public let additionalProperties: [String: JSONValue]

    public init(name: String, actorOrActressId: String, additionalProperties: [String: JSONValue] = .init()) {
        self.name = name
        self.actorOrActressId = actorOrActressId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.actorOrActressId = try container.decode(String.self, forKey: .actorOrActressId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.actorOrActressId, forKey: .actorOrActressId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case actorOrActressId
    }
}