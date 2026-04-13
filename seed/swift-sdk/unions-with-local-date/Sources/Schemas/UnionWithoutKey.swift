import Foundation

public enum UnionWithoutKey: Codable, Hashable, Sendable {
    case unionWithoutKeyOne(UnionWithoutKeyOne)
    case unionWithoutKeyZero(UnionWithoutKeyZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithoutKeyOne.self) {
            self = .unionWithoutKeyOne(value)
        } else if let value = try? container.decode(UnionWithoutKeyZero.self) {
            self = .unionWithoutKeyZero(value)
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
        case .unionWithoutKeyOne(let value):
            try container.encode(value)
        case .unionWithoutKeyZero(let value):
            try container.encode(value)
        }
    }
}