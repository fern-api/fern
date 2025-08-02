public enum Fruit: Codable, Hashable, Sendable {
    case acai(Acai)
    case fig(Fig)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}