import Foundation

public indirect enum VariableValue: Codable, Hashable, Sendable {
    case variableValueEight(VariableValueEight)
    case variableValueFive(VariableValueFive)
    case variableValueFour(VariableValueFour)
    case variableValueNine(VariableValueNine)
    case variableValueOne(VariableValueOne)
    case variableValueSeven(VariableValueSeven)
    case variableValueSix(VariableValueSix)
    case variableValueThree(VariableValueThree)
    case variableValueTwo(VariableValueTwo)
    case variableValueType(VariableValueType)
    case variableValueZero(VariableValueZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(VariableValueEight.self) {
            self = .variableValueEight(value)
        } else if let value = try? container.decode(VariableValueFive.self) {
            self = .variableValueFive(value)
        } else if let value = try? container.decode(VariableValueFour.self) {
            self = .variableValueFour(value)
        } else if let value = try? container.decode(VariableValueNine.self) {
            self = .variableValueNine(value)
        } else if let value = try? container.decode(VariableValueOne.self) {
            self = .variableValueOne(value)
        } else if let value = try? container.decode(VariableValueSeven.self) {
            self = .variableValueSeven(value)
        } else if let value = try? container.decode(VariableValueSix.self) {
            self = .variableValueSix(value)
        } else if let value = try? container.decode(VariableValueThree.self) {
            self = .variableValueThree(value)
        } else if let value = try? container.decode(VariableValueTwo.self) {
            self = .variableValueTwo(value)
        } else if let value = try? container.decode(VariableValueType.self) {
            self = .variableValueType(value)
        } else if let value = try? container.decode(VariableValueZero.self) {
            self = .variableValueZero(value)
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
        case .variableValueEight(let value):
            try container.encode(value)
        case .variableValueFive(let value):
            try container.encode(value)
        case .variableValueFour(let value):
            try container.encode(value)
        case .variableValueNine(let value):
            try container.encode(value)
        case .variableValueOne(let value):
            try container.encode(value)
        case .variableValueSeven(let value):
            try container.encode(value)
        case .variableValueSix(let value):
            try container.encode(value)
        case .variableValueThree(let value):
            try container.encode(value)
        case .variableValueTwo(let value):
            try container.encode(value)
        case .variableValueType(let value):
            try container.encode(value)
        case .variableValueZero(let value):
            try container.encode(value)
        }
    }
}