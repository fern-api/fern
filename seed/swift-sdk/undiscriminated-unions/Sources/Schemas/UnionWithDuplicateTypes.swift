public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case int(Int)
    case json(JSONValue)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}