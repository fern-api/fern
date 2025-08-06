/// Nested layer 1.
public enum NestedUnionL1: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case stringArray([String])
    case nestedUnionL2(NestedUnionL2)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode([String].self) {
            self = .stringArray(value)
        } else if let value = try? container.decode(NestedUnionL2.self) {
            self = .nestedUnionL2(value)
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