public enum JsonLike: Codable, Hashable, Sendable {
    case jsonLikeArray([JsonLike])
    case stringToJsonLikeDictionary([String: JsonLike])
    case string(String)
    case int(Int)
    case bool(Bool)

    public init() throws {
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