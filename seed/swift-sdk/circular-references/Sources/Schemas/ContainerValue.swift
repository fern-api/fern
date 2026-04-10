import Foundation

public indirect enum ContainerValue: Codable, Hashable, Sendable {
    case list(ContainerValueList)
    case optional(ContainerValueOptional)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "list":
            self = .list(try ContainerValueList(from: decoder))
        case "optional":
            self = .optional(try ContainerValueOptional(from: decoder))
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
            try data.encode(to: encoder)
        case .optional(let data):
            try container.encode("optional", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}