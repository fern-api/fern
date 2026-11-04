import Foundation

public enum ColorOrOperand: Codable, Hashable, Sendable {
    case color(Color)
    case operand(Operand)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Color.self), Color.allCases.contains(value) {
            self = .color(value)
        } else if let value = try? container.decode(Operand.self), Operand.allCases.contains(value) {
            self = .operand(value)
        } else if let value = try? container.decode(Color.self) {
            self = .color(value)
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
        case .color(let value):
            try container.encode(value)
        case .operand(let value):
            try container.encode(value)
        }
    }
}