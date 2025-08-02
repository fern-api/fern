public enum SearchRequestNeighborRequired: Codable, Hashable, Sendable {
    case user(User)
    case nestedUser(NestedUser)
    case string(String)
    case int(Int)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .user(let value):
            try container.encode(value)
        case .nestedUser(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .int(let value):
            try container.encode(value)
        }
    }
}