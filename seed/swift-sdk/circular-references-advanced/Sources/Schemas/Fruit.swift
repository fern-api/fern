public enum Fruit: Codable, Hashable, Sendable {
    case acai(Acai)
    case fig(Fig)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .acai(let value):
            try container.encode(value)
        case .fig(let value):
            try container.encode(value)
        }
    }
}