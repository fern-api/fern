import Foundation

public enum CommonsData: Codable, Hashable, Sendable {
    case base64(CommonsDataBase64)
    case string(CommonsDataString)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "base64":
            self = .base64(try CommonsDataBase64(from: decoder))
        case "string":
            self = .string(try CommonsDataString(from: decoder))
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
            try data.encode(to: encoder)
        case .string(let data):
            try container.encode("string", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}