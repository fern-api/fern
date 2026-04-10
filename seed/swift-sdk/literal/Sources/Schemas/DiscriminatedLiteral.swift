import Foundation

public enum DiscriminatedLiteral: Codable, Hashable, Sendable {
    case customName(DiscriminatedLiteralCustomName)
    case defaultName(DiscriminatedLiteralDefaultName)
    case george(DiscriminatedLiteralGeorge)
    case literalGeorge(DiscriminatedLiteralLiteralGeorge)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "customName":
            self = .customName(try DiscriminatedLiteralCustomName(from: decoder))
        case "defaultName":
            self = .defaultName(try DiscriminatedLiteralDefaultName(from: decoder))
        case "george":
            self = .george(try DiscriminatedLiteralGeorge(from: decoder))
        case "literalGeorge":
            self = .literalGeorge(try DiscriminatedLiteralLiteralGeorge(from: decoder))
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
        case .customName(let data):
            try container.encode("customName", forKey: .type)
            try data.encode(to: encoder)
        case .defaultName(let data):
            try container.encode("defaultName", forKey: .type)
            try data.encode(to: encoder)
        case .george(let data):
            try container.encode("george", forKey: .type)
            try data.encode(to: encoder)
        case .literalGeorge(let data):
            try container.encode("literalGeorge", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}