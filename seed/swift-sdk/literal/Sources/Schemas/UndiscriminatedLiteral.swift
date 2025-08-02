public enum UndiscriminatedLiteral: Codable, Hashable, Sendable {
    case string(String)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case bool(Bool)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        }
    }
}