public enum JsonLike: Codable, Hashable, Sendable {
    case jsonLikeArray([JsonLike])
    case stringToJsonLikeDictionary([String: JsonLike])
    case string(String)
    case int(Int)
    case bool(Bool)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}