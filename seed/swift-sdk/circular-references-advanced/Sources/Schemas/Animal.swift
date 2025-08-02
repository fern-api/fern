public enum Animal: Codable, Hashable, Sendable {
    case cat(Cat)
    case dog(Dog)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}