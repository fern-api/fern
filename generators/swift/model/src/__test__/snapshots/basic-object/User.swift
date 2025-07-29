public struct User: Codable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let email: String
    public let age: Int?
    public let isActive: Bool
    public let balance: Double
    public let tags: [String]
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        name: String,
        email: String,
        age: Int? = nil,
        isActive: Bool,
        balance: Double,
        tags: [String],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.email = email
        self.age = age
        self.isActive = isActive
        self.balance = balance
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.email = try container.decode(String.self, forKey: .email)
        self.age = try container.decodeIfPresent(Int.self, forKey: .age)
        self.isActive = try container.decode(Bool.self, forKey: .isActive)
        self.balance = try container.decode(Double.self, forKey: .balance)
        self.tags = try container.decode([String].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.email, forKey: .email)
        try container.encodeIfPresent(self.age, forKey: .age)
        try container.encode(self.isActive, forKey: .isActive)
        try container.encode(self.balance, forKey: .balance)
        try container.encode(self.tags, forKey: .tags)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case email
        case age
        case isActive = "is_active"
        case balance
        case tags
    }
}