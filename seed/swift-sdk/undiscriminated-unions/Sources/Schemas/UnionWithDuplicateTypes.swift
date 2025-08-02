public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case int(Int)
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
        case .json(let value):
            try container.encode(value)
        }
    }
}