public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let email: String
    public let age: Int?
    public let isActive: Bool
    public let balance: Double
    public let tags: [String]
}