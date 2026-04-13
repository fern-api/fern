import Foundation

public enum UnionWithNoProperties: Codable, Hashable, Sendable {
    case unionWithNoPropertiesType(UnionWithNoPropertiesType)
    case unionWithNoPropertiesZero(UnionWithNoPropertiesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithNoPropertiesType.self) {
            self = .unionWithNoPropertiesType(value)
        } else if let value = try? container.decode(UnionWithNoPropertiesZero.self) {
            self = .unionWithNoPropertiesZero(value)
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
        case .unionWithNoPropertiesType(let value):
            try container.encode(value)
        case .unionWithNoPropertiesZero(let value):
            try container.encode(value)
        }
    }
}