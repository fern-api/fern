import Foundation

/// Tests that union members named 'Type' or 'Value' don't collide with internal properties
public enum UnionWithReservedNames: Codable, Hashable, Sendable {
    case string(String)
    case type(Type)
    case value(Value)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(Type.self) {
            self = .type(value)
        } else if let value = try? container.decode(Value.self) {
            self = .value(value)
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
        case .string(let value):
            try container.encode(value)
        case .type(let value):
            try container.encode(value)
        case .value(let value):
            try container.encode(value)
        }
    }

    public enum Type: String, Codable, Hashable, CaseIterable, Sendable {
        case type
    }

    public enum Value: String, Codable, Hashable, CaseIterable, Sendable {
        case value
    }
}