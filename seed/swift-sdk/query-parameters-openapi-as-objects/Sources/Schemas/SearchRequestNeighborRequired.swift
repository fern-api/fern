public enum SearchRequestNeighborRequired: Codable, Hashable, Sendable {
    case user(User)
    case nestedUser(NestedUser)
    case string(String)
    case int(Int)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}