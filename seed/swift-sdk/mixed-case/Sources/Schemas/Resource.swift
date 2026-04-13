import Foundation

public enum Resource: Codable, Hashable, Sendable {
    case resourceOne(ResourceOne)
    case resourceZero(ResourceZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(ResourceOne.self) {
            self = .resourceOne(value)
        } else if let value = try? container.decode(ResourceZero.self) {
            self = .resourceZero(value)
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
        case .resourceOne(let value):
            try container.encode(value)
        case .resourceZero(let value):
            try container.encode(value)
        }
    }
}