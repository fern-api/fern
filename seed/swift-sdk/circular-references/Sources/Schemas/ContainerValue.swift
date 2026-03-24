import Foundation

public indirect enum ContainerValue: Codable, Hashable, Sendable {
    case list([FieldValue])
    case optional(FieldValue?)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "list":
            self = .list(try container.decode([FieldValue].self, forKey: .value))
        case "optional":
            self = .optional(try container.decode(FieldValue?.self, forKey: .value))
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
        case .list(let data):
            try container.encode("list", forKey: .type)
            try container.encode(data, forKey: .value)
        case .optional(let data):
            try container.encode("optional", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}