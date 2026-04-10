import Foundation

public indirect enum JsonLikeWithNullAndUndefined: Codable, Hashable, Sendable {
    case optionalNullableBool(Nullable<Bool>?)
    case optionalNullableInt(Nullable<Int>?)
    case optionalNullableJsonLikeWithNullAndUndefinedArray([Nullable<JsonLikeWithNullAndUndefined>?])
    case optionalNullableString(Nullable<String>?)
    case stringToOptionalNullableJsonLikeWithNullAndUndefinedDictionary([String: Nullable<JsonLikeWithNullAndUndefined>?])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Nullable<Bool>?.self) {
            self = .optionalNullableBool(value)
        } else if let value = try? container.decode(Nullable<Int>?.self) {
            self = .optionalNullableInt(value)
        } else if let value = try? container.decode([Nullable<JsonLikeWithNullAndUndefined>?].self) {
            self = .optionalNullableJsonLikeWithNullAndUndefinedArray(value)
        } else if let value = try? container.decode(Nullable<String>?.self) {
            self = .optionalNullableString(value)
        } else if let value = try? container.decode([String: Nullable<JsonLikeWithNullAndUndefined>?].self) {
            self = .stringToOptionalNullableJsonLikeWithNullAndUndefinedDictionary(value)
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
        case .optionalNullableBool(let value):
            try container.encode(value)
        case .optionalNullableInt(let value):
            try container.encode(value)
        case .optionalNullableJsonLikeWithNullAndUndefinedArray(let value):
            try container.encode(value)
        case .optionalNullableString(let value):
            try container.encode(value)
        case .stringToOptionalNullableJsonLikeWithNullAndUndefinedDictionary(let value):
            try container.encode(value)
        }
    }
}