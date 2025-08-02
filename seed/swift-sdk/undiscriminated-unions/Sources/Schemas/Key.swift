public enum Key: Codable, Hashable, Sendable {
    case keyType(KeyType)
    case json(JSONValue)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .keyType(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        }
    }
}