import Foundation

public enum Test: Codable, Hashable, Sendable {
    case and(Bool)
    case or(Bool)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "and":
            self = .and(try container.decode(Bool.self, forKey: .value))
        case "or":
            self = .or(try container.decode(Bool.self, forKey: .value))
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
            try container.encode(data, forKey: .value)
        case .or(let data):
            try container.encode("or", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}