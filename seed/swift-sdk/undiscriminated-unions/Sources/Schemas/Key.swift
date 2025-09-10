import Foundation

public enum Key: Codable, Hashable, Sendable {
    case keyType(KeyType)
    case json(JSONValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(KeyType.self) {
            self = .keyType(value)
        } else if let value = try? container.decode(JSONValue.self) {
            self = .json(value)
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
        case .keyType(let value):
            try container.encode(value)
        case .json(let value):
            try container.encode(value)
        }
    }
}