import Foundation

/// Nested union root.
public enum NestedUnionRoot: Codable, Hashable, Sendable {
    case nestedUnionL1(NestedUnionL1)
    case string(String)
    case stringArray([String])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(NestedUnionL1.self) {
            self = .nestedUnionL1(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
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
        case .nestedUnionL1(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        }
    }
}