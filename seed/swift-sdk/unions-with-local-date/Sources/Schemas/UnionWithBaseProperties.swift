import Foundation

public enum UnionWithBaseProperties: Codable, Hashable, Sendable {
    case unionWithBasePropertiesOne(UnionWithBasePropertiesOne)
    case unionWithBasePropertiesTwo(UnionWithBasePropertiesTwo)
    case unionWithBasePropertiesZero(UnionWithBasePropertiesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithBasePropertiesOne.self) {
            self = .unionWithBasePropertiesOne(value)
        } else if let value = try? container.decode(UnionWithBasePropertiesTwo.self) {
            self = .unionWithBasePropertiesTwo(value)
        } else if let value = try? container.decode(UnionWithBasePropertiesZero.self) {
            self = .unionWithBasePropertiesZero(value)
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
        case .unionWithBasePropertiesOne(let value):
            try container.encode(value)
        case .unionWithBasePropertiesTwo(let value):
            try container.encode(value)
        case .unionWithBasePropertiesZero(let value):
            try container.encode(value)
        }
    }
}