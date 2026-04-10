import Foundation

public enum UnionWithMultipleNoProperties: Codable, Hashable, Sendable {
    case unionWithMultipleNoPropertiesOne(UnionWithMultipleNoPropertiesOne)
    case unionWithMultipleNoPropertiesTwo(UnionWithMultipleNoPropertiesTwo)
    case unionWithMultipleNoPropertiesZero(UnionWithMultipleNoPropertiesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithMultipleNoPropertiesOne.self) {
            self = .unionWithMultipleNoPropertiesOne(value)
        } else if let value = try? container.decode(UnionWithMultipleNoPropertiesTwo.self) {
            self = .unionWithMultipleNoPropertiesTwo(value)
        } else if let value = try? container.decode(UnionWithMultipleNoPropertiesZero.self) {
            self = .unionWithMultipleNoPropertiesZero(value)
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
        case .unionWithMultipleNoPropertiesOne(let value):
            try container.encode(value)
        case .unionWithMultipleNoPropertiesTwo(let value):
            try container.encode(value)
        case .unionWithMultipleNoPropertiesZero(let value):
            try container.encode(value)
        }
    }
}