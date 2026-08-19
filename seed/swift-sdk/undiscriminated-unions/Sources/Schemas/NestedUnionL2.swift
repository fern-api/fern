import Foundation

/// Nested layer 2.
public enum NestedUnionL2: Codable, Hashable, Sendable {
    case bool(Bool)
    case jsonValue(JSONValue)
    case stringArray([String])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .jsonValue(value)
        } else if let value = try? container.decode([String].self) {
            self = .stringArray(value)
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
        case .bool(let value):
            try container.encode(value)
        case .jsonValue(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        }
    }
}