public enum Type: Codable, Hashable, Sendable {
    case basicType(BasicType)
    case complexType(ComplexType)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}