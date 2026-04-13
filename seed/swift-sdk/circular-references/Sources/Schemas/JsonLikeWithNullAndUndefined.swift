import Foundation

public indirect enum JsonLikeWithNullAndUndefined: Codable, Hashable, Sendable {
    case jsonLikeWithNullAndUndefinedArray([JsonLikeWithNullAndUndefined])
    case nullableBool(Nullable<Bool>)
    case nullableInt(Nullable<Int>)
    case nullableString(Nullable<String>)
    case stringToJsonLikeWithNullAndUndefinedDictionary([String: JsonLikeWithNullAndUndefined])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode([JsonLikeWithNullAndUndefined].self) {
            self = .jsonLikeWithNullAndUndefinedArray(value)
        } else if let value = try? container.decode(Nullable<Bool>.self) {
            self = .nullableBool(value)
        } else if let value = try? container.decode(Nullable<Int>.self) {
            self = .nullableInt(value)
        } else if let value = try? container.decode(Nullable<String>.self) {
            self = .nullableString(value)
        } else if let value = try? container.decode([String: JsonLikeWithNullAndUndefined].self) {
            self = .stringToJsonLikeWithNullAndUndefinedDictionary(value)
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
        case .jsonLikeWithNullAndUndefinedArray(let value):
            try container.encode(value)
        case .nullableBool(let value):
            try container.encode(value)
        case .nullableInt(let value):
            try container.encode(value)
        case .nullableString(let value):
            try container.encode(value)
        case .stringToJsonLikeWithNullAndUndefinedDictionary(let value):
            try container.encode(value)
        }
    }
}