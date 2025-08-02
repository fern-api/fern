public enum ColorOrOperand: Codable, Hashable, Sendable {
    case color(Color)
    case operand(Operand)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .color(let value):
            try container.encode(value)
        case .operand(let value):
            try container.encode(value)
        }
    }
}