import Foundation

public enum UnionWithDuplicativeDiscriminants: Codable, Hashable, Sendable {
    case unionWithDuplicativeDiscriminantsOne(UnionWithDuplicativeDiscriminantsOne)
    case unionWithDuplicativeDiscriminantsZero(UnionWithDuplicativeDiscriminantsZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(UnionWithDuplicativeDiscriminantsOne.self) {
            self = .unionWithDuplicativeDiscriminantsOne(value)
        } else if let value = try? container.decode(UnionWithDuplicativeDiscriminantsZero.self) {
            self = .unionWithDuplicativeDiscriminantsZero(value)
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
        case .unionWithDuplicativeDiscriminantsOne(let value):
            try container.encode(value)
        case .unionWithDuplicativeDiscriminantsZero(let value):
            try container.encode(value)
        }
    }
}