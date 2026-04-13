import Foundation

public enum UnionWithSameNumberTypes: Codable, Hashable, Sendable {
    case anyNumber(UnionWithSameNumberTypesAnyNumber)
    case negativeInt(UnionWithSameNumberTypesNegativeInt)
    case positiveInt(UnionWithSameNumberTypesPositiveInt)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "anyNumber":
            self = .anyNumber(try UnionWithSameNumberTypesAnyNumber(from: decoder))
        case "negativeInt":
            self = .negativeInt(try UnionWithSameNumberTypesNegativeInt(from: decoder))
        case "positiveInt":
            self = .positiveInt(try UnionWithSameNumberTypesPositiveInt(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .anyNumber(let data):
            try container.encode("anyNumber", forKey: .type)
            try data.encode(to: encoder)
        case .negativeInt(let data):
            try container.encode("negativeInt", forKey: .type)
            try data.encode(to: encoder)
        case .positiveInt(let data):
            try container.encode("positiveInt", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}