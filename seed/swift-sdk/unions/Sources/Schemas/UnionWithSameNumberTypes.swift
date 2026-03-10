import Foundation

public enum UnionWithSameNumberTypes: Codable, Hashable, Sendable {
    case anyNumber(Double)
    case negativeInt(Int)
    case positiveInt(Int)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "anyNumber":
            self = .anyNumber(try container.decode(Double.self, forKey: .value))
        case "negativeInt":
            self = .negativeInt(try container.decode(Int.self, forKey: .value))
        case "positiveInt":
            self = .positiveInt(try container.decode(Int.self, forKey: .value))
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
            try container.encode(data, forKey: .value)
        case .negativeInt(let data):
            try container.encode("negativeInt", forKey: .type)
            try container.encode(data, forKey: .value)
        case .positiveInt(let data):
            try container.encode("positiveInt", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}