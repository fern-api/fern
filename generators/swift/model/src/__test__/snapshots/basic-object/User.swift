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
}