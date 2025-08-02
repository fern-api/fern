public enum NestedUnionL2: Codable, Hashable, Sendable {
    case bool(Bool)
    case json(JSONValue)
    case stringArray([String])

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .bool(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        }
    }
}