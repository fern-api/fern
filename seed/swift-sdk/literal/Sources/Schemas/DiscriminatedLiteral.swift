import Foundation

public enum DiscriminatedLiteral: Codable, Hashable, Sendable {
    case customName(String)
    case defaultName(Bob)
    case george(Bool)
    case literalGeorge(Bool)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "customName":
            self = .customName(try container.decode(String.self, forKey: .value))
        case "defaultName":
            self = .defaultName(try container.decode(Bob.self, forKey: .value))
        case "george":
            self = .george(try container.decode(Bool.self, forKey: .value))
        case "literalGeorge":
            self = .literalGeorge(try container.decode(Bool.self, forKey: .value))
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
            try container.encode(data, forKey: .value)
        case .defaultName(let data):
            try container.encode("defaultName", forKey: .type)
            try container.encode(data, forKey: .value)
        case .george(let data):
            try container.encode("george", forKey: .type)
            try container.encode(data, forKey: .value)
        case .literalGeorge(let data):
            try container.encode("literalGeorge", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    public enum Bob: String, Codable, Hashable, CaseIterable, Sendable {
        case bob = "Bob"
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}