import Foundation

public enum Key: Codable, Hashable, Sendable {
    case keyType(KeyType)
    case `default`(Default)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(KeyType.self) {
            self = .keyType(value)
        } else if let value = try? container.decode(Default.self) {
            self = .default(value)
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
        case .default(let value):
            try container.encode(value)
        }
    }

    public enum Default: String, Codable, Hashable, CaseIterable, Sendable {
        case `default`
    }
}