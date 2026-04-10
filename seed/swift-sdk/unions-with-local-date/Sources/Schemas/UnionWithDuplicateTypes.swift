import Foundation

public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case unionWithDuplicateTypesOne(UnionWithDuplicateTypesOne)
    case unionWithDuplicateTypesZero(UnionWithDuplicateTypesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithDuplicateTypesOne.self) {
            self = .unionWithDuplicateTypesOne(value)
        } else if let value = try? container.decode(UnionWithDuplicateTypesZero.self) {
            self = .unionWithDuplicateTypesZero(value)
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
        case .unionWithDuplicateTypesOne(let value):
            try container.encode(value)
        case .unionWithDuplicateTypesZero(let value):
            try container.encode(value)
        }
    }
}