import Foundation

public enum WeirdNumber: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case optionalJson(JSONValue?)
    case double(Double)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
        } else if let value = try? container.decode(JSONValue?.self) {
            self = .optionalJson(value)
        } else if let value = try? container.decode(Double.self) {
            self = .double(value)
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
        case .optionalJson(let value):
            try container.encode(value)
        case .double(let value):
            try container.encode(value)
        }
    }
}