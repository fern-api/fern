public enum NestedUnionL1: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case stringArray([String])
    case nestedUnionL2(NestedUnionL2)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}