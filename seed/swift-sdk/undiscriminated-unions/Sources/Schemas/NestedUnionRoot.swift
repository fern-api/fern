public enum NestedUnionRoot: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case nestedUnionL1(NestedUnionL1)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        case .nestedUnionL1(let value):
            try container.encode(value)
        }
    }
}