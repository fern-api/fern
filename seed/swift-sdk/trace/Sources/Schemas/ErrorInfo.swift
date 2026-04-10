import Foundation

public enum ErrorInfo: Codable, Hashable, Sendable {
    case errorInfoOne(ErrorInfoOne)
    case errorInfoTwo(ErrorInfoTwo)
    case errorInfoZero(ErrorInfoZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ErrorInfoOne.self) {
            self = .errorInfoOne(value)
        } else if let value = try? container.decode(ErrorInfoTwo.self) {
            self = .errorInfoTwo(value)
        } else if let value = try? container.decode(ErrorInfoZero.self) {
            self = .errorInfoZero(value)
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
        case .errorInfoOne(let value):
            try container.encode(value)
        case .errorInfoTwo(let value):
            try container.encode(value)
        case .errorInfoZero(let value):
            try container.encode(value)
        }
    }
}