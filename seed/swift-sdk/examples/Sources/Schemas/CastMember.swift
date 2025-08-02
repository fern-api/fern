public enum CastMember: Codable, Hashable, Sendable {
    case actor(Actor)
    case actress(Actress)
    case stuntDouble(StuntDouble)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}