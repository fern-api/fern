import Foundation

public enum InvalidRequestCause: Codable, Hashable, Sendable {
    case invalidRequestCauseOne(InvalidRequestCauseOne)
    case invalidRequestCauseTwo(InvalidRequestCauseTwo)
    case invalidRequestCauseZero(InvalidRequestCauseZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(InvalidRequestCauseOne.self) {
            self = .invalidRequestCauseOne(value)
        } else if let value = try? container.decode(InvalidRequestCauseTwo.self) {
            self = .invalidRequestCauseTwo(value)
        } else if let value = try? container.decode(InvalidRequestCauseZero.self) {
            self = .invalidRequestCauseZero(value)
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
        case .invalidRequestCauseOne(let value):
            try container.encode(value)
        case .invalidRequestCauseTwo(let value):
            try container.encode(value)
        case .invalidRequestCauseZero(let value):
            try container.encode(value)
        }
    }
}