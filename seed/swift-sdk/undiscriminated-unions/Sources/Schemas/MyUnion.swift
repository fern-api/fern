public enum MyUnion: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case int(Int)
    case intArray([Int])
    case intArrayArray([[Int]])
    case json(JSONValue)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        case .int(let value):
            try container.encode(value)
        case .intArray(let value):
            try container.encode(value)
        case .intArrayArray(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        }
    }
}