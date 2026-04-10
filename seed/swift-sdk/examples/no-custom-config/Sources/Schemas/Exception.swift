import Foundation

public enum Exception: Codable, Hashable, Sendable {
    case exceptionType(ExceptionType)
    case exceptionZero(ExceptionZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ExceptionType.self) {
            self = .exceptionType(value)
        } else if let value = try? container.decode(ExceptionZero.self) {
            self = .exceptionZero(value)
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
        case .exceptionType(let value):
            try container.encode(value)
        case .exceptionZero(let value):
            try container.encode(value)
        }
    }
}