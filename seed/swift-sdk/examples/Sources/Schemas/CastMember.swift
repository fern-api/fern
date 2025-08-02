public enum CastMember: Codable, Hashable, Sendable {
    case actor(Actor)
    case actress(Actress)
    case stuntDouble(StuntDouble)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Actor.self) {
            self = .actor(value)
        } else if let value = try? container.decode(Actress.self) {
            self = .actress(value)
        } else if let value = try? container.decode(StuntDouble.self) {
            self = .stuntDouble(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
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