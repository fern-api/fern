public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let email: String
    public let age: Int?
    public let isActive: Bool
    public let balance: Double
    public let tags: [String]

    public init(id: String, name: String, email: String, age: Int? = nil, isActive: Bool, balance: Double, tags: [String]) {
        self.id = id
        self.name = name
        self.email = email
        self.age = age
        self.isActive = isActive
        self.balance = balance
        self.tags = tags
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
    }

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case age
        case isActive = "is_active"
        case balance
        case tags
    }
}