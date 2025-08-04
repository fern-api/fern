public struct Dog: Codable, Hashable, Sendable {
    public let fruit: Fruit
    public let additionalProperties: [String: JSONValue]

    public init(
        fruit: Fruit,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.fruit = fruit
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.fruit = try container.decode(Fruit.self, forKey: .fruit)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.fruit, forKey: .fruit)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case fruit
    }
}