public struct Dog: Codable, Hashable, Sendable {
    public let name: String
    public let likesToWoof: Bool
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        likesToWoof: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.likesToWoof = likesToWoof
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.likesToWoof = try container.decode(Bool.self, forKey: .likesToWoof)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.likesToWoof, forKey: .likesToWoof)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case likesToWoof
    }
}