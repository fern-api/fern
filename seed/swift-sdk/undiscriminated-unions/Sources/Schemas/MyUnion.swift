public enum MyUnion: Codable, Hashable, Sendable {
    case string(String)
    case stringArray([String])
    case int(Int)
    case intArray([Int])
    case intArrayArray([[Int]])
    case json(JSONValue)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}