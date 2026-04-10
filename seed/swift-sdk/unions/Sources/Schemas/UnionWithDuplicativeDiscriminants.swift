import Foundation

public enum UnionWithDuplicativeDiscriminants: Codable, Hashable, Sendable {
    case firstItemType(FirstItemType)
    case secondItemType(SecondItemType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "firstItemType":
            self = .firstItemType(try FirstItemType(from: decoder))
        case "secondItemType":
            self = .secondItemType(try SecondItemType(from: decoder))
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
        case .firstItemType(let data):
            try container.encode("firstItemType", forKey: .type)
            try data.encode(to: encoder)
        case .secondItemType(let data):
            try container.encode("secondItemType", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}