import Foundation

/// Several different types are accepted.
public enum MyUnion: Codable, Hashable, Sendable {
    case int(Int)
    case intArray([Int])
    case intArrayArray([[Int]])
    case jsonValue(JSONValue)
    case string(String)
    case stringArray([String])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode([Int].self) {
            self = .intArray(value)
        } else if let value = try? container.decode([[Int]].self) {
            self = .intArrayArray(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .jsonValue(value)
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
        case .int(let value):
            try container.encode(value)
        case .intArray(let value):
            try container.encode(value)
        case .intArrayArray(let value):
            try container.encode(value)
        case .jsonValue(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .stringArray(let value):
            try container.encode(value)
        }
    }
}