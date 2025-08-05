public enum Type: Codable, Hashable, Sendable {
    case basicType(BasicType)
    case complexType(ComplexType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(BasicType.self) {
            self = .basicType(value)
        } else if let value = try? container.decode(ComplexType.self) {
            self = .complexType(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
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