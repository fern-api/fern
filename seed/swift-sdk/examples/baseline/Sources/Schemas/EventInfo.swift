import Foundation

public enum EventInfo: Codable, Hashable, Sendable {
    case metadata(Metadata)
    case tag(Tag)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "metadata":
            self = .metadata(try Metadata(from: decoder))
        case "tag":
            self = .tag(try container.decode(Tag.self, forKey: .value))
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
        case .metadata(let data):
            try container.encode("metadata", forKey: .type)
            try data.encode(to: encoder)
        case .tag(let data):
            try container.encode("tag", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}