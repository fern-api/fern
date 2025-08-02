public enum Key: Codable, Hashable, Sendable {
    case keyType(KeyType)
    case json(JSONValue)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}