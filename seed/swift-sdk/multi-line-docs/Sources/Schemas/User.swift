public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let age: Int?
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        age: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.age = age
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.age = try container.decodeIfPresent(Int.self, forKey: .age)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.age, forKey: .age)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case age
    }
}