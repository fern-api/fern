public enum NestedUnionL1: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case stringArray([String])
    case nestedUnionL2(NestedUnionL2)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .int(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        case .nestedUnionL2(let value):
            try container.encode(value)
        }
    }
}