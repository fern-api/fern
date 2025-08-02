public enum NestedUnionRoot: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case nestedUnionL1(NestedUnionL1)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}