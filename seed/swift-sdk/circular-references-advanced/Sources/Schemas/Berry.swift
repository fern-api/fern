public struct Berry: Codable, Hashable {
    public let animal: Animal
    public let additionalProperties: [String: JSONValue]

    public init(animal: Animal, additionalProperties: [String: JSONValue] = .init()) {
        self.animal = animal
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.animal = try container.decode(Animal.self, forKey: .animal)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.animal, forKey: .animal)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case animal
    }
}