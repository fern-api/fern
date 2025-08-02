public enum NestedUnionL2: Codable, Hashable, Sendable {
    case bool(Bool)
    case json(JSONValue)
    case stringArray([String])

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}