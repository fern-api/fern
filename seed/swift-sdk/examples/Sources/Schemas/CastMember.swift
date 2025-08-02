public enum CastMember: Codable, Hashable, Sendable {
    case actor(Actor)
    case actress(Actress)
    case stuntDouble(StuntDouble)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .actor(let value):
            try container.encode(value)
        case .actress(let value):
            try container.encode(value)
        case .stuntDouble(let value):
            try container.encode(value)
        }
    }
}