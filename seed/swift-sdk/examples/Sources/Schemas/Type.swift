public enum Type: Codable, Hashable, Sendable {
    case basicType(BasicType)
    case complexType(ComplexType)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .basicType(let value):
            try container.encode(value)
        case .complexType(let value):
            try container.encode(value)
        }
    }
}