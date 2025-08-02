public enum UndiscriminatedLiteral: Codable, Hashable, Sendable {
    case string(String)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case json(JSONValue)
    case bool(Bool)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}