import Foundation

public enum ExceptionV2: Codable, Hashable, Sendable {
    case exceptionV2Type(ExceptionV2Type)
    case exceptionV2Zero(ExceptionV2Zero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ExceptionV2Type.self) {
            self = .exceptionV2Type(value)
        } else if let value = try? container.decode(ExceptionV2Zero.self) {
            self = .exceptionV2Zero(value)
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
        case .exceptionV2Type(let value):
            try container.encode(value)
        case .exceptionV2Zero(let value):
            try container.encode(value)
        }
    }
}