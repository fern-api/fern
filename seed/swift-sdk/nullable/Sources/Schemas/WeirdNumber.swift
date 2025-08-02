public enum WeirdNumber: Codable, Hashable, Sendable {
    case int(Int)
    case json(JSONValue)
    case optionalJson(JSONValue?)
    case double(Double)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}