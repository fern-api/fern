import Foundation

public indirect enum VariableType: Codable, Hashable, Sendable {
    case variableTypeEight(VariableTypeEight)
    case variableTypeFive(VariableTypeFive)
    case variableTypeFour(VariableTypeFour)
    case variableTypeNine(VariableTypeNine)
    case variableTypeOne(VariableTypeOne)
    case variableTypeSeven(VariableTypeSeven)
    case variableTypeSix(VariableTypeSix)
    case variableTypeThree(VariableTypeThree)
    case variableTypeTwo(VariableTypeTwo)
    case variableTypeZero(VariableTypeZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(VariableTypeEight.self) {
            self = .variableTypeEight(value)
        } else if let value = try? container.decode(VariableTypeFive.self) {
            self = .variableTypeFive(value)
        } else if let value = try? container.decode(VariableTypeFour.self) {
            self = .variableTypeFour(value)
        } else if let value = try? container.decode(VariableTypeNine.self) {
            self = .variableTypeNine(value)
        } else if let value = try? container.decode(VariableTypeOne.self) {
            self = .variableTypeOne(value)
        } else if let value = try? container.decode(VariableTypeSeven.self) {
            self = .variableTypeSeven(value)
        } else if let value = try? container.decode(VariableTypeSix.self) {
            self = .variableTypeSix(value)
        } else if let value = try? container.decode(VariableTypeThree.self) {
            self = .variableTypeThree(value)
        } else if let value = try? container.decode(VariableTypeTwo.self) {
            self = .variableTypeTwo(value)
        } else if let value = try? container.decode(VariableTypeZero.self) {
            self = .variableTypeZero(value)
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
        case .variableTypeEight(let value):
            try container.encode(value)
        case .variableTypeFive(let value):
            try container.encode(value)
        case .variableTypeFour(let value):
            try container.encode(value)
        case .variableTypeNine(let value):
            try container.encode(value)
        case .variableTypeOne(let value):
            try container.encode(value)
        case .variableTypeSeven(let value):
            try container.encode(value)
        case .variableTypeSix(let value):
            try container.encode(value)
        case .variableTypeThree(let value):
            try container.encode(value)
        case .variableTypeTwo(let value):
            try container.encode(value)
        case .variableTypeZero(let value):
            try container.encode(value)
        }
    }
}