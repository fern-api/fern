import Foundation

public enum DependencyItem: Codable, Hashable, Sendable {
    case known(KnownDependency)
    case unknown(KnownDependency)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "known":
            self = .known(try KnownDependency(from: decoder))
        case "unknown":
            self = .unknown(try KnownDependency(from: decoder))
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
        case .known(let data):
            try container.encode("known", forKey: .type)
            try data.encode(to: encoder)
        case .unknown(let data):
            try container.encode("unknown", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}