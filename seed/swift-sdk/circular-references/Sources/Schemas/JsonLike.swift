public enum JsonLike: Codable, Hashable, Sendable {
    case jsonLikeArray([JsonLike])
    case stringToJsonLikeDictionary([String: JsonLike])
    case string(String)
    case int(Int)
    case bool(Bool)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode([JsonLike].self) {
            self = .jsonLikeArray(value)
        } else if let value = try? container.decode([String: JsonLike].self) {
            self = .stringToJsonLikeDictionary(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
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
        case .jsonLikeArray(let value):
            try container.encode(value)
        case .stringToJsonLikeDictionary(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .int(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        }
    }
}