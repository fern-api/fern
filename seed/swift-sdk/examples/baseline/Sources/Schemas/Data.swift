import Foundation

public enum Data: Codable, Hashable, Sendable {
    case base64(String)
    case string(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "base64":
            self = .base64(try container.decode(String.self, forKey: .value))
        case "string":
            self = .string(try container.decode(String.self, forKey: .value))
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
        case .base64(let data):
            try container.encode("base64", forKey: .type)
            try container.encode(data, forKey: .value)
        case .string(let data):
            try container.encode("string", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}