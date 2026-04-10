import Foundation

public enum UndiscriminatedLiteral: Codable, Hashable, Sendable {
    case bool(Bool)
    case string(String)
    case undiscriminatedLiteralOne(UndiscriminatedLiteralOne)
    case undiscriminatedLiteralTwo(UndiscriminatedLiteralTwo)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(UndiscriminatedLiteralOne.self) {
            self = .undiscriminatedLiteralOne(value)
        } else if let value = try? container.decode(UndiscriminatedLiteralTwo.self) {
            self = .undiscriminatedLiteralTwo(value)
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
        case .bool(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .undiscriminatedLiteralOne(let value):
            try container.encode(value)
        case .undiscriminatedLiteralTwo(let value):
            try container.encode(value)
        }
    }
}