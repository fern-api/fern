import Foundation

public indirect enum JsonLike: Codable, Hashable, Sendable {
    case bool(Bool)
    case int(Int)
    case jsonLikeArray([JsonLike])
    case string(String)
    case stringToJsonLikeDictionary([String: JsonLike])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode([JsonLike].self) {
            self = .jsonLikeArray(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([String: JsonLike].self) {
            self = .stringToJsonLikeDictionary(value)
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
        case .int(let value):
            try container.encode(value)
        case .jsonLikeArray(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .stringToJsonLikeDictionary(let value):
            try container.encode(value)
        }
    }
}