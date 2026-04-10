import Foundation

public enum StreamEvent: Codable, Hashable, Sendable {
    case streamEventOne(StreamEventOne)
    case streamEventZero(StreamEventZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(StreamEventOne.self) {
            self = .streamEventOne(value)
        } else if let value = try? container.decode(StreamEventZero.self) {
            self = .streamEventZero(value)
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
        case .streamEventOne(let value):
            try container.encode(value)
        case .streamEventZero(let value):
            try container.encode(value)
        }
    }
}