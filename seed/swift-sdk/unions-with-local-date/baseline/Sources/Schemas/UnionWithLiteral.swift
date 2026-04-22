import Foundation

public enum UnionWithLiteral: Codable, Hashable, Sendable {
    case fern(Fern)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "fern":
            self = .fern(try container.decode(Fern.self, forKey: .value))
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
        case .fern(let data):
            try container.encode("fern", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    public enum Fern: String, Codable, Hashable, CaseIterable, Sendable {
        case fern
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}