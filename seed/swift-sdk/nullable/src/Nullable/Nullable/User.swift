public struct User: Codable, Hashable {
    public let name: String
    public let id: UserId
    public let tags: Any
    public let metadata: Any?
    public let email: Email
    public let favoriteNumber: WeirdNumber
    public let numbers: Any?
    public let strings: Any?

    enum CodingKeys: String, CodingKey {
        case name
        case id
        case tags
        case metadata
        case email
        case favoriteNumber = "favorite-number"
        case numbers
        case strings
    }
}