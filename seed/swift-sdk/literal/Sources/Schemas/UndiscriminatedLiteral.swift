import Foundation

public enum UndiscriminatedLiteral: Codable, Hashable, Sendable {
    case bool(Bool)
    case ending(Ending)
    case jsonValue(JSONValue)
    case string(String)
    case value(Value)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Ending.self) {
            self = .ending(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .jsonValue(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
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
        case .bool(let value):
            try container.encode(value)
        case .ending(let value):
            try container.encode(value)
        case .jsonValue(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .value(let value):
            try container.encode(value)
        }
    }

    public enum Ending: String, Codable, Hashable, CaseIterable, Sendable {
        case ending = "$ending"
    }

    public enum Value: String, Codable, Hashable, CaseIterable, Sendable {
        case value = "10 non-alphanumeric string literals you're going to love & why (number 8 will surprise you)"
    }
}