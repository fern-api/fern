public enum ColorOrOperand: Codable, Hashable, Sendable {
    case color(Color)
    case operand(Operand)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}