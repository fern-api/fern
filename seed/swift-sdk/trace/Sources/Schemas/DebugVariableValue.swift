import Foundation

public indirect enum DebugVariableValue: Codable, Hashable, Sendable {
    case debugVariableValueEight(DebugVariableValueEight)
    case debugVariableValueEleven(DebugVariableValueEleven)
    case debugVariableValueFive(DebugVariableValueFive)
    case debugVariableValueFour(DebugVariableValueFour)
    case debugVariableValueNine(DebugVariableValueNine)
    case debugVariableValueOne(DebugVariableValueOne)
    case debugVariableValueSeven(DebugVariableValueSeven)
    case debugVariableValueSix(DebugVariableValueSix)
    case debugVariableValueTen(DebugVariableValueTen)
    case debugVariableValueThree(DebugVariableValueThree)
    case debugVariableValueTwelve(DebugVariableValueTwelve)
    case debugVariableValueTwo(DebugVariableValueTwo)
    case debugVariableValueZero(DebugVariableValueZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(DebugVariableValueEight.self) {
            self = .debugVariableValueEight(value)
        } else if let value = try? container.decode(DebugVariableValueEleven.self) {
            self = .debugVariableValueEleven(value)
        } else if let value = try? container.decode(DebugVariableValueFive.self) {
            self = .debugVariableValueFive(value)
        } else if let value = try? container.decode(DebugVariableValueFour.self) {
            self = .debugVariableValueFour(value)
        } else if let value = try? container.decode(DebugVariableValueNine.self) {
            self = .debugVariableValueNine(value)
        } else if let value = try? container.decode(DebugVariableValueOne.self) {
            self = .debugVariableValueOne(value)
        } else if let value = try? container.decode(DebugVariableValueSeven.self) {
            self = .debugVariableValueSeven(value)
        } else if let value = try? container.decode(DebugVariableValueSix.self) {
            self = .debugVariableValueSix(value)
        } else if let value = try? container.decode(DebugVariableValueTen.self) {
            self = .debugVariableValueTen(value)
        } else if let value = try? container.decode(DebugVariableValueThree.self) {
            self = .debugVariableValueThree(value)
        } else if let value = try? container.decode(DebugVariableValueTwelve.self) {
            self = .debugVariableValueTwelve(value)
        } else if let value = try? container.decode(DebugVariableValueTwo.self) {
            self = .debugVariableValueTwo(value)
        } else if let value = try? container.decode(DebugVariableValueZero.self) {
            self = .debugVariableValueZero(value)
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
        case .debugVariableValueEight(let value):
            try container.encode(value)
        case .debugVariableValueEleven(let value):
            try container.encode(value)
        case .debugVariableValueFive(let value):
            try container.encode(value)
        case .debugVariableValueFour(let value):
            try container.encode(value)
        case .debugVariableValueNine(let value):
            try container.encode(value)
        case .debugVariableValueOne(let value):
            try container.encode(value)
        case .debugVariableValueSeven(let value):
            try container.encode(value)
        case .debugVariableValueSix(let value):
            try container.encode(value)
        case .debugVariableValueTen(let value):
            try container.encode(value)
        case .debugVariableValueThree(let value):
            try container.encode(value)
        case .debugVariableValueTwelve(let value):
            try container.encode(value)
        case .debugVariableValueTwo(let value):
            try container.encode(value)
        case .debugVariableValueZero(let value):
            try container.encode(value)
        }
    }
}