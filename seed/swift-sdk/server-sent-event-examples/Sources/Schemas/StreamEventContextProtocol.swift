import Foundation

public enum StreamEventContextProtocol: Codable, Hashable, Sendable {
    case streamEventContextProtocolOne(StreamEventContextProtocolOne)
    case streamEventContextProtocolTwo(StreamEventContextProtocolTwo)
    case streamEventContextProtocolZero(StreamEventContextProtocolZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(StreamEventContextProtocolOne.self) {
            self = .streamEventContextProtocolOne(value)
        } else if let value = try? container.decode(StreamEventContextProtocolTwo.self) {
            self = .streamEventContextProtocolTwo(value)
        } else if let value = try? container.decode(StreamEventContextProtocolZero.self) {
            self = .streamEventContextProtocolZero(value)
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
        case .streamEventContextProtocolOne(let value):
            try container.encode(value)
        case .streamEventContextProtocolTwo(let value):
            try container.encode(value)
        case .streamEventContextProtocolZero(let value):
            try container.encode(value)
        }
    }
}