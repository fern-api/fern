public struct FooExtended: Codable, Hashable {
    public let age: Int
    public let additionalProperties: [String: JSONValue]

    public init(age: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.age = age
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.age = try container.decode(Int.self, forKey: .age)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.age, forKey: .age)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case age
    }
}