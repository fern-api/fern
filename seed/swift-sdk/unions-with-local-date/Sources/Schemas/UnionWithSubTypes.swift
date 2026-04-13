import Foundation

public enum UnionWithSubTypes: Codable, Hashable, Sendable {
    case unionWithSubTypesOne(UnionWithSubTypesOne)
    case unionWithSubTypesZero(UnionWithSubTypesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithSubTypesOne.self) {
            self = .unionWithSubTypesOne(value)
        } else if let value = try? container.decode(UnionWithSubTypesZero.self) {
            self = .unionWithSubTypesZero(value)
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
        case .unionWithSubTypesOne(let value):
            try container.encode(value)
        case .unionWithSubTypesZero(let value):
            try container.encode(value)
        }
    }
}