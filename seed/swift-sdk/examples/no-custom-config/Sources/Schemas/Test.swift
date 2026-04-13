import Foundation

public enum Test: Codable, Hashable, Sendable {
    case and(TestAnd)
    case or(TestOr)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "and":
            self = .and(try TestAnd(from: decoder))
        case "or":
            self = .or(try TestOr(from: decoder))
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
        case .and(let data):
            try container.encode("and", forKey: .type)
            try data.encode(to: encoder)
        case .or(let data):
            try container.encode("or", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}