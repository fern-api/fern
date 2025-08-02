public enum Animal: Codable, Hashable, Sendable {
    case cat(Cat)
    case dog(Dog)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .cat(let value):
            try container.encode(value)
        case .dog(let value):
            try container.encode(value)
        }
    }
}