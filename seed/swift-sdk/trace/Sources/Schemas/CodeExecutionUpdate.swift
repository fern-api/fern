import Foundation

public enum CodeExecutionUpdate: Codable, Hashable, Sendable {
    case codeExecutionUpdateEight(CodeExecutionUpdateEight)
    case codeExecutionUpdateFive(CodeExecutionUpdateFive)
    case codeExecutionUpdateFour(CodeExecutionUpdateFour)
    case codeExecutionUpdateNine(CodeExecutionUpdateNine)
    case codeExecutionUpdateOne(CodeExecutionUpdateOne)
    case codeExecutionUpdateSeven(CodeExecutionUpdateSeven)
    case codeExecutionUpdateSix(CodeExecutionUpdateSix)
    case codeExecutionUpdateTen(CodeExecutionUpdateTen)
    case codeExecutionUpdateThree(CodeExecutionUpdateThree)
    case codeExecutionUpdateTwo(CodeExecutionUpdateTwo)
    case codeExecutionUpdateZero(CodeExecutionUpdateZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(CodeExecutionUpdateEight.self) {
            self = .codeExecutionUpdateEight(value)
        } else if let value = try? container.decode(CodeExecutionUpdateFive.self) {
            self = .codeExecutionUpdateFive(value)
        } else if let value = try? container.decode(CodeExecutionUpdateFour.self) {
            self = .codeExecutionUpdateFour(value)
        } else if let value = try? container.decode(CodeExecutionUpdateNine.self) {
            self = .codeExecutionUpdateNine(value)
        } else if let value = try? container.decode(CodeExecutionUpdateOne.self) {
            self = .codeExecutionUpdateOne(value)
        } else if let value = try? container.decode(CodeExecutionUpdateSeven.self) {
            self = .codeExecutionUpdateSeven(value)
        } else if let value = try? container.decode(CodeExecutionUpdateSix.self) {
            self = .codeExecutionUpdateSix(value)
        } else if let value = try? container.decode(CodeExecutionUpdateTen.self) {
            self = .codeExecutionUpdateTen(value)
        } else if let value = try? container.decode(CodeExecutionUpdateThree.self) {
            self = .codeExecutionUpdateThree(value)
        } else if let value = try? container.decode(CodeExecutionUpdateTwo.self) {
            self = .codeExecutionUpdateTwo(value)
        } else if let value = try? container.decode(CodeExecutionUpdateZero.self) {
            self = .codeExecutionUpdateZero(value)
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
        case .codeExecutionUpdateEight(let value):
            try container.encode(value)
        case .codeExecutionUpdateFive(let value):
            try container.encode(value)
        case .codeExecutionUpdateFour(let value):
            try container.encode(value)
        case .codeExecutionUpdateNine(let value):
            try container.encode(value)
        case .codeExecutionUpdateOne(let value):
            try container.encode(value)
        case .codeExecutionUpdateSeven(let value):
            try container.encode(value)
        case .codeExecutionUpdateSix(let value):
            try container.encode(value)
        case .codeExecutionUpdateTen(let value):
            try container.encode(value)
        case .codeExecutionUpdateThree(let value):
            try container.encode(value)
        case .codeExecutionUpdateTwo(let value):
            try container.encode(value)
        case .codeExecutionUpdateZero(let value):
            try container.encode(value)
        }
    }
}